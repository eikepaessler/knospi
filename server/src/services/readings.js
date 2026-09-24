import { db } from '../db/index.js';
import {
  computeMetricStatuses, moodFromStatuses, resolveLightStatus, METRIC_LABEL,
  MOOD_SAYS, MOOD_META, FIX_ALL_OK_SAYS, FIX_PARTIAL_SAYS, notificationMessage
} from './comparator.js';
import { broadcast } from './events.js';
import { pushToAll } from './push.js';
import { getSettings } from './settings.js';
import { getPlantDecorated } from './plants.js';

function notify(plant, metric, status) {
  const message = notificationMessage(plant.name, metric, status);

  const info = db.prepare(`
    INSERT INTO notifications (plant_id, metric, status, message, created_at, read)
    VALUES (?, ?, ?, ?, ?, 0)
  `).run(plant.id, metric, status, message, new Date().toISOString());

  const notification = { id: info.lastInsertRowid, plantId: plant.id, plantName: plant.name, metric, status, message, createdAt: new Date().toISOString(), read: false };
  broadcast('notification', notification);

  // Von den drei Push-Anlaessen im Briefing (Wasser noetig, Sensor offline,
  // Wochenrueckblick) loest hier nur "braucht Wasser" aus - alle anderen
  // Metrikwechsel bleiben In-App-only (Zuhause-Screen ist die Wahrheit).
  const settings = getSettings();
  const isDryAlert = metric === 'soil' && status === 'low';
  if (settings.push && settings.dryReminder && isDryAlert) {
    pushToAll({ title: `${plant.name} braucht Wasser`, body: message, plantId: plant.id }).catch(() => {});
  }
  return notification;
}

function typeRangeOf(typeRow) {
  return {
    soil: [typeRow.soil_min, typeRow.soil_max],
    light: [typeRow.light_min, typeRow.light_max],
    temp: [typeRow.temp_min, typeRow.temp_max],
    humidity: [typeRow.humidity_min, typeRow.humidity_max]
  };
}

