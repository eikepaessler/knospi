import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Screen } from '../components/Screen';
import { BackHeader } from '../components/Header';
import { Card } from '../components/ui';
import { useAppData } from '../context/AppDataContext';
import { colors } from '../theme/colors';
import { radius, shadows } from '../theme/layout';
import { baloo, sans } from '../theme/typography';

// Kleine Tuschestrich-Icons statt Emoji, damit die Sticker zum Rest der
// handgezeichneten App passen (siehe Header.js/TabBar.js fuer denselben Stil).
function StickerIcon({ glyph, color, size = 20 }) {
  const s = { stroke: color, strokeWidth: 1.6, fill: 'none', strokeLinejoin: 'round', strokeLinecap: 'round' };
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      {glyph === 'drop' && <Path d="M10 2c0 0 6.5 6.3 6.5 10.6A6.5 6.5 0 0 1 3.5 12.6C3.5 8.3 10 2 10 2z" {...s} />}
      {glyph === 'heart' && <Path d="M10 17C4.3 12.3 2 8.7 2 6.2A4 4 0 0 1 10 4.7 4 4 0 0 1 18 6.2C18 8.7 15.7 12.3 10 17z" {...s} />}
      {glyph === 'lens' && (<><Circle cx="8.3" cy="8.3" r="5.3" {...s} /><Path d="M12.6 12.6 17.5 17.5" {...s} /></>)}
      {glyph === 'square' && <Path d="M10 2 18 10 10 18 2 10z" {...s} />}
      {glyph === 'sun' && <Circle cx="10" cy="10" r="6.3" {...s} />}
      {glyph === 'thumb' && (<><Circle cx="7.8" cy="11.3" r="5.3" {...s} /><Circle cx="14.5" cy="6" r="2.1" {...s} /></>)}
      {glyph === 'cross' && <Path d="M10 3v14M3 10h14" {...s} />}
      {glyph === 'home' && <Path d="M3 10 10 3l7 7M5.2 8.3V17h9.6V8.3" {...s} />}
    </Svg>
  );
}

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

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
}

