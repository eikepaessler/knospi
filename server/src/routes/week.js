import { Router } from 'express';
import { db } from '../db/index.js';

export const weekRouter = Router();

const DAY_MS = 86400000;
function mondayOf(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0=Montag
  d.setHours(0, 0, 0, 0);
  return new Date(d.getTime() - day * DAY_MS);
}

// Wie ging's der Wohnung diese Woche: pro Tag (Mo-So) ok/warn/bad, oder
// null fuer Tage vor der ersten Pflanze bzw. nach heute.
weekRouter.get('/', (req, res) => {
  const firstPlant = db.prepare('SELECT MIN(added_at) d FROM plants').get().d;
  const monday = mondayOf(new Date());
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }, (_, i) => {
    const dayStart = new Date(monday.getTime() + i * DAY_MS);
    const dayEnd = new Date(dayStart.getTime() + DAY_MS);
    if ((firstPlant && dayStart < new Date(firstPlant)) || dayStart > today) {
      return { date: dayStart.toISOString().slice(0, 10), status: null };
    }
    const rows = db.prepare(`
      SELECT plant_id, metric, status FROM notifications
      WHERE created_at >= ? AND created_at < ?
    `).all(dayStart.toISOString(), dayEnd.toISOString());

    const problems = rows.filter((r) => r.status !== 'ok');
    if (problems.length === 0) return { date: dayStart.toISOString().slice(0, 10), status: 'ok' };

    const resolvedSameDay = problems.every((p) =>
      rows.some((r) => r.plant_id === p.plant_id && r.metric === p.metric && r.status === 'ok'));
    return { date: dayStart.toISOString().slice(0, 10), status: resolvedSameDay ? 'warn' : 'bad' };
  });

  res.json(days);
});
