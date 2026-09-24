import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path } from 'react-native-svg';
import { Screen } from '../components/Screen';
import { BackHeader } from '../components/Header';
import { Card, ActionPill, GhostButton, SoftButton, SpeechBubble } from '../components/ui';
import { PlantAvatar } from '../components/PlantAvatar';
import { Sparkline } from '../components/Sparkline';
import { useAppData } from '../context/AppDataContext';
import { api } from '../lib/api';
import { timeAgo } from '../lib/greeting';
import { colors, roomColor, toneColor } from '../theme/colors';
import { radius, shadows } from '../theme/layout';
import { baloo, sans } from '../theme/typography';

// Gleiches Blatt-Silhouette wie Header.js/TabBar.js - als winziger Punkt
// vor Metrik-/Raum-Zeilen statt eines schmucklosen farbigen Kaestchens.
function LeafDot({ color, size = 11 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M20 4C10 4 4 10 4 20c10 0 16-6 16-16z" fill={color} />
    </Svg>
  );
}

function Hearts({ bond }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <View key={i} style={[styles.heart, { backgroundColor: i < bond ? '#E4695F' : 'rgba(74,59,51,0.16)' }]} />
      ))}
    </View>
  );
}

function Collapsible({ title, meta, open, onToggle, children }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Pressable onPress={onToggle} style={styles.collapseHead}>
        <Text style={styles.collapseTitle}>{title}</Text>
        {meta && <Text style={styles.collapseMeta}>{meta}</Text>}
        <Svg width={12} height={8} viewBox="0 0 12 8" style={{ marginLeft: 8, transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <Path d="M1 1.5 6 6.5 11 1.5" stroke={colors.mut} strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Pressable>
      {open && <View style={{ marginTop: 10 }}>{children}</View>}
    </View>
  );
}

export function PlantDetailScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { plants, plantTypes, fixPlant, removeSensor, removePlant, updatePlant, healDiagnosis, addPhoto, showToast } = useAppData();
  const plant = plants.find((p) => p.id === params.id);
  const [open, setOpen] = useState({ gallery: false, richtwerte: false, info: false });
  const [readings, setReadings] = useState([]);
  const [busy, setBusy] = useState(false);
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [typeSearch, setTypeSearch] = useState('');

  useEffect(() => {
    if (plant?.hasSensor) {
      api.getReadings(plant.id, 30).then(setReadings).catch(() => setReadings([]));
    }
  }, [plant?.id, plant?.hasSensor, plant?.readingAt]);

  if (!plant) return null;

  async function withBusy(fn) {
    setBusy(true);
    try { await fn(); } catch (err) { showToast(err.message); } finally { setBusy(false); }
  }

  async function refreshReadings() {
    try { setReadings(await api.getReadings(plant.id, 30)); } catch { showToast('Sensor meldet sich nicht.'); }
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return showToast('Kamera-Zugriff wurde nicht erlaubt.');
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true, aspect: [3, 4] });
    if (result.canceled) return;
    await withBusy(() => addPhoto(plant.id, result.assets[0].uri));
  }

  async function changeType(type) {
    setTypePickerOpen(false);
    setTypeSearch('');
    await withBusy(() => updatePlant(plant.id, { typeId: type.id }));
    showToast(`Art geändert zu ${type.name}.`);
  }

  const typeResults = plantTypes.filter((t) =>
    !typeSearch.trim() || t.name.toLowerCase().includes(typeSearch.toLowerCase()) || t.latin.toLowerCase().includes(typeSearch.toLowerCase())
  );

  function confirmRemovePlant() {
    Alert.alert(`${plant.name} entfernen?`, 'Das kann nicht rückgängig gemacht werden.', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Entfernen', style: 'destructive',
        onPress: () => withBusy(async () => { await removePlant(plant.id); navigation.goBack(); })
      }
    ]);
  }

  const rc = plant.room ? roomColor(plant.room.id) : colors.mut;

  return (
    <Screen>
      <BackHeader
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pressable onPress={() => navigation.navigate('RoomDetail', { id: plant.room?.id })} style={styles.roomChip}>
              <LeafDot color={rc} size={13} />
              <Text style={styles.roomChipText}>{plant.room?.name}</Text>
            </Pressable>
            <Pressable onPress={confirmRemovePlant} style={styles.trashBtn}>
              <Svg width={16} height={17} viewBox="0 0 16 17">
                <Path d="M2 4h12M6 4V2h4v2M3 4l1 11.5A1 1 0 0 0 5 16.5h6a1 1 0 0 0 1-1L13 4" stroke={colors.mut} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
          </View>
        }
      />

      <View style={[styles.stage, shadows.lg]}>
        {plant.showMood && (
          <View style={styles.moodBadge}>
            <Text style={[styles.moodBadgeText, { color: toneColor(plant.tone) }]}>{plant.moodLabel}</Text>
          </View>
        )}
        <SpeechBubble>{plant.says}</SpeechBubble>
        <View style={{ marginVertical: 6 }}>
          <PlantAvatar kind={plant.kind} mood={plant.face} size={180} />
        </View>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{plant.name}</Text>
          <Hearts bond={plant.bond} />
        </View>
        <Text style={styles.together}>{plant.together}</Text>
      </View>

      <View style={styles.speciesRow}>
        <Text style={styles.speciesText}>{plant.species}</Text>
        <Pressable onPress={() => setTypePickerOpen((v) => !v)}>
          <Text style={styles.speciesEdit}>Art ändern</Text>
        </Pressable>
      </View>

      {typePickerOpen && (
        <Card style={{ marginBottom: 16 }}>
          <View style={styles.searchHead}>
            <Text style={styles.searchTitle}>Andere Art wählen</Text>
            <Pressable onPress={() => setTypePickerOpen(false)}><Text style={styles.searchClose}>Schließen</Text></Pressable>
          </View>
          <TextInput
            value={typeSearch} onChangeText={setTypeSearch} placeholder="Art oder Name suchen …"
            style={styles.searchInput} placeholderTextColor={colors.mut}
          />
          <ScrollView style={{ maxHeight: 260 }}>
            {typeResults.map((t) => (
              <Pressable key={t.id} onPress={() => changeType(t)} style={[styles.resultRow, t.id === plant.kind && styles.resultRowActive]}>
                <PlantAvatar kind={t.id} mood="happy" size={40} sway={false} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName}>{t.name}</Text>
                  <Text style={styles.resultLatin}>{t.latin}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </Card>
      )}

      {plant.hasAction && (
        <ActionPill label={plant.actionLabel} disabled={busy} onPress={() => withBusy(() => fixPlant(plant.id))} style={{ marginBottom: 20 }} />
      )}

      {plant.hasDiagnosis && (
        <Card style={styles.diagCard}>
          <View style={styles.diagBadge}>
            <View style={styles.diagDot} />
            <Text style={styles.diagBadgeText}>In Behandlung</Text>
          </View>
          <Text style={styles.diagTitle}>{plant.diagnosis.name} · {new Date(plant.diagnosis.diagnosedAt).toLocaleDateString('de-DE')}</Text>
          <Text style={styles.diagBody}>Vom Pflanzen-Doktor erkannt. Kontrolliere alle vier Tage, ob es besser wird.</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <GhostButton label="Neu prüfen" style={{ flex: 1 }} onPress={() => navigation.navigate('DoctorFlow', { plantId: plant.id })} />
            <SoftButton label="Geheilt" style={{ flex: 1 }} onPress={() => withBusy(() => healDiagnosis(plant.id, plant.diagnosis.id))} />
          </View>
        </Card>
      )}

      {!plant.hasSensor ? (
        <Card style={{ marginBottom: 18 }}>
          <Text style={styles.cardTitleBaloo}>Ich habe noch keinen Sensor</Text>
          <Text style={styles.cardBody}>Darum kenne ich meine Werte nicht. Ich erzähl dir vorerst nur, was über meine Art in der Datenbank steht.</Text>
          <View style={{ gap: 8 }}>
            <ActionPill label="Sensor koppeln" onPress={() => navigation.navigate('SensorOnboarding', { plantId: plant.id })} />
            <GhostButton label="Sensor kaufen" onPress={() => navigation.navigate('Shop')} />
          </View>
        </Card>
      ) : (
        <>
          <View style={styles.sectionLabelRow}>
            <View style={[styles.sectionDot, { backgroundColor: toneColor(plant.tone) }]} />
            <Text style={styles.sectionLabel}>Was der Sensor gerade spürt</Text>
          </View>
          <Card style={{ marginBottom: 12, paddingVertical: 4 }}>
            {plant.metrics.map((m, i) => (
              <View key={m.key} style={[styles.metricRow, i === plant.metrics.length - 1 && { borderBottomWidth: 0 }]}>
                <LeafDot color={toneColor(m.status === 'ok' ? 'ok' : m.key === 'soil' && m.status === 'high' ? 'warn' : 'bad')} size={13} />
                <Text style={styles.metricLabel}>{m.label}</Text>
                <View style={[styles.metricChip, { backgroundColor: colors.soft2 }]}>
                  <Text style={[styles.metricChipText, { color: toneColor(m.status === 'ok' ? 'ok' : 'warn') }]}>{m.text}</Text>
                </View>
              </View>
            ))}
          </Card>

          <View style={styles.sectionLabelRow}>
            <View style={[styles.sectionDot, { backgroundColor: toneColor(plant.tone) }]} />
            <Text style={styles.sectionLabel}>Letzter Abruf</Text>
          </View>
          <Card style={{ marginBottom: 18 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <Text style={styles.liveValue}>{plant.metrics[0]?.value}%</Text>
                <Text style={styles.liveSub}>Erdfeuchte · {timeAgo(plant.readingAt)}</Text>
              </View>
              <Pressable onPress={refreshReadings}>
                <Text style={styles.refreshText}>Aktualisieren</Text>
              </Pressable>
            </View>
            <View style={styles.liveSide}>
              <View style={styles.liveBox}>
                <Text style={styles.liveBoxValue}>{plant.metrics[2]?.value}°C</Text>
                <Text style={styles.liveBoxLabel}>Temperatur</Text>
              </View>
              <View style={styles.liveBox}>
                <Text style={styles.liveBoxValue}>{plant.metrics[3]?.value}%</Text>
                <Text style={styles.liveBoxLabel}>Luftfeuchte</Text>
              </View>
              <View style={styles.liveBox}>
                <Text style={styles.liveBoxValue}>{plant.metrics[1]?.value} lx</Text>
                <Text style={styles.liveBoxLabel}>Licht</Text>
              </View>
            </View>
            {readings.length > 1 && (
              <Sparkline values={readings.map((r) => r.soil_moisture)} width={280} height={46} />
            )}
          </Card>

          <Text style={styles.sectionLabel}>Sensor</Text>
          <Card style={{ marginBottom: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.sensorId}>{plant.sensor.id}</Text>
              <Text style={styles.sensorSub}>Akku {plant.sensor.battery}% · {plant.sensor.connected ? 'verbunden' : 'offline'} · zuletzt {timeAgo(plant.sensor.lastSeen)}</Text>
            </View>
            <Pressable onPress={() => withBusy(() => removeSensor(plant.id))}>
              <Text style={styles.linkDanger}>Trennen</Text>
            </Pressable>
          </Card>
        </>
      )}

      <Collapsible
        title="Fotoalbum" meta={`${plant.photos.length} ${plant.photos.length === 1 ? 'Foto' : 'Fotos'}`}
        open={open.gallery} onToggle={() => setOpen((o) => ({ ...o, gallery: !o.gallery }))}
      >
        <View style={styles.photoGrid}>
          {plant.photos.map((p) => (
            <View key={p.id} style={styles.photoTile}>
              <Image source={{ uri: p.uri }} style={styles.photoImg} />
              {p.isFirst && <View style={styles.photoBadge}><Text style={styles.photoBadgeText}>EINZUG</Text></View>}
              <Text style={styles.photoDate}>{new Date(p.takenAt).toLocaleDateString('de-DE')}</Text>
            </View>
          ))}
          <Pressable style={styles.photoAdd} onPress={takePhoto}>
            <Text style={styles.photoAddPlus}>+</Text>
            <Text style={styles.photoAddLabel}>Foto{'\n'}machen</Text>
          </Pressable>
        </View>
      </Collapsible>

      <Collapsible
        title="Richtwerte meiner Art" meta={`${plant.richtwerte.length} Werte`}
        open={open.richtwerte} onToggle={() => setOpen((o) => ({ ...o, richtwerte: !o.richtwerte }))}
      >
        <Card style={{ paddingVertical: 4 }}>
          {plant.richtwerte.map((r, i) => (
            <View key={r.key} style={[styles.richRow, i === plant.richtwerte.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.richLabel}>{r.label}{r.provisional ? ' (vorläufig)' : ''}</Text>
                <Text style={styles.richHint}>{r.hint}</Text>
              </View>
              <Text style={[styles.richValue, { color: toneColor(r.status === 'ok' || r.status === 'na' ? 'ok' : 'warn') }]}>
                {r.min}–{r.max}{r.unit}
              </Text>
            </View>
          ))}
        </Card>
      </Collapsible>

      <Collapsible
        title="Weitere Infos" meta="Pflege · Steckbrief"
        open={open.info} onToggle={() => setOpen((o) => ({ ...o, info: !o.info }))}
      >
        <Card style={{ marginBottom: 10 }}>
          <Text style={styles.cardTitleBaloo}>Womit du mich glücklich machst</Text>
          <Text style={styles.cardBody}>{plant.type.tip}</Text>
        </Card>
        <Card style={{ marginBottom: 10, paddingVertical: 4 }}>
          {plant.facts.map((f, i) => (
            <View key={f.label} style={[styles.factRow, i === plant.facts.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={styles.factLabel}>{f.label}</Text>
              <Text style={styles.factValue}>{f.value}</Text>
            </View>
          ))}
        </Card>
        <Card style={{ marginBottom: 10 }}>
          <Text style={styles.cardTitleBaloo}>Gut zu wissen</Text>
          <Text style={styles.cardBody}>{plant.type.lore}</Text>
        </Card>
        <SoftButton label="Sieht komisch aus? Pflanzen-Doktor öffnen" onPress={() => navigation.navigate('DoctorFlow', { plantId: plant.id })} />
      </Collapsible>
    </Screen>
  );
}

const styles = StyleSheet.create({
  roomChip: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 44, paddingHorizontal: 16, borderRadius: radius.pill, backgroundColor: colors.card, ...shadows.sm },
  trashBtn: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', ...shadows.sm },
  roomChipText: { ...sans(800, 14, { color: colors.ink }) },
  stage: { backgroundColor: colors.acc2, borderRadius: radius.xxxl, padding: 18, alignItems: 'center', marginBottom: 14 },
  moodBadge: { alignSelf: 'flex-start', backgroundColor: colors.ink, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 10 },
  moodBadgeText: { ...sans(800, 11.5) },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 4 },
  name: { ...baloo(700, 30, { color: colors.ink, letterSpacing: -0.5 }) },
  together: { ...sans(600, 13, { color: colors.mut, marginTop: 2 }) },
  heart: { width: 11, height: 11, borderRadius: 5, transform: [{ rotate: '45deg' }] },
  speciesRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  speciesText: { ...sans(600, 15, { color: colors.mut, fontStyle: 'italic' }) },
  speciesEdit: { ...sans(700, 12.5, { color: colors.acc, textDecorationLine: 'underline' }) },
  searchHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  searchTitle: { ...sans(800, 12.5, { color: colors.ok, textTransform: 'uppercase', letterSpacing: 0.5 }) },
  searchClose: { ...sans(800, 12.5, { color: colors.mut }) },
  searchInput: { borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.md, height: 48, paddingHorizontal: 14, ...sans(700, 15, { color: colors.ink }), marginBottom: 10 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 6, borderRadius: radius.md, marginBottom: 4 },
  resultRowActive: { backgroundColor: colors.soft },
  resultName: { ...sans(800, 14.5, { color: colors.ink }) },
  resultLatin: { ...sans(600, 12, { color: colors.mut, fontStyle: 'italic' }) },
  diagCard: { marginBottom: 18, borderWidth: 1.5, borderColor: 'rgba(192,86,74,0.35)' },
  diagBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: 'rgba(192,86,74,0.12)', marginBottom: 10 },
  diagDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.bad },
  diagBadgeText: { ...sans(800, 12, { color: colors.bad }) },
  diagTitle: { ...baloo(600, 19, { color: colors.ink, marginBottom: 4 }) },
  diagBody: { ...sans(600, 14, { color: colors.mut, marginBottom: 14, lineHeight: 19 }) },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
  sectionDot: { width: 7, height: 7, borderRadius: 3.5 },
  sectionLabel: { ...sans(800, 13, { color: colors.ok, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }) },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13, borderBottomWidth: 1, borderColor: colors.line },
  metricLabel: { flex: 1, ...sans(600, 16, { color: colors.ink }) },
  metricChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  metricChipText: { ...sans(700, 13) },
  liveValue: { ...baloo(700, 40, { color: colors.ink }) },
  liveSub: { ...sans(600, 12.5, { color: colors.mut }) },
  liveSide: { flexDirection: 'row', gap: 10, marginTop: 14, marginBottom: 12 },
  liveBox: { flex: 1, backgroundColor: colors.soft2, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 10 },
  liveBoxValue: { ...sans(800, 15, { color: colors.ink }) },
  liveBoxLabel: { ...sans(600, 11, { color: colors.mut, marginTop: 2 }) },
  refreshText: { ...sans(800, 12.5, { color: colors.acc, textDecorationLine: 'underline' }) },
  sensorId: { ...sans(700, 14, { color: colors.ink }) },
  sensorSub: { ...sans(600, 12, { color: colors.mut, marginTop: 2 }) },
  linkDanger: { ...sans(800, 13, { color: colors.bad, textDecorationLine: 'underline' }) },
  collapseHead: { flexDirection: 'row', alignItems: 'center', minHeight: 52, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 18 },
  collapseTitle: { ...sans(800, 15, { color: colors.ink }) },
  collapseMeta: { ...sans(700, 12, { color: colors.mut, marginLeft: 8 }) },
  cardTitleBaloo: { ...baloo(600, 18, { color: colors.ink, marginBottom: 6 }) },
  cardBody: { ...sans(600, 14.5, { color: colors.mut, lineHeight: 20 }) },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoTile: { width: '31%', gap: 4 },
  photoImg: { width: '100%', aspectRatio: 3 / 4, borderRadius: radius.md, backgroundColor: colors.soft },
  photoBadge: { position: 'absolute', top: 6, left: 6, backgroundColor: colors.btn, borderRadius: radius.pill, paddingHorizontal: 7, paddingVertical: 2 },
  photoBadgeText: { ...sans(800, 8.5, { color: colors.acc2 }) },
  photoDate: { ...sans(800, 10, { color: colors.mut, textAlign: 'center' }) },
  photoAdd: { width: '31%', aspectRatio: 3 / 4, borderRadius: radius.md, borderWidth: 1.5, borderColor: 'rgba(29,36,24,0.28)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 6 },
  photoAddPlus: { ...sans(700, 18, { color: colors.acc }) },
  photoAddLabel: { ...sans(800, 10.5, { color: colors.acc, textAlign: 'center', lineHeight: 13 }) },
  richRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.line },
  richLabel: { ...sans(700, 14, { color: colors.ink }) },
  richHint: { ...sans(600, 12, { color: colors.mut, marginTop: 2 }) },
  richValue: { ...sans(700, 13) },
  factRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.line },
  factLabel: { ...sans(700, 13, { color: colors.mut }) },
  factValue: { ...sans(700, 13, { color: colors.ink }) }
});
