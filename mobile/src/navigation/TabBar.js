import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/colors';
import { radius } from '../theme/layout';
import { sans } from '../theme/typography';

const TABS = [
  { key: 'Home', label: 'Zuhause' },
  { key: 'Rooms', label: 'Räume' },
  { key: 'Doctor', label: 'Doktor' }
];

function LeafIcon({ color }) {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24">
      <Path d="M20 4C10 4 4 10 4 20c10 0 16-6 16-16z" fill={color} />
      <Path d="M6 18c4-4 8-8 12-12" stroke={colors.ink} strokeWidth={1.4} strokeLinecap="round" opacity={0.25} />
    </Svg>
  );
}

export function TabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const activeName = state.routes[state.index].name;

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom }]} pointerEvents="box-none">
      <View style={styles.row}>
        {TABS.map((t) => {
          const active = activeName === t.key;
          const color = active ? colors.ink : 'rgba(246,245,239,0.78)';
          return (
            <Pressable key={t.key} onPress={() => navigation.navigate(t.key)} style={[styles.tab, active && styles.tabActive]}>
              {active ? <LeafIcon color={colors.acc} /> : <View style={styles.dot} />}
              <Text style={[styles.label, { color }]}>{t.label}</Text>
            </Pressable>
          );
        })}
        <Pressable style={styles.fab} onPress={() => navigation.navigate('AddPlant')}>
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Path d="M12 5v14M5 12h14" stroke={colors.ink} strokeWidth={2.6} strokeLinecap="round" />
          </Svg>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingTop: 16, paddingBottom: 12 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 16, borderRadius: radius.pill },
  tabActive: { backgroundColor: colors.bg },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(246,245,239,0.78)' },
  label: { ...sans(800, 12.5) },
  fab: {
    width: 58, height: 58, borderRadius: radius.pill, backgroundColor: colors.acc2,
    alignItems: 'center', justifyContent: 'center'
  }
});
