import { useMemo, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ActionPill, GhostButton } from '../components/ui';
import { CloseButton } from '../components/Header';
import { colors } from '../theme/colors';
import { radius, shadows } from '../theme/layout';
import { baloo, sans } from '../theme/typography';
import { useAppData } from '../context/AppDataContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function randomSensorId() {
  return Array.from({ length: 4 }, () => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('');
}

export function SensorOnboardingScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const insets = useSafeAreaInsets();
  const { plants, assignSensor, pairRealSensor, showToast } = useAppData();
  const plant = plants.find((p) => p.id === params?.plantId);
  const sensorId = useMemo(randomSensorId, []);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [realMode, setRealMode] = useState(false);
  const [realInput, setRealInput] = useState('');

  async function finish() {
    if (!plant) return navigation.goBack();
    setBusy(true);
    try {
      await assignSensor(plant.id, sensorId);
      navigation.navigate('Main', { screen: 'Home', params: { screen: 'PlantDetail', params: { id: plant.id } } });
    } catch (err) {
      showToast(err.message);
      setBusy(false);
    }
  }

  async function connectReal() {
    if (!plant) return navigation.goBack();
    if (!realInput.trim()) return showToast('Bitte den Link oder Token deines Sensors einfügen.');
    setBusy(true);
    try {
      await pairRealSensor(plant.id, realInput.trim());
      navigation.navigate('Main', { screen: 'Home', params: { screen: 'PlantDetail', params: { id: plant.id } } });
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  function next() {
    if (step === 2) return finish();
    setStep((s) => s + 1);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={[styles.wrap, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.headRow}>
            <View style={styles.progressRow}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.progressSeg, { backgroundColor: i <= step ? colors.acc : colors.line }]} />
              ))}
            </View>
            <CloseButton onPress={() => navigation.goBack()} />
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {step === 0 && realMode && (
              <>
                <View style={styles.illoWrap}>
                  <View style={styles.illoCircle} />
                  <View style={styles.stick} />
                  <View style={styles.bud} />
                </View>
                <Text style={styles.title}>Sensor-Link einfügen</Text>
                <Text style={styles.body}>Den Link oder Token, den dein Sensor dir gibt (sensors.duus.digital/…), hier einfügen.</Text>
                <TextInput
                  value={realInput} onChangeText={setRealInput} placeholder="https://sensors.duus.digital/…"
                  autoCapitalize="none" autoCorrect={false} placeholderTextColor={colors.mut}
                  returnKeyType="done" onSubmitEditing={Keyboard.dismiss}
                  style={styles.realInput}
                />
              </>
            )}

            {step === 0 && !realMode && (
              <>
                <View style={styles.illoWrap}>
                  <View style={styles.illoCircle} />
                  <View style={styles.stick} />
                  <View style={styles.bud} />
                </View>
                <Text style={styles.title}>Steck mich in die Erde</Text>
                <Text style={styles.body}>Zwei Finger breit neben dem Stamm, bis zur Markierung. Ab da hört der Sensor zu — Erde und Luft, alle zehn Minuten.</Text>
                <GhostButton label="Ich habe schon einen Sensor-Link" onPress={() => setRealMode(true)} />
              </>
            )}

            {step === 1 && (
              <>
                <View style={styles.illoWrap}>
                  <View style={[styles.pulseRing, { transform: [{ scale: 1 }] }]} />
                  <View style={[styles.pulseRing, { transform: [{ scale: 0.7 }] }]} />
                  <View style={styles.pulseCore}><View style={styles.pulseDot} /></View>
                </View>
                <Text style={styles.title}>Da bist du ja</Text>
                <View style={[styles.sensorCard, shadows.md]}>
                  <View style={styles.sensorIcon}><View style={styles.sensorIconBar} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sensorName}>Knospi S1 · {sensorId}</Text>
                    <Text style={styles.sensorStatus}>Bestens gelaunt · Akku 96 %</Text>
                  </View>
                  <View style={styles.okDot} />
                </View>
              </>
            )}

            {step === 2 && (
              <>
                <View style={styles.illoWrap}>
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                </View>
                <Text style={styles.title}>Bereit für {plant?.name || 'deine Pflanze'}</Text>
                <Text style={styles.body}>Ab jetzt hört {plant?.name || 'sie'} auf ihren Sensor. Die ersten Werte kommen in wenigen Minuten.</Text>
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable onPress={() => (step === 0 && realMode ? setRealMode(false) : navigation.goBack())}>
              <Text style={styles.skip}>{step === 0 && realMode ? 'Zurück' : 'Später'}</Text>
            </Pressable>
            {step === 0 && realMode ? (
              <ActionPill label="Verbinden" disabled={busy} onPress={connectReal} style={{ flex: 1 }} />
            ) : (
              <ActionPill label={['Steckt drin', 'Verbinden', 'Fertig'][step]} disabled={busy} onPress={next} style={{ flex: 1 }} />
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 26 },
  progressRow: { flex: 1, flexDirection: 'row', gap: 6 },
  progressSeg: { flex: 1, height: 5, borderRadius: 99 },
  content: { flexGrow: 1, alignItems: 'center', textAlign: 'center', gap: 18, paddingTop: 20 },
  illoWrap: { width: 190, height: 190, borderRadius: 95, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  illoCircle: { position: 'absolute', width: 190, height: 190, borderRadius: 95, backgroundColor: colors.soft },
  stick: { width: 26, height: 130, borderRadius: 13, backgroundColor: '#F0E4D9' },
  bud: { position: 'absolute', bottom: 100, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.acc },
  title: { ...sans(800, 27, { color: colors.ink, textAlign: 'center', letterSpacing: -0.8 }) },
  body: { ...sans(600, 15, { color: colors.mut, textAlign: 'center', lineHeight: 21, maxWidth: 290 }) },
  realInput: {
    width: '100%', borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.md, height: 50,
    paddingHorizontal: 14, backgroundColor: colors.card, ...sans(700, 14, { color: colors.ink })
  },
  pulseRing: { position: 'absolute', width: 190, height: 190, borderRadius: 95, backgroundColor: colors.soft },
  pulseCore: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', ...shadows.md },
  pulseDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.acc },
  sensorCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.xl, padding: 16, width: '100%' },
  sensorIcon: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  sensorIconBar: { width: 9, height: 24, borderRadius: 5, backgroundColor: colors.acc },
  sensorName: { ...sans(800, 15, { color: colors.ink }) },
  sensorStatus: { ...sans(600, 12.5, { color: colors.mut, marginTop: 2 }) },
  okDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.ok },
  checkCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.acc2, alignItems: 'center', justifyContent: 'center' },
  checkMark: { fontSize: 44, color: colors.acc, fontWeight: '700' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  skip: { ...sans(700, 15, { color: colors.mut, paddingVertical: 14, paddingHorizontal: 4 }) }
});
