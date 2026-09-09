import { Router } from 'express';
import { db } from '../db/index.js';

export const notificationsRouter = Router();

notificationsRouter.get('/', (req, res) => {
  const limit = Math.min(200, Number(req.query.limit) || 50);
  const rows = db.prepare(`
    SELECT n.id, n.plant_id as plantId, p.name as plantName, n.metric, n.status, n.message, n.created_at as createdAt, n.read
    FROM notifications n JOIN plants p ON p.id = n.plant_id
    ORDER BY n.created_at DESC LIMIT ?
  `).all(limit);
  res.json(rows.map((r) => ({ ...r, read: !!r.read })));
});

notificationsRouter.get('/unread-count', (req, res) => {
  res.json(db.prepare('SELECT COUNT(*) c FROM notifications WHERE read = 0').get());
});

notificationsRouter.patch('/:id/read', (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

notificationsRouter.patch('/read-all', (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE read = 0').run();
  res.status(204).end();
});
