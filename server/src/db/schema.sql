-- Knospi Pflanzenpflege-Datenbank

CREATE TABLE IF NOT EXISTS rooms (
  id   TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

-- Pflanzenarten mit ihren Idealbereichen. Sensorwerte werden gegen diese
-- Bereiche geprueft, um den Pflegezustand abzuleiten. Je Metrik gibt es
-- zusaetzlich einen kurzen Hinweistext (z.B. "gleichmaessig feucht, obere
-- 2-5cm antrocknen lassen"), passend zur "Richtwerte meiner Art"-Sektion.
CREATE TABLE IF NOT EXISTS plant_types (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  latin             TEXT NOT NULL,
  tip               TEXT NOT NULL, -- "Womit du mich gluecklich machst"
  lore              TEXT NOT NULL, -- "Gut zu wissen"
  room_hint         TEXT NOT NULL, -- Standort-Empfehlung fuer den Anlege-Dialog
  soil_min          REAL NOT NULL, -- % Bodenfeuchte (kalibrierter Rohwert -> %)
  soil_max          REAL NOT NULL,
  soil_hint         TEXT NOT NULL,
  soil_provisional  INTEGER NOT NULL DEFAULT 1, -- Prozentschwellen sind unkalibriert, bis der Sensor geeicht wurde
  light_min         REAL NOT NULL, -- Lux
  light_max         REAL NOT NULL,
  light_hint        TEXT NOT NULL,
  temp_min          REAL NOT NULL, -- Grad Celsius
  temp_max          REAL NOT NULL,
  temp_hint         TEXT NOT NULL,
  humidity_min      REAL NOT NULL, -- % relative Luftfeuchte
  humidity_max      REAL NOT NULL,
  humidity_hint     TEXT NOT NULL
);

-- real_token/real_device_id sind gesetzt, wenn dieser Sensor ein echtes
-- Geraet ist (sensors.duus.digital), statt vom Simulator gespeist zu
-- werden. last_reading_ts merkt sich den zuletzt verarbeiteten Messwert
-- des Geraets, um beim Polling keine Duplikate einzuspielen.
CREATE TABLE IF NOT EXISTS sensors (
  id              TEXT PRIMARY KEY,
  plant_id        TEXT UNIQUE REFERENCES plants(id) ON DELETE SET NULL,
  battery         INTEGER NOT NULL DEFAULT 100,
  connected       INTEGER NOT NULL DEFAULT 1,
  last_seen       TEXT,
  real_token      TEXT,
  real_device_id  TEXT,
  last_reading_ts TEXT
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
-- damit UI und Benachrichtigungsdienst nicht bei jedem Request neu gegen
-- plant_types rechnen muessen. NULL = "na" (kein Sensor, kein Statuswert).
CREATE TABLE IF NOT EXISTS plant_status (
  plant_id  TEXT PRIMARY KEY REFERENCES plants(id) ON DELETE CASCADE,
  soil      TEXT,
  light     TEXT,
  temp      TEXT,
  humidity  TEXT,
  mood      TEXT NOT NULL DEFAULT 'happy',
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS notifications (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  plant_id   TEXT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  metric     TEXT NOT NULL, -- soil | light | temp | humidity
  status     TEXT NOT NULL, -- low | high | ok (ok = Entwarnung)
  message    TEXT NOT NULL,
  created_at TEXT NOT NULL,
  read       INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications (created_at);

-- Fotoalbum je Pflanze; erstes Foto (is_first) ist das Erkennungsfoto vom Scan.
CREATE TABLE IF NOT EXISTS photos (
  id         TEXT PRIMARY KEY,
  plant_id   TEXT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  uri        TEXT NOT NULL,
  taken_at   TEXT NOT NULL,
  note       TEXT,
  is_first   INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_photos_plant ON photos (plant_id, taken_at);

-- Vom Pflanzen-Doktor erkannte/notierte Behandlung. healed_at = NULL heisst
-- "in Behandlung" (Badge auf dem Pflanzen-Detail).
CREATE TABLE IF NOT EXISTS diagnoses (
  id            TEXT PRIMARY KEY,
  plant_id      TEXT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  latin         TEXT NOT NULL,
  confidence    INTEGER NOT NULL,
  tells         TEXT NOT NULL, -- "Woran ich es erkenne"
  steps         TEXT NOT NULL, -- JSON-Array, vier Behandlungsschritte
  photo_uri     TEXT,
  diagnosed_at  TEXT NOT NULL,
  healed_at     TEXT
);
CREATE INDEX IF NOT EXISTS idx_diagnoses_plant ON diagnoses (plant_id);

CREATE TABLE IF NOT EXISTS stickers (
  key         TEXT PRIMARY KEY,
  label       TEXT NOT NULL,
  tint        TEXT NOT NULL,
  ink         TEXT NOT NULL,
  glyph       TEXT NOT NULL,
  got         INTEGER NOT NULL DEFAULT 0,
  unlocked_at TEXT
);

CREATE TABLE IF NOT EXISTS expo_push_tokens (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  token      TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
