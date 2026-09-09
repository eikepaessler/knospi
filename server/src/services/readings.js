import { db } from '../db/index.js';
import { computeMetricStatuses, fertStatus, moodFromStatuses, METRIC_LABEL, METRIC_TONE, MOOD_SAYS, notificationMessage } from './comparator.js';
import { broadcast } from './events.js';
import { pushToAll } from './push.js';
import { getSettings, isQuietHours } from './settings.js';
import { getPlantDecorated } from './plants.js';

function notify(plant, metric, status) {
  const message = notificationMessage(plant.name, metric, status);

  const info = db.prepare(`
    INSERT INTO notifications (plant_id, metric, status, message, created_at, read)
    VALUES (?, ?, ?, ?, ?, 0)
  `).run(plant.id, metric, status, message, new Date().toISOString());

  const notification = { id: info.lastInsertRowid, plantId: plant.id, plantName: plant.name, metric, status, message, createdAt: new Date().toISOString(), read: false };
  broadcast('notification', notification);

  const settings = getSettings();
  const isProblem = status !== 'ok';
  const isUrgentEnough = !settings.urgent || METRIC_TONE[metric] === 'bad';
  const inQuietHours = settings.night && isQuietHours();
  if (settings.push && isProblem && isUrgentEnough && !inQuietHours) {
    pushToAll({
      title: `${METRIC_LABEL[metric]}-Alarm: ${plant.name}`,
      body: message,
      plantId: plant.id
    }).catch(() => {});
  }
  return notification;
}

