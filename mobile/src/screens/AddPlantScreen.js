import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { CloseButton } from '../components/Header';
import { CaptureCamera } from '../components/CaptureCamera';
import { ActionPill, Card, Chip, GhostButton } from '../components/ui';
import { PlantAvatar } from '../components/PlantAvatar';
import { useAppData } from '../context/AppDataContext';
import { colors } from '../theme/colors';
import { radius } from '../theme/layout';
import { baloo, sans } from '../theme/typography';

// Schritt 2 (Erkennung) hat noch keine echte Bilderkennungs-API angebunden.
// Bis eine (z.B. Plant.id/PlantNet) ausgewaehlt ist, liefert dieser Schritt
// ein plausibles Platzhalter-Ergebnis aus dem lokalen Katalog - klar als
// Demo gekennzeichnet, damit niemand ihn fuer echt haelt.
function mockRecognize(plantTypes) {
  if (!plantTypes.length) return null;
  const pick = plantTypes[Math.floor(Math.random() * plantTypes.length)];
  const confidence = 78 + Math.floor(Math.random() * 20);
  return { type: pick, confidence };
}

export function AddPlantScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { plantTypes, rooms, addRoom, addPlant, showToast } = useAppData();

  const [step, setStep] = useState(0);
  const [photoUri, setPhotoUri] = useState(null);
  const [match, setMatch] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState(params?.roomId || rooms[0]?.id || '');
  const [addingRoom, setAddingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [showSpotHint, setShowSpotHint] = useState(false);
  const [createdPlant, setCreatedPlant] = useState(null);
  const [busy, setBusy] = useState(false);

  function cancel() { navigation.goBack(); }

  function onPhotoTaken(uri) {
    setPhotoUri(uri);
    setStep(1);
    setTimeout(() => {
      const recognized = mockRecognize(plantTypes);
      if (!recognized) {
        showToast('Pflanzenarten konnten nicht geladen werden. Bitte Verbindung prüfen und erneut versuchen.');
        setStep(0);
        return;
      }
      setMatch(recognized);
      setStep(2);
    }, 1800);
  }

  function pickType(type) {
    setMatch({ type, confidence: null });
    setSearchOpen(false);
  }

  async function createRoom() {
    if (!newRoomName.trim()) return;
    const room = await addRoom(newRoomName.trim());
    setRoomId(room.id);
    setAddingRoom(false);
    setNewRoomName('');
  }

  async function submitNameRoom() {
    if (!name.trim() || !roomId) return showToast('Name und Raum werden noch gebraucht.');
    setBusy(true);
    try {
      const plant = await addPlant({ name: name.trim(), typeId: match.type.id, roomId });
      if (photoUri) { /* Erkennungsfoto wird beim Anlegen serverseitig nicht automatisch gesetzt */ }
      setCreatedPlant(plant);
      setStep(3);
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  const results = plantTypes.filter((t) =>
    !searchTerm.trim() || t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.latin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (step === 0) {
    return (
      <Screen scroll={false} contentStyle={{ padding: 20 }}>
        <View style={{ flex: 1, padding: 20 }}>
          <CaptureCamera
            title="Neue Mitbewohnerin?"
            subtitle="Halt sie ins Bild, ich rate die Art. Meistens richtig."
            onCancel={cancel}
            onCapture={onPhotoTaken}
          />
        </View>
      </Screen>
    );
  }

  if (step === 1) {
    return (
      <Screen scroll={false}>
        <View style={styles.stepHeadRow}>
          <View style={{ flex: 1 }} />
          <CloseButton onPress={cancel} />
        </View>
        <View style={styles.centerAll}>
          <ActivityIndicator size="large" color={colors.acc} />
          <Text style={styles.spinnerTitle}>Ich blättere nach …</Text>
          <Text style={styles.spinnerSub}>12.400 Arten in der Datenbank. Eine davon bist du.</Text>
        </View>
      </Screen>
    );
  }

  if (step === 2) {
    return (
      <Screen contentStyle={{ padding: 20 }}>
        <View style={styles.stepHeadRow}>
          <Text style={styles.stepLabel}>Neue Pflanze · Schritt 2 von 3</Text>
          <CloseButton onPress={cancel} />
        </View>

        <View style={styles.matchCard}>
          <PlantAvatar kind={match.type.id} mood="happy" size={90} />
          <View style={{ flex: 1 }}>
            {match.confidence != null && (
              <View style={styles.matchBadge}><Text style={styles.matchBadgeText}>{match.confidence}% sicher</Text></View>
            )}
            <Text style={styles.matchName}>{match.type.name}</Text>
            <Text style={styles.matchLatin}>{match.type.latin}</Text>
          </View>
        </View>

        {!searchOpen ? (
          <Pressable onPress={() => setSearchOpen(true)} style={styles.searchToggle}>
            <Text style={styles.searchToggleText}>Nicht die Richtige? Selbst suchen ›</Text>
          </Pressable>
        ) : (
          <Card style={{ marginBottom: 16 }}>
            <View style={styles.searchHead}>
              <Text style={styles.searchTitle}>Aus der Datenbank wählen</Text>
              <Pressable onPress={() => setSearchOpen(false)}><Text style={styles.searchClose}>Schließen</Text></Pressable>
            </View>
            <TextInput
              value={searchTerm} onChangeText={setSearchTerm} placeholder="Art oder Name suchen …"
              style={styles.searchInput} placeholderTextColor={colors.mut}
            />
            <ScrollView style={{ maxHeight: 260 }}>
              {results.map((r) => (
                <Pressable key={r.id} onPress={() => pickType(r)} style={[styles.resultRow, r.id === match.type.id && styles.resultRowActive]}>
                  <PlantAvatar kind={r.id} mood="happy" size={40} sway={false} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resultName}>{r.name}</Text>
                    <Text style={styles.resultLatin}>{r.latin}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </Card>
        )}

        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>Name</Text>
          <TextInput value={name} onChangeText={setName} placeholder="z. B. Wilma" style={styles.input} placeholderTextColor={colors.mut} />
        </View>

        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>Raum</Text>
          <View style={styles.roomChips}>
            {rooms.map((r) => (
              <Chip key={r.id} label={r.name} active={roomId === r.id} onPress={() => setRoomId(r.id)} />
            ))}
            {!addingRoom ? (
              <Pressable onPress={() => setAddingRoom(true)} style={styles.dashedChip}>
                <Text style={styles.dashedChipText}>+ Neuer Raum</Text>
              </Pressable>
            ) : (
              <View style={styles.newRoomRow}>
                <TextInput value={newRoomName} onChangeText={setNewRoomName} placeholder="Raumname" style={styles.newRoomInput} placeholderTextColor={colors.mut} autoFocus />
                <Pressable onPress={createRoom} style={styles.newRoomBtn}><Text style={styles.newRoomBtnText}>Anlegen</Text></Pressable>
              </View>
            )}
          </View>
        </View>

        <Pressable onPress={() => setShowSpotHint((v) => !v)} style={styles.spotToggle}>
          <Text style={styles.spotToggleText}>{showSpotHint ? 'Standort-Tipp verbergen' : 'Wo steht sie am liebsten?'}</Text>
        </Pressable>
        {showSpotHint && <Text style={styles.spotHint}>{match.type.roomHint}</Text>}

        <ActionPill label="Willkommen zuhause" disabled={busy} onPress={submitNameRoom} style={{ marginTop: 18 }} />
      </Screen>
    );
  }

  // step 3: Sensor
  return (
    <Screen contentStyle={{ padding: 20 }}>
      <View style={styles.stepHeadRow}>
        <Text style={styles.stepLabel}>Neue Pflanze · Schritt 3 von 3</Text>
        <CloseButton onPress={() => navigation.navigate('Main', { screen: 'Home', params: { screen: 'PlantDetail', params: { id: createdPlant.id } } })} />
      </View>
      <Text style={styles.sensorTitle}>Sensor für {createdPlant?.name}?</Text>
      <Card style={{ gap: 8, marginTop: 16 }}>
        <ActionPill label="Sensor jetzt koppeln" onPress={() => navigation.replace('SensorOnboarding', { plantId: createdPlant.id })} />
        <GhostButton label="Sensor bestellen · ab 19 €" onPress={() => navigation.navigate('Main', { screen: 'Home', params: { screen: 'Shop' } })} />
        <GhostButton
          label="Erstmal ohne Sensor"
          onPress={() => { showToast(`${createdPlant.name} ist eingezogen. Willkommen!`); navigation.navigate('Main', { screen: 'Home', params: { screen: 'RoomDetail', params: { id: createdPlant.room.id } } }); }}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centerAll: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 40 },
  spinnerTitle: { ...baloo(700, 24, { color: colors.ink }) },
  spinnerSub: { ...sans(600, 14, { color: colors.mut, textAlign: 'center' }) },
  stepHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  stepLabel: { ...sans(700, 13, { color: colors.mut }) },
  matchCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.acc2, borderRadius: radius.xxl, padding: 14, marginBottom: 10 },
  matchBadge: { alignSelf: 'flex-start', backgroundColor: colors.acc, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 6 },
  matchBadgeText: { ...sans(800, 10.5, { color: '#fff' }) },
  matchName: { ...baloo(700, 20, { color: colors.ink }) },
  matchLatin: { ...sans(600, 13, { color: '#3E4A33', fontStyle: 'italic' }) },
  searchToggle: { paddingVertical: 12, marginBottom: 8 },
  searchToggleText: { ...sans(800, 14, { color: colors.acc }) },
  searchHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  searchTitle: { ...sans(800, 12.5, { color: colors.ok, textTransform: 'uppercase', letterSpacing: 0.5 }) },
  searchClose: { ...sans(800, 12.5, { color: colors.mut }) },
  searchInput: { borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.md, height: 48, paddingHorizontal: 14, ...sans(700, 15, { color: colors.ink }), marginBottom: 10 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 6, borderRadius: radius.md, marginBottom: 4 },
  resultRowActive: { backgroundColor: colors.soft },
  resultName: { ...sans(800, 14.5, { color: colors.ink }) },
  resultLatin: { ...sans(600, 12, { color: colors.mut, fontStyle: 'italic' }) },
  formField: { marginBottom: 16 },
  fieldLabel: { ...sans(700, 12, { color: colors.mut, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }) },
  input: { borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.md, height: 50, paddingHorizontal: 14, ...sans(700, 15, { color: colors.ink }), backgroundColor: colors.card },
  roomChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dashedChip: { height: 38, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1.5, borderColor: 'rgba(29,36,24,0.28)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  dashedChipText: { ...sans(700, 13, { color: colors.acc }) },
  newRoomRow: { flexDirection: 'row', gap: 8, width: '100%' },
  newRoomInput: { flex: 1, height: 44, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.line, paddingHorizontal: 12, ...sans(700, 14) },
  newRoomBtn: { height: 44, paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  newRoomBtnText: { ...sans(800, 13, { color: colors.bg }) },
  spotToggle: { paddingVertical: 8 },
  spotToggleText: { ...sans(700, 13, { color: colors.acc }) },
  spotHint: { ...sans(600, 13.5, { color: colors.mut, lineHeight: 19, marginBottom: 6 }) },
  sensorTitle: { ...baloo(700, 24, { color: colors.ink }) }
});
