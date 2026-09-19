import { Router } from 'express';
import { saveExpoToken, removeExpoToken } from '../services/push.js';

export const pushRouter = Router();

pushRouter.post('/register', (req, res) => {
  const { token } = req.body;
  if (!token || typeof token !== 'string') return res.status(400).json({ error: 'Expo-Push-Token fehlt' });
  saveExpoToken(token);
  res.status(201).end();
});

pushRouter.post('/unregister', (req, res) => {
  if (req.body?.token) removeExpoToken(req.body.token);
  res.status(204).end();
});
