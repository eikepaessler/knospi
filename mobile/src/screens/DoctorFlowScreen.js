import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { CloseButton } from '../components/Header';
import { CaptureCamera } from '../components/CaptureCamera';
import { ActionPill, Card } from '../components/ui';
import { PlantAvatar } from '../components/PlantAvatar';
import { useAppData } from '../context/AppDataContext';
import { colors } from '../theme/colors';
import { radius } from '../theme/layout';
import { baloo, sans } from '../theme/typography';

// Platzhalter-Befund, solange keine echte Bilderkennungs-API fuer
// Krankheiten/Schaedlinge angebunden ist (siehe Scan-Flow-Hinweis).
const MOCK_DIAGNOSES = [
  { name: 'Spinnmilben', latin: 'Tetranychidae', tells: 'Feine Gespinste an den Blattunterseiten, winzige helle Punkte auf den Blättern.',
    steps: ['Betroffene Blätter mit Wasser abduschen.', 'Luftfeuchte erhöhen — Spinnmilben mögen es trocken.', 'Bei starkem Befall Neemöl auftragen.', 'Eine Woche isoliert von anderen Pflanzen stellen.'] },
  { name: 'Wurzelfäule', latin: 'Root rot', tells: 'Gelbe, welke Blätter trotz feuchter Erde, modriger Geruch am Wurzelballen.',
    steps: ['Aus dem Topf nehmen und Wurzeln begutachten.', 'Braune, matschige Wurzeln mit sauberer Schere entfernen.', 'In frische, trockene Erde umtopfen.', 'Erst wieder gießen, wenn die oberen Zentimeter trocken sind.'] },
  { name: 'Schildläuse', latin: 'Coccoidea', tells: 'Kleine braune Schildchen an Stängeln und Blattadern, klebriger Belag.',
    steps: ['Schildläuse vorsichtig mit einem Wattestäbchen und Alkohol entfernen.', 'Pflanze mit lauwarmem Wasser abduschen.', 'Betroffene Bereiche wöchentlich kontrollieren.', 'Bei Bedarf ein Blattglanzmittel meiden, es begünstigt Neubefall.'] },
  { name: 'Blattfleckenkrankheit', latin: 'Cercospora spp.', tells: 'Runde braune bis schwarze Flecken mit gelbem Rand auf den Blättern.',
    steps: ['Befallene Blätter vollständig entfernen und entsorgen.', 'Nicht mehr von oben gießen, nur noch die Erde.', 'Für mehr Abstand und Luftzirkulation sorgen.', 'Nach zwei Wochen auf neue Flecken kontrollieren.'] }
];

