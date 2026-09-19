// Baloo 2 traegt Namen/Persoenlichkeit (Pflanzenname, freundliche
// Karten-Titel), Plus Jakarta Sans ist die Arbeitsschrift fuer den Rest -
// exakt die Aufteilung aus dem Prototyp.
export const fonts = {
  baloo: {
    500: 'Baloo2_500Medium',
    600: 'Baloo2_600SemiBold',
    700: 'Baloo2_700Bold',
    800: 'Baloo2_800ExtraBold'
  },
  sans: {
    500: 'PlusJakartaSans_500Medium',
    600: 'PlusJakartaSans_600SemiBold',
    700: 'PlusJakartaSans_700Bold',
    800: 'PlusJakartaSans_800ExtraBold'
  }
};

export function baloo(weight = 600, size = 16, extra = {}) {
  return { fontFamily: fonts.baloo[weight] || fonts.baloo[600], fontSize: size, ...extra };
}
export function sans(weight = 600, size = 15, extra = {}) {
  return { fontFamily: fonts.sans[weight] || fonts.sans[600], fontSize: size, ...extra };
}
