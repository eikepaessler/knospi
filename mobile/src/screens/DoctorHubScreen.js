import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { Screen } from '../components/Screen';
import { TopHeader } from '../components/Header';
import { ActionPill, Card } from '../components/ui';
import { PlantAvatar } from '../components/PlantAvatar';
import { useAppData } from '../context/AppDataContext';
import { colors } from '../theme/colors';
import { radius } from '../theme/layout';
import { baloo, sans } from '../theme/typography';

export function DoctorHubScreen() {
  const navigation = useNavigation();
  const { plants } = useAppData();
  const inTreatment = plants.filter((p) => p.hasDiagnosis);

  return (
    <Screen>
      <TopHeader />
      <Text style={styles.title}>Pflanzen-Doktor</Text>
      <Text style={styles.sub}>Braune Ränder, weiße Flecken, klebrige Blätter? Ich schau's mir an.</Text>

      <View style={styles.heroCard}>
        <Svg width={54} height={54} viewBox="0 0 24 24">
          <Path d="M12 3v6M9 6h6M6 12c0 5 3.5 8 6 9 2.5-1 6-4 6-9a4 4 0 00-6-3.4A4 4 0 006 12z" stroke={colors.acc} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <Text style={styles.heroText}>Abgleich mit 2.800 Krankheits- und Schädlingsbildern.</Text>
        <ActionPill label="Diagnose starten" onPress={() => navigation.navigate('DoctorFlow')} style={{ width: '100%' }} />
      </View>

      {inTreatment.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>In Behandlung</Text>
          {inTreatment.map((p) => (
            <Pressable key={p.id} onPress={() => navigation.navigate('PlantDetail', { id: p.id })}>
              <Card style={styles.row}>
                <PlantAvatar kind={p.kind} mood={p.face} size={54} sway={false} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowName}>{p.name}</Text>
                  <Text style={styles.rowDiag}>{p.diagnosis.name} · {p.room?.name}</Text>
                </View>
              </Card>
            </Pressable>
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...baloo(700, 26, { color: colors.ink, marginBottom: 2 }) },
  sub: { ...sans(600, 14, { color: colors.mut, marginBottom: 18 }) },
  heroCard: {
    backgroundColor: colors.soft2, borderRadius: radius.xxl, padding: 22, alignItems: 'center', gap: 12, marginBottom: 22
  },
  heroText: { ...sans(600, 14, { color: colors.mut, textAlign: 'center', marginBottom: 6 }) },
  sectionLabel: { ...sans(800, 13, { color: colors.mut, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }) },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  rowName: { ...sans(700, 15, { color: colors.ink }) },
  rowDiag: { ...sans(600, 12.5, { color: colors.mut }) }
});
