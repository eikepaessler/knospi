# Knospi 🌱

Begleit-App für Zimmerpflanzen. Ein Bodensensor pro Pflanze misst Erdfeuchte,
Temperatur, Luftfeuchte und Licht; die App vergleicht das mit den Idealwerten
der Pflanzenart und lässt die Pflanze in der Ich-Form sagen, wie es ihr geht
("Meine Erde ist ziemlich trocken. Ein Schluck, bitte?"). Erledigt man das
Anliegen, freut sich die Pflanze — niedlich, aber nicht kitschig.

Native iPhone/Android-App (React Native + Expo), Sprache Deutsch/Du-Form.

## Architektur

```
knospi/
├── server/    Node.js + Express + SQLite (better-sqlite3) — REST-API
│   ├── src/db/            Schema, Pflanzenarten-Katalog, Seed-Daten
│   └── src/services/      Vergleichslogik, Benachrichtigungen, Sensor-Simulator, Expo Push
└── mobile/    React Native App (Expo, SDK 57)
    ├── src/screens/       Zuhause, Räume, Pflanzen-Detail, Scan, Doktor, Shop, Profil, Onboarding
    ├── src/components/    PlantAvatar (Illustrationen), UI-Bausteine, Kamera
    ├── src/context/       Zentraler App-State (Polling statt Push-Abo)
    └── src/theme/         Farben, Typografie (Baloo 2 / Plus Jakarta Sans), Radien, Schatten
```

**Datenfluss:** Ein Sensor (aktuell simuliert, siehe unten) meldet Rohmesswerte
an `POST /api/sensors/:id/readings`. Der Server vergleicht sie gegen die
Idealbereiche der Pflanzenart (`server/src/services/comparator.js`), leitet
Status (`ok`/`low`/`high`/`na`) und Stimmung ab (`happy · thirsty · soggy ·
dark · cold · air`, exakt nach den Bewertungsregeln des Briefings — zu nasse
Erde hat immer Vorrang vor "durstig"), aktualisiert die Datenbank und
benachrichtigt bei Zustandswechseln per In-App-Event und Push. Die App zieht
Daten beim Öffnen, bei jedem Zurückkehren in den Vordergrund und danach im
Minutentakt (kein Postfach-Screen, kein SSE/WebSocket nötig).

## Setup

Voraussetzung: Node.js 22+, ein iOS-Simulator/Android-Emulator oder die
Expo-Go-App auf einem echten Gerät.

```bash
npm install                 # installiert Server- und Mobile-Abhängigkeiten (npm workspaces)
npm run seed                 # legt die SQLite-DB an, befüllt sie mit 14 Pflanzenarten,
                              # 4 Räumen und 22 Beispielpflanzen (einige mit Problemen)
npm run dev                  # startet Backend (Port 4000) und Expo Metro Bundler parallel
```

Danach in der Expo-CLI-Ausgabe `i` (iOS-Simulator), `a` (Android-Emulator)
oder `w` (Browser-Vorschau, siehe unten) drücken, oder den QR-Code mit der
Expo-Go-App auf einem echten Gerät scannen.

Einzeln starten: `npm run dev:server` bzw. `npm run dev:mobile`.

**Auf einem echten Gerät** (Expo Go oder eigener Build) erreicht das Handy
`localhost:4000` nicht — `mobile/src/lib/config.js` in dem Fall auf die
LAN-IP des Rechners oder eine deployte Server-URL setzen (Env-Variable
`EXPO_PUBLIC_API_URL`).

### Browser-Vorschau ohne Simulator

`npm run web-preview` startet die App als React-Native-Web-Build im Browser
(`http://localhost:8081`). Nützlich für einen schnellen Check ohne
Xcode/Android Studio — kein Ersatz für einen echten Gerätetest (Kamera,
Push-Benachrichtigungen und Gesten verhalten sich auf einem echten iPhone
anders als im Browser).

## Pflanzen-Datenbank

`server/src/db/plantTypes.js` enthält 14 Pflanzenarten mit Pflegetipp (`tip`),
Artenfakt (`lore`), Standort-Empfehlung (`roomHint`) und je Metrik einem
Idealbereich **plus** einem kurzen Hinweistext (genau wie im Briefing-Beispiel
*Begonia maculata*):

| Feld        | Einheit                | Hinweis |
|-------------|------------------------|---------|
| Erdfeuchte  | % Bodenfeuchte         | als „vorläufig" markiert — siehe unten |
| Licht       | Lux                    | |
| Temperatur  | °C                     | |
| Luftfeuchte | % relative Luftfeuchte | |

**Wichtig:** Die Prozent-Schwellen der Erdfeuchte sind nicht aus Pflegequellen
belegt und müssen je Sensor/Erde kalibriert werden (Rohwert trocken vs. direkt
nach dem Gießen, dazwischen interpolieren). Deshalb `soilProvisional: true` in
`plantTypes.js` und das „(vorläufig)"-Label in der App, bis das passiert ist.

Neue Pflanzenart hinzufügen: Eintrag in `plantTypes.js` ergänzen, `npm run
seed` erneut laufen lassen.

## Bewertungsregeln

Siehe `server/src/services/comparator.js` — 1:1 nach Briefing:

