const NAME = 'Eike';

export function timeGreeting(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return `Noch wach, ${NAME}?`;
  if (h < 11) return `Guten Morgen, ${NAME}.`;
  if (h < 14) return `Hallo ${NAME}.`;
  if (h < 18) return `Guten Tag, ${NAME}.`;
  if (h < 22) return `Guten Abend, ${NAME}.`;
  return `Gute Nacht, ${NAME}.`;
}

export function homeHeadline(needCount) {
  if (needCount === 0) return 'Alle sind zufrieden.';
  if (needCount === 1) return 'Eine Pflanze meldet sich.';
  return `${needCount} Pflanzen melden sich.`;
}

export function homeSubline({ needCount, roomCount, happyCount }) {
  if (needCount === 0) return 'Genieß den Moment, das kommt selten vor.';
  const base = `In ${roomCount} ${roomCount === 1 ? 'Raum' : 'Räumen'}`;
  if (happyCount === 0) return base;
  if (happyCount === 1) return `${base} · eine ist wohlauf.`;
  return `${base} · der Rest genießt das Licht.`;
}

export function timeAgo(iso) {
  if (!iso) return 'nie';
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'gerade eben';
  if (min < 60) return `vor ${min} Min.`;
  const h = Math.floor(min / 60);
  if (h < 24) return `vor ${h} Std.`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'vor 1 Tag';
  if (d < 14) return `vor ${d} Tagen`;
  return `vor ${Math.floor(d / 7)} Wochen`;
}
