import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/colors';
import { radius, shadows } from '../theme/layout';
import { sans } from '../theme/typography';
import { useAppData } from '../context/AppDataContext';

export function TopHeader() {
  const navigation = useNavigation();
  const { settings } = useAppData();
  const unreadOffer = !settings.offerRead;

  return (
    <View style={styles.row}>
      <View style={styles.brand}>
        <View style={styles.brandDot} />
        <Text style={styles.brandText}>Knospi</Text>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.circleBtn} onPress={() => navigation.navigate('Shop')}>
          <Svg width={20} height={20} viewBox="0 0 20 20">
            <Path d="M6.5 2 L4 6 V17 A1.5 1.5 0 0 0 5.5 18.5 H14.5 A1.5 1.5 0 0 0 16 17 V6 L13.5 2 Z" stroke={colors.ink} strokeWidth={1.6} fill="none" strokeLinejoin="round" strokeLinecap="round" />
            <Path d="M4 6 H16" stroke={colors.ink} strokeWidth={1.6} strokeLinecap="round" />
            <Path d="M7.5 8.2 A2.3 2.3 0 0 0 12.5 8.2" stroke={colors.ink} strokeWidth={1.6} fill="none" strokeLinecap="round" />
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
  brandDot: { width: 16, height: 16, borderRadius: 3, backgroundColor: colors.ok },
  brandText: { ...sans(800, 16, { color: colors.ok, letterSpacing: -0.3 }) },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  circleBtn: {
    width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.card,
    alignItems: 'center', justifyContent: 'center', ...shadows.sm
  },
  badge: { position: 'absolute', top: 2, right: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.acc2, borderWidth: 2, borderColor: colors.bg },
  initial: { ...sans(600, 18, { color: colors.acc }) }
});
