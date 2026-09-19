import { db } from '../db/index.js';

// Push-Benachrichtigungen ueber den Expo Push Service - passend zur
// React-Native/Expo-App (kein Web Push/VAPID mehr noetig). Jedes Geraet
// registriert beim App-Start ein Expo-Push-Token, das hier gespeichert wird.
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export function saveExpoToken(token) {
  db.prepare(`
    INSERT INTO expo_push_tokens (token, created_at) VALUES (?, ?)
    ON CONFLICT(token) DO NOTHING
  `).run(token, new Date().toISOString());
}

export function removeExpoToken(token) {
  db.prepare('DELETE FROM expo_push_tokens WHERE token = ?').run(token);
}

export async function pushToAll({ title, body, plantId }) {
  const tokens = db.prepare('SELECT token FROM expo_push_tokens').all().map((r) => r.token);
  if (tokens.length === 0) return;

  const messages = tokens.map((to) => ({ to, title, body, data: { plantId }, sound: 'default' }));
  const res = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(messages)
  });
  if (!res.ok) {
    console.error('Expo Push fehlgeschlagen:', res.status, await res.text().catch(() => ''));
    return;
  }
  const data = await res.json().catch(() => null);
  // Ungueltig gewordene Tokens (App deinstalliert o.ae.) aus der DB entfernen.
  const tickets = data?.data || [];
  tickets.forEach((ticket, i) => {
    if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
      removeExpoToken(tokens[i]);
    }
  });
}
