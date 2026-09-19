import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/colors';
import { radius } from '../theme/layout';
import { sans } from '../theme/typography';

const ICONS = {
  home: (c) => <Path d="M4 12l8-7 8 7M6 10v9h12v-9" stroke={c} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  rooms: (c) => <Path d="M4 5h7v7H4zM13 5h7v4h-7zM13 12h7v7h-7zM4 15h7v4H4z" stroke={c} strokeWidth={1.8} fill="none" strokeLinejoin="round" />,
  doctor: (c) => <Path d="M12 3v6M9 6h6M6 12c0 5 3.5 8 6 9 2.5-1 6-4 6-9a4 4 0 00-6-3.4A4 4 0 006 12z" stroke={c} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  gallery: (c) => <Path d="M4 5h16v14H4zM4 15l4-4 3 3 5-6 4 5" stroke={c} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
};

const TABS = [
  { key: 'Home', label: 'Zuhause', icon: 'home' },
  { key: 'Rooms', label: 'Räume', icon: 'rooms' },
  { key: 'Doctor', label: 'Doktor', icon: 'doctor' },
  { key: 'Gallery', label: 'Galerie', icon: 'gallery' }
];

export function TabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const activeName = state.routes[state.index].name;

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom }]} pointerEvents="box-none">
      <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} pointerEvents="none" />
      <View style={styles.row}>
        <View style={styles.pill}>
          {TABS.map((t) => {
            const active = activeName === t.key;
            const color = active ? colors.ink : 'rgba(246,245,239,0.78)';
            return (
              <Pressable key={t.key} onPress={() => navigation.navigate(t.key)} style={[styles.tab, active && styles.tabActive]}>
                <Svg width={20} height={20} viewBox="0 0 24 24">{ICONS[t.icon](color)}</Svg>
                <Text style={[styles.label, { color }]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable style={styles.fab} onPress={() => navigation.navigate('AddPlant')}>
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Path d="M12 5v14M5 12h14" stroke={colors.bg} strokeWidth={2.6} strokeLinecap="round" />
          </Svg>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 6 },
  pill: { flex: 1, flexDirection: 'row', backgroundColor: colors.ink, borderRadius: radius.pill, padding: 5, gap: 2 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 9, borderRadius: radius.pill },
  tabActive: { backgroundColor: colors.bg },
  label: { ...sans(800, 10.5) },
  fab: {
    width: 52, height: 52, borderRadius: radius.pill, backgroundColor: colors.ink,
    alignItems: 'center', justifyContent: 'center'
  }
});
