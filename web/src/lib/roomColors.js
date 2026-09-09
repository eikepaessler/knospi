const KNOWN = { wohn: '#3C7A2E', kueche: '#B98436', kinder: '#8C9B58', schlaf: '#7E9EA8' };
const PALETTE = ['#3C7A2E', '#B98436', '#8C9B58', '#7E9EA8', '#A6714F', '#6E8B9E'];

export function roomColor(id) {
  if (KNOWN[id]) return KNOWN[id];
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) % PALETTE.length;
  return PALETTE[hash];
}
