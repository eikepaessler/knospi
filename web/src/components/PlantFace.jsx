const FACE_PATHS = {
  happy: (
    <>
      <circle cx="34" cy="46" r="4.5" fill="currentColor" />
      <circle cx="66" cy="46" r="4.5" fill="currentColor" />
      <path d="M32 60c6 8 30 8 36 0" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
    </>
  ),
  sad: (
    <>
      <circle cx="34" cy="46" r="4.5" fill="currentColor" />
      <circle cx="66" cy="46" r="4.5" fill="currentColor" />
      <path d="M32 66c6-8 30-8 36 0" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
    </>
  ),
  sleepy: (
    <>
      <path d="M28 46c4-3 10-3 14 0" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d="M58 46c4-3 10-3 14 0" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d="M38 62h24" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  pot: (
    <>
      <circle cx="34" cy="48" r="3.5" fill="currentColor" opacity="0.5" />
      <circle cx="66" cy="48" r="3.5" fill="currentColor" opacity="0.5" />
      <path d="M38 62h24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
    </>
  )
};

export function PlantFace({ face = 'happy', tone = '#3C7A2E', size = 56, bg }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: bg || 'var(--k-soft)', color: tone,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}
    >
      <svg width={size * 0.72} height={size * 0.72} viewBox="0 0 100 100">
        {FACE_PATHS[face] || FACE_PATHS.happy}
      </svg>
    </div>
  );
}
