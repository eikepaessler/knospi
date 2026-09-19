import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, shadows, spacing } from '../theme/layout';
import { sans } from '../theme/typography';

export function Card({ children, style, ...props }) {
  return <View style={[styles.card, style]} {...props}>{children}</View>;
}

export function SectionTitle({ children, style }) {
  return <Text style={[styles.sectionTitle, style]}>{children}</Text>;
}

export function SpeechBubble({ children, style, textStyle }) {
  return (
    <View style={[styles.bubble, style]}>
      <Text style={[styles.bubbleText, textStyle]}>{children}</Text>
      <View style={styles.bubbleTail} />
    </View>
  );
}

export function ActionPill({ label, onPress, disabled, style }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.actionPill, shadows.action, style, pressed && { transform: [{ scale: 0.985 }] }, disabled && { opacity: 0.5 }]}
    >
      <Text style={styles.actionPillText}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({ label, onPress, style, textStyle }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.ghostBtn, style, pressed && { opacity: 0.7 }]}>
      <Text style={[styles.ghostBtnText, textStyle]}>{label}</Text>
    </Pressable>
  );
}

export function SoftButton({ label, onPress, style }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.softBtn, style, pressed && { opacity: 0.75 }]}>
      <Text style={styles.softBtnText}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, dotColor, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      {dotColor && <View style={[styles.chipDot, { backgroundColor: dotColor }]} />}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function MoodDot({ color, size = 9 }) {
  return <View style={{ width: size, height: size, borderRadius: 3, backgroundColor: color }} />;
}

export function Toast({ message }) {
  if (!message) return null;
  return (
    <View pointerEvents="none" style={styles.toastWrap}>
      <View style={styles.toast}><Text style={styles.toastText}>{message}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.md
  },
  sectionTitle: {
    ...sans(800, 13),
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.ok,
    marginBottom: spacing.sm
  },
  bubble: {
    backgroundColor: colors.paper,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: radius.md,
    paddingHorizontal: 17,
    paddingVertical: 14,
    maxWidth: 280
  },
  bubbleText: { ...sans(700, 16, { lineHeight: 22, color: colors.ink, textAlign: 'center' }) },
  bubbleTail: {
    position: 'absolute', left: '50%', bottom: -8, marginLeft: -7,
    width: 14, height: 14, backgroundColor: colors.paper,
    borderLeftWidth: 1.5, borderBottomWidth: 1.5, borderColor: colors.ink,
    transform: [{ rotate: '-45deg' }]
  },
  actionPill: {
    minHeight: 58, borderRadius: radius.pill, backgroundColor: colors.btn,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl
  },
  actionPillText: { ...sans(700, 17, { color: colors.btnFg, letterSpacing: -0.3 }) },
  ghostBtn: {
    minHeight: 52, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.line,
    backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg
  },
  ghostBtnText: { ...sans(800, 15, { color: colors.ink }) },
  softBtn: {
    minHeight: 52, borderRadius: radius.pill, backgroundColor: colors.soft2,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg
  },
  softBtnText: { ...sans(800, 15, { color: colors.acc }) },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 7, height: 38, paddingHorizontal: 14,
    borderRadius: radius.pill, backgroundColor: colors.soft, borderWidth: 1.5, borderColor: 'transparent'
  },
  chipActive: { backgroundColor: colors.ink },
  chipDot: { width: 8, height: 8, borderRadius: 3 },
  chipText: { ...sans(700, 13.5, { color: colors.ink }) },
  chipTextActive: { color: colors.bg },
  toastWrap: { position: 'absolute', left: 0, right: 0, bottom: 110, alignItems: 'center' },
  toast: {
    backgroundColor: colors.ink, borderRadius: radius.pill, paddingHorizontal: 18, paddingVertical: 12,
    maxWidth: '86%', ...shadows.action
  },
  toastText: { ...sans(700, 13.5, { color: colors.bg, textAlign: 'center' }) }
});
