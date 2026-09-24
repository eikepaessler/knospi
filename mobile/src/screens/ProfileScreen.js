import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { BackHeader } from '../components/Header';
import { Card } from '../components/ui';
import { useAppData } from '../context/AppDataContext';
import { colors } from '../theme/colors';
import { radius } from '../theme/layout';
import { baloo, sans } from '../theme/typography';

const GLYPH = { drop: '💧', heart: '💚', lens: '🔍', square: '◆', sun: '☀️', thumb: '👍', cross: '✚', home: '🏠' };

function SettingRow({ label, sub, value, onChange, last }) {
  return (
    <View style={[styles.settingRow, last && { borderBottomWidth: 0 }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.settingLabel}>{label}</Text>
        {sub && <Text style={styles.settingSub}>{sub}</Text>}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.acc, false: colors.line }} thumbColor="#fff" />
    </View>
  );
}

export function ProfileScreen() {
  const navigation = useNavigation();
  const { plants, stickers, settings, updateSettings, showToast } = useAppData();
  const sensors = plants.filter((p) => p.hasSensor).map((p) => ({ ...p.sensor, plantName: p.name }));

  function changeSetting(patch) {
    updateSettings(patch).catch((err) => showToast(err.message));
  }

  return (
    <Screen>
      <BackHeader />

      <View style={styles.avatarRow}>
        <View style={styles.avatar}><Text style={styles.avatarText}>E</Text></View>
        <View>
          <Text style={styles.name}>Eike Päßer</Text>
          <Text style={styles.summary}>{plants.length} Pflanzen · {sensors.length} Sensoren</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Sticker-Sammlung</Text>
      <View style={styles.stickerGrid}>
        {stickers.map((s) => (
          <View key={s.key} style={[styles.medal, { backgroundColor: s.got ? s.tint : colors.soft, opacity: s.got ? 1 : 0.45 }]}>
            <View style={styles.medalShine} />
            <Text style={styles.medalGlyph}>{GLYPH[s.glyph] || '★'}</Text>
            <Text style={[styles.medalLabel, { color: s.got ? s.ink : colors.mut }]} numberOfLines={2}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Sensoren</Text>
      <Card style={{ paddingVertical: 4, marginBottom: 20 }}>
        {sensors.length === 0 && <Text style={styles.emptyText}>Noch keine Sensoren gekoppelt.</Text>}
        {sensors.map((s, i) => (
          <View key={s.id} style={[styles.sensorRow, i === sensors.length - 1 && { borderBottomWidth: 0 }]}>
            <View>
              <Text style={styles.sensorId}>{s.id}</Text>
              <Text style={styles.sensorSub}>bei {s.plantName}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.sensorBattery}>{s.battery}%</Text>
              <Text style={[styles.sensorSignal, { color: s.connected ? colors.ok : colors.bad }]}>{s.connected ? 'verbunden' : 'offline'}</Text>
            </View>
          </View>
        ))}
      </Card>

      <Text style={styles.sectionTitle}>Einstellungen</Text>
      <Card style={{ paddingVertical: 4, marginBottom: 20 }}>
        <SettingRow label="Push-Benachrichtigungen" value={settings.push} onChange={(v) => changeSetting({ push: v })} />
        <SettingRow label="Erinnerung bei Trockenheit" sub="Push, wenn eine Pflanze Wasser braucht" value={settings.dryReminder} onChange={(v) => changeSetting({ dryReminder: v })} />
        <SettingRow label="Wochenrückblick" sub="Einmal pro Woche eine Zusammenfassung" value={settings.weeklyRecap} onChange={(v) => changeSetting({ weeklyRecap: v })} last />
      </Card>

      <Pressable onPress={() => navigation.navigate('Shop')} style={styles.shopCard}>
        <Text style={styles.shopText}>Zum Shop</Text>
        <Text style={styles.shopArrow}>›</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  avatar: { width: 62, height: 62, borderRadius: 31, backgroundColor: colors.soft2, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...baloo(600, 26, { color: colors.acc }) },
  name: { ...baloo(700, 20, { color: colors.ink }) },
  summary: { ...sans(600, 13, { color: colors.mut, marginTop: 2 }) },
  sectionTitle: { ...sans(800, 13, { color: colors.mut, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }) },
  stickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  medal: { width: '30%', aspectRatio: 0.95, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', padding: 8, overflow: 'hidden' },
  medalShine: { position: 'absolute', top: 8, left: 12, width: 16, height: 9, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.5)' },
  medalGlyph: { fontSize: 22, marginBottom: 4 },
  medalLabel: { ...sans(700, 10.5, { textAlign: 'center' }) },
  emptyText: { ...sans(600, 13, { color: colors.mut, paddingVertical: 12 }) },
  sensorRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.line },
  sensorId: { ...sans(700, 14, { color: colors.ink }) },
  sensorSub: { ...sans(600, 12, { color: colors.mut, marginTop: 2 }) },
  sensorBattery: { ...sans(700, 14, { color: colors.ink }) },
  sensorSignal: { ...sans(700, 11.5, { marginTop: 2 }) },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderColor: colors.line, gap: 10 },
  settingLabel: { ...sans(700, 14.5, { color: colors.ink }) },
  settingSub: { ...sans(600, 12, { color: colors.mut, marginTop: 2 }) },
  shopCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.soft2, borderRadius: radius.xl, padding: 18, marginBottom: 30 },
  shopText: { ...sans(800, 15, { color: colors.acc }) },
  shopArrow: { ...sans(800, 20, { color: colors.acc }) }
});
