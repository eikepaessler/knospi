import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { BackHeader } from '../components/Header';
import { Card } from '../components/ui';
import { PlantAvatar } from '../components/PlantAvatar';
import { useAppData } from '../context/AppDataContext';
import { colors } from '../theme/colors';
import { radius, shadows } from '../theme/layout';
import { baloo, sans } from '../theme/typography';

const SENSORS = [
  { label: 'Ein Sensor', price: '19 €' },
  { label: '3er-Set', price: '49 €', note: 'der vierte ist gratis' },
  { label: '6er-Set', price: '89 €' }
];

const BUNDLES = [
  { kind: 'pilea', name: 'Ufopflanze-Geschenkset', price: '39 €' },
  { kind: 'monstera', name: 'Monstera-Geschenkset', price: '45 €' }
];

export function ShopScreen() {
  const { settings, updateSettings } = useAppData();

  useEffect(() => {
    // Nur ein "gesehen"-Haekchen fuer das Angebots-Badge - schlaegt der
    // Request mal fehl (z.B. kurzzeitig kein Server erreichbar), ist das
    // kein Problem, das den Nutzer mit einer Fehlermeldung stoeren muss.
    if (!settings.offerRead) updateSettings({ offerRead: true }).catch(() => {});
  }, [settings.offerRead, updateSettings]);

  return (
    <Screen>
      <BackHeader />
      <Text style={styles.title}>Shop</Text>

      <View style={styles.offerCard}>
        <Text style={styles.offerTag}>Angebot der Woche</Text>
        <Text style={styles.offerTitle}>3 Sensoren, einer geschenkt</Text>
        <Text style={styles.offerBody}>Bis Sonntag: Dreier-Set bestellen, den vierten Sensor legen wir dazu.</Text>
        <Text style={styles.offerPrice}>49 €</Text>
      </View>

      <Text style={styles.sectionTitle}>Sensoren</Text>
      <Card style={{ paddingVertical: 4, marginBottom: 20 }}>
        {SENSORS.map((s, i) => (
          <View key={s.label} style={[styles.row, i === SENSORS.length - 1 && { borderBottomWidth: 0 }]}>
            <View>
              <Text style={styles.rowLabel}>{s.label}</Text>
              {s.note && <Text style={styles.rowNote}>{s.note}</Text>}
            </View>
            <Text style={styles.rowPrice}>{s.price}</Text>
          </View>
        ))}
      </Card>

      <Text style={styles.sectionTitle}>Bundles</Text>
      <View style={{ gap: 10, marginBottom: 20 }}>
        {BUNDLES.map((b) => (
          <Card key={b.kind} style={styles.bundleCard}>
            <PlantAvatar kind={b.kind} mood="happy" size={64} sway={false} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{b.name}</Text>
              <Text style={styles.rowNote}>Pflanze inkl. Sensor und Topf, als Geschenk verpackt</Text>
            </View>
            <Text style={styles.rowPrice}>{b.price}</Text>
          </Card>
        ))}
      </View>

      <Image
        source={require('../../assets/marketing/geschenk-set-banner.webp')}
        style={styles.banner}
        resizeMode="contain"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...baloo(700, 26, { color: colors.ink, marginBottom: 16 }) },
  offerCard: { backgroundColor: colors.acc2, borderRadius: radius.xxl, padding: 18, marginBottom: 22 },
  offerTag: { ...sans(800, 11, { color: colors.ink, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, opacity: 0.7 }) },
  offerTitle: { ...baloo(700, 21, { color: colors.ink, marginBottom: 4 }) },
  offerBody: { ...sans(600, 14, { color: '#2E3626', lineHeight: 19, marginBottom: 10 }) },
  offerPrice: { ...sans(800, 20, { color: colors.ink }) },
  sectionTitle: { ...sans(800, 13, { color: colors.mut, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }) },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderColor: colors.line },
  rowLabel: { ...sans(700, 15, { color: colors.ink }) },
  rowNote: { ...sans(600, 12, { color: colors.mut, marginTop: 2 }) },
  rowPrice: { ...sans(800, 15, { color: colors.acc }) },
  bundleCard: { flexDirection: 'row', alignItems: 'center', gap: 14, ...shadows.md },
  banner: { height: 460, aspectRatio: 902 / 1744, alignSelf: 'center', borderRadius: radius.xxl, backgroundColor: 'transparent' }
});
