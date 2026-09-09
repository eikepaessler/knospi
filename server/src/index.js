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

// Im Produktionsbetrieb liefert derselbe Server die gebaute Web-App aus
// (ein Deployment, eine URL, kein CORS-Setup noetig). Im Dev-Betrieb laeuft
// die Web-App separat unter Vite (siehe web/vite.config.js Proxy).
const webDist = path.resolve(__dirname, '../../web/dist');
if (fs.existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(webDist, 'index.html')));
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
