import { Router } from 'express';
import { db } from '../db/index.js';

export const plantTypesRouter = Router();

plantTypesRouter.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM plant_types ORDER BY name').all();
  res.json(rows.map((t) => ({
    id: t.id, name: t.name, latin: t.latin, tip: t.tip, lore: t.lore, roomHint: t.room_hint,
    richtwerte: [
      { key: 'soil', label: 'Erdfeuchte', min: t.soil_min, max: t.soil_max, unit: '%', hint: t.soil_hint, provisional: !!t.soil_provisional },
      { key: 'light', label: 'Licht', min: t.light_min, max: t.light_max, unit: ' lx', hint: t.light_hint, provisional: false },
      { key: 'temp', label: 'Temperatur', min: t.temp_min, max: t.temp_max, unit: '°C', hint: t.temp_hint, provisional: false },
      { key: 'humidity', label: 'Luftfeuchte', min: t.humidity_min, max: t.humidity_max, unit: '%', hint: t.humidity_hint, provisional: false }
    ]
  })));
});
