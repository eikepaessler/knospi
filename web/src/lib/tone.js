export const TONE_COLOR = {
  ok: 'var(--k-ok)',
  warn: 'var(--k-warn)',
  bad: 'var(--k-bad)',
  mut: 'var(--k-mut)'
};

export const MOOD_TONE = {
  happy: 'ok', thirsty: 'bad', dark: 'warn', cold: 'warn', hungry: 'warn', air: 'warn'
};

export function toneForMood(mood) {
  return TONE_COLOR[MOOD_TONE[mood] || 'ok'];
}

export function toneForStatus(status) {
  if (status == null) return TONE_COLOR.mut;
  return status === 'ok' ? TONE_COLOR.ok : TONE_COLOR.warn;
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
  const w = Math.floor(d / 7);
  return `vor ${w} Wochen`;
}
