import webpush from 'web-push';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '../db/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const vapidPath = path.resolve(__dirname, '../../data/vapid.json');

function loadOrCreateVapidKeys() {
  if (fs.existsSync(vapidPath)) {
    return JSON.parse(fs.readFileSync(vapidPath, 'utf-8'));
  }
  const keys = webpush.generateVAPIDKeys();
  fs.mkdirSync(path.dirname(vapidPath), { recursive: true });
  fs.writeFileSync(vapidPath, JSON.stringify(keys, null, 2));
  return keys;
}

const vapidKeys = loadOrCreateVapidKeys();
webpush.setVapidDetails('mailto:kontakt@knospi.app', vapidKeys.publicKey, vapidKeys.privateKey);

export const publicVapidKey = vapidKeys.publicKey;

export function saveSubscription(sub) {
  db.prepare(`
    INSERT INTO push_subscriptions (endpoint, p256dh, auth, created_at)
    VALUES (@endpoint, @p256dh, @auth, @created_at)
    ON CONFLICT(endpoint) DO UPDATE SET p256dh=excluded.p256dh, auth=excluded.auth
  `).run({
    endpoint: sub.endpoint,
    p256dh: sub.keys.p256dh,
    auth: sub.keys.auth,
    created_at: new Date().toISOString()
  });
}

export function removeSubscription(endpoint) {
  db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').run(endpoint);
}

export async function pushToAll(payload) {
  const subs = db.prepare('SELECT endpoint, p256dh, auth FROM push_subscriptions').all();
  const body = JSON.stringify(payload);
  await Promise.all(subs.map(async (s) => {
    const subscription = { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } };
    try {
      await webpush.sendNotification(subscription, body);
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) removeSubscription(s.endpoint);
      else console.error('Push-Fehler:', err.message);
    }
  }));
}