// Wendet einen Messwert (von echtem Sensor oder Simulator) auf die Pflanze
// an, leitet den Status neu ab und benachrichtigt bei Zustandswechseln.
export function applyReading(sensorId, reading) {
  const plantRow = db.prepare('SELECT * FROM plants WHERE sensor_id = ?').get(sensorId);
  if (!plantRow) throw new Error(`Keine Pflanze fuer Sensor ${sensorId} gefunden`);
  const type = db.prepare('SELECT * FROM plant_types WHERE id = ?').get(plantRow.type_id);
  const prevStatus = db.prepare('SELECT * FROM plant_status WHERE plant_id = ?').get(plantRow.id) || {};

  const statuses = computeMetricStatuses(reading, { range: typeRangeOf(type) });
  const nowDate = new Date();
  const now = nowDate.toISOString();

  // Licht-Verschlechterung erst uebernehmen, wenn sie eine Weile anhaelt -
  // ein einzelner duesterer Messwert kann am Wetter liegen, nicht am Platz.
  const lightResolved = resolveLightStatus({
    raw: statuses.light,
    committed: prevStatus.light ?? null,
    pendingStatus: prevStatus.light_pending ?? null,
    pendingSince: prevStatus.light_pending_since ?? null,
    now: nowDate
  });
  statuses.light = lightResolved.status;

  const mood = moodFromStatuses(statuses);

  const tx = db.transaction(() => {
    db.prepare(`
      UPDATE plants SET soil_moisture=?, light_lux=?, temperature=?, humidity=?, reading_at=? WHERE id=?
    `).run(reading.soil_moisture, reading.light_lux, reading.temperature, reading.humidity, now, plantRow.id);

    db.prepare(`
      INSERT INTO sensor_readings (sensor_id, plant_id, soil_moisture, light_lux, temperature, humidity, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(sensorId, plantRow.id, reading.soil_moisture, reading.light_lux, reading.temperature, reading.humidity, now);

    db.prepare(`
      INSERT INTO plant_status (plant_id, soil, light, temp, humidity, mood, updated_at, light_pending, light_pending_since)
      VALUES (@plant_id, @soil, @light, @temp, @humidity, @mood, @updated_at, @light_pending, @light_pending_since)
      ON CONFLICT(plant_id) DO UPDATE SET soil=excluded.soil, light=excluded.light, temp=excluded.temp,
        humidity=excluded.humidity, mood=excluded.mood, updated_at=excluded.updated_at,
        light_pending=excluded.light_pending, light_pending_since=excluded.light_pending_since
    `).run({
      plant_id: plantRow.id, ...statuses, mood, updated_at: now,
      light_pending: lightResolved.pendingStatus, light_pending_since: lightResolved.pendingSince
    });

    db.prepare("UPDATE sensors SET last_seen = ?, connected = 1 WHERE id = ?").run(now, sensorId);

    if (mood !== (prevStatus.mood || 'happy') && MOOD_SAYS[mood]) {
      db.prepare('UPDATE plants SET says = ? WHERE id = ?').run(MOOD_SAYS[mood], plantRow.id);
    }
  });
  tx();

  const plant = getPlantDecorated(plantRow.id);
  for (const metric of ['soil', 'light', 'temp', 'humidity']) {
    const before = prevStatus[metric] ?? null;
    const after = statuses[metric];
    if (before !== after && after != null) notify(plant, metric, after);
  }

  broadcast('plant-updated', plant);
  return plant;
}

function unlockSticker(key) {
  const s = db.prepare('SELECT * FROM stickers WHERE key = ?').get(key);
  if (!s || s.got) return null;
  const now = new Date().toISOString();
  db.prepare('UPDATE stickers SET got = 1, unlocked_at = ? WHERE key = ?').run(now, key);
  const sticker = { ...s, got: true, unlocked_at: now };
  broadcast('sticker-unlocked', sticker);
  return sticker;
}

// Giessen: setzt wateredAt und schiebt die Erdfeuchte (bei Sensor) auf einen
// Wert in der Mitte des Idealbereichs - simuliert den unmittelbaren Effekt.
export function waterPlant(plantId) {
  const plantRow = db.prepare('SELECT * FROM plants WHERE id = ?').get(plantId);
  if (!plantRow) throw new Error('Pflanze nicht gefunden');
  const now = new Date().toISOString();
  db.prepare('UPDATE plants SET watered_at = ? WHERE id = ?').run(now, plantId);

  const reward = unlockSticker('green_thumb');

  let plant;
  if (plantRow.sensor_id) {
    const type = db.prepare('SELECT * FROM plant_types WHERE id = ?').get(plantRow.type_id);
    const mid = (type.soil_min + type.soil_max) / 2;
    plant = applyReading(plantRow.sensor_id, {
      soil_moisture: Math.round(mid * 10) / 10,
      light_lux: plantRow.light_lux, temperature: plantRow.temperature, humidity: plantRow.humidity
    });
  } else {
    plant = getPlantDecorated(plantId);
  }
  return { plant, reward };
}

// "Ich lass dich abtrocknen": Erdfeuchte auf Mitte des Idealbereichs senken.
function driedPlant(plantRow, type) {
  const mid = (type.soil_min + type.soil_max) / 2;
  return applyReading(plantRow.sensor_id, {
    soil_moisture: Math.round(mid * 10) / 10,
    light_lux: plantRow.light_lux, temperature: plantRow.temperature, humidity: plantRow.humidity
  });
}

// Generische Erledigen-Aktion: behebt die Metrik, die aktuell die Stimmung
// bestimmt (siehe MOOD_META[mood].fix), aktualisiert says/bond nach den
// Erledigen-Regeln und meldet zurueck, ob alles wieder ok ist.
export function fixPlant(plantId) {
  const before = getPlantDecorated(plantId);
  if (!before) throw new Error('Pflanze nicht gefunden');
  if (!before.hasAction) return { plant: before, reward: null };

  const row = db.prepare('SELECT * FROM plants WHERE id = ?').get(plantId);
  const type = db.prepare('SELECT * FROM plant_types WHERE id = ?').get(row.type_id);
  const metric = MOOD_META[before.mood].fix;

  let plant, reward = null;
  if (metric === 'soil' && before.mood === 'thirsty') {
    ({ plant, reward } = waterPlant(plantId));
  } else if (metric === 'soil' && before.mood === 'soggy') {
    plant = driedPlant(row, type);
  } else {
    const mid = (key) => Math.round(((type[`${key}_min`] + type[`${key}_max`]) / 2) * 10) / 10;
    plant = applyReading(row.sensor_id, {
      soil_moisture: row.soil_moisture,
      light_lux: metric === 'light' ? mid('light') : row.light_lux,
      temperature: metric === 'temp' ? mid('temp') : row.temperature,
      humidity: metric === 'humidity' ? mid('humidity') : row.humidity
    });
  }

  if (plant.mood === 'happy') {
    db.prepare('UPDATE plants SET says = ?, bond = MIN(5, bond + 1) WHERE id = ?').run(FIX_ALL_OK_SAYS, plantId);
  } else {
    db.prepare('UPDATE plants SET says = ? WHERE id = ?').run(FIX_PARTIAL_SAYS, plantId);
  }

  plant = getPlantDecorated(plantId);
  broadcast('plant-updated', plant);
  return { plant, reward };
}
