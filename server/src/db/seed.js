import { db } from './index.js';
import { PLANT_TYPES } from './plantTypes.js';
import { ROOMS, PLANTS } from './seedData.js';
import { computeMetricStatuses, fertStatus, moodFromStatuses, notificationMessage } from '../services/comparator.js';

const now = new Date();
const iso = (d) => d.toISOString();
const daysAgo = (n) => iso(new Date(now.getTime() - n * 86400000));

function sampleValue([min, max], target) {
  const span = max - min;
  if (target === 'low') return Math.round((min - span * 0.18) * 10) / 10;
  if (target === 'high') return Math.round((max + span * 0.18) * 10) / 10;
  return Math.round((min + span / 2) * 10) / 10;
}

// mood -> welche Metrik ausserhalb des Bereichs liegen soll
const MOOD_TARGET_METRIC = { thirsty: 'soil', dark: 'light', cold: 'temp', air: 'humidity', hungry: 'fert' };

function run() {
  const insertType = db.prepare(`
    INSERT OR REPLACE INTO plant_types
      (id,name,latin,tip,lore,care_light,care_spot,care_water,care_temp,care_food,care_room,
       soil_min,soil_max,light_min,light_max,temp_min,temp_max,humidity_min,humidity_max,fert_interval_days)
    VALUES (@id,@name,@latin,@tip,@lore,@care_light,@care_spot,@care_water,@care_temp,@care_food,@care_room,
       @soil_min,@soil_max,@light_min,@light_max,@temp_min,@temp_max,@humidity_min,@humidity_max,@fert_interval_days)
  `);
  const typeById = {};
  for (const t of PLANT_TYPES) {
    typeById[t.id] = t;
    insertType.run({
      id: t.id, name: t.name, latin: t.latin, tip: t.tip, lore: t.lore,
      care_light: t.care.light, care_spot: t.care.spot, care_water: t.care.water,
      care_temp: t.care.temp, care_food: t.care.food, care_room: t.care.room,
      soil_min: t.range.soil[0], soil_max: t.range.soil[1],
      light_min: t.range.light[0], light_max: t.range.light[1],
      temp_min: t.range.temp[0], temp_max: t.range.temp[1],
      humidity_min: t.range.humidity[0], humidity_max: t.range.humidity[1],
      fert_interval_days: t.fertDays
    });
  }

  const insertRoom = db.prepare('INSERT OR REPLACE INTO rooms (id, name) VALUES (?, ?)');
  for (const r of ROOMS) insertRoom.run(r.id, r.name);

  const insertSensor = db.prepare('INSERT OR REPLACE INTO sensors (id, plant_id, battery, connected, last_seen) VALUES (?, ?, ?, 1, ?)');
  const insertPlant = db.prepare(`
    INSERT OR REPLACE INTO plants
      (id,name,type_id,room_id,sensor_id,added_at,bond,watered_at,fertilized_at,says,
       soil_moisture,light_lux,temperature,humidity,reading_at)
    VALUES (@id,@name,@type_id,@room_id,@sensor_id,@added_at,@bond,@watered_at,@fertilized_at,@says,
       @soil_moisture,@light_lux,@temperature,@humidity,@reading_at)
  `);
  const insertStatus = db.prepare(`
    INSERT OR REPLACE INTO plant_status (plant_id, soil, light, temp, humidity, fert, mood, updated_at)
    VALUES (@plant_id, @soil, @light, @temp, @humidity, @fert, @mood, @updated_at)
  `);
  const insertReading = db.prepare(`
    INSERT INTO sensor_readings (sensor_id, plant_id, soil_moisture, light_lux, temperature, humidity, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertNotification = db.prepare(`
    INSERT INTO notifications (plant_id, metric, status, message, created_at, read)
    VALUES (?, ?, ?, ?, ?, 0)
  `);

  const attachSensor = db.prepare('UPDATE plants SET sensor_id = ? WHERE id = ?');

  const insertMany = db.transaction(() => {
    for (const p of PLANTS) {
      const type = typeById[p.type];
      const targetMetric = MOOD_TARGET_METRIC[p.mood];
      const wateredAt = daysAgo(p.wateredDaysAgo);
      const fertilizedAt = targetMetric === 'fert' ? daysAgo(type.fertDays + 5) : daysAgo(Math.min(type.fertDays - 3, 10));

      let reading = null;
      if (p.sensor) {
        reading = {
          soil_moisture: sampleValue(type.range.soil, targetMetric === 'soil' ? 'low' : 'ok'),
          light_lux: sampleValue(type.range.light, targetMetric === 'light' ? 'low' : 'ok'),
          temperature: sampleValue(type.range.temp, targetMetric === 'temp' ? 'low' : 'ok'),
          humidity: sampleValue(type.range.humidity, targetMetric === 'humidity' ? 'low' : 'ok')
        };
      }

      // plants.sensor_id und sensors.plant_id verweisen aufeinander: die
      // Pflanze zuerst ohne Sensor anlegen, dann den Sensor eintragen und
      // zuletzt die Pflanze auf den Sensor verweisen lassen.
      insertPlant.run({
        id: p.id, name: p.name, type_id: p.type, room_id: p.room,
        sensor_id: null, added_at: daysAgo(p.days), bond: p.bond,
        watered_at: wateredAt, fertilized_at: fertilizedAt, says: p.says,
        soil_moisture: reading?.soil_moisture ?? null,
        light_lux: reading?.light_lux ?? null,
        temperature: reading?.temperature ?? null,
        humidity: reading?.humidity ?? null,
        reading_at: reading ? iso(now) : null
      });
      if (p.sensor) {
        insertSensor.run(p.sensor, p.id, 60 + Math.round(Math.random() * 38), iso(now));
        attachSensor.run(p.sensor, p.id);
      }

      if (reading) {
        insertReading.run(p.sensor, p.id, reading.soil_moisture, reading.light_lux, reading.temperature, reading.humidity, iso(now));
        const statuses = computeMetricStatuses(reading, type);
        const fert = fertStatus(fertilizedAt, type.fertDays, now);
        const mood = moodFromStatuses({ ...statuses, fert });
        insertStatus.run({ plant_id: p.id, ...statuses, fert, mood, updated_at: iso(now) });

        for (const [metric, status] of Object.entries({ ...statuses, fert })) {
          if (status && status !== 'ok') {
            insertNotification.run(p.id, metric, status, notificationMessage(p.name, metric, status), iso(now));
          }
        }
      } else {
        // Keine Sensor-Zuweisung: Naehrstoffstatus ist trotzdem zeitbasiert bekannt,
        // der Rest bleibt unbekannt bis ein Sensor angebracht wird.
        const fert = fertStatus(fertilizedAt, type.fertDays, now);
        insertStatus.run({ plant_id: p.id, soil: null, light: null, temp: null, humidity: null, fert, mood: fert === 'ok' ? 'happy' : 'hungry', updated_at: iso(now) });
      }
    }
  });
  insertMany();

  console.log(`Seed abgeschlossen: ${PLANT_TYPES.length} Pflanzenarten, ${ROOMS.length} Räume, ${PLANTS.length} Pflanzen.`);
}

run();
