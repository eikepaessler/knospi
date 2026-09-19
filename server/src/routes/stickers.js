import { Router } from 'express';
import { db } from '../db/index.js';

export const stickersRouter = Router();

stickersRouter.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM stickers').all();
  res.json(rows.map((s) => ({ key: s.key, label: s.label, tint: s.tint, ink: s.ink, glyph: s.glyph, got: !!s.got, unlockedAt: s.unlocked_at })));
});