export function DoctorFlowScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { plants, rooms, addDiagnosis, showToast } = useAppData();

  const [step, setStep] = useState(0);
  const [photoUri, setPhotoUri] = useState(null);
  const [result, setResult] = useState(null);
  const [selectedPlantId, setSelectedPlantId] = useState(params?.plantId || null);
  const [busy, setBusy] = useState(false);

  function cancel() { navigation.goBack(); }

  function onPhoto(uri) {
    setPhotoUri(uri);
    setStep(1);
    setTimeout(() => {
      const pick = MOCK_DIAGNOSES[Math.floor(Math.random() * MOCK_DIAGNOSES.length)];
      setResult({ ...pick, confidence: 80 + Math.floor(Math.random() * 18) });
      setStep(2);
    }, 1800);
  }

  async function saveDiagnosis() {
    if (!selectedPlantId) return showToast('Wähle noch eine Pflanze aus.');
    setBusy(true);
    try {
      await addDiagnosis(selectedPlantId, {
        name: result.name, latin: result.latin, confidence: result.confidence,
        tells: result.tells, steps: result.steps, photoUri
      });
      showToast('Behandlung notiert. Ich erinnere dich in 5 Tagen.');
      navigation.navigate('Main', { screen: 'Home', params: { screen: 'PlantDetail', params: { id: selectedPlantId } } });
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (step === 0) {
    return (
      <Screen scroll={false}>
        <View style={{ flex: 1, padding: 20 }}>
          <CaptureCamera
            title="Was ist los?"
            subtitle="Braune Ränder, weiße Flecken, klebrige Blätter?"
            onCancel={cancel}
            onCapture={onPhoto}
          />
        </View>
      </Screen>
    );
  }

  if (step === 1) {
    return (
      <Screen scroll={false}>
        <View style={styles.headRow}>
          <View style={{ flex: 1 }} />
          <CloseButton onPress={cancel} />
        </View>
        <View style={styles.centerAll}>
          <ActivityIndicator size="large" color={colors.acc} />
          <Text style={styles.spinnerTitle}>Ich vergleiche genau …</Text>
          <Text style={styles.spinnerSub}>Abgleich mit 2.800 Krankheits- und Schädlingsbildern.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen contentStyle={{ padding: 20 }}>
      <View style={styles.headRow}>
        <Text style={styles.stepLabel}>Befund</Text>
        <CloseButton onPress={cancel} />
      </View>

      <View style={styles.badge}><Text style={styles.badgeText}>Befund · {result.confidence}% sicher</Text></View>
      <Text style={styles.diagName}>{result.name}</Text>
      <Text style={styles.diagLatin}>{result.latin}</Text>

      <Card style={{ marginVertical: 14 }}>
        <Text style={styles.cardTitle}>Woran ich es erkenne</Text>
        <Text style={styles.cardBody}>{result.tells}</Text>
      </Card>

      <Text style={styles.cardTitle}>Behandlung</Text>
      {result.steps.map((s, i) => (
        <View key={i} style={styles.stepRow}>
          <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
          <Text style={styles.stepText}>{s}</Text>
        </View>
      ))}

      <Text style={[styles.cardTitle, { marginTop: 16 }]}>Für welche Pflanze?</Text>
      {rooms.map((room) => {
        const list = plants.filter((p) => p.room?.id === room.id);
        if (list.length === 0) return null;
        return (
          <View key={room.id} style={{ marginBottom: 10 }}>
            <Text style={styles.roomLabel}>{room.name}</Text>
            <View style={styles.plantChips}>
              {list.map((p) => (
                <Pressable key={p.id} onPress={() => setSelectedPlantId(p.id)} style={[styles.plantChip, selectedPlantId === p.id && styles.plantChipActive]}>
                  <PlantAvatar kind={p.kind} mood="happy" size={28} sway={false} />
                  <Text style={[styles.plantChipText, selectedPlantId === p.id && { color: colors.bg }]}>{p.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      })}

      <ActionPill label="Behandlung notieren" disabled={busy || !selectedPlantId} onPress={saveDiagnosis} style={{ marginTop: 16 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centerAll: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 40 },
  spinnerTitle: { ...baloo(700, 24, { color: colors.ink }) },
  spinnerSub: { ...sans(600, 14, { color: colors.mut, textAlign: 'center' }) },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  stepLabel: { ...sans(700, 13, { color: colors.mut }) },
  badge: { alignSelf: 'flex-start', backgroundColor: 'rgba(192,86,74,0.12)', borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 10 },
  badgeText: { ...sans(800, 12, { color: colors.bad }) },
  diagName: { ...baloo(700, 26, { color: colors.ink }) },
  diagLatin: { ...sans(600, 14, { color: colors.mut, fontStyle: 'italic', marginBottom: 4 }) },
  cardTitle: { ...baloo(600, 17, { color: colors.ink, marginBottom: 6 }) },
  cardBody: { ...sans(600, 14, { color: colors.mut, lineHeight: 19 }) },
  stepRow: { flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'flex-start' },
  stepNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.soft2, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { ...sans(800, 11.5, { color: colors.acc }) },
  stepText: { flex: 1, ...sans(600, 14, { color: colors.ink, lineHeight: 19 }) },
  roomLabel: { ...sans(700, 12.5, { color: colors.mut, marginBottom: 6 }) },
  plantChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  plantChip: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.soft },
  plantChipActive: { backgroundColor: colors.ink },
  plantChipText: { ...sans(700, 13, { color: colors.ink }) }
});
