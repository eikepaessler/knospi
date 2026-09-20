import { fileURLToPath } from 'node:url';
import { db } from './index.js';
import { PLANT_TYPES } from './plantTypes.js';
import { ROOMS } from './seedData.js';

// Alle Sticker starten ungesehen - sie werden durch echte Nutzung freigeschaltet,
// nicht durch Beispieldaten (siehe Bewertungsregeln in comparator.js / readings.js).
const STICKERS = [
  { key: 'green_thumb', label: 'Grüner Daumen', tint: '#E4F0C4', ink: '#4A6B21', glyph: 'drop' },
  { key: 'first_rescue', label: 'Erste Rettung', tint: '#F4DAD5', ink: '#94513F', glyph: 'heart' },
  { key: 'first_scan', label: 'Erster Scan', tint: '#DEE7EC', ink: '#4A6070', glyph: 'lens' },
  { key: 'collector', label: 'Sammler', tint: '#E5E2EC', ink: '#5C5170', glyph: 'square' },
  { key: 'one_year', label: 'Ein Jahr zusammen', tint: '#DCE9E2', ink: '#3F6157', glyph: 'sun' },
  { key: 'week_winner', label: 'Wochensieger', tint: '#EBEBD0', ink: '#63652F', glyph: 'thumb' },
  { key: 'plant_doctor', label: 'Erste Diagnose', tint: '#F4DAD5', ink: '#94513F', glyph: 'cross' },
  { key: 'full_house', label: 'Volles Haus', tint: '#E4F0C4', ink: '#4A6B21', glyph: 'home' }
];

export function seedDatabase() {
  const insertType = db.prepare(`
    INSERT OR REPLACE INTO plant_types
      (id,name,latin,tip,lore,room_hint,
       soil_min,soil_max,soil_hint,soil_provisional,
       light_min,light_max,light_hint,
       temp_min,temp_max,temp_hint,
       humidity_min,humidity_max,humidity_hint)
    VALUES (@id,@name,@latin,@tip,@lore,@room_hint,
       @soil_min,@soil_max,@soil_hint,@soil_provisional,
       @light_min,@light_max,@light_hint,
       @temp_min,@temp_max,@temp_hint,
       @humidity_min,@humidity_max,@humidity_hint)
  `);
  const insertRoom = db.prepare('INSERT OR REPLACE INTO rooms (id, name) VALUES (?, ?)');
  const insertSticker = db.prepare(`
    INSERT OR REPLACE INTO stickers (key, label, tint, ink, glyph, got, unlocked_at)
    VALUES (@key, @label, @tint, @ink, @glyph, 0, NULL)
  `);

  const insertMany = db.transaction(() => {
    for (const t of PLANT_TYPES) {
      insertType.run({
        id: t.id, name: t.name, latin: t.latin, tip: t.tip, lore: t.lore, room_hint: t.roomHint,
        soil_min: t.soil.min, soil_max: t.soil.max, soil_hint: t.soil.hint, soil_provisional: t.soil.provisional ? 1 : 0,
        light_min: t.light.min, light_max: t.light.max, light_hint: t.light.hint,
        temp_min: t.temp.min, temp_max: t.temp.max, temp_hint: t.temp.hint,
        humidity_min: t.humidity.min, humidity_max: t.humidity.max, humidity_hint: t.humidity.hint
      });
    }
    for (const r of ROOMS) insertRoom.run(r.id, r.name);
    for (const s of STICKERS) insertSticker.run(s);
  });
  insertMany();

  console.log(`Seed abgeschlossen: ${PLANT_TYPES.length} Pflanzenarten, ${ROOMS.length} Räume. Keine Beispielpflanzen - leg deine erste selbst an.`);
}

export function seedIfEmpty() {
  const { c } = db.prepare('SELECT COUNT(*) c FROM plant_types').get();
  if (c === 0) seedDatabase();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase();
}
