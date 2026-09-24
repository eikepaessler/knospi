// Vergleicht Sensor-Rohwerte gegen die Idealbereiche einer Pflanzenart und
// leitet daraus Status (ok/low/high/na) und Stimmung (mood) ab.
// Bewertungsregeln exakt nach Briefing: soil=high (soggy) schlaegt immer
// soil=low (thirsty) - bei zu viel Wasser darf nie "durstig" erscheinen.

export function statusFor(value, [min, max]) {
  if (value == null) return null; // na
  if (value < min) return 'low';
  if (value > max) return 'high';
  return 'ok';
}

// Natuerliches Licht ist morgens/abends von Haus aus schwaecher - ohne das
// zu beruecksichtigen wuerde eine Pflanze schon um 6 Uhr "zu dunkel" melden,
// obwohl das ganz normal ist. Der Mindestwert wird daher in der Daemmerung
// abgesenkt und nachts (kein Tageslicht zu erwarten) gar nicht erst gegen
// "zu dunkel" geprueft.
export function lightMinFactor(date = new Date()) {
  const h = date.getHours() + date.getMinutes() / 60;
  if (h >= 9 && h < 18) return 1; // voller Taganspruch
  if (h >= 6 && h < 9) return 0.4 + (0.6 * (h - 6)) / 3; // Morgendaemmerung: 0.4 -> 1
  if (h >= 18 && h < 21) return 1 - (0.6 * (h - 18)) / 3; // Abenddaemmerung: 1 -> 0.4
  return 0; // Nacht: "zu dunkel" wird nicht gemeldet
}

export function computeMetricStatuses(reading, type, at = new Date()) {
  const [lightMin, lightMax] = type.range.light;
  return {
    soil: statusFor(reading.soil_moisture, type.range.soil),
    light: statusFor(reading.light_lux, [lightMin * lightMinFactor(at), lightMax]),
    temp: statusFor(reading.temperature, type.range.temp),
    humidity: statusFor(reading.humidity, type.range.humidity)
  };
}

// Prioritaet exakt nach Briefing-Tabelle.
export function moodFromStatuses({ soil, light, temp, humidity }) {
  if (soil === 'high') return 'soggy';
  if (soil === 'low') return 'thirsty';
  if (light && light !== 'ok') return 'dark';
  if (temp && temp !== 'ok') return 'cold';
  if (humidity && humidity !== 'ok') return 'air';
  return 'happy';
}

export const MOOD_META = {
  happy: { face: 'happy', label: 'Rundum wohl', tone: 'ok', fix: null, action: null },
  thirsty: { face: 'sad', label: 'Durstig', tone: 'bad', fix: 'soil', action: 'Ich hab dich gegossen' },
  soggy: { face: 'sleepy', label: 'Nasse Füße', tone: 'warn', fix: 'soil', action: 'Ich lass dich abtrocknen' },
  dark: { face: 'sleepy', label: 'Sitzt im Dunkeln', tone: 'warn', fix: 'light', action: 'Ich hab dich umgestellt' },
  cold: { face: 'sad', label: 'Fröstelt', tone: 'warn', fix: 'temp', action: 'Ich hab dich umgestellt' },
  air: { face: 'sleepy', label: 'Trockene Luft', tone: 'warn', fix: 'humidity', action: 'Wasserschale dazugestellt' }
};

export const METRIC_LABEL = { soil: 'Erdfeuchte', light: 'Licht', temp: 'Temperatur', humidity: 'Luftfeuchte' };

// Dringlichkeit je Metrik fuer die "nur dringend"-Push-Einstellung.
export const METRIC_TONE = { soil: 'bad', light: 'warn', temp: 'warn', humidity: 'warn' };

export const METRIC_TEXT = {
  soil: { ok: 'Angenehm feucht', low: 'Staubtrocken', high: 'Nasse Füße', na: 'Keine Daten' },
  light: { ok: 'Genau richtig', low: 'Zu düster', high: 'Zu grell', na: 'Keine Daten' },
  temp: { ok: 'Kuschelig', low: 'Zu kühl', high: 'Zu warm', na: 'Keine Daten' },
  humidity: { ok: 'Passt so', low: 'Wüstenluft', high: 'Zu feucht', na: 'Keine Daten' }
};

// Was die Pflanze sagt, wenn sie neu in eine Stimmung wechselt (ohne
// konkreten Messwert - der wird, wenn vorhanden, dynamisch angehaengt).
export const MOOD_SAYS = {
  thirsty: 'Meine Erde ist ziemlich trocken. Ein Schluck, bitte?',
  soggy: 'Ganz schön nass hier unten. Lass mich abtrocknen.',
  dark: 'Hier ist es schummrig. Zwei Schritte zum Fenster?',
  cold: 'Mir ist kalt an den Wurzeln. Zugluft, oder?',
  air: 'Die Luft hier ist wie in der Wüste. Wasserschale?'
};

// Fix-Erledigung: "alles wieder ok" vs. "ein Problem bleibt".
export const FIX_ALL_OK_SAYS = 'Ahhh. Genau das hat gefehlt. Du bist die Beste.';
export const FIX_PARTIAL_SAYS = 'Schon viel besser. Eine Kleinigkeit fehlt noch, aber ich drängle nicht.';

// Ohne Sensor spricht die Pflanze ueber ihre Art, nicht ihren Zustand.
export const NO_SENSOR_SAYS = [
  'Ohne Sensor kann ich dir nicht sagen, wie es mir geht.',
  'Steck mir einen Sensor in die Erde, dann melde ich mich von selbst.',
  'Ich schweige noch — mir fehlt der Sensor zum Reden.',
  'Wie es mir wirklich geht? Rate mal. Oder gib mir einen Sensor.'
];

export function notificationMessage(plantName, metric, status) {
  const RESOLVED = { soil: 'ist wieder angenehm feucht.', light: 'steht wieder im richtigen Licht.', temp: 'hat wieder eine angenehme Temperatur.', humidity: 'hat wieder eine gute Luftfeuchte.' };
  const PROBLEM = {
    soil: { low: 'ist staubtrocken. Zeit zum Gießen.', high: 'steht zu nass. Nicht mehr gießen.' },
    light: { low: 'sitzt zu dunkel. Heller stellen.', high: 'bekommt zu grelles Licht. Etwas verschatten.' },
    temp: { low: 'friert. Wärmer stellen.', high: 'hat es zu warm. Kühler stellen.' },
    humidity: { low: 'leidet unter trockener Luft. Besprühen hilft.', high: 'steht in zu feuchter Luft. Lüften.' }
  };
  return status === 'ok' ? `${plantName} ${RESOLVED[metric]}` : `${plantName} ${PROBLEM[metric][status]}`;
}
