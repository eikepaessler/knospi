// Pflanzenarten-Katalog: Richtwerte je Metrik (Min/Max + Hinweistext),
// Pflegetipp (tip), Artenfakt (lore) und Standort-Empfehlung (roomHint).
// Die Prozent-Schwellen der Erdfeuchte sind nicht aus Pflegequellen belegt
// und muessen je Sensor/Erde kalibriert werden - daher soilProvisional.
export const PLANT_TYPES = [
  {
    id: 'begonia', name: 'Forellenbegonie', latin: 'Begonia maculata',
    tip: 'Helles Licht, weiches Wasser, nie auf die Blätter gießen.',
    lore: 'Die silbrigen Punkte sind kein Zufall — sie streuen Licht auf den Waldboden Brasiliens, wo ich herkomme. Rote Blattunterseite inklusive.',
    roomHint: 'das Wohnzimmer: helles Fenster ohne Mittagssonne',
    soil: { min: 40, max: 80, hint: 'gleichmäßig feucht, obere 2–5 cm antrocknen lassen', provisional: true },
    light: { min: 2000, max: 20000, hint: 'Quellen widersprechen sich; Ost-/Nordfenster, keine Mittagssonne' },
    temp: { min: 18, max: 25, hint: 'toleriert 18–30 °C, keine Zugluft, nicht unter 15 °C' },
    humidity: { min: 50, max: 70, hint: 'Herkunft Brasilien; nicht besprühen (Pilzrisiko)' }
  },
  {
    id: 'kingbegonia', name: 'Königsbegonie', latin: 'Begonia rex',
    tip: 'Über 55 % Luftfeuchte, keine direkte Sonne.',
    lore: 'Von mir gibt es über 500 Zuchtformen. Gezüchtet wurde ich für das Muster, nicht für die Blüte.',
    roomHint: 'das Badezimmer: feucht, gleichmäßig warm, schattig',
    soil: { min: 40, max: 65, hint: 'sparsam und regelmäßig, immer von unten gießen', provisional: true },
    light: { min: 800, max: 8000, hint: 'Halbschatten; direkte Sonne zeichnet Flecken ins Muster' },
    temp: { min: 18, max: 24, hint: '18–23 °C gleichmäßig, keine Kälteschocks' },
    humidity: { min: 55, max: 80, hint: 'über 55 % — Bad oder eine Schale Wasser in der Nähe' }
  },
  {
    id: 'pilea', name: 'Ufopflanze', latin: 'Pilea peperomioides',
    tip: 'Heller Platz ohne Mittagssonne, alle zwei Wochen drehen.',
    lore: 'Meine Blätter zeigen wie kleine Satellitenschüsseln zum Licht. Weitergegeben wurde ich lange nur unter Freunden — daher \'Glückstaler\'.',
    roomHint: 'das Arbeitszimmer: helles Fenster, keine Heizungsluft',
    soil: { min: 30, max: 60, hint: 'obere Erdschicht antrocknen lassen zwischen den Gießgängen', provisional: true },
    light: { min: 1500, max: 15000, hint: 'hell und indirekt; Blätter drehen sich zum Licht' },
    temp: { min: 16, max: 24, hint: 'verträgt auch kühlere Räume, keine Zugluft' },
    humidity: { min: 40, max: 60, hint: 'normale Zimmerluft reicht' }
  },
  {
    id: 'monstera', name: 'Monstera', latin: 'Monstera deliciosa',
    tip: 'Helles indirektes Licht, gießen wenn die oberen drei Zentimeter trocken sind.',
    lore: 'Die Löcher sind Absicht: Im Regenwald lasse ich so Licht zu den unteren Blättern und Sturm hindurch.',
    roomHint: 'das Wohnzimmer: hell, warm, viel Platz nach oben',
    soil: { min: 35, max: 65, hint: 'oberste 3 cm antrocknen lassen, dann durchdringend gießen', provisional: true },
    light: { min: 1500, max: 18000, hint: 'keine pralle Sonne, sonst bleichen die Blätter aus' },
    temp: { min: 18, max: 26, hint: 'nicht unter 15 °C, keine kalte Zugluft' },
    humidity: { min: 40, max: 70, hint: 'toleriert normale Raumluft, mehr Feuchte fördert größere Fenster' }
  },
  {
    id: 'strelitzia', name: 'Strelizie', latin: 'Strelitzia nicolai',
    tip: 'Viel Licht, gern Morgensonne. Blätter abstauben.',
    lore: 'Ich werde im Wohnzimmer bis drei Meter hoch. Meine Blätter reißen mit der Zeit ein — das ist normal, kein Pflegefehler.',
    roomHint: 'das Wohnzimmer: das hellste Fenster, viel Deckenhöhe',
    soil: { min: 35, max: 65, hint: 'im Sommer reichlich, dazwischen antrocknen lassen', provisional: true },
    light: { min: 3000, max: 25000, hint: 'so viel Licht wie möglich, gern direkte Morgensonne' },
    temp: { min: 18, max: 28, hint: 'im Winter nicht unter 12 °C' },
    humidity: { min: 35, max: 65, hint: 'normale Zimmerluft genügt' }
  },
  {
    id: 'pothos', name: 'Efeutute', latin: 'Epipremnum aureum',
    tip: 'Halbschatten, mäßig gießen — verzeiht fast alles.',
    lore: 'In freier Natur klettere ich zwanzig Meter hoch und bekomme dabei riesige, geschlitzte Blätter.',
    roomHint: 'die Küche: Halbschatten und etwas Feuchte reichen ihr',
    soil: { min: 25, max: 55, hint: 'obere Erde darf antrocknen, verzeiht auch mal Vergessen', provisional: true },
    light: { min: 600, max: 15000, hint: 'Halbschatten genügt, je heller desto stärker die Panaschierung' },
    temp: { min: 15, max: 26, hint: 'sehr tolerant, kaum Ansprüche' },
    humidity: { min: 30, max: 60, hint: 'normale Zimmerluft reicht völlig' }
  },
  {
    id: 'sansevieria', name: 'Bogenhanf', latin: 'Sansevieria trifasciata',
    tip: 'Sehr trockenheitsfest, im Winter nur alle vier Wochen gießen.',
    lore: 'Ich verwerte CO₂ auch nachts — einer der Gründe, warum ich als Schlafzimmerpflanze gelte.',
    roomHint: 'das Schlafzimmer: pflegeleicht, kommt mit wenig Licht aus',
    soil: { min: 10, max: 35, hint: 'Erde ganz durchtrocknen lassen zwischen den Gießgängen', provisional: true },
    light: { min: 300, max: 30000, hint: 'von Halbschatten bis volle Sonne — fast alles ist möglich' },
    temp: { min: 15, max: 28, hint: 'mag keine Kälte unter 15 °C' },
    humidity: { min: 20, max: 60, hint: 'unempfindlich gegen trockene Heizungsluft' }
  },
  {
    id: 'coffee', name: 'Kaffeepflanze', latin: 'Coffea arabica',
    tip: 'Gleichmäßig feucht, kalkarmes Wasser, keine Mittagssonne.',
    lore: 'Nach drei bis vier Jahren blühe ich weiß und duftend. Danach kommen grüne Kirschen, die rot werden.',
    roomHint: 'die Küche: warm, feucht, helles Licht',
    soil: { min: 45, max: 70, hint: 'nie austrocknen lassen, kalkarmes Wasser verwenden', provisional: true },
    light: { min: 1200, max: 15000, hint: 'hell, aber keine direkte Mittagssonne' },
    temp: { min: 18, max: 25, hint: 'im Winter nicht unter 15 °C' },
    humidity: { min: 50, max: 75, hint: 'mag es feucht und warm, nicht neben ein zugiges Fenster' }
  },
  {
    id: 'cactus', name: 'Kaktus', latin: 'Echinopsis chamaecereus',
    tip: 'Sonnig und trocken. Im Winter gar nicht gießen.',
    lore: 'Meine Stacheln sind umgebaute Blätter. Sie verdunsten kein Wasser und beschatten mich sogar leicht.',
    roomHint: 'das Schlafzimmer: Südfenster, trocken, im Winter kühl',
    soil: { min: 5, max: 25, hint: 'von November bis März gar nicht gießen', provisional: true },
    light: { min: 5000, max: 40000, hint: 'volle Sonne, so viel wie möglich — Südfenster ist perfekt' },
    temp: { min: 10, max: 32, hint: 'Winter kühl bei 8–12 °C, davon hängt die Blüte ab' },
    humidity: { min: 15, max: 45, hint: 'trockene Luft ist kein Problem' }
  },
  {
    id: 'bamboo', name: 'Zimmerbambus', latin: 'Pogonatherum paniceum',
    tip: 'Mag es dauerhaft feucht — Untersetzer mit Wasser.',
    lore: 'Botanisch bin ich ein Süßgras, kein echter Bambus. Deshalb mag ich es nass wie am Flussufer.',
    roomHint: 'das Wohnzimmer: hell und mit Platz für einen Untersetzer',
    soil: { min: 55, max: 85, hint: 'nie austrocknen lassen, Untersetzer immer mit etwas Wasser', provisional: true },
    light: { min: 1000, max: 12000, hint: 'hell bis halbschattig, keine pralle Sonne' },
    temp: { min: 18, max: 25, hint: 'mag es nicht kalt' },
    humidity: { min: 45, max: 70, hint: 'schätzt spürbare Luftfeuchte' }
  },
  {
    id: 'bonsai', name: 'Bonsai', latin: 'Ficus microcarpa',
    tip: 'Nie ganz austrocknen lassen, im Frühjahr Triebspitzen kürzen.',
    lore: 'Nicht die Art macht den Bonsai, sondern die Erziehung: Schnitt, kleines Gefäß, Geduld über Jahre.',
    roomHint: 'das Wohnzimmer: heller Platz auf Augenhöhe',
    soil: { min: 35, max: 60, hint: 'kleines Gefäß trocknet schnell — täglich prüfen', provisional: true },
    light: { min: 2000, max: 18000, hint: 'hell, gern etwas Morgensonne, kein dunkler Standort' },
    temp: { min: 18, max: 24, hint: 'keine Zugluft' },
    humidity: { min: 40, max: 65, hint: 'normale Zimmerluft genügt' }
  },
  {
    id: 'rubber', name: 'Gummibaum', latin: 'Ficus elastica',
    tip: 'Helles Licht, erst gießen wenn die Erde angetrocknet ist.',
    lore: 'Mein Milchsaft wurde früher zu Kautschuk verarbeitet. Bitte nicht anfassen — er reizt die Haut.',
    roomHint: 'das Schlafzimmer: gleichmäßig warm, hell, ohne Zugluft',
    soil: { min: 30, max: 60, hint: 'erst gießen, wenn die Erde gut angetrocknet ist', provisional: true },
    light: { min: 1500, max: 15000, hint: 'hell bis halbschattig, keine pralle Mittagssonne' },
    temp: { min: 18, max: 25, hint: 'reagiert auf Umstellen mit Blattfall' },
    humidity: { min: 30, max: 60, hint: 'normale Zimmerluft reicht' }
  },
  {
    id: 'fern', name: 'Streifenfarn', latin: 'Asplenium nidus',
    tip: 'Halbschatten, gleichmäßig feucht — ich liebe Badezimmerluft.',
    lore: 'Ich bin älter als alle Blütenpflanzen und vermehre mich über Sporen an der Blattunterseite.',
    roomHint: 'das Badezimmer: warm, feucht, kein direktes Sonnenlicht',
    soil: { min: 50, max: 80, hint: 'nie ganz austrocknen, Wasser nicht ins Herz gießen', provisional: true },
    light: { min: 200, max: 8000, hint: 'Halbschatten bis helles indirektes Licht' },
    temp: { min: 18, max: 24, hint: 'keine kalte Zugluft' },
    humidity: { min: 50, max: 85, hint: 'über 50 % — mag Bad- oder Küchenluft' }
  },
  {
    id: 'generic', name: 'Unbekannte Art', latin: 'noch nicht bestimmt',
    tip: 'Wir lernen uns eben kennen. Beobachte mich die erste Woche genau.',
    lore: 'Zu meiner Art steht noch nicht viel in der Datenbank. Wir lernen uns eben kennen.',
    roomHint: 'ein heller Platz im Wohnzimmer, bis du sie besser kennst',
    soil: { min: 30, max: 60, hint: 'sparsam gießen und beobachten, bis klar ist was passt', provisional: true },
    light: { min: 1000, max: 12000, hint: 'starte mit hellem, indirektem Licht' },
    temp: { min: 18, max: 24, hint: 'normale Zimmertemperatur' },
    humidity: { min: 35, max: 65, hint: 'normale Zimmerluft, dann beobachten' }
  }
];
