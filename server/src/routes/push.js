import { Router } from 'express';
import { publicVapidKey, saveSubscription, removeSubscription } from '../services/push.js';

export const pushRouter = Router();

pushRouter.get('/public-key', (req, res) => {
  res.json({ publicKey: publicVapidKey });
});

pushRouter.post('/subscribe', (req, res) => {
  const sub = req.body;
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return res.status(400).json({ error: 'Ungültiges Subscription-Objekt' });
  }
  saveSubscription(sub);
  res.status(201).end();
});

pushRouter.post('/unsubscribe', (req, res) => {
  if (req.body?.endpoint) removeSubscription(req.body.endpoint);
  res.status(204).end();
});
