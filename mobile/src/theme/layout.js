import { Platform } from 'react-native';

export const radius = { sm: 14, md: 18, lg: 22, xl: 26, xxl: 30, xxxl: 34, pill: 999 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };

// Naehert die CSS box-shadow-Werte des Prototyps mit plattformgerechten
// Schatten an (iOS: shadow*-Props, Android: elevation).
function shadow(elevation, opacity, radiusPx = elevation * 1.6, offsetY = elevation * 0.5) {
  return Platform.select({
    android: { elevation },
    default: {
      shadowColor: '#1D2418',
      shadowOpacity: opacity,
      shadowRadius: radiusPx,
      shadowOffset: { width: 0, height: offsetY }
    }
  });
}

export const shadows = {
  sm: shadow(3, 0.07),
  md: shadow(6, 0.09),
  lg: shadow(10, 0.1),
  action: shadow(12, 0.22, 20, 8),
  shutter: shadow(14, 0.28, 22, 10)
};
