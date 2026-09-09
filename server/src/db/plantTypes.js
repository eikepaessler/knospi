// Pflanzenarten-Katalog: Pflegehinweise (Anzeige-Text) + numerische
// Idealbereiche (fuer den Abgleich mit Sensordaten).
export const PLANT_TYPES = [
  {
    id: 'fern', name: 'Streifenfarn', latin: 'Asplenium nidus',
    tip: 'Halbschatten, gleichmäßig feucht — ich liebe Badezimmerluft.',
    lore: 'Ich bin älter als alle Blütenpflanzen und vermehre mich über Sporen an der Blattunterseite.',
    care: {
      light: 'Halbschatten bis helles indirektes Licht. Direkte Mittagssonne verbrennt meine Wedel.',
      spot: 'Gern Bad oder Küche — Luftfeuchte über 50 %. Nicht direkt über die Heizung.',
      water: 'Gleichmäßig feucht halten, nie ganz austrocknen. Weiches Wasser in den Topfrand, nicht ins Herz.',
      temp: '18 bis 24 Grad, keine kalte Zugluft.',
      food: 'April bis September alle vier Wochen schwach dosiert düngen.',
      room: 'das Badezimmer: warm, feucht, kein direktes Sonnenlicht'
    },
    range: { soil: [50, 75], light: [200, 1500], temp: [18, 24], humidity: [50, 80] },
    fertDays: 28
  },
  {
    id: 'monstera', name: 'Monstera', latin: 'Monstera deliciosa',
    tip: 'Helles indirektes Licht, gießen wenn die oberen drei Zentimeter trocken sind.',
    lore: 'Die Löcher sind Absicht: Im Regenwald lasse ich so Licht zu den unteren Blättern und Sturm hindurch.',
    care: {
      light: 'Helles indirektes Licht. Keine pralle Sonne, sonst bleichen die Blätter aus.',
      spot: 'Braucht Platz — mindestens einen halben Meter zur Wand, gern mit Rankstab.',
      water: 'Erst gießen, wenn die oberen drei Zentimeter Erde trocken sind. Etwa einmal pro Woche.',
      temp: '18 bis 26 Grad, nicht unter 15 Grad.',
      food: 'Alle vier Wochen in der Wachstumszeit düngen — davon lebt die Blattgröße.',
      room: 'das Wohnzimmer: hell, warm, viel Platz nach oben'
    },
    range: { soil: [35, 60], light: [1500, 8000], temp: [18, 26], humidity: [40, 70] },
    fertDays: 28
  },
  {
    id: 'begonia', name: 'Forellenbegonie', latin: 'Begonia maculata',
    tip: 'Helles Licht, weiches Wasser, nie auf die Blätter gießen.',
    lore: 'Die silbrigen Punkte sind kein Zufall — sie streuen Licht auf den Waldboden Brasiliens, wo ich herkomme. Rote Blattunterseite inklusive.',
    care: {
      light: 'Hell, aber ohne direkte Sonne — sonst verblassen die silbernen Punkte.',
      spot: 'Fester Platz mit etwas Luftfeuchte. Mag es nicht, verschoben zu werden.',
      water: 'Erde leicht feucht halten, immer von unten gießen. Nie auf die Blätter.',
      temp: '18 bis 24 Grad, empfindlich gegen Zugluft.',
      food: 'Alle drei Wochen leicht düngen, im Winter pausieren.',
      room: 'das Wohnzimmer: helles Fenster ohne Mittagssonne'
    },
    range: { soil: [40, 60], light: [1200, 6000], temp: [18, 24], humidity: [45, 70] },
    fertDays: 21
  },
  {
    id: 'kingbegonia', name: 'Königsbegonie', latin: 'Begonia rex',
    tip: 'Über 55 % Luftfeuchte, keine direkte Sonne.',
    lore: 'Von mir gibt es über 500 Zuchtformen. Gezüchtet wurde ich für das Muster, nicht für die Blüte.',
    care: {
      light: 'Halbschatten. Direkte Sonne zeichnet Flecken ins Muster.',
      spot: 'Über 55 % Luftfeuchte — Bad oder eine Schale Wasser in der Nähe.',
      water: 'Sparsam und regelmäßig, immer von unten. Staunässe ist tödlich.',
      temp: '18 bis 23 Grad, gleichmäßig.',
      food: 'Alle vier Wochen sehr schwach düngen.',
      room: 'das Badezimmer: feucht, gleichmäßig warm, schattig'
    },
    range: { soil: [40, 60], light: [800, 4000], temp: [18, 23], humidity: [55, 80] },
    fertDays: 28
  },
  {
    id: 'pilea', name: 'Ufopflanze', latin: 'Pilea peperomioides',
    tip: 'Heller Platz ohne Mittagssonne, alle zwei Wochen drehen.',
    lore: 'Meine Blätter zeigen wie kleine Satellitenschüsseln zum Licht. Weitergegeben wurde ich lange nur unter Freunden — daher \'Glückstaler\'.',
    care: {
      light: 'Hell und indirekt. Blätter drehen sich zum Licht.',
      spot: 'Alle zwei Wochen um 90 Grad drehen, damit sie gerade wächst.',
      water: 'Mäßig gießen, obere Erdschicht antrocknen lassen. Etwa alle 7 bis 10 Tage.',
      temp: '16 bis 24 Grad, verträgt auch kühlere Räume.',
      food: 'Alle vier Wochen leicht düngen, sonst wird sie beinig.',
      room: 'das Arbeitszimmer: helles Fenster, keine Heizungsluft'
    },
    range: { soil: [30, 55], light: [1500, 7000], temp: [16, 24], humidity: [40, 60] },
    fertDays: 28
  },
  {
    id: 'pothos', name: 'Efeutute', latin: 'Epipremnum aureum',
    tip: 'Halbschatten, mäßig gießen — verzeiht fast alles.',
    lore: 'In freier Natur klettere ich zwanzig Meter hoch und bekomme dabei riesige, geschlitzte Blätter.',
    care: {
      light: 'Halbschatten genügt. Je heller, desto stärker die Panaschierung.',
      spot: 'Hängend oder rankend — überall, wo Ranken Platz haben.',
      water: 'Mäßig gießen, obere Erde darf trocknen. Verzeiht Vergessen.',
      temp: '15 bis 26 Grad, sehr tolerant.',
      food: 'Alle sechs Wochen düngen reicht.',
      room: 'die Küche: Halbschatten und etwas Feuchte reichen ihr'
    },
    range: { soil: [25, 50], light: [600, 5000], temp: [15, 26], humidity: [30, 60] },
    fertDays: 42
  },
  {
    id: 'sansevieria', name: 'Bogenhanf', latin: 'Sansevieria trifasciata',
    tip: 'Sehr trockenheitsfest, im Winter nur alle vier Wochen gießen.',
    lore: 'Ich verwerte CO₂ auch nachts — einer der Gründe, warum ich als Schlafzimmerpflanze gilt.',
    care: {
      light: 'Von Halbschatten bis volle Sonne — fast alles ist möglich.',
      spot: 'Auch dunkle Ecken sind ok. Kein Untersetzer mit Standwasser.',
      water: 'Sehr sparsam: im Sommer alle zwei bis drei Wochen, im Winter alle vier. Erde ganz durchtrocknen lassen.',
      temp: 'Über 15 Grad, mag keine Kälte.',
      food: 'Zwei bis drei Mal im Jahr Kakteendünger genügt.',
      room: 'das Schlafzimmer: pflegeleicht, kommt mit wenig Licht aus'
    },
    range: { soil: [10, 30], light: [300, 10000], temp: [15, 28], humidity: [20, 60] },
    fertDays: 90
  },
  {
    id: 'strelitzia', name: 'Strelizie', latin: 'Strelitzia nicolai',
    tip: 'Viel Licht, gern Morgensonne. Blätter abstauben.',
    lore: 'Ich werde im Wohnzimmer bis drei Meter hoch. Meine Blätter reißen mit der Zeit ein — das ist normal, kein Pflegefehler.',
    care: {
      light: 'So viel Licht wie möglich, gern direkte Morgensonne.',
      spot: 'Braucht Höhe und Standfestigkeit — sie wird groß. Blätter regelmäßig abstauben.',
      water: 'Im Sommer reichlich, Erde zwischendurch antrocknen lassen. Im Winter deutlich weniger.',
      temp: '18 bis 28 Grad, im Winter nicht unter 12 Grad.',
      food: 'Alle zwei Wochen von April bis September düngen.',
      room: 'das Wohnzimmer: das hellste Fenster, viel Deckenhöhe'
    },
    range: { soil: [35, 60], light: [3000, 12000], temp: [18, 28], humidity: [35, 65] },
    fertDays: 14
  },
  {
    id: 'rubber', name: 'Gummibaum', latin: 'Ficus elastica',
    tip: 'Helles Licht, erst gießen wenn die Erde angetrocknet ist.',
    lore: 'Mein Milchsaft wurde früher zu Kautschuk verarbeitet. Bitte nicht anfassen — er reizt die Haut.',
    care: {
      light: 'Hell bis halbschattig, keine pralle Mittagssonne.',
      spot: 'Fester Platz — reagiert auf Umstellen mit Blattfall. Blätter feucht abwischen.',
      water: 'Erst gießen, wenn die Erde gut angetrocknet ist. Etwa alle 10 Tage.',
      temp: '18 bis 25 Grad, nicht unter 15 Grad.',
      food: 'Alle vier Wochen düngen in der Wachstumszeit.',
      room: 'das Schlafzimmer: gleichmäßig warm, hell, ohne Zugluft'
    },
    range: { soil: [30, 55], light: [1500, 7000], temp: [18, 25], humidity: [30, 60] },
    fertDays: 28
  },
  {
    id: 'coffee', name: 'Kaffeepflanze', latin: 'Coffea arabica',
    tip: 'Gleichmäßig feucht, kalkarmes Wasser, keine Mittagssonne.',
    lore: 'Nach drei bis vier Jahren blühe ich weiß und duftend. Danach kommen grüne Kirschen, die rot werden.',
    care: {
      light: 'Hell, aber keine direkte Mittagssonne.',
      spot: 'Mag Luftfeuchte und Wärme. Nicht neben ein zugiges Fenster.',
      water: 'Gleichmäßig feucht halten mit kalkarmem Wasser. Nie austrocknen lassen.',
      temp: '18 bis 25 Grad, im Winter nicht unter 15 Grad.',
      food: 'Alle zwei Wochen düngen, sie wächst schnell.',
      room: 'die Küche: warm, feucht, helles Licht'
    },
    range: { soil: [45, 65], light: [1200, 6000], temp: [18, 25], humidity: [50, 75] },
    fertDays: 14
  },
  {
    id: 'cactus', name: 'Kaktus', latin: 'Echinopsis chamaecereus',
    tip: 'Sonnig und trocken. Im Winter gar nicht gießen.',
    lore: 'Meine Stacheln sind umgebaute Blätter. Sie verdunsten kein Wasser und beschatten mich sogar leicht.',
    care: {
      light: 'Volle Sonne, so viel wie möglich. Südfenster ist perfekt.',
      spot: 'Sandige, durchlässige Erde. Auf keinen Fall Untersetzer mit Wasser.',
      water: 'Im Sommer alle zwei bis drei Wochen sparsam. Von November bis März gar nicht gießen.',
      temp: 'Sommer warm, Winter kühl bei 8 bis 12 Grad — davon hängt die Blüte ab.',
      food: 'Ein bis zwei Mal im Sommer Kakteendünger.',
      room: 'das Schlafzimmer: Südfenster, trocken, im Winter kühl'
    },
    range: { soil: [5, 25], light: [5000, 20000], temp: [10, 32], humidity: [15, 45] },
    fertDays: 180
  },
  {
    id: 'bamboo', name: 'Zimmerbambus', latin: 'Pogonatherum paniceum',
    tip: 'Mag es dauerhaft feucht — Untersetzer mit Wasser.',
    lore: 'Botanisch bin ich ein Süßgras, kein echter Bambus. Deshalb mag ich es nass wie am Flussufer.',
    care: {
      light: 'Hell bis halbschattig, keine pralle Sonne.',
      spot: 'Braucht dauerhaft Wasser im Untersetzer — botanisch ein Süßgras vom Flussufer.',
      water: 'Nie austrocknen lassen, im Untersetzer immer ein paar Millimeter Wasser.',
      temp: '18 bis 25 Grad, mag es nicht kalt.',
      food: 'Alle vier Wochen leicht düngen.',
      room: 'das Wohnzimmer: hell und mit Platz für einen Untersetzer'
    },
    range: { soil: [55, 80], light: [1000, 6000], temp: [18, 25], humidity: [45, 70] },
    fertDays: 28
  },
  {
    id: 'bonsai', name: 'Bonsai', latin: 'Ficus microcarpa',
    tip: 'Nie ganz austrocknen lassen, im Frühjahr Triebspitzen kürzen.',
    lore: 'Nicht die Art macht den Bonsai, sondern die Erziehung: Schnitt, kleines Gefäß, Geduld über Jahre.',
    care: {
      light: 'Hell, gern etwas Morgensonne. Kein dunkler Standort.',
      spot: 'Fester, luftiger Platz. Kleines Gefäß trocknet schnell aus — täglich prüfen.',
      water: 'Nie ganz austrocknen lassen, aber auch keine Staunässe. Oft kleine Mengen.',
      temp: '18 bis 24 Grad, keine Zugluft.',
      food: 'Alle zwei Wochen schwach düngen, im Winter pausieren.',
      room: 'das Wohnzimmer: heller Platz auf Augenhöhe'
    },
    range: { soil: [35, 55], light: [2000, 8000], temp: [18, 24], humidity: [40, 65] },
    fertDays: 14
  },
  {
    id: 'generic', name: 'Unbekannte Art', latin: 'noch nicht bestimmt',
    tip: 'Wir lernen uns eben kennen. Beobachte mich die erste Woche genau.',
    lore: 'Zu meiner Art steht noch nicht viel in der Datenbank. Wir lernen uns eben kennen.',
    care: {
      light: 'Starte mit hellem, indirektem Licht — das passt den meisten Zimmerpflanzen.',
      spot: 'Erstmal ein fester Platz ohne Zugluft, damit du Veränderungen erkennst.',
      water: 'Sparsam gießen und beobachten: hängende Blätter heißen Durst, gelbe zu viel Wasser.',
      temp: 'Zimmertemperatur zwischen 18 und 24 Grad.',
      food: 'Im ersten Monat nicht düngen — frische Erde bringt genug mit.',
      room: 'ein heller Platz im Wohnzimmer, bis du sie besser kennst'
    },
    range: { soil: [30, 55], light: [1000, 6000], temp: [18, 24], humidity: [35, 60] },
    fertDays: 30
  }
];
