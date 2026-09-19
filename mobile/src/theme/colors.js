// 1:1 aus den CSS-Custom-Properties von Knospi_App_v2.dc.html uebernommen.
export const colors = {
  outerBg: '#DFE4D2', // Hintergrund hinter dem 440pt-Geraeterahmen
  bg: '#F6F5EF',
  card: '#FFFFFF',
  ink: '#1D2418',
  mut: '#77826E',
  acc: '#3C7A2E',
  acc2: '#DFF48F',
  ok: '#3C7A2E',
  warn: '#B98436',
  bad: '#C0564A',
  soft: '#EFF1E4',
  soft2: '#E8F0D5',
  line: 'rgba(29,36,24,0.10)',
  btn: '#1D2418',
  btnFg: '#F6F5EF',
  paper: '#FFFDF7', // Sprechblasen-Hintergrund

  // Raumfarben (Punkt-Marker), aus dem Prototyp übernommen.
  rooms: { wohn: '#3C7A2E', kueche: '#B98436', kinder: '#8C9B58', schlaf: '#7E9EA8' },
  roomFallback: ['#3C7A2E', '#B98436', '#8C9B58', '#7E9EA8', '#A6714F', '#6E8B9E']
};

export function toneColor(tone) {
  return { ok: colors.ok, warn: colors.warn, bad: colors.bad, mut: colors.mut }[tone] || colors.ok;
}

export function roomColor(id) {
  if (colors.rooms[id]) return colors.rooms[id];
  let hash = 0;
  for (const ch of String(id)) hash = (hash * 31 + ch.charCodeAt(0)) % colors.roomFallback.length;
  return colors.roomFallback[hash];
}