1. Je Metrik: unter Min → `low`, über Max → `high`, sonst `ok`. Kein Sensor → `na`.
2. Priorität für die Stimmung: `soil=high` (soggy) > `soil=low` (thirsty) >
   `light≠ok` (dark) > `temp≠ok` (cold) > `humidity≠ok` (air) > `happy`.
3. Erledigen (Action-Pille) behebt die betroffene Metrik, vergibt bei
   vollständiger Genesung `bond+1` (max. 5) und einen fröhlichen Satz, sonst
   einen aufmunternden Zwischenstand-Satz. Erstes Gießen schaltet den Sticker
   „Grüner Daumen" frei (Overlay-Animation).
4. Kein Dünger-/Nährstoff-Feature (bewusst entfernt, siehe Briefing).

## Sensoren: Simulation und echtes Bluetooth

**Aktuell:** `server/src/services/simulator.js` erzeugt alle 20 Sekunden neue
Messwerte für jede Pflanze mit zugewiesenem Sensor und speist sie über
dieselbe Funktion (`applyReading`) ein, die auch echte Hardware nutzen würde.
Ein separater Watchdog markiert Sensoren als offline, wenn länger kein Reading
kam (Push-Anlass „Sensor offline").

**Echter Sensor-Endpunkt** (aus dem Briefing, noch nicht angebunden):
`GET https://sensors.duus.digital/<device-token>/tail?n=<count>` liefert
Klima-/Licht-/Rohwerte. Sobald ein device-token vorliegt, ersetzt ein Poller
gegen diesen Endpunkt den Simulator — die Vergleichslogik und Benachrichtigungen
bleiben unverändert, da beide über dieselbe `applyReading()`-Funktion laufen.

**Sensor-Pairing in der App:** `POST /api/plants/:id/sensor` (das
Sensor-Onboarding in der App ruft das nach den drei Schritten auf). Für echte
BLE-Kopplung braucht es zusätzlich die GATT-Service-/Characteristic-UUIDs des
gewählten Sensor-Modells — noch offen, siehe Nicht-Ziele unten.

## Bilderkennung (Scan-Flow & Pflanzen-Doktor)

**Noch nicht angebunden.** Für die Arterkennung beim Anlegen einer Pflanze
und die Krankheits-/Schädlingsdiagnose beim Pflanzen-Doktor braucht es eine
echte Vision-API (z. B. Plant.id, PlantNet) oder ein trainiertes Modell.
Beide Flows sind komplett funktionsfähig gebaut (Kamera, UI, Speichern in der
Datenbank) und liefern bis dahin ein klar als Demo gekennzeichnetes,
deterministisches Platzhalter-Ergebnis aus dem lokalen Katalog
(`mobile/src/screens/AddPlantScreen.js` bzw. `DoctorFlowScreen.js`) — leicht
gegen eine echte API austauschbar, sobald eine ausgewählt ist.

## Benachrichtigungen

- **In-App:** Zuhause-Screen ist die Wahrheit (kein Postfach-Screen, wie im
  Briefing gefordert).
- **Push (Expo Push Service):** Nur für die drei im Briefing genannten
  Anlässe — Pflanze braucht Wasser, Sensor offline, Wochenrückblick (Versand
  des Wochenrückblicks selbst ist als Cron-Job noch nicht implementiert, der
  Schalter dafür existiert bereits im Profil). Andere Metrik-Probleme
  (Licht/Temperatur/Luftfeuchte) erscheinen nur auf dem Zuhause-Screen, nie
  als Push. Gerätetoken werden über `POST /api/push/register` hinterlegt.

## Wichtigste API-Endpunkte

| Methode & Pfad                              | Zweck |
|----------------------------------------------|-------|
| `GET /api/plants`                            | Alle Pflanzen inkl. Status, Metriken, Richtwerten |
| `POST /api/plants`                           | Neue Pflanze anlegen |
| `POST /api/plants/:id/sensor`                | Sensor koppeln |
| `POST /api/plants/:id/water` / `/fix`        | Pflegeaktionen (liefert ggf. `reward`-Sticker) |
| `POST /api/plants/:id/photos`                | Foto zum Album hinzufügen |
| `POST /api/plants/:id/diagnoses`             | Diagnose des Pflanzen-Doktors notieren |
| `POST /api/sensors/:id/readings`             | Messwerte einspeisen (echte Hardware) |
| `GET /api/week`                              | Wochenübersicht (Mo–So, ok/warn/bad) |
| `GET /api/stickers`                          | Sticker-Sammlung |
| `GET/PATCH /api/settings`                    | Push, Trocken-Erinnerung, Wochenrückblick |

## Nicht-Ziele (bewusst, laut Briefing)

Kein Social-Feed, keine Teilen-Funktion, kein Dünger-/Nährstoff-Feature, kein
Postfach, keine weiteren Shop-Artikel außer Sensoren und Bundles.

## Offene Punkte

- Echte Bild-/Krankheitserkennung (siehe oben)
- Echter Sensor-Endpunkt statt Simulator (siehe oben)
- Wochenrückblick-Versand als Cron-Job
- Verlaufs-Charts über einen Tag/Monat hinaus (aktuell: Sparkline der letzten ~30 Readings)
- App-Icon/Splash-Assets sind Platzhalter aus dem Expo-Template
