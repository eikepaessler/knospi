// Sensor-Simulator: erzeugt periodisch Messwerte fuer Pflanzen mit
// zugewiesenem Sensor und speist sie ueber dieselbe applyReading()-Pipeline
// ein, die auch ein echter Bluetooth-Sensor treffen wuerde (siehe
// POST /api/sensors/:id/readings in routes/sensors.js). Ein echter
// BLE-Adapter (Web Bluetooth im Browser oder ein Node-BLE-Bridge-Skript)
// kann diesen Simulator 1:1 ersetzen, ohne dass sich an applyReading(),
// der Vergleichslogik oder den Benachrichtigungen etwas aendert.
import { db } from '../db/index.js';
import { applyReading } from './readings.js';
import { broadcast } from './events.js';
import { pushToAll } from './push.js';
import { getSettings } from './settings.js';

const TICK_MS = 20_000;
const OFFLINE_MS = 3 * 60_000; // kein Reading seit 3 Minuten -> gilt als offline
const state = new Map();

// Push-Anlass "Sensor offline": greift v.a. bei echter Hardware, die
// aufhoert zu senden. Der Simulator aktualisiert verbundene Sensoren bei
// jedem Tick, daher wird dieser Zweig hier nur fuer echte, gestoppte
// Sensoren relevant.
function checkOffline() {
  const now = Date.now();
  const sensors = db.prepare(`
    SELECT s.*, p.id as plant_id, p.name as plant_name
    FROM sensors s JOIN plants p ON p.sensor_id = s.id
    WHERE s.connected = 1 AND s.last_seen IS NOT NULL
  `).all();

  for (const s of sensors) {
    if (now - new Date(s.last_seen).getTime() < OFFLINE_MS) continue;
    db.prepare('UPDATE sensors SET connected = 0 WHERE id = ?').run(s.id);
    broadcast('plant-updated', { id: s.plant_id });
    const settings = getSettings();
    if (settings.push) {
      pushToAll({ title: `${s.plant_name}: Sensor offline`, body: `${s.plant_name}s Sensor meldet sich seit einer Weile nicht mehr.`, plantId: s.plant_id }).catch(() => {});
    }
  }
}

function clampDrift(value, delta, min, max, pad) {
  const next = value + delta;
  return Math.min(max + pad, Math.max(min - pad, next));
}

function tick() {
  const plants = db.prepare(`
    SELECT p.*, t.soil_min, t.soil_max, t.light_min, t.light_max,
           t.temp_min, t.temp_max, t.humidity_min, t.humidity_max
    FROM plants p JOIN plant_types t ON t.id = p.type_id
    WHERE p.sensor_id IS NOT NULL
  `).all();

  for (const p of plants) {
    let s = state.get(p.sensor_id);
    if (!s) {
      s = { soil: p.soil_moisture, light: p.light_lux, temp: p.temperature, humidity: p.humidity };
      state.set(p.sensor_id, s);
    }

    // Erde trocknet langsam ab (Verdunstung), bis wieder gegossen wird.
    const soilSpan = p.soil_max - p.soil_min;
    s.soil = clampDrift(s.soil, -soilSpan * 0.012 + (Math.random() - 0.5) * soilSpan * 0.01, p.soil_min, p.soil_max, soilSpan * 0.35);
    // Licht, Temperatur und Luftfeuchte schwanken leicht um ihren Wert.
    const lightSpan = p.light_max - p.light_min;
    s.light = clampDrift(s.light, (Math.random() - 0.52) * lightSpan * 0.05, p.light_min, p.light_max, lightSpan * 0.3);
    const tempSpan = p.temp_max - p.temp_min;
    s.temp = clampDrift(s.temp, (Math.random() - 0.5) * tempSpan * 0.06, p.temp_min, p.temp_max, tempSpan * 0.3);
    const humiditySpan = p.humidity_max - p.humidity_min;
    s.humidity = clampDrift(s.humidity, (Math.random() - 0.5) * humiditySpan * 0.05, p.humidity_min, p.humidity_max, humiditySpan * 0.3);

    try {
      applyReading(p.sensor_id, {
        soil_moisture: Math.round(s.soil * 10) / 10,
        light_lux: Math.round(s.light),
        temperature: Math.round(s.temp * 10) / 10,
        humidity: Math.round(s.humidity * 10) / 10
      });
    } catch (err) {
      console.error('Simulator-Fehler fuer Sensor', p.sensor_id, err.message);
    }
  }

  checkOffline();
}

let timer = null;
export function startSimulator() {
  if (timer) return;
  timer = setInterval(tick, TICK_MS);
  console.log(`Sensor-Simulator laeuft (alle ${TICK_MS / 1000}s).`);
}
export function stopSimulator() {
  clearInterval(timer);
  timer = null;
}
