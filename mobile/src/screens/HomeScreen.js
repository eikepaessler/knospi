import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { Screen } from '../components/Screen';
import { TopHeader } from '../components/Header';
import { Card, SpeechBubble } from '../components/ui';
import { PlantAvatar } from '../components/PlantAvatar';
import { useAppData } from '../context/AppDataContext';
import { colors, roomColor, toneColor } from '../theme/colors';
import { radius, shadows } from '../theme/layout';
import { baloo, sans } from '../theme/typography';
import { homeHeadline, homeSubline, timeGreeting } from '../lib/greeting';

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

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

function AttentionCard({ plant, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.attentionCard, shadows.lg]}>
      <View style={styles.attentionStage}>
        <SpeechBubble style={styles.attentionBubble} textStyle={{ fontSize: 12.5, lineHeight: 17 }}>{plant.says}</SpeechBubble>
        <PlantAvatar kind={plant.kind} mood={plant.face} size={100} />
      </View>
      <Text style={styles.attentionName}>{plant.name}</Text>
      <View style={styles.moodRow}>
        <View style={[styles.dot, { backgroundColor: toneColor(plant.tone) }]} />
        <Text style={[styles.moodText, { color: toneColor(plant.tone) }]}>{plant.moodLabel}</Text>
      </View>
    </Pressable>
  );
}

function HappyTile({ plant, onPress }) {
  const pct = Math.round((plant.bond / 5) * 100);
  return (
    <Pressable onPress={onPress} style={[styles.happyTile, shadows.md]}>
      <View style={styles.happyStage}>
        <View style={styles.happyBadge}><Text style={styles.happyBadgeText}>{plant.moodLabel}</Text></View>
        <PlantAvatar kind={plant.kind} mood="happy" size={80} />
      </View>
      <View style={{ paddingTop: 10 }}>
        <Text style={styles.happyName} numberOfLines={1}>{plant.name}</Text>
        <Text style={styles.happyWhere} numberOfLines={1}>{plant.room?.name}</Text>
        <View style={styles.happyBarTrack}><View style={[styles.happyBarFill, { width: `${pct}%` }]} /></View>
        <Text style={styles.happyStatus}>Bindung {plant.bond}/5</Text>
      </View>
    </Pressable>
  );
}

