import { db } from '../db/index.js';

const DEFAULTS = { push: true, urgent: false, night: true };

export function getSettings() {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'app'").get();
  return row ? { ...DEFAULTS, ...JSON.parse(row.value) } : DEFAULTS;
}

export function updateSettings(patch) {
  const next = { ...getSettings(), ...patch };
  db.prepare(`
    INSERT INTO settings (key, value) VALUES ('app', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(JSON.stringify(next));
  return next;
}

// "night" = Ruhezeit 22-7 Uhr, in der Push-Benachrichtigungen unterdrueckt
// werden (die In-App-Benachrichtigung wird trotzdem angelegt).
export function isQuietHours(date = new Date()) {
  const h = date.getHours();
  return h >= 22 || h < 7;
}