export function ProfileScreen() {
  const navigation = useNavigation();
  const { plants, stickers, settings, updateSettings, showToast } = useAppData();
  const sensors = plants.filter((p) => p.hasSensor).map((p) => ({ ...p.sensor, plantName: p.name, roomName: p.room?.name }));
  const unpaired = plants.filter((p) => !p.hasSensor);
  const withSensor = plants.filter((p) => p.hasSensor);
  const attention = withSensor.filter((p) => p.mood !== 'happy');

  const statusText = plants.length === 0
    ? 'Leg deine erste Pflanze an'
    : attention.length === 0
      ? (plants.length === 1 ? 'Deine Pflanze ist wohlauf' : 'Deine Pflanzen sind wohlauf')
      : `${attention.length} ${attention.length === 1 ? 'Pflanze braucht' : 'Pflanzen brauchen'} dich`;

  function changeSetting(patch) {
    updateSettings(patch).catch((err) => showToast(err.message));
  }

  return (
    <Screen>
      <BackHeader />
      <Text style={styles.title}>Du und dein Grün</Text>

      <Card style={styles.avatarCard}>
        <View style={styles.avatar}><Text style={styles.avatarText}>E</Text></View>
        <View>
          <Text style={styles.name}>Eike Päßer</Text>
          <Text style={styles.summary}>{statusText}</Text>
        </View>
      </Card>

      <View style={styles.sectionHeadRow}>
        <Text style={styles.sectionTitle}>Sticker-Sammlung</Text>
        <Text style={styles.sectionCount}>{stickers.filter((s) => s.got).length} von {stickers.length}</Text>
      </View>
      <View style={styles.stickerGrid}>
        {stickers.map((s) => (
          <View key={s.key} style={styles.stickerCell}>
            <View style={[styles.stickerRing, { borderColor: s.got ? s.ink : colors.line, backgroundColor: s.got ? s.tint : colors.soft }]}>
              <View style={styles.stickerInner}>
                {s.got ? <StickerIcon glyph={s.glyph} color={s.ink} /> : <Text style={styles.stickerQuestion}>?</Text>}
              </View>
            </View>
            <Text style={[styles.stickerLabel, { color: s.got ? colors.ink : colors.mut }]} numberOfLines={2}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Sensoren</Text>
      <View style={{ marginBottom: 20 }}>
        {sensors.map((s) => (
          <Card key={s.id} style={styles.sensorCard}>
            <View style={styles.sensorIcon}>
              <Svg width={14} height={14} viewBox="0 0 14 14">
                <Path d="M7 1v6M7 7 3.5 12.5h7z" stroke={colors.acc} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sensorId}>{s.id}</Text>
              <Text style={styles.sensorSub}>bei {s.plantName}{s.roomName ? ` · ${s.roomName}` : ''}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.sensorSignal, { color: s.connected ? colors.ok : colors.bad }]}>
                {s.connected ? `Letztes Signal · ${formatTime(s.lastSeen)}` : 'Offline'}
              </Text>
              <Text style={styles.sensorBattery}>{s.battery}%</Text>
            </View>
          </Card>
        ))}
        {unpaired.length > 0 && (
          <Pressable
            style={styles.addSensorBtn}
            onPress={() => navigation.navigate('SensorOnboarding', { plantId: unpaired[0].id })}
          >
            <Text style={styles.addSensorPlus}>+</Text>
            <Text style={styles.addSensorLabel}>Sensor koppeln</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.sectionTitle}>Wann wir uns melden</Text>
      <Card style={{ paddingVertical: 4, marginBottom: 20 }}>
        <SettingRow label="Push-Benachrichtigungen" value={settings.push} onChange={(v) => changeSetting({ push: v })} />
        <SettingRow label="Erinnerung bei Trockenheit" sub="Push, wenn eine Pflanze Wasser braucht" value={settings.dryReminder} onChange={(v) => changeSetting({ dryReminder: v })} />
        <SettingRow label="Wochenrückblick" sub="Einmal pro Woche eine Zusammenfassung" value={settings.weeklyRecap} onChange={(v) => changeSetting({ weeklyRecap: v })} last />
      </Card>

      <View style={styles.shopCard}>
        <Text style={styles.shopTitle}>Zum Shop</Text>
        <Text style={styles.shopBody}>Weitere Sensoren, Sets und Geschenkpakete — diese Woche mit Angebot.</Text>
        <Pressable onPress={() => navigation.navigate('Shop')} style={styles.shopBtn}>
          <Text style={styles.shopBtnText}>Angebote ansehen</Text>
          <Text style={styles.shopBtnArrow}>›</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...baloo(700, 26, { color: colors.ink, marginBottom: 16 }) },
  avatarCard: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 26, ...shadows.md },
  avatar: { width: 62, height: 62, borderRadius: 31, backgroundColor: colors.soft2, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...baloo(600, 26, { color: colors.acc }) },
  name: { ...baloo(700, 20, { color: colors.ink }) },
  summary: { ...sans(700, 13, { color: colors.mut, marginTop: 2 }) },
  sectionHeadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { ...sans(800, 13, { color: colors.mut, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }) },
  sectionCount: { ...sans(700, 13, { color: colors.mut, marginBottom: 10 }) },
  stickerGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  stickerCell: { width: '31%', alignItems: 'center', marginBottom: 16 },
  stickerRing: { width: '100%', aspectRatio: 1, borderRadius: 999, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  stickerInner: { width: '58%', aspectRatio: 1, borderRadius: 999, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  stickerQuestion: { ...sans(800, 16, { color: colors.mut }) },
  stickerLabel: { ...sans(700, 11, { textAlign: 'center' }) },
  sensorCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10, ...shadows.sm },
  sensorIcon: { width: 36, height: 36, borderRadius: radius.lg, backgroundColor: colors.soft2, alignItems: 'center', justifyContent: 'center' },
  sensorId: { ...sans(700, 14, { color: colors.ink }) },
  sensorSub: { ...sans(600, 12, { color: colors.mut, marginTop: 2 }) },
  sensorBattery: { ...sans(700, 11.5, { color: colors.mut, marginTop: 2 }) },
  sensorSignal: { ...sans(700, 11.5, { textAlign: 'right' }) },
  addSensorBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.line, borderRadius: radius.xl, paddingVertical: 16 },
  addSensorPlus: { ...sans(800, 16, { color: colors.mut }) },
  addSensorLabel: { ...sans(700, 14, { color: colors.mut }) },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderColor: colors.line, gap: 10 },
  settingLabel: { ...sans(700, 14.5, { color: colors.ink }) },
  settingSub: { ...sans(600, 12, { color: colors.mut, marginTop: 2 }) },
  shopCard: { backgroundColor: colors.acc2, borderRadius: radius.xxl, padding: 20, marginBottom: 30 },
  shopTitle: { ...baloo(700, 19, { color: colors.ink, marginBottom: 6 }) },
  shopBody: { ...sans(600, 13.5, { color: '#2E3626', lineHeight: 18, marginBottom: 14 }) },
  shopBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.ink, borderRadius: radius.pill, paddingVertical: 13 },
  shopBtnText: { ...sans(800, 14, { color: colors.bg }) },
  shopBtnArrow: { ...sans(800, 16, { color: colors.bg }) }
});
