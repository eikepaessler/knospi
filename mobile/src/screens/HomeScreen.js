import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { Screen } from '../components/Screen';
import { TopHeader } from '../components/Header';
import { Card, SpeechBubble, ActionPill } from '../components/ui';
import { PlantAvatar } from '../components/PlantAvatar';
import { useAppData } from '../context/AppDataContext';
import { colors, toneColor } from '../theme/colors';
import { radius, shadows } from '../theme/layout';
import { baloo, sans } from '../theme/typography';
import { homeHeadline, homeSubline, timeGreeting } from '../lib/greeting';

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const METRIC_ORDER = ['soil', 'light', 'temp', 'humidity'];

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

function HeroCard({ plant, onPress }) {
  const needsHelp = plant && plant.mood !== 'happy';
  return (
    <Pressable onPress={onPress} style={[styles.heroCard, shadows.lg, { backgroundColor: needsHelp ? colors.soft2 : colors.acc2 }]}>
      <SpeechBubble>{plant ? plant.says : 'Nichts zu tun. Wir winken dir nur mal zu.'}</SpeechBubble>
      <PlantAvatar kind={plant?.kind || 'generic'} mood={plant ? plant.face : 'happy'} size={140} />
    </Pressable>
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

function PlantPage({ plant, width, onPress }) {
  const { pct, availableCount, total } = metricSummary(plant);
  const lines = plant.hasSensor
    ? METRIC_ORDER.map((key) => plant.metrics.find((m) => m.key === key)).filter(Boolean).slice(0, 2).map(metricLine)
    : [{ text: 'Noch kein Sensor gekoppelt', color: colors.mut }];

  return (
    <View style={{ width, paddingHorizontal: 20 }}>
      <Pressable onPress={onPress} style={[styles.plantCard, shadows.md]}>
        <View style={styles.plantStage}>
          <View style={styles.plantBadge}>
            <Text style={styles.plantBadgeText}>{pct != null ? `${pct}% · ${availableCount} von ${total}` : 'Kein Sensor'}</Text>
          </View>
          <PlantAvatar kind={plant.kind} mood={plant.hasSensor ? plant.face : 'happy'} size={100} />
        </View>
        <View style={{ paddingTop: 12 }}>
          <Text style={styles.plantName}>{plant.name}</Text>
          <Text style={styles.plantRoom}>{plant.room?.name || 'Kein Raum'}</Text>
          <View style={styles.plantBarTrack}>
            <View style={[styles.plantBarFill, { width: `${pct ?? 0}%` }]} />
          </View>
          {lines.map((l, i) => (
            <Text key={i} style={[styles.plantLine, { color: l.color }]}>{l.text}</Text>
          ))}
        </View>
      </Pressable>
    </View>
  );
}

function AllPlantsCarousel({ plants, onPressPlant }) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  function onScrollEnd(e) {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(Math.max(0, Math.min(plants.length - 1, i)));
  }

  return (
    <View style={{ marginBottom: 22 }}>
      <View style={[styles.roomHeader, { paddingHorizontal: 20 }]}>
        <Text style={styles.roomTitle}>Alle Pflanzen</Text>
        <Text style={styles.roomCount}>{index + 1} von {plants.length}</Text>
      </View>
      <View style={{ marginHorizontal: -20 }}>
        <ScrollView
          horizontal pagingEnabled showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          snapToInterval={width}
          decelerationRate="fast"
        >
          {plants.map((p) => (
            <PlantPage key={p.id} plant={p} width={width} onPress={() => onPressPlant(p)} />
          ))}
        </ScrollView>
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
          {withSensor.length} {withSensor.length === 1 ? 'Pflanze' : 'Pflanzen'}, Sensor gekoppelt
        </Text>
      </View>

      <HeroCard plant={attention[0] || null} onPress={() => goToPlant(attention[0] || plants[0])} />

      <AllPlantsCarousel plants={plants} onPressPlant={goToPlant} />

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
  plantCard: { backgroundColor: colors.card, borderRadius: radius.xl, padding: 14 },
  plantStage: {
    borderRadius: radius.lg, backgroundColor: colors.acc2, minHeight: 190,
    alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6, overflow: 'hidden'
  },
  plantBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: colors.ink, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  plantBadgeText: { ...sans(800, 11, { color: colors.bg }) },
  plantName: { ...baloo(700, 22, { color: colors.ink }) },
  plantRoom: { ...sans(600, 13, { color: colors.mut, marginBottom: 8 }) },
  plantBarTrack: { height: 6, borderRadius: 99, backgroundColor: 'rgba(29,36,24,0.09)', overflow: 'hidden', marginBottom: 10 },
  plantBarFill: { height: '100%', backgroundColor: colors.acc, borderRadius: 99 },
  plantLine: { ...sans(700, 13.5, { marginBottom: 2 }) }
});
