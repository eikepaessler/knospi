# Knospi 🌱

Pflanzenpflege-App: eine Datenbank mit Pflanzenarten und ihren Idealbereichen
(Erdfeuchte, Licht, Luftfeuchte, Temperatur), Sensor-Anbindung (Bluetooth,
aktuell simuliert) und Benachrichtigungen, sobald eine Pflanze nicht mehr
optimal versorgt ist.

Nachgebaut auf Basis eines Claude-Prototyps (UI/UX, Pflanzen-Charaktere,
Pflegetexte) als lauffähige Web-App mit echter Datenbank, Backend-Logik und
Push-Benachrichtigungen.

## Architektur

```
knospi/
├── server/    Node.js + Express + SQLite (better-sqlite3)
│   ├── src/db/            Schema, Pflanzenarten-Katalog, Seed-Daten
│   ├── src/services/      Vergleichslogik, Benachrichtigungen, Sensor-Simulator, Web Push
│   └── src/routes/        REST-API
└── web/       React (Vite) – Progressive Web App
    ├── src/screens/       Zuhause, Räume, Pflanze, Doktor, Einstellungen
    └── public/sw.js       Service Worker für Push-Benachrichtigungen
```

**Datenfluss:** Ein Sensor (aktuell simuliert, siehe unten) meldet
Rohmesswerte an `POST /api/sensors/:id/readings`. Der Server vergleicht sie
gegen die Idealbereiche der Pflanzenart (`server/src/services/comparator.js`),
leitet Status (ok/zu niedrig/zu hoch) und Stimmung ab, aktualisiert die
Datenbank und benachrichtigt bei Zustandswechseln per In-App-Event (SSE) und
Web Push (`server/src/services/readings.js`).

## Setup

Voraussetzung: Node.js 22+.

```bash
npm install        # installiert Server- und Web-Abhängigkeiten (npm workspaces)
npm run seed        # legt die SQLite-DB an und befüllt sie mit Pflanzenarten,
                     # Räumen und 22 Beispielpflanzen (inkl. ein paar mit Problemen)
npm run dev          # startet Backend (Port 4000) und Web-App (Port 5173) parallel
```

Danach die App unter **http://localhost:5173** öffnen.

Einzeln starten geht auch: `npm run dev:server` bzw. `npm run dev:web`.

## Pflanzen-Datenbank

`server/src/db/plantTypes.js` enthält 14 Pflanzenarten mit Pflegetexten und
numerischen Idealbereichen:

| Feld       | Einheit               |
|------------|-----------------------|
| Erdfeuchte | % Bodenfeuchte        |
| Licht      | Lux                   |
| Temperatur | °C                    |
| Luftfeuchte| % relative Luftfeuchte|
| Düngen     | Intervall in Tagen (zeitbasiert, kein Sensor nötig) |

Jede Pflanze (`plants`-Tabelle) speichert ihre letzten Messwerte; der
abgeleitete Status pro Metrik liegt in `plant_status`. Der volle Verlauf jeder
Messung landet in `sensor_readings` (Basis für spätere Verlaufs-Charts).

Neue Pflanzenarten hinzufügen: Eintrag in `plantTypes.js` ergänzen und
`npm run seed` erneut laufen lassen (oder im Betrieb direkt per SQL/Route
ergänzen – dafür gibt es aktuell keine eigene Admin-UI).

## Sensoren: Simulation und echtes Bluetooth

**Aktuell:** `server/src/services/simulator.js` erzeugt alle 20 Sekunden neue
Messwerte für jede Pflanze mit zugewiesenem Sensor (Erde trocknet langsam ab,
Licht/Temperatur/Luftfeuchte schwanken leicht) und speist sie über dieselbe
Funktion (`applyReading`) ein, die auch echte Hardware nutzen würde.

**Für echte Bluetooth-Sensoren gibt es zwei Wege, ohne Backend-Änderungen:**

1. **Web Bluetooth im Browser** (Chrome/Edge, Desktop & Android – nicht
   Safari/iOS): Auf der Pflanzen-Detailseite koppelt „Bluetooth-Sensor
   koppeln" bereits ein echtes Gerät über `navigator.bluetooth.requestDevice`
   (`web/src/lib/bluetooth.js`). Um daraus echte Messwerte zu lesen, müssen
   dort die GATT-Service-/Characteristic-UUIDs des gewählten Sensor-Modells
   ergänzt werden (modellspezifisch, z. B. bei Xiaomi Mi Flora dokumentiert).
2. **Ingest-Endpunkt für eine Gateway-Bridge:**
   `POST /api/sensors/:id/readings` mit
   `{ "soilMoisture": 42, "lightLux": 3000, "temperature": 21, "humidity": 55 }`.
   Eine kleine Bridge (z. B. ein Python-/Node-Skript auf einem Raspberry Pi,
   der per BLE mit den Sensoren spricht) kann so echte Werte einspeisen,
   unabhängig vom Browser.

Ein Sensor wird einer Pflanze über `POST /api/plants/:id/sensor` zugeordnet
(„gepairt"); das übernimmt die App-UI automatisch.

## Benachrichtigungen

- **In-App:** Glocken-Icon oben rechts, Live-Updates per Server-Sent Events
  (kein Polling nötig).
- **Browser-Push:** Unter „Einstellungen" aktivierbar. Nutzt Web Push mit
  VAPID-Schlüsseln, die beim ersten Serverstart automatisch erzeugt und in
  `server/data/vapid.json` abgelegt werden (nicht eingecheckt – bei einem
  Redeploy mit neuen Schlüsseln müssen Nutzer:innen Push einmal neu
  aktivieren). Zwei Feineinstellungen:
  - **Nur Dringendes:** blendet alles außer akutem Wassermangel aus.
  - **Nachtruhe:** unterdrückt Push zwischen 22 und 7 Uhr (die In-App-Meldung
    bleibt trotzdem erhalten).

Web Push über HTTPS außerhalb von `localhost` braucht ein gültiges
TLS-Zertifikat – beim Deployment entsprechend hinter einem Reverse-Proxy mit
HTTPS betreiben.

## Wichtigste API-Endpunkte

| Methode & Pfad                          | Zweck |
|------------------------------------------|-------|
| `GET /api/plants`                        | Alle Pflanzen inkl. Status |
| `GET /api/plants/:id`                    | Eine Pflanze im Detail |
| `POST /api/plants`                       | Neue Pflanze anlegen |
| `POST /api/plants/:id/sensor`            | Sensor zuordnen |
| `POST /api/plants/:id/water` / `/fertilize` / `/fix` | Pflegeaktionen |
| `POST /api/sensors/:id/readings`         | Messwerte einspeisen (echte Hardware) |
| `GET /api/notifications`                 | Benachrichtigungsverlauf |
| `GET /api/events`                        | Server-Sent-Events-Stream |
| `GET/PATCH /api/settings`                | Push-Einstellungen |

## Nächste Schritte (nicht Teil dieses Stands)

- Verlaufs-Charts pro Pflanze aus `sensor_readings`
- Native Mobile-App (React Native) auf Basis derselben REST-API
- Mehrbenutzer-/Haushalts-Unterstützung (aktuell: eine gemeinsame Instanz)
