import { Router } from 'express';
import { db } from '../db/index.js';
import { applyReading } from '../services/readings.js';

export const sensorsRouter = Router();

sensorsRouter.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT s.id, s.battery, s.connected, s.last_seen, p.id as plant_id, p.name as plant_name
    FROM sensors s LEFT JOIN plants p ON p.sensor_id = s.id
  `).all();
  res.json(rows.map((r) => ({
    id: r.id, battery: r.battery, connected: !!r.connected, lastSeen: r.last_seen,
    plant: r.plant_id ? { id: r.plant_id, name: r.plant_name } : null
  })));
});

// Einspeise-Endpunkt fuer echte Hardware: ein Web-Bluetooth-Client oder eine
// BLE-Gateway-Bruecke (z.B. ein Raspberry Pi neben den Pflanzen) postet hier
// die vom Sensor gelesenen Rohwerte. Der Simulator (services/simulator.js)
// ruft intern dieselbe applyReading()-Funktion auf - echte Sensoren lassen
// sich also einfach anschliessen, ohne Backend-Logik zu aendern.
sensorsRouter.post('/:id/readings', (req, res) => {
  const { soilMoisture, lightLux, temperature, humidity, battery } = req.body;
  if ([soilMoisture, lightLux, temperature, humidity].some((v) => typeof v !== 'number')) {
    return res.status(400).json({ error: 'soilMoisture, lightLux, temperature und humidity (Zahlen) sind erforderlich' });
  }
  const sensor = db.prepare('SELECT * FROM sensors WHERE id = ?').get(req.params.id);
  if (!sensor) return res.status(404).json({ error: 'Sensor nicht bekannt' });
  if (!sensor.plant_id) return res.status(409).json({ error: 'Sensor ist keiner Pflanze zugeordnet' });

  if (typeof battery === 'number') {
    db.prepare('UPDATE sensors SET battery = ? WHERE id = ?').run(battery, sensor.id);
  }
  const plant = applyReading(sensor.id, {
    soil_moisture: soilMoisture, light_lux: lightLux, temperature, humidity
  });
  res.json(plant);
});
