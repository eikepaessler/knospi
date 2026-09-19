import { Router } from 'express';
import { getSettings, updateSettings } from '../services/settings.js';

export const settingsRouter = Router();

settingsRouter.get('/', (req, res) => res.json(getSettings()));

settingsRouter.patch('/', (req, res) => {
  const allowed = ['push', 'dryReminder', 'weeklyRecap', 'offerRead'];
  const patch = {};
  for (const key of allowed) if (typeof req.body[key] === 'boolean') patch[key] = req.body[key];
  res.json(updateSettings(patch));
});
