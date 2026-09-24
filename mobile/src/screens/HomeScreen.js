import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { Screen } from '../components/Screen';
import { TopHeader } from '../components/Header';
import { Card, SpeechBubble, ActionPill } from '../components/ui';
import { PlantAvatar } from '../components/PlantAvatar';
import { useAppData } from '../context/AppDataContext';
import { colors, roomColor, toneColor } from '../theme/colors';
import { radius, shadows } from '../theme/layout';
import { baloo, sans } from '../theme/typography';
import { homeHeadline, homeSubline, timeGreeting } from '../lib/greeting';

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const METRIC_ORDER = ['soil', 'light', 'temp', 'humidity'];

// Grober Aufwand statt reiner Anzahl - jede Pflanze ist mit einem Tipp
// auf "Erledigen" versorgt, also laesst sich die Zeit gut abschaetzen.
function effortLabel(count) {
  if (count === 0) return 'Nichts zu tun';
  if (count === 1) return 'Ca. 1 Minute';
  if (count <= 3) return `Ca. ${count * 2} Minuten`;
  return 'Etwas mehr zu tun';
}

function WeekRow({ week }) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <Card style={{ marginBottom: 20 }}>
      <Text style={styles.weekTitle}>Wie ging's der Wohnung diese Woche?</Text>
      <View style={styles.weekRow}>
        {week.map((d, i) => {
          const isToday = d.date === today;
          let bg = 'transparent', border = { borderWidth: 2, borderColor: 'rgba(29,36,24,0.14)', borderStyle: 'dashed' }, mouth = null;
          if (isToday) {
            border = { borderWidth: 2, borderColor: 'rgba(29,36,24,0.22)', borderStyle: 'dashed' };
          } else if (d.status === 'ok') {
            bg = '#DFF48F'; border = {};
            mouth = <Svg width={14} height={8}><Path d="M1 1 Q7 8 13 1" stroke="#3C7A2E" strokeWidth={2} fill="none" strokeLinecap="round" /></Svg>;
          } else if (d.status === 'warn') {
            bg = '#F1E6CE'; border = {};
            mouth = <Svg width={14} height={4}><Path d="M1 2 L13 2" stroke="#B98436" strokeWidth={2} strokeLinecap="round" /></Svg>;
          } else if (d.status === 'bad') {
            bg = '#F4DAD5'; border = {};
            mouth = <Svg width={14} height={8}><Path d="M1 7 Q7 0 13 7" stroke="#C0564A" strokeWidth={2} fill="none" strokeLinecap="round" /></Svg>;
          }
          return (
            <View key={i} style={styles.weekDay}>
              <View style={[styles.weekCircle, { backgroundColor: bg }, border]}>{mouth}</View>
              <Text style={[styles.weekLabel, isToday && { color: colors.ink, fontFamily: sans(800).fontFamily }]}>{WEEKDAYS[i]}</Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

// Wenn niemand etwas braucht, soll die Karte sich nicht jedes Mal gleich
// anfuehlen - eine zufaellig gewaehlte, aber pro Aufruf stabile Begruessung
// aus einem kleinen Pool statt einem einzigen festen Satz.
const ALL_GOOD_SAYS = [
  'Hallo! Uns geht es hier allen richtig gut.',
  'Alles bestens - genieß den Moment mit uns.',
  'Wir sind rundum zufrieden. Danke dir!',
  'Kein Grund zur Sorge, alle glücklich hier.',
  'Alles im grünen Bereich, im wahrsten Sinne.',
  'Wir haben alles, was wir brauchen. Danke dir!'
];

function HeroCard({ onPress }) {
  const [allGoodSays] = useState(() => ALL_GOOD_SAYS[Math.floor(Math.random() * ALL_GOOD_SAYS.length)]);
  return (
    <Pressable onPress={onPress} style={[styles.heroCard, shadows.lg, { backgroundColor: colors.acc2 }]}>
      <SpeechBubble>{allGoodSays}</SpeechBubble>
      <PlantAvatar kind="generic" mood="happy" size={140} />
    </Pressable>
  );
}

// Statt nur einer einzelnen Pflanze zeigt der obere Bereich jetzt ALLE
// Pflanzen, die gerade etwas brauchen, gruppiert nach Raum - jede mit
// Sprechblase, eigenem Namen und Status (Farbe + Text passend zur Stimmung).
function NeedyCard({ plant, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.needyCard, shadows.md]}>
      <View style={styles.needyStage}>
        <SpeechBubble style={styles.needyBubble} textStyle={styles.needyBubbleText}>{plant.says}</SpeechBubble>
        <PlantAvatar kind={plant.kind} mood={plant.face} size={80} />
      </View>
      <View style={{ paddingTop: 10 }}>
        <Text style={styles.plantName} numberOfLines={1}>{plant.name}</Text>
        <View style={styles.needyStatusRow}>
          <View style={[styles.needyDot, { backgroundColor: toneColor(plant.tone) }]} />
          <Text style={[styles.needyStatusText, { color: toneColor(plant.tone) }]} numberOfLines={1}>{plant.moodLabel}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function NeedsAttentionRooms({ plants, rooms, onPressPlant }) {
  const groups = rooms
    .map((room) => ({ room, list: plants.filter((p) => p.room?.id === room.id) }))
    .filter((g) => g.list.length > 0);
  const orphan = plants.filter((p) => !p.room);
  if (orphan.length) groups.push({ room: null, list: orphan });

  return (
    <View style={{ marginBottom: 8 }}>
      {groups.map(({ room, list }) => (
        <View key={room?.id || 'none'} style={{ marginBottom: 18 }}>
          <View style={styles.attnRoomHeader}>
            <View style={[styles.attnRoomDot, { backgroundColor: room ? roomColor(room.id) : colors.mut }]} />
            <Text style={styles.attnRoomName}>{room?.name || 'Ohne Raum'}</Text>
            <Text style={styles.attnRoomCount}>{list.length} {list.length === 1 ? 'Pflanze' : 'Pflanzen'}</Text>
          </View>
          <View style={{ marginHorizontal: -20 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
              {list.map((p, i) => (
                <View key={p.id} style={i === 0 ? undefined : { marginLeft: 12 }}>
                  <NeedyCard plant={p} onPress={() => onPressPlant(p)} />
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      ))}
    </View>
  );
}

function metricSummary(plant) {
  const available = plant.metrics.filter((m) => m.status !== 'na');
  const ok = available.filter((m) => m.status === 'ok');
  const pct = available.length ? Math.round((ok.length / available.length) * 100) : null;
  return { pct, availableCount: available.length, total: METRIC_ORDER.length };
}

function metricLine(m) {
  if (m.status === 'ok') return { text: `${m.label} ok`, color: colors.ok };
  if (m.status === 'na') return { text: `${m.label}: noch kein Sensorwert`, color: colors.mut };
  return { text: `${m.label}: ${m.text}`, color: toneColor('warn') };
}

function PlantTile({ plant, onPress }) {
  const { pct, availableCount, total } = metricSummary(plant);
  const lines = plant.hasSensor
    ? METRIC_ORDER.map((key) => plant.metrics.find((m) => m.key === key)).filter(Boolean).slice(0, 2).map(metricLine)
    : [{ text: 'Sensor koppeln für Werte', color: colors.mut }];

  return (
    <Pressable onPress={onPress} style={[styles.plantCard, shadows.md]}>
      <View style={[styles.plantStage, { backgroundColor: plant.hasSensor ? colors.acc2 : colors.soft }]}>
        <View style={[styles.plantBadge, !plant.hasSensor && styles.plantBadgeMuted]}>
          <Text style={[styles.plantBadgeText, !plant.hasSensor && styles.plantBadgeTextMuted]}>
            {pct != null ? `${pct}% · ${availableCount} von ${total}` : 'ohne Sensor'}
          </Text>
        </View>
        <PlantAvatar kind={plant.kind} mood={plant.hasSensor ? plant.face : 'happy'} size={84} />
      </View>
      <View style={{ paddingTop: 10 }}>
        <Text style={styles.plantName} numberOfLines={1}>{plant.name}</Text>
        <Text style={styles.plantRoom} numberOfLines={1}>{plant.room?.name || 'Kein Raum'}</Text>
        <View style={styles.plantBarTrack}>
          <View style={[styles.plantBarFill, { width: `${pct ?? 0}%` }]} />
        </View>
        {lines.map((l, i) => (
          <Text key={i} style={[styles.plantLine, { color: l.color }]} numberOfLines={1}>{l.text}</Text>
        ))}
      </View>
    </Pressable>
  );
}

function AllPlantsGrid({ plants, onPressPlant }) {
  return (
    <View style={{ marginBottom: 22 }}>
      <View style={styles.roomHeader}>
        <Text style={styles.roomTitle}>Alle Pflanzen</Text>
        <Text style={styles.roomCount}>{plants.length} {plants.length === 1 ? 'Pflanze' : 'Pflanzen'}</Text>
      </View>
      <View style={styles.plantGrid}>
        {plants.map((p) => (
          <View key={p.id} style={styles.plantGridItem}>
            <PlantTile plant={p} onPress={() => onPressPlant(p)} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function HomeScreen() {
  const navigation = useNavigation();
  const { plants, rooms, week } = useAppData();

  const withSensor = plants.filter((p) => p.hasSensor);
  const attention = withSensor.filter((p) => p.mood !== 'happy');
  const roomCount = new Set(plants.map((p) => p.room?.id)).size;

  const load = plants.map((p) => ({
    id: p.id,
    color: !p.hasSensor ? 'rgba(29,36,24,0.12)' : p.mood !== 'happy' ? 'rgba(192,86,74,0.55)' : 'rgba(60,122,46,0.35)'
  }));

  const goToPlant = (p) => navigation.navigate('PlantDetail', { id: p.id });

  if (plants.length === 0) {
    return (
      <Screen>
        <TopHeader />
        <Text style={styles.greetLine1}>{timeGreeting()}</Text>
        <Text style={styles.greetLine2}>Willkommen bei Knospi.</Text>
        <Text style={styles.subline}>Leg deine erste Pflanze an, dann kümmern wir uns gemeinsam um sie.</Text>
        <View style={[styles.wavingCard, shadows.lg]}>
          <SpeechBubble>Hallo! Ich warte noch auf meine erste Mitbewohnerin.</SpeechBubble>
          <PlantAvatar kind="generic" mood="happy" size={140} />
        </View>
        <ActionPill label="Erste Pflanze anlegen" onPress={() => navigation.navigate('AddPlant')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <TopHeader />
      <Text style={styles.greetLine1}>{timeGreeting()}</Text>
      <Text style={styles.greetLine2}>{homeHeadline(attention.length)}</Text>
      <Text style={styles.subline}>
        {homeSubline({ needCount: attention.length, roomCount, happyCount: withSensor.length - attention.length })}
      </Text>

      <View style={styles.loadBarTrack}>
        {load.map((seg) => <View key={seg.id} style={[styles.loadSeg, { backgroundColor: seg.color }]} />)}
      </View>
      <View style={styles.loadRow}>
        <Text style={styles.loadText}>
          {attention.length === 0 ? 'Niemand braucht dich gerade' : `${attention.length} von ${plants.length} braucht dich`}
        </Text>
        <Text style={[styles.loadText, { color: colors.acc }]}>
          {effortLabel(attention.length)}
        </Text>
      </View>

      {attention.length === 0 ? (
        <HeroCard onPress={() => goToPlant(plants[0])} />
      ) : (
        <NeedsAttentionRooms plants={attention} rooms={rooms} onPressPlant={goToPlant} />
      )}

      <AllPlantsGrid plants={plants} onPressPlant={goToPlant} />

      {week.length > 0 && <WeekRow week={week} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  greetLine1: { ...sans(800, 34, { color: colors.ink, letterSpacing: -1.2, lineHeight: 38 }) },
  greetLine2: { ...sans(800, 34, { color: colors.ink, letterSpacing: -1.2, lineHeight: 38, marginBottom: 6 }) },
  subline: { ...sans(600, 15, { color: colors.mut, marginBottom: 16 }) },
  loadBarTrack: { flexDirection: 'row', height: 6, borderRadius: radius.pill, overflow: 'hidden', backgroundColor: 'rgba(29,36,24,0.08)', marginBottom: 8 },
  loadSeg: { flex: 1, height: '100%' },
  loadRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 },
  loadText: { ...sans(700, 12.5, { color: colors.mut }) },
  weekTitle: { ...sans(600, 13, { color: colors.mut, marginBottom: 10 }) },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weekDay: { alignItems: 'center', gap: 6 },
  weekCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  weekLabel: { ...sans(600, 11, { color: colors.mut }) },
  roomHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  roomTitle: { ...sans(800, 18, { color: colors.ink, letterSpacing: -0.4 }) },
  roomCount: { ...sans(700, 13, { color: colors.mut }) },
  heroCard: {
    borderRadius: radius.xxl, padding: 20, alignItems: 'center', gap: 14, marginBottom: 22
  },
  wavingCard: {
    borderRadius: radius.xxl, backgroundColor: colors.acc2, padding: 20, alignItems: 'center', gap: 14, marginBottom: 20
  },
  attnRoomHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  attnRoomDot: { width: 9, height: 9, borderRadius: 3 },
  attnRoomName: { ...sans(800, 16, { color: colors.ink, letterSpacing: -0.3 }) },
  attnRoomCount: { ...sans(700, 12.5, { color: colors.mut }) },
  needyCard: { width: 172, backgroundColor: colors.card, borderRadius: radius.xl, padding: 10 },
  needyStage: {
    borderRadius: radius.lg, backgroundColor: colors.acc2, minHeight: 140,
    alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6, paddingHorizontal: 8, overflow: 'hidden'
  },
  needyBubble: { paddingHorizontal: 10, paddingVertical: 8, maxWidth: '100%', marginBottom: 6 },
  needyBubbleText: { ...sans(700, 11.5, { lineHeight: 15 }) },
  needyStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  needyDot: { width: 7, height: 7, borderRadius: 3.5 },
  needyStatusText: { ...sans(800, 12.5) },
  plantGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  plantGridItem: { width: '48%', marginBottom: 14 },
  plantCard: { backgroundColor: colors.card, borderRadius: radius.xl, padding: 10, flex: 1 },
  plantStage: {
    borderRadius: radius.lg, minHeight: 140,
    alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6, overflow: 'hidden'
  },
  plantBadge: { position: 'absolute', top: 8, left: 8, right: 8, backgroundColor: colors.ink, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 4, alignSelf: 'flex-start' },
  plantBadgeMuted: { backgroundColor: 'rgba(29,36,24,0.12)' },
  plantBadgeText: { ...sans(800, 10, { color: colors.bg }) },
  plantBadgeTextMuted: { color: colors.mut },
  plantName: { ...baloo(700, 17, { color: colors.ink }) },
  plantRoom: { ...sans(600, 12, { color: colors.mut, marginBottom: 7 }) },
  plantBarTrack: { height: 5, borderRadius: 99, backgroundColor: 'rgba(29,36,24,0.09)', overflow: 'hidden', marginBottom: 8 },
  plantBarFill: { height: '100%', backgroundColor: colors.acc, borderRadius: 99 },
  plantLine: { ...sans(700, 11.5, { marginBottom: 2 }) }
});
