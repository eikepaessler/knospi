import { Router } from 'express';
import { db } from '../db/index.js';
import { nanoid } from '../utils/nanoid.js';
import { getAllPlantsDecorated, getPlantDecorated, getPlantRow } from '../services/plants.js';
import { waterPlant, fertilizePlant, fixPlant } from '../services/readings.js';
import { broadcast } from '../services/events.js';

export const plantsRouter = Router();

plantsRouter.get('/', (req, res) => {
  res.json(getAllPlantsDecorated());
});

plantsRouter.get('/:id', (req, res) => {
  const plant = getPlantDecorated(req.params.id);
  if (!plant) return res.status(404).json({ error: 'Pflanze nicht gefunden' });
  res.json(plant);
});

plantsRouter.get('/:id/readings', (req, res) => {
  const limit = Math.min(500, Number(req.query.limit) || 100);
  const rows = db.prepare(`
    SELECT soil_moisture, light_lux, temperature, humidity, created_at
    FROM sensor_readings WHERE plant_id = ? ORDER BY created_at DESC LIMIT ?
  `).all(req.params.id, limit);
  res.json(rows.reverse());
});

plantsRouter.post('/', (req, res) => {
  const { name, typeId, roomId } = req.body;
  const type = db.prepare('SELECT id FROM plant_types WHERE id = ?').get(typeId);
  const room = db.prepare('SELECT id FROM rooms WHERE id = ?').get(roomId);
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name fehlt' });
  if (!type) return res.status(400).json({ error: 'Unbekannte Pflanzenart' });
  if (!room) return res.status(400).json({ error: 'Unbekannter Raum' });

  const id = nanoid();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO plants (id, name, type_id, room_id, sensor_id, added_at, bond, watered_at, fertilized_at, says)
    VALUES (?, ?, ?, ?, NULL, ?, 1, NULL, ?, 'Schön, hier zu sein.')
  `).run(id, name.trim(), typeId, roomId, now, now);
  db.prepare(`
    INSERT INTO plant_status (plant_id, soil, light, temp, humidity, fert, mood, updated_at)
    VALUES (?, NULL, NULL, NULL, NULL, 'ok', 'happy', ?)
  `).run(id, now);

  const plant = getPlantDecorated(id);
  broadcast('plant-updated', plant);
  res.status(201).json(plant);
});

plantsRouter.patch('/:id', (req, res) => {
  const row = getPlantRow(req.params.id);
  if (!row) return res.status(404).json({ error: 'Pflanze nicht gefunden' });
  const { name, roomId } = req.body;
  if (name !== undefined) db.prepare('UPDATE plants SET name = ? WHERE id = ?').run(name.trim(), row.id);
  if (roomId !== undefined) db.prepare('UPDATE plants SET room_id = ? WHERE id = ?').run(roomId, row.id);
  const plant = getPlantDecorated(row.id);
  broadcast('plant-updated', plant);
  res.json(plant);
});

plantsRouter.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM plants WHERE id = ?').run(req.params.id);
  broadcast('plant-removed', { id: req.params.id });
  res.status(204).end();
});

// Sensor-"Pairing": ordnet der Pflanze einen (simulierten oder echten)
// BLE-Sensor zu. sensorId ist die vom Geraet gemeldete Kennung.
plantsRouter.post('/:id/sensor', (req, res) => {
  const row = getPlantRow(req.params.id);
  if (!row) return res.status(404).json({ error: 'Pflanze nicht gefunden' });
  const sensorId = (req.body.sensorId || nanoid().toUpperCase().slice(0, 4)).toUpperCase();

  const taken = db.prepare('SELECT plant_id FROM sensors WHERE id = ?').get(sensorId);
  if (taken && taken.plant_id && taken.plant_id !== row.id) {
    return res.status(409).json({ error: 'Sensor ist bereits einer anderen Pflanze zugeordnet' });
  }

  db.prepare('UPDATE plants SET sensor_id = NULL WHERE sensor_id = ?').run(sensorId);
  db.prepare(`
    INSERT INTO sensors (id, plant_id, battery, connected, last_seen) VALUES (?, ?, 100, 1, ?)
    ON CONFLICT(id) DO UPDATE SET plant_id = excluded.plant_id, connected = 1, last_seen = excluded.last_seen
  `).run(sensorId, row.id, new Date().toISOString());
  db.prepare('UPDATE plants SET sensor_id = ? WHERE id = ?').run(sensorId, row.id);

  const plant = getPlantDecorated(row.id);
  broadcast('plant-updated', plant);
  res.json(plant);
});

plantsRouter.delete('/:id/sensor', (req, res) => {
  const row = getPlantRow(req.params.id);
  if (!row) return res.status(404).json({ error: 'Pflanze nicht gefunden' });
  if (row.sensor_id) db.prepare('DELETE FROM sensors WHERE id = ?').run(row.sensor_id);
  db.prepare('UPDATE plants SET sensor_id = NULL WHERE id = ?').run(row.id);
  db.prepare('UPDATE plant_status SET soil=NULL, light=NULL, temp=NULL, humidity=NULL WHERE plant_id = ?').run(row.id);

  const plant = getPlantDecorated(row.id);
  broadcast('plant-updated', plant);
  res.json(plant);
});

plantsRouter.post('/:id/water', (req, res) => {
  if (!getPlantRow(req.params.id)) return res.status(404).json({ error: 'Pflanze nicht gefunden' });
  res.json(waterPlant(req.params.id));
});

plantsRouter.post('/:id/fertilize', (req, res) => {
  if (!getPlantRow(req.params.id)) return res.status(404).json({ error: 'Pflanze nicht gefunden' });
  res.json(fertilizePlant(req.params.id));
});

// Generische Pflege-Aktion: behebt automatisch das aktuell dringendste Problem.
plantsRouter.post('/:id/fix', (req, res) => {
  if (!getPlantRow(req.params.id)) return res.status(404).json({ error: 'Pflanze nicht gefunden' });
  res.json(fixPlant(req.params.id));
});
