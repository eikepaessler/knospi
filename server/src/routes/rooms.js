import { Router } from 'express';
import { nanoid } from '../utils/nanoid.js';
import { db } from '../db/index.js';

export const roomsRouter = Router();

roomsRouter.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM rooms ORDER BY name').all());
});

roomsRouter.post('/', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name fehlt' });
  const id = nanoid();
  db.prepare('INSERT INTO rooms (id, name) VALUES (?, ?)').run(id, name.trim());
  res.status(201).json({ id, name: name.trim() });
});

roomsRouter.patch('/:id', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name fehlt' });
  const info = db.prepare('UPDATE rooms SET name = ? WHERE id = ?').run(name.trim(), req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Raum nicht gefunden' });
  res.json({ id: req.params.id, name: name.trim() });
});

roomsRouter.delete('/:id', (req, res) => {
  const hasPlants = db.prepare('SELECT COUNT(*) c FROM plants WHERE room_id = ?').get(req.params.id).c;
  if (hasPlants > 0) return res.status(409).json({ error: 'Raum enthält noch Pflanzen' });
  db.prepare('DELETE FROM rooms WHERE id = ?').run(req.params.id);
  res.status(204).end();
});
