import { db } from '../db/index.js';

// Drei Schalter, exakt wie im Profil-Screen des Briefings:
// push = Master-Schalter, dryReminder = "Erinnerung bei Trockenheit" (die
// einzige Metrik, die tatsaechlich einen Push ausloest), weeklyRecap =
// wird derzeit nur gespeichert (der Wochenrueckblick-Versand ist noch
// nicht als Cron-Job implementiert).
const DEFAULTS = { push: true, dryReminder: true, weeklyRecap: true, offerRead: false };

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
