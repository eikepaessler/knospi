import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius } from '../theme/layout';
import { baloo, sans } from '../theme/typography';

const CONFETTI = Array.from({ length: 10 }, (_, i) => ({
  angle: (i / 10) * Math.PI * 2,
  dist: 46 + (i % 3) * 14,
  color: i % 2 ? colors.acc2 : colors.acc
}));

export function StickerOverlay({ sticker }) {
  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!sticker) return;
    pop.setValue(0);
    Animated.spring(pop, { toValue: 1, friction: 5.5, tension: 60, useNativeDriver: true }).start();
  }, [sticker, pop]);

  if (!sticker) return null;

  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const rotate = pop.interpolate({ inputRange: [0, 1], outputRange: ['-14deg', '0deg'] });
  const opacity = pop;

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <View style={styles.confettiWrap}>
        {CONFETTI.map((c, i) => {
          const dx = Math.cos(c.angle) * c.dist;
          const dy = Math.sin(c.angle) * c.dist;
          return (
            <Animated.View
              key={i}
              style={{
                position: 'absolute', width: 6, height: 6, borderRadius: 2, backgroundColor: c.color,
                opacity, transform: [
                  { translateX: pop.interpolate({ inputRange: [0, 1], outputRange: [0, dx] }) },
                  { translateY: pop.interpolate({ inputRange: [0, 1], outputRange: [0, dy] }) }
                ]
              }}
            />
          );
        })}
        <Animated.View style={[styles.medal, { backgroundColor: sticker.tint, transform: [{ scale }, { rotate }], opacity }]}>
          <View style={styles.medalShine} />
          <Text style={[styles.glyph, { color: sticker.ink }]}>★</Text>
        </Animated.View>
      </View>
      <Animated.Text style={[styles.title, { opacity }]}>Sticker freigeschaltet</Animated.Text>
      <Animated.Text style={[styles.label, { opacity }]}>{sticker.label}</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  confettiWrap: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center' },
  medal: {
    width: 88, height: 88, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)'
  },
  medalShine: { position: 'absolute', top: 10, left: 16, width: 26, height: 14, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.55)' },
  glyph: { fontSize: 30 },
  title: { ...sans(700, 13, { color: colors.mut, marginTop: 14 }) },
  label: { ...baloo(700, 22, { color: colors.ink, marginTop: 2 }) }
});
