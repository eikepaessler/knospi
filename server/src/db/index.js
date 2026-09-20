import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = process.env.DB_PATH || path.join(dataDir, 'knospi.sqlite');
export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

// Leichtgewichtige Migration fuer bereits bestehende Datenbanken: neue
// Spalten, die schema.sql's "CREATE TABLE IF NOT EXISTS" auf einer schon
// vorhandenen Tabelle nicht mehr anlegen wuerde.
for (const stmt of [
  'ALTER TABLE sensors ADD COLUMN real_token TEXT',
  'ALTER TABLE sensors ADD COLUMN real_device_id TEXT',
  'ALTER TABLE sensors ADD COLUMN last_reading_ts TEXT'
]) {
  try { db.exec(stmt); } catch { /* Spalte existiert bereits */ }
}