export function HomeScreen() {
  const navigation = useNavigation();
  const { plants, rooms, week } = useAppData();

  const withSensor = plants.filter((p) => p.hasSensor);
  const attention = withSensor.filter((p) => p.mood !== 'happy');
  const happy = withSensor.filter((p) => p.mood === 'happy');
  const noSensor = plants.filter((p) => !p.hasSensor);

  const load = useMemo(() => plants.map((p) => ({
    id: p.id,
    color: !p.hasSensor ? 'rgba(29,36,24,0.12)' : p.mood !== 'happy' ? 'rgba(192,86,74,0.55)' : 'rgba(60,122,46,0.35)'
  })), [plants]);

  const roomsWithAttention = rooms
    .map((r) => ({ room: r, plants: attention.filter((p) => p.room?.id === r.id) }))
    .filter((g) => g.plants.length > 0);

  const roomCount = new Set(plants.map((p) => p.room?.id)).size;

  return (
    <Screen>
      <TopHeader />
      <Text style={styles.greetLine1}>{timeGreeting()}</Text>
      <Text style={styles.greetLine2}>{homeHeadline(attention.length)}</Text>
      <Text style={styles.subline}>
        {homeSubline({ needCount: attention.length, roomCount, happyCount: happy.length })}
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

      {week.length > 0 && <WeekRow week={week} />}

      {roomsWithAttention.map(({ room, plants: list }) => (
        <View key={room.id} style={styles.roomGroup}>
          <View style={styles.roomHeader}>
            <View style={[styles.roomDot, { backgroundColor: roomColor(room.id) }]} />
            <Text style={styles.roomTitle}>{room.name}</Text>
            <Text style={styles.roomCount}>{list.length}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20 }}>
            {list.map((p) => (
              <AttentionCard key={p.id} plant={p} onPress={() => navigation.navigate('PlantDetail', { id: p.id })} />
            ))}
          </ScrollView>
        </View>
      ))}

      {attention.length === 0 && withSensor.length > 0 && (
        <View style={[styles.wavingCard, shadows.lg]}>
          <SpeechBubble>Nichts zu tun. Wir winken dir nur mal zu.</SpeechBubble>
          <PlantAvatar kind={happy[0]?.kind || 'generic'} mood="happy" size={140} />
        </View>
      )}

      {happy.length > 0 && (
        <View style={styles.softSection}>
          <Text style={styles.softTitle}>Denen geht es gut</Text>
          <View style={styles.happyGrid}>
            {happy.map((p) => (
              <HappyTile key={p.id} plant={p} onPress={() => navigation.navigate('PlantDetail', { id: p.id })} />
            ))}
          </View>
        </View>
      )}

      {noSensor.length > 0 && (
        <View style={{ marginTop: 22 }}>
          <Text style={styles.softTitleDark}>Ohne Sensor — noch keine Diagnose</Text>
          {noSensor.map((p) => (
            <Pressable key={p.id} onPress={() => navigation.navigate('PlantDetail', { id: p.id })} style={styles.noSensorRow}>
              <PlantAvatar kind={p.kind} mood="happy" size={44} sway={false} />
              <View style={{ flex: 1 }}>
                <Text style={styles.noSensorName}>{p.name}</Text>
                <Text style={styles.noSensorRoom}>{p.room?.name}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
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
  roomGroup: { marginBottom: 22 },
  roomHeader: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 10 },
  roomDot: { width: 10, height: 10, borderRadius: 3 },
  roomTitle: { ...sans(800, 18, { color: colors.ink, letterSpacing: -0.4 }) },
  roomCount: { ...sans(700, 13, { color: colors.mut }) },
  attentionCard: { width: 200, backgroundColor: colors.card, borderRadius: radius.xl, padding: 10, paddingBottom: 14 },
  attentionStage: {
    borderRadius: radius.lg, backgroundColor: colors.acc2, minHeight: 190,
    alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6, overflow: 'hidden'
  },
  attentionBubble: { position: 'absolute', top: 10, left: 10, right: 10, maxWidth: undefined },
  attentionName: { ...sans(700, 16, { color: colors.ink, marginTop: 10, letterSpacing: -0.2 }) },
  moodRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  dot: { width: 7, height: 7, borderRadius: 3 },
  moodText: { ...sans(700, 12.5) },
  wavingCard: {
    borderRadius: radius.xxl, backgroundColor: colors.acc2, padding: 20, alignItems: 'center', gap: 14, marginBottom: 8
  },
  softSection: { marginHorizontal: -20, marginTop: 22, paddingHorizontal: 20, paddingVertical: 20, backgroundColor: colors.soft, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl },
  softTitle: { ...sans(800, 18, { color: colors.ink, letterSpacing: -0.4, marginBottom: 12 }) },
  softTitleDark: { ...sans(800, 13, { color: colors.mut, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }) },
  happyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  happyTile: { width: '47%', backgroundColor: colors.card, borderRadius: radius.lg, padding: 9, paddingBottom: 13 },
  happyStage: { borderRadius: radius.md, backgroundColor: colors.soft2, height: 110, alignItems: 'center', justifyContent: 'flex-end' },
  happyBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: colors.acc, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3 },
  happyBadgeText: { ...sans(800, 10.5, { color: '#fff' }) },
  happyName: { ...sans(700, 15, { color: colors.ink }) },
  happyWhere: { ...sans(600, 11.5, { color: colors.mut, marginBottom: 7 }) },
  happyBarTrack: { height: 5, borderRadius: 99, backgroundColor: 'rgba(29,36,24,0.09)', overflow: 'hidden' },
  happyBarFill: { height: '100%', backgroundColor: colors.acc, borderRadius: 99 },
  happyStatus: { ...sans(700, 11.5, { color: colors.acc, marginTop: 6 }) },
  noSensorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  noSensorName: { ...sans(700, 14) },
  noSensorRoom: { ...sans(600, 12, { color: colors.mut }) }
});
