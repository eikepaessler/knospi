import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Rect } from 'react-native-svg';
import { colors } from '../theme/colors';
import { radius, shadows } from '../theme/layout';
import { sans } from '../theme/typography';
import { useAppData } from '../context/AppDataContext';

// Gleiches Blatt-Icon wie der aktive Tab in der Fussnavigation (TabBar.js) -
// fuer ein durchgaengiges Markenzeichen statt eines schmucklosen Kastens.
function LeafMark() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path d="M20 4C10 4 4 10 4 20c10 0 16-6 16-16z" fill={colors.ok} />
      <Path d="M6 18c4-4 8-8 12-12" stroke={colors.card} strokeWidth={1.4} strokeLinecap="round" opacity={0.35} />
    </Svg>
  );
}

export function TopHeader() {
  const navigation = useNavigation();
  const { settings } = useAppData();
  const unreadOffer = !settings.offerRead;

  return (
    <View style={styles.row}>
      <View style={styles.brand}>
        <LeafMark />
        <Text style={styles.brandText}>Knospi</Text>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.circleBtn} onPress={() => navigation.navigate('Shop')}>
          <Svg width={20} height={20} viewBox="0 0 20 20">
            <Rect x={4} y={6.5} width={12} height={10.5} rx={2.6} stroke={colors.ink} strokeWidth={1.6} fill="none" strokeLinejoin="round" />
            <Path d="M7.2 6.5 V4.6 A2.8 2.8 0 0 1 12.8 4.6 V6.5" stroke={colors.ink} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          {unreadOffer && <View style={styles.badge} />}
        </Pressable>
        <Pressable style={styles.circleBtn} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.initial}>E</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function BackHeader({ right }) {
  const navigation = useNavigation();
  return (
    <View style={styles.backRow}>
      <Pressable style={styles.circleBtn} onPress={() => navigation.goBack()}>
        <Svg width={12} height={12} viewBox="0 0 12 12">
          <Path d="M8 1L2 6l6 5" stroke={colors.ink} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Pressable>
      <View style={{ flex: 1 }} />
      {right}
    </View>
  );
}

export function CloseButton({ onPress }) {
  return (
    <Pressable style={styles.circleBtn} onPress={onPress}>
      <Svg width={15} height={15} viewBox="0 0 15 15">
        <Path d="M1 1l13 13M14 1L1 14" stroke={colors.ink} strokeWidth={2.2} strokeLinecap="round" />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText: { ...sans(800, 16, { color: colors.ok, letterSpacing: -0.3 }) },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  circleBtn: {
    width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.card,
    alignItems: 'center', justifyContent: 'center', ...shadows.sm
  },
  badge: { position: 'absolute', top: 2, right: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.acc2, borderWidth: 2, borderColor: colors.bg },
  initial: { ...sans(600, 18, { color: colors.acc }) }
});
