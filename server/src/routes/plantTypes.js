import { Router } from 'express';
import { db } from '../db/index.js';

export const plantTypesRouter = Router();

plantTypesRouter.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM plant_types ORDER BY name').all();
  res.json(rows.map((t) => ({
    id: t.id, name: t.name, latin: t.latin, tip: t.tip, lore: t.lore,
    care: { light: t.care_light, spot: t.care_spot, water: t.care_water, temp: t.care_temp, food: t.care_food, room: t.care_room },
    range: {
      soil: [t.soil_min, t.soil_max], light: [t.light_min, t.light_max],
      temp: [t.temp_min, t.temp_max], humidity: [t.humidity_min, t.humidity_max]
    },
    fertIntervalDays: t.fert_interval_days
  })));
});
