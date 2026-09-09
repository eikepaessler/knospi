import { db } from '../db/index.js';
import { METRIC_LABEL, METRIC_TEXT, MOOD_META } from './comparator.js';

const daysBetween = (iso) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));

function metricEntry(key, value, status) {
  return {
    value,
    status: status ?? null,
    label: METRIC_LABEL[key],
    text: status ? METRIC_TEXT[key][status] : 'Keine Daten'
  };
}

export function decoratePlant(row) {
  const type = db.prepare('SELECT * FROM plant_types WHERE id = ?').get(row.type_id);
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(row.room_id);
  const status = db.prepare('SELECT * FROM plant_status WHERE plant_id = ?').get(row.id) || {};
  const sensor = row.sensor_id ? db.prepare('SELECT * FROM sensors WHERE id = ?').get(row.sensor_id) : null;
  const mood = status.mood || 'happy';
  const meta = MOOD_META[mood] || MOOD_META.happy;

  return {
    id: row.id,
    name: row.name,
    says: row.says,
    bond: row.bond,
    daysTogether: daysBetween(row.added_at),
    wateredAt: row.watered_at,
    fertilizedAt: row.fertilized_at,
    room: room ? { id: room.id, name: room.name } : null,
    type: {
      id: type.id, name: type.name, latin: type.latin, tip: type.tip, lore: type.lore,
      care: {
        light: type.care_light, spot: type.care_spot, water: type.care_water,
        temp: type.care_temp, food: type.care_food, room: type.care_room
      }
    },
    sensor: sensor ? { id: sensor.id, battery: sensor.battery, connected: !!sensor.connected, lastSeen: sensor.last_seen } : null,
    hasSensor: !!sensor,
    mood,
    moodLabel: sensor ? meta.label : 'Keine Daten',
    moodFace: sensor ? meta.face : 'pot',
    fixMetric: meta.fix,
    metrics: {
      soil: metricEntry('soil', row.soil_moisture, status.soil),
      light: metricEntry('light', row.light_lux, status.light),
      temp: metricEntry('temp', row.temperature, status.temp),
      humidity: metricEntry('humidity', row.humidity, status.humidity),
      fert: metricEntry('fert', null, status.fert)
    },
    readingAt: row.reading_at
  };
}

export function getPlantRow(id) {
  return db.prepare('SELECT * FROM plants WHERE id = ?').get(id);
}

export function getAllPlantsDecorated() {
  return db.prepare('SELECT * FROM plants ORDER BY name').all().map(decoratePlant);
}

export function getPlantDecorated(id) {
  const row = getPlantRow(id);
  return row ? decoratePlant(row) : null;
}
