import { fileURLToPath } from 'node:url';
import { db } from './index.js';
import { PLANT_TYPES } from './plantTypes.js';
import { ROOMS, PLANTS } from './seedData.js';
import { computeMetricStatuses, moodFromStatuses, notificationMessage } from '../services/comparator.js';

const now = new Date();
const iso = (d) => d.toISOString();
const daysAgo = (n) => iso(new Date(now.getTime() - n * 86400000));

function sampleValue([min, max], target) {
  const span = max - min;
  if (target === 'low') return Math.round((min - span * 0.18) * 10) / 10;
  if (target === 'high') return Math.round((max + span * 0.18) * 10) / 10;
  return Math.round((min + span / 2) * 10) / 10;
}

// mood -> welche Metrik ausserhalb des Bereichs liegen soll, und in welche Richtung
const MOOD_TARGET = {
  thirsty: { metric: 'soil', dir: 'low' },
  soggy: { metric: 'soil', dir: 'high' },
  dark: { metric: 'light', dir: 'low' },
  cold: { metric: 'temp', dir: 'low' },
  air: { metric: 'humidity', dir: 'low' }
};

const STICKERS = [
  { key: 'green_thumb', label: 'Grüner Daumen', tint: '#E4F0C4', ink: '#4A6B21', glyph: 'drop', got: false },
  { key: 'first_rescue', label: 'Erste Rettung', tint: '#F4DAD5', ink: '#94513F', glyph: 'heart', got: true },
  { key: 'first_scan', label: 'Erster Scan', tint: '#DEE7EC', ink: '#4A6070', glyph: 'lens', got: true },
  { key: 'collector', label: 'Sammler', tint: '#E5E2EC', ink: '#5C5170', glyph: 'square', got: true },
  { key: 'one_year', label: 'Ein Jahr zusammen', tint: '#DCE9E2', ink: '#3F6157', glyph: 'sun', got: false },
  { key: 'week_winner', label: 'Wochensieger', tint: '#EBEBD0', ink: '#63652F', glyph: 'thumb', got: false },
  { key: 'plant_doctor', label: 'Erste Diagnose', tint: '#F4DAD5', ink: '#94513F', glyph: 'cross', got: false },
  { key: 'full_house', label: 'Volles Haus', tint: '#E4F0C4', ink: '#4A6B21', glyph: 'home', got: false }
];

