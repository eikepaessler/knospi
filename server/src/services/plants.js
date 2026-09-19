import { db } from '../db/index.js';
import { METRIC_LABEL, METRIC_TEXT, MOOD_META, NO_SENSOR_SAYS } from './comparator.js';

const daysBetween = (iso) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));

function metricEntry(key, value, status) {
  const s = status ?? 'na';
  return { value, status: s, label: METRIC_LABEL[key], text: METRIC_TEXT[key][s] };
}

export function decoratePlant(row) {
  const type = db.prepare('SELECT * FROM plant_types WHERE id = ?').get(row.type_id);
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(row.room_id);
  const status = db.prepare('SELECT * FROM plant_status WHERE plant_id = ?').get(row.id) || {};
  const sensor = row.sensor_id ? db.prepare('SELECT * FROM sensors WHERE id = ?').get(row.sensor_id) : null;
  const photos = db.prepare('SELECT * FROM photos WHERE plant_id = ? ORDER BY taken_at ASC').all(row.id);
  const diagnosis = db.prepare('SELECT * FROM diagnoses WHERE plant_id = ? AND healed_at IS NULL ORDER BY diagnosed_at DESC LIMIT 1').get(row.id);

  const mood = sensor ? (status.mood || 'happy') : 'happy';
  const meta = MOOD_META[mood] || MOOD_META.happy;
  const says = sensor ? row.says : NO_SENSOR_SAYS[Math.abs(hashCode(row.id)) % NO_SENSOR_SAYS.length];

  return {
    id: row.id,
    name: row.name,
    species: type.latin,
    short: type.name,
    kind: type.id,
    says,
    bond: row.bond,
    daysTogether: daysBetween(row.added_at),
    together: `Ihr kennt euch seit ${daysBetween(row.added_at)} Tagen`,
    wateredAt: row.watered_at,
    room: room ? { id: room.id, name: room.name } : null,
    facts: [
      { label: 'Art', value: type.name },
      { label: 'Lateinisch', value: type.latin },
      { label: 'Raum', value: room?.name || '—' },
      { label: 'Bei dir seit', value: `${daysBetween(row.added_at)} Tagen` },
      { label: 'Sensor', value: sensor ? sensor.id : 'keiner' },
      { label: 'Letztes Wasser', value: row.watered_at ? new Date(row.watered_at).toLocaleDateString('de-DE') : '—' }
    ],
    type: {
      id: type.id, name: type.name, latin: type.latin, tip: type.tip, lore: type.lore, roomHint: type.room_hint
    },
    sensor: sensor ? { id: sensor.id, battery: sensor.battery, connected: !!sensor.connected, lastSeen: sensor.last_seen } : null,
    hasSensor: !!sensor,
    showMood: !!sensor,
    mood,
    moodLabel: sensor ? meta.label : 'Keine Daten',
    face: sensor ? meta.face : 'pot',
    tone: sensor ? meta.tone : 'mut',
    actionLabel: sensor ? meta.action : null,
    hasAction: sensor && !!meta.action,
    fixMetric: meta.fix,
    metrics: !sensor ? [] : ['soil', 'light', 'temp', 'humidity'].map((key) => {
      const entry = metricEntry(key, row[metricColumn(key)], status[key]);
      return { key, ...entry };
    }),
    richtwerte: ['soil', 'light', 'temp', 'humidity'].map((key) => ({
      key, label: METRIC_LABEL[key],
      min: type[`${key}_min`], max: type[`${key}_max`],
      unit: UNIT[key],
      hint: type[`${key}_hint`],
      provisional: key === 'soil' ? !!type.soil_provisional : false,
      value: row[metricColumn(key)],
      status: sensor ? (status[key] ?? 'na') : 'na'
    })),
    photos: photos.map((p) => ({ id: p.id, uri: p.uri, takenAt: p.taken_at, note: p.note, isFirst: !!p.is_first })),
    diagnosis: diagnosis ? {
      id: diagnosis.id, name: diagnosis.name, latin: diagnosis.latin, confidence: diagnosis.confidence,
      tells: diagnosis.tells, steps: JSON.parse(diagnosis.steps), diagnosedAt: diagnosis.diagnosed_at
    } : null,
    hasDiagnosis: !!diagnosis,
    readingAt: row.reading_at
  };
}

const UNIT = { soil: '%', light: ' lx', temp: '°C', humidity: '%' };
function metricColumn(key) {
  return { soil: 'soil_moisture', light: 'light_lux', temp: 'temperature', humidity: 'humidity' }[key];
}
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return h;
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
