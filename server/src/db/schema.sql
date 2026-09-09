-- Knospi Pflanzenpflege-Datenbank

CREATE TABLE IF NOT EXISTS rooms (
  id   TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

-- Pflanzenarten mit ihren Idealbereichen. Sensorwerte werden gegen diese
-- Bereiche geprueft, um den Pflegezustand abzuleiten.
CREATE TABLE IF NOT EXISTS plant_types (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  latin             TEXT NOT NULL,
  tip               TEXT NOT NULL,
  lore              TEXT NOT NULL,
  care_light        TEXT NOT NULL,
  care_spot         TEXT NOT NULL,
  care_water        TEXT NOT NULL,
  care_temp         TEXT NOT NULL,
  care_food         TEXT NOT NULL,
  care_room         TEXT NOT NULL,
  soil_min          REAL NOT NULL, -- % Bodenfeuchte
  soil_max          REAL NOT NULL,
  light_min         REAL NOT NULL, -- Lux
  light_max         REAL NOT NULL,
  temp_min          REAL NOT NULL, -- Grad Celsius
  temp_max          REAL NOT NULL,
  humidity_min      REAL NOT NULL, -- % relative Luftfeuchte
  humidity_max      REAL NOT NULL,
  fert_interval_days INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sensors (
  id         TEXT PRIMARY KEY,
  plant_id   TEXT UNIQUE REFERENCES plants(id) ON DELETE SET NULL,
  battery    INTEGER NOT NULL DEFAULT 100,
  connected  INTEGER NOT NULL DEFAULT 1,
  last_seen  TEXT
);

CREATE TABLE IF NOT EXISTS plants (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  type_id        TEXT NOT NULL REFERENCES plant_types(id),
  room_id        TEXT NOT NULL REFERENCES rooms(id),
  sensor_id      TEXT REFERENCES sensors(id) ON DELETE SET NULL,
  added_at       TEXT NOT NULL,
  bond           INTEGER NOT NULL DEFAULT 1,
  watered_at     TEXT,
  fertilized_at  TEXT,
  says           TEXT NOT NULL DEFAULT '',
  -- letzte Messwerte (roh), vom Sensor bzw. Simulator geschrieben
  soil_moisture  REAL,
  light_lux      REAL,
  temperature    REAL,
  humidity       REAL,
  reading_at     TEXT
);

CREATE TABLE IF NOT EXISTS sensor_readings (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  sensor_id     TEXT NOT NULL,
  plant_id      TEXT NOT NULL,
  soil_moisture REAL NOT NULL,
  light_lux     REAL NOT NULL,
  temperature   REAL NOT NULL,
  humidity      REAL NOT NULL,
  created_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_readings_plant_time ON sensor_readings (plant_id, created_at);

-- Aktueller, abgeleiteter Status je Metrik und Pflanze (ok / low / high),
-- damit die UI und der Notification-Dienst nicht bei jedem Request neu
-- gegen plant_types rechnen muessen.
-- soil/light/temp/humidity sind NULL, solange der Pflanze kein Sensor
-- zugewiesen ist ("keine Daten" statt eines falschen "ok").
CREATE TABLE IF NOT EXISTS plant_status (
  plant_id  TEXT PRIMARY KEY REFERENCES plants(id) ON DELETE CASCADE,
  soil      TEXT,
  light     TEXT,
  temp      TEXT,
  humidity  TEXT,
  fert      TEXT NOT NULL DEFAULT 'ok',
  mood      TEXT NOT NULL DEFAULT 'happy',
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS notifications (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  plant_id   TEXT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  metric     TEXT NOT NULL, -- soil | light | temp | humidity | fert
  status     TEXT NOT NULL, -- low | high
  message    TEXT NOT NULL,
  created_at TEXT NOT NULL,
  read       INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications (created_at);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint   TEXT NOT NULL UNIQUE,
  p256dh     TEXT NOT NULL,
  auth       TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
