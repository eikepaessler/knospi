// Anbindung an echte Hardware ueber sensors.duus.digital: ein ESP32 postet
// dort periodisch Rohdaten, dieser Dienst holt sie per Polling ab und speist
// sie ueber dieselbe applyReading()-Pipeline ein wie der Simulator (siehe
// simulator.js) - Vergleichslogik und Benachrichtigungen bleiben gleich.
//
// Antwortformat von GET https://sensors.duus.digital/<token>/tail?n=<n>:
// { count, messages: [{ ts, json: { device_id, soil: { percent }, light: { visible }, climate: { temperature_c, humidity_pct } } }, ...] }
import { db } from '../db/index.js';
import { applyReading } from './readings.js';
import { getPlantRow } from './plants.js';

const TAIL_BASE = process.env.SENSOR_TAIL_BASE || 'https://sensors.duus.digital';
const POLL_MS = 60_000;

export function parseToken(input) {
  const trimmed = (input || '').trim();
  const urlMatch = trimmed.match(/sensors\.duus\.digital\/([a-f0-9]{16,})/i);
  if (urlMatch) return urlMatch[1];
  if (/^[a-f0-9]{16,}$/i.test(trimmed)) return trimmed;
  return null;
}

async function fetchTail(token, n = 5) {
  const res = await fetch(`${TAIL_BASE}/${token}/tail?n=${n}`);
  if (!res.ok) throw new Error(`Sensor-Server antwortete mit ${res.status}`);
  return res.json();
}

function toReading(json) {
  if (!json || !json.soil || !json.light || !json.climate) return null;
  return {
    soil_moisture: json.soil.percent,
    light_lux: json.light.visible,
    temperature: json.climate.temperature_c,
    humidity: json.climate.humidity_pct
  };
}

// Koppelt eine Pflanze mit einem echten Geraet: token aus der Eingabe lesen,
// einmal die juengsten Nachrichten holen, device_id daraus uebernehmen
// (ein Token gehoert zu genau einem Geraet) und die erste Messung sofort
// anwenden, damit die Pflanze nicht auf den naechsten Poll-Tick warten muss.
export async function pairRealSensor(plantId, input) {
  const plant = getPlantRow(plantId);
  if (!plant) throw new Error('Pflanze nicht gefunden');

  const token = parseToken(input);
  if (!token) throw new Error('Konnte keinen Sensor-Token aus der Eingabe lesen.');

  const data = await fetchTail(token, 5);
  const latest = (data.messages || [])[data.messages.length - 1];
  if (!latest?.json?.device_id) throw new Error('Der Sensor hat noch keine Daten gesendet.');

  const reading = toReading(latest.json);
  if (!reading) throw new Error('Unerwartetes Datenformat vom Sensor.');

  const sensorId = `real:${latest.json.device_id}`;
  const now = new Date().toISOString();

  db.prepare('UPDATE plants SET sensor_id = NULL WHERE sensor_id = ?').run(sensorId);
  db.prepare(`
    INSERT INTO sensors (id, plant_id, battery, connected, last_seen, real_token, real_device_id, last_reading_ts)
    VALUES (?, ?, 100, 1, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET plant_id = excluded.plant_id, connected = 1, last_seen = excluded.last_seen,
      real_token = excluded.real_token, real_device_id = excluded.real_device_id, last_reading_ts = excluded.last_reading_ts
  `).run(sensorId, plant.id, now, token, latest.json.device_id, latest.ts);
  db.prepare('UPDATE plants SET sensor_id = ? WHERE id = ?').run(sensorId, plant.id);

  return applyReading(sensorId, reading);
}

async function pollOne(sensor) {
  const data = await fetchTail(sensor.real_token, 10);
  const messages = (data.messages || [])
    .filter((m) => m.json?.device_id === sensor.real_device_id)
    .filter((m) => !sensor.last_reading_ts || m.ts > sensor.last_reading_ts)
    .sort((a, b) => (a.ts < b.ts ? -1 : 1));

  for (const m of messages) {
    const reading = toReading(m.json);
    if (!reading) continue;
    applyReading(sensor.id, reading);
    db.prepare('UPDATE sensors SET last_reading_ts = ? WHERE id = ?').run(m.ts, sensor.id);
  }
}

async function pollTick() {
  const sensors = db.prepare('SELECT * FROM sensors WHERE real_token IS NOT NULL').all();
  for (const sensor of sensors) {
    try {
      await pollOne(sensor);
    } catch (err) {
      console.error('Sensor-Polling-Fehler fuer', sensor.id, err.message);
    }
  }
}

let timer = null;
export function startRealSensorPoller() {
  if (timer) return;
  timer = setInterval(pollTick, POLL_MS);
  console.log(`Echter-Sensor-Poller laeuft (alle ${POLL_MS / 1000}s).`);
}
export function stopRealSensorPoller() {
  clearInterval(timer);
  timer = null;
}
