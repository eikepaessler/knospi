import { Router } from 'express';
import { db } from '../db/index.js';
import { nanoid } from '../utils/nanoid.js';
import { getAllPlantsDecorated, getPlantDecorated, getPlantRow } from '../services/plants.js';
import { waterPlant, fixPlant } from '../services/readings.js';
import { pairRealSensor } from '../services/realSensor.js';
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
    INSERT INTO plants (id, name, type_id, room_id, sensor_id, added_at, bond, watered_at, says)
    VALUES (?, ?, ?, ?, NULL, ?, 1, NULL, 'Schön, hier zu sein.')
  `).run(id, name.trim(), typeId, roomId, now);
  db.prepare(`
    INSERT INTO plant_status (plant_id, soil, light, temp, humidity, mood, updated_at)
    VALUES (?, NULL, NULL, NULL, NULL, 'happy', ?)
  `).run(id, now);

  const plant = getPlantDecorated(id);
  broadcast('plant-updated', plant);
  res.status(201).json(plant);
});

plantsRouter.patch('/:id', (req, res) => {
  const row = getPlantRow(req.params.id);
  if (!row) return res.status(404).json({ error: 'Pflanze nicht gefunden' });
  const { name, roomId, typeId } = req.body;
  if (name !== undefined) db.prepare('UPDATE plants SET name = ? WHERE id = ?').run(name.trim(), row.id);
  if (roomId !== undefined) {
    const room = db.prepare('SELECT id FROM rooms WHERE id = ?').get(roomId);
    if (!room) return res.status(400).json({ error: 'Unbekannter Raum' });
    db.prepare('UPDATE plants SET room_id = ? WHERE id = ?').run(roomId, row.id);
  }
  if (typeId !== undefined) {
    const type = db.prepare('SELECT id FROM plant_types WHERE id = ?').get(typeId);
    if (!type) return res.status(400).json({ error: 'Unbekannte Pflanzenart' });
    db.prepare('UPDATE plants SET type_id = ? WHERE id = ?').run(typeId, row.id);
  }
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

// Kopplung mit einem echten Sensor (sensors.duus.digital) statt einer
// simulierten Kennung: body { input } nimmt sowohl den vollen Link als
// auch nur den Token an.
plantsRouter.post('/:id/sensor/real', async (req, res) => {
  if (!getPlantRow(req.params.id)) return res.status(404).json({ error: 'Pflanze nicht gefunden' });
  try {
    const plant = await pairRealSensor(req.params.id, req.body.input);
    broadcast('plant-updated', plant);
    res.json(plant);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
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

// Giessen: { plant, reward } - reward ist ein Sticker-Objekt, wenn dies das
// erste Giessen ueberhaupt war (fuer das Freischalt-Overlay), sonst null.
plantsRouter.post('/:id/water', (req, res) => {
  if (!getPlantRow(req.params.id)) return res.status(404).json({ error: 'Pflanze nicht gefunden' });
  res.json(waterPlant(req.params.id));
});

// Generische Erledigen-Aktion: behebt das Problem, das die aktuelle
// Stimmung bestimmt. { plant, reward }.
plantsRouter.post('/:id/fix', (req, res) => {
  if (!getPlantRow(req.params.id)) return res.status(404).json({ error: 'Pflanze nicht gefunden' });
  res.json(fixPlant(req.params.id));
});

// ── Fotoalbum ──
plantsRouter.get('/:id/photos', (req, res) => {
  const rows = db.prepare('SELECT * FROM photos WHERE plant_id = ? ORDER BY taken_at ASC').all(req.params.id);
  res.json(rows.map((p) => ({ id: p.id, uri: p.uri, takenAt: p.taken_at, note: p.note, isFirst: !!p.is_first })));
});

plantsRouter.post('/:id/photos', (req, res) => {
  const row = getPlantRow(req.params.id);
  if (!row) return res.status(404).json({ error: 'Pflanze nicht gefunden' });
  const { uri, note } = req.body;
  if (!uri) return res.status(400).json({ error: 'uri fehlt' });

  const isFirst = db.prepare('SELECT COUNT(*) c FROM photos WHERE plant_id = ?').get(row.id).c === 0;
  const id = nanoid();
  const now = new Date().toISOString();
  db.prepare('INSERT INTO photos (id, plant_id, uri, taken_at, note, is_first) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, row.id, uri, now, note || null, isFirst ? 1 : 0);

  const plant = getPlantDecorated(row.id);
  broadcast('plant-updated', plant);
  res.status(201).json(plant);
});

// ── Pflanzen-Doktor: Diagnosen ──
plantsRouter.post('/:id/diagnoses', (req, res) => {
  const row = getPlantRow(req.params.id);
  if (!row) return res.status(404).json({ error: 'Pflanze nicht gefunden' });
  const { name, latin, confidence, tells, steps, photoUri } = req.body;
  if (!name || !Array.isArray(steps)) return res.status(400).json({ error: 'name und steps sind erforderlich' });

  const id = nanoid();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO diagnoses (id, plant_id, name, latin, confidence, tells, steps, photo_uri, diagnosed_at, healed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
  `).run(id, row.id, name, latin || '', confidence || 0, tells || '', JSON.stringify(steps), photoUri || null, now);

  if (photoUri) {
    db.prepare('INSERT INTO photos (id, plant_id, uri, taken_at, note, is_first) VALUES (?, ?, ?, ?, ?, 0)')
      .run(nanoid(), row.id, photoUri, now, `Doktor: ${name}`);
  }

  const plant = getPlantDecorated(row.id);
  broadcast('plant-updated', plant);
  res.status(201).json(plant);
});

plantsRouter.patch('/:id/diagnoses/:diagId/heal', (req, res) => {
  db.prepare('UPDATE diagnoses SET healed_at = ? WHERE id = ? AND plant_id = ?')
    .run(new Date().toISOString(), req.params.diagId, req.params.id);
  const plant = getPlantDecorated(req.params.id);
  broadcast('plant-updated', plant);
  res.json(plant);
});