export function seedDatabase() {
  const insertType = db.prepare(`
    INSERT OR REPLACE INTO plant_types
      (id,name,latin,tip,lore,room_hint,
       soil_min,soil_max,soil_hint,soil_provisional,
       light_min,light_max,light_hint,
       temp_min,temp_max,temp_hint,
       humidity_min,humidity_max,humidity_hint)
    VALUES (@id,@name,@latin,@tip,@lore,@room_hint,
       @soil_min,@soil_max,@soil_hint,@soil_provisional,
       @light_min,@light_max,@light_hint,
       @temp_min,@temp_max,@temp_hint,
       @humidity_min,@humidity_max,@humidity_hint)
  `);
  const typeById = {};
  for (const t of PLANT_TYPES) {
    typeById[t.id] = {
      id: t.id, name: t.name, latin: t.latin, tip: t.tip, lore: t.lore, roomHint: t.roomHint,
      range: { soil: [t.soil.min, t.soil.max], light: [t.light.min, t.light.max], temp: [t.temp.min, t.temp.max], humidity: [t.humidity.min, t.humidity.max] }
    };
    insertType.run({
      id: t.id, name: t.name, latin: t.latin, tip: t.tip, lore: t.lore, room_hint: t.roomHint,
      soil_min: t.soil.min, soil_max: t.soil.max, soil_hint: t.soil.hint, soil_provisional: t.soil.provisional ? 1 : 0,
      light_min: t.light.min, light_max: t.light.max, light_hint: t.light.hint,
      temp_min: t.temp.min, temp_max: t.temp.max, temp_hint: t.temp.hint,
      humidity_min: t.humidity.min, humidity_max: t.humidity.max, humidity_hint: t.humidity.hint
    });
  }

  const insertRoom = db.prepare('INSERT OR REPLACE INTO rooms (id, name) VALUES (?, ?)');
  for (const r of ROOMS) insertRoom.run(r.id, r.name);

  const insertSensor = db.prepare('INSERT OR REPLACE INTO sensors (id, plant_id, battery, connected, last_seen) VALUES (?, ?, ?, 1, ?)');
  const insertPlant = db.prepare(`
    INSERT OR REPLACE INTO plants
      (id,name,type_id,room_id,sensor_id,added_at,bond,watered_at,says,
       soil_moisture,light_lux,temperature,humidity,reading_at)
    VALUES (@id,@name,@type_id,@room_id,@sensor_id,@added_at,@bond,@watered_at,@says,
       @soil_moisture,@light_lux,@temperature,@humidity,@reading_at)
  `);
  const insertStatus = db.prepare(`
    INSERT OR REPLACE INTO plant_status (plant_id, soil, light, temp, humidity, mood, updated_at)
    VALUES (@plant_id, @soil, @light, @temp, @humidity, @mood, @updated_at)
  `);
  const insertReading = db.prepare(`
    INSERT INTO sensor_readings (sensor_id, plant_id, soil_moisture, light_lux, temperature, humidity, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertNotification = db.prepare(`
    INSERT INTO notifications (plant_id, metric, status, message, created_at, read)
    VALUES (?, ?, ?, ?, ?, 0)
  `);
  const insertSticker = db.prepare(`
    INSERT OR REPLACE INTO stickers (key, label, tint, ink, glyph, got, unlocked_at)
    VALUES (@key, @label, @tint, @ink, @glyph, @got, @unlocked_at)
  `);

  const attachSensor = db.prepare('UPDATE plants SET sensor_id = ? WHERE id = ?');

  const insertMany = db.transaction(() => {
    for (const s of STICKERS) {
      insertSticker.run({ ...s, got: s.got ? 1 : 0, unlocked_at: s.got ? daysAgo(30) : null });
    }

    for (const p of PLANTS) {
      const type = typeById[p.type];
      const target = MOOD_TARGET[p.mood];
      const wateredAt = daysAgo(p.wateredDaysAgo);

      let reading = null;
      if (p.sensor) {
        const pick = (metric) => sampleValue(type.range[metric], target && target.metric === metric ? target.dir : 'ok');
        reading = {
          soil_moisture: pick('soil'),
          light_lux: pick('light'),
          temperature: pick('temp'),
          humidity: pick('humidity')
        };
      }

      // plants.sensor_id und sensors.plant_id verweisen aufeinander: die
      // Pflanze zuerst ohne Sensor anlegen, dann den Sensor eintragen und
      // zuletzt die Pflanze auf den Sensor verweisen lassen.
      insertPlant.run({
        id: p.id, name: p.name, type_id: p.type, room_id: p.room,
        sensor_id: null, added_at: daysAgo(p.days), bond: p.bond,
        watered_at: wateredAt, says: p.says,
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
        const mood = moodFromStatuses(statuses);
        insertStatus.run({ plant_id: p.id, ...statuses, mood, updated_at: iso(now) });

        for (const [metric, status] of Object.entries(statuses)) {
          if (status && status !== 'ok') {
            insertNotification.run(p.id, metric, status, notificationMessage(p.name, metric, status), iso(now));
          }
        }
      } else {
        insertStatus.run({ plant_id: p.id, soil: null, light: null, temp: null, humidity: null, mood: 'happy', updated_at: iso(now) });
      }
    }
  });
  insertMany();

  console.log(`Seed abgeschlossen: ${PLANT_TYPES.length} Pflanzenarten, ${ROOMS.length} Räume, ${PLANTS.length} Pflanzen.`);
}

export function seedIfEmpty() {
  const { c } = db.prepare('SELECT COUNT(*) c FROM plants').get();
  if (c === 0) seedDatabase();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase();
}
