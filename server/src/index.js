import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import './db/index.js';
import { seedIfEmpty } from './db/seed.js';

import { roomsRouter } from './routes/rooms.js';
import { plantTypesRouter } from './routes/plantTypes.js';
import { plantsRouter } from './routes/plants.js';
import { sensorsRouter } from './routes/sensors.js';
import { notificationsRouter } from './routes/notifications.js';
import { pushRouter } from './routes/push.js';
import { settingsRouter } from './routes/settings.js';
import { stickersRouter } from './routes/stickers.js';
import { weekRouter } from './routes/week.js';
import { sseHandler } from './services/events.js';
import { startSimulator } from './services/simulator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Frische/ephemere Datenbank (z. B. nach einem Deploy) automatisch mit
// Demodaten befuellen; bereits vorhandene Nutzerdaten bleiben unangetastet.
seedIfEmpty();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/api/events', sseHandler);
app.use('/api/rooms', roomsRouter);
app.use('/api/plant-types', plantTypesRouter);
app.use('/api/plants', plantsRouter);
app.use('/api/sensors', sensorsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/push', pushRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/stickers', stickersRouter);
app.use('/api/week', weekRouter);

// Optionale Web-Vorschau: liefert einen "expo export -p web"-Build aus
// mobile/dist aus, falls vorhanden (fuer einen schnellen Browser-Test ohne
// Simulator/Geraet). Faellt sonst auf einen alten web/dist-Build zurueck.
const staticDist = [path.resolve(__dirname, '../../mobile/dist'), path.resolve(__dirname, '../../web/dist')]
  .find((p) => fs.existsSync(p));
if (staticDist) {
  app.use(express.static(staticDist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(staticDist, 'index.html')));
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Interner Fehler' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Knospi-Server läuft auf http://localhost:${PORT}`);
  startSimulator();
});
