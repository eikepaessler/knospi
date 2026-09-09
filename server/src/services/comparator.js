// Vergleicht Sensor-Rohwerte gegen die Idealbereiche einer Pflanzenart
// und leitet daraus Status (ok/low/high) und Stimmung (mood) ab.
// Diese Logik ist die Basis fuer die Benachrichtigungen im Prototyp.

export function statusFor(value, [min, max]) {
  if (value == null) return null;
  if (value < min) return 'low';
  if (value > max) return 'high';
  return 'ok';
}

export function computeMetricStatuses(reading, type) {
  return {
    soil: statusFor(reading.soil_moisture, type.range.soil),
    light: statusFor(reading.light_lux, type.range.light),
    temp: statusFor(reading.temperature, type.range.temp),
    humidity: statusFor(reading.humidity, type.range.humidity)
  };
}

export function fertStatus(fertilizedAt, fertDays, now = new Date()) {
  if (!fertilizedAt) return 'low';
  const days = (now - new Date(fertilizedAt)) / 86400000;
  return days > fertDays ? 'low' : 'ok';
}

// Prioritaet entspricht dem Prototyp: Durst schlaegt Dunkelheit schlaegt
// Kaelte schlaegt trockene Luft schlaegt Naehrstoffmangel.
export function moodFromStatuses({ soil, light, temp, humidity, fert }) {
  if (soil && soil !== 'ok') return 'thirsty';
  if (light && light !== 'ok') return 'dark';
  if (temp && temp !== 'ok') return 'cold';
  if (humidity && humidity !== 'ok') return 'air';
  if (fert && fert !== 'ok') return 'hungry';
  return 'happy';
}

export const MOOD_META = {
  happy: { face: 'happy', label: 'Rundum wohl', tone: 'ok', fix: null },
  thirsty: { face: 'sad', label: 'Durstig', tone: 'bad', fix: 'soil' },
  dark: { face: 'sleepy', label: 'Sitzt im Dunkeln', tone: 'warn', fix: 'light' },
  cold: { face: 'sad', label: 'Fröstelt', tone: 'warn', fix: 'temp' },
  hungry: { face: 'sad', label: 'Hungrig', tone: 'warn', fix: 'fert' },
  air: { face: 'sleepy', label: 'Trockene Luft', tone: 'warn', fix: 'humidity' }
};

export const METRIC_LABEL = { soil: 'Erdfeuchte', light: 'Licht', temp: 'Temperatur', humidity: 'Luftfeuchte', fert: 'Nährstoffe' };

// Dringlichkeit je Metrik fuer die "nur dringend"-Push-Einstellung:
// Wassermangel ist kritisch (bad), der Rest ist wichtig aber nicht akut (warn).
export const METRIC_TONE = { soil: 'bad', light: 'warn', temp: 'warn', humidity: 'warn', fert: 'warn' };

// Was die Pflanze sagt, wenn sie neu in eine Stimmung wechselt.
export const MOOD_SAYS = {
  thirsty: 'Meine Erde ist staubtrocken. Ein Schluck wäre traumhaft.',
  dark: 'Hier ist es duster geworden. Ich sehe kaum meine Blätter.',
  cold: 'Mir ist zu kalt. Ich hole mir gleich eine Decke.',
  air: 'Die Luft ist wie ein Föhn. Etwas feuchter, bitte.',
  hungry: 'Die Erde hier ist ausgelutscht. Ein bisschen Dünger, bitte.',
  happy: 'Ahhh. Genau das hat gefehlt. Du bist die Beste.'
};

export const METRIC_TEXT = {
  soil: { ok: 'Angenehm feucht', low: 'Staubtrocken', high: 'Nasse Füße' },
  light: { ok: 'Genau richtig', low: 'Zu düster', high: 'Zu grell' },
  temp: { ok: 'Kuschelig', low: 'Zu kühl', high: 'Zu warm' },
  humidity: { ok: 'Passt so', low: 'Wüstenluft', high: 'Zu feucht' },
  fert: { ok: 'Gut versorgt', low: 'Etwas mager', high: 'Überdüngt' }
};

// Benachrichtigungstexte fuer Statuswechsel, gemeinsam genutzt von
// services/readings.js (Live-Betrieb) und db/seed.js (Anfangszustand).
export const RESOLVED_NOTIFICATION_TEXT = {
  soil: 'ist wieder angenehm feucht.', light: 'steht wieder im richtigen Licht.',
  temp: 'hat wieder eine angenehme Temperatur.', humidity: 'hat wieder eine gute Luftfeuchte.',
  fert: 'ist wieder gut versorgt.'
};
export const PROBLEM_NOTIFICATION_TEXT = {
  soil: { low: 'ist staubtrocken. Zeit zum Gießen.', high: 'steht zu nass. Nicht mehr gießen.' },
  light: { low: 'sitzt zu dunkel. Heller stellen.', high: 'bekommt zu grelles Licht. Etwas verschatten.' },
  temp: { low: 'friert. Wärmer stellen.', high: 'hat es zu warm. Kühler stellen.' },
  humidity: { low: 'leidet unter trockener Luft. Besprühen hilft.', high: 'steht in zu feuchter Luft. Lüften.' },
  fert: { low: 'braucht bald Dünger.', high: 'wurde überdüngt.' }
};
export function notificationMessage(plantName, metric, status) {
  return status === 'ok'
    ? `${plantName} ${RESOLVED_NOTIFICATION_TEXT[metric]}`
    : `${plantName} ${PROBLEM_NOTIFICATION_TEXT[metric][status]}`;
}