// Wendet einen Messwert (von echtem Sensor oder Simulator) auf die Pflanze
// an, leitet den Status neu ab und benachrichtigt bei Zustandswechseln.
export function applyReading(sensorId, reading) {
  const plantRow = db.prepare('SELECT * FROM plants WHERE sensor_id = ?').get(sensorId);
  if (!plantRow) throw new Error(`Kein Pflanze fuer Sensor ${sensorId} gefunden`);
  const type = db.prepare('SELECT * FROM plant_types WHERE id = ?').get(plantRow.type_id);
  const prevStatus = db.prepare('SELECT * FROM plant_status WHERE plant_id = ?').get(plantRow.id) || {};

  const range = {
    soil: [type.soil_min, type.soil_max],
    light: [type.light_min, type.light_max],
    temp: [type.temp_min, type.temp_max],
    humidity: [type.humidity_min, type.humidity_max]
  };
  const statuses = computeMetricStatuses(reading, { range });
  const fert = fertStatus(plantRow.fertilized_at, type.fert_interval_days);
  const mood = moodFromStatuses({ ...statuses, fert });
  const now = new Date().toISOString();

  const tx = db.transaction(() => {
    db.prepare(`
      UPDATE plants SET soil_moisture=?, light_lux=?, temperature=?, humidity=?, reading_at=? WHERE id=?
    `).run(reading.soil_moisture, reading.light_lux, reading.temperature, reading.humidity, now, plantRow.id);

    db.prepare(`
      INSERT INTO sensor_readings (sensor_id, plant_id, soil_moisture, light_lux, temperature, humidity, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(sensorId, plantRow.id, reading.soil_moisture, reading.light_lux, reading.temperature, reading.humidity, now);

    db.prepare(`
      INSERT INTO plant_status (plant_id, soil, light, temp, humidity, fert, mood, updated_at)
      VALUES (@plant_id, @soil, @light, @temp, @humidity, @fert, @mood, @updated_at)
      ON CONFLICT(plant_id) DO UPDATE SET soil=excluded.soil, light=excluded.light, temp=excluded.temp,
        humidity=excluded.humidity, fert=excluded.fert, mood=excluded.mood, updated_at=excluded.updated_at
    `).run({ plant_id: plantRow.id, ...statuses, fert, mood, updated_at: now });

    db.prepare("UPDATE sensors SET last_seen = ?, connected = 1 WHERE id = ?").run(now, sensorId);

    if (mood !== (prevStatus.mood || 'happy') && MOOD_SAYS[mood]) {
      db.prepare('UPDATE plants SET says = ? WHERE id = ?').run(MOOD_SAYS[mood], plantRow.id);
    }
  });
  tx();

  const plant = getPlantDecorated(plantRow.id);
  for (const metric of ['soil', 'light', 'temp', 'humidity', 'fert']) {
    const before = prevStatus[metric] ?? null;
    const after = { ...statuses, fert }[metric];
    if (before !== after && after != null) notify(plant, metric, after);
  }

  broadcast('plant-updated', plant);
  return plant;
}

// Setzt den Duenge-Zeitpunkt zurueck (Duengen braucht keinen Sensor).
export function fertilizePlant(plantId) {
  const plantRow = db.prepare('SELECT * FROM plants WHERE id = ?').get(plantId);
  if (!plantRow) throw new Error('Pflanze nicht gefunden');
  const type = db.prepare('SELECT * FROM plant_types WHERE id = ?').get(plantRow.type_id);
  const prev = db.prepare('SELECT * FROM plant_status WHERE plant_id = ?').get(plantId) || {};
  const now = new Date().toISOString();

  db.prepare('UPDATE plants SET fertilized_at = ? WHERE id = ?').run(now, plantId);
  const fert = fertStatus(now, type.fert_interval_days);
  const mood = moodFromStatuses({ soil: prev.soil, light: prev.light, temp: prev.temp, humidity: prev.humidity, fert });
  db.prepare('UPDATE plant_status SET fert = ?, mood = ?, updated_at = ? WHERE plant_id = ?').run(fert, mood, now, plantId);
  if (mood !== (prev.mood || 'happy') && MOOD_SAYS[mood]) {
    db.prepare('UPDATE plants SET says = ? WHERE id = ?').run(MOOD_SAYS[mood], plantId);
  }

  const plant = getPlantDecorated(plantId);
  if (prev.fert !== fert) notify(plant, 'fert', fert);
  broadcast('plant-updated', plant);
  return plant;
}

export function waterPlant(plantId) {
  const plantRow = db.prepare('SELECT * FROM plants WHERE id = ?').get(plantId);
  if (!plantRow) throw new Error('Pflanze nicht gefunden');
  db.prepare('UPDATE plants SET watered_at = ? WHERE id = ?').run(new Date().toISOString(), plantId);

  if (plantRow.sensor_id) {
    const type = db.prepare('SELECT * FROM plant_types WHERE id = ?').get(plantRow.type_id);
    const mid = (type.soil_min + type.soil_max) / 2;
    return applyReading(plantRow.sensor_id, {
      soil_moisture: Math.round(mid * 10) / 10,
      light_lux: plantRow.light_lux,
      temperature: plantRow.temperature,
      humidity: plantRow.humidity
    });
  }
  return getPlantDecorated(plantId);
}

// Generische "Ich kuemmere mich"-Aktion: behebt die aktuell dringendste
// Metrik der Pflanze, analog zum fixPlant() im Prototyp.
export function fixPlant(plantId) {
  const plant = getPlantDecorated(plantId);
  if (!plant) throw new Error('Pflanze nicht gefunden');
  const metric = plant.fixMetric;
  if (!metric) return plant;

  if (metric === 'fert') return fertilizePlant(plantId);
  if (metric === 'soil') return waterPlant(plantId);

  const row = db.prepare('SELECT * FROM plants WHERE id = ?').get(plantId);
  if (!row.sensor_id) return plant;
  const type = db.prepare('SELECT * FROM plant_types WHERE id = ?').get(row.type_id);
  const mid = (key) => Math.round(((type[`${key}_min`] + type[`${key}_max`]) / 2) * 10) / 10;

  const reading = {
    soil_moisture: row.soil_moisture,
    light_lux: metric === 'light' ? mid('light') : row.light_lux,
    temperature: metric === 'temp' ? mid('temp') : row.temperature,
    humidity: metric === 'humidity' ? mid('humidity') : row.humidity
  };
  return applyReading(row.sensor_id, reading);
}
