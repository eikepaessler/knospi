import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { Screen } from '../components/Screen';
import { BackHeader } from '../components/Header';
import { PlantAvatar } from '../components/PlantAvatar';
import { useAppData } from '../context/AppDataContext';
import { colors, toneColor } from '../theme/colors';
import { radius, shadows } from '../theme/layout';
import { baloo, sans } from '../theme/typography';

export function RoomDetailScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { rooms, plants, renameRoom } = useAppData();
  const room = rooms.find((r) => r.id === params.id);
  const list = plants.filter((p) => p.room?.id === params.id);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(room?.name || '');

  if (!room) return null;

  const attention = list.filter((p) => p.hasSensor && p.mood !== 'happy').length;

  async function saveRename() {
    if (draft.trim() && draft.trim() !== room.name) await renameRoom(room.id, draft.trim());
    setEditing(false);
  }

  return (
    <Screen>
      <BackHeader />
      <View style={styles.titleRow}>
        {editing ? (
          <TextInput value={draft} onChangeText={setDraft} onSubmitEditing={saveRename} onBlur={saveRename} autoFocus style={styles.titleInput} />
        ) : (
          <Text style={styles.title}>{room.name}</Text>
        )}
        <Pressable onPress={() => setEditing((e) => !e)} style={styles.pencil}>
          <Svg width={16} height={16} viewBox="0 0 24 24">
            <Path d="M4 20l1-4 11-11 3 3-11 11-4 1z" stroke={colors.mut} strokeWidth={1.8} fill="none" strokeLinejoin="round" />
          </Svg>
        </Pressable>
      </View>
      <Text style={styles.sub}>
        {list.length} {list.length === 1 ? 'Pflanze' : 'Pflanzen'}{attention > 0 ? ` · ${attention} meldet sich` : ''}
      </Text>

      <View style={styles.grid}>
        {list.map((p) => (
          <Pressable key={p.id} onPress={() => navigation.navigate('PlantDetail', { id: p.id })} style={[styles.tile, shadows.md]}>
            <PlantAvatar kind={p.kind} mood={p.face} size={84} />
            <View style={styles.tileRow}>
              <View style={[styles.dot, { backgroundColor: p.hasSensor ? toneColor(p.tone) : 'rgba(29,36,24,0.2)' }]} />
              <Text style={styles.tileName} numberOfLines={1}>{p.name}</Text>
            </View>
          </Pressable>
        ))}
        <Pressable
          style={styles.addTile}
          onPress={() => navigation.navigate('AddPlant', { roomId: room.id })}
        >
          <Text style={styles.addPlus}>+</Text>
          <Text style={styles.addLabel}>Pflanze{'\n'}hinzufügen</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 },
  title: { ...sans(800, 30, { color: colors.ink, letterSpacing: -0.8 }) },
  titleInput: { ...sans(800, 30, { color: colors.ink, letterSpacing: -0.8, borderBottomWidth: 2, borderColor: colors.acc, flex: 1 }) },
  pencil: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  sub: { ...sans(600, 14, { color: colors.mut, marginBottom: 18 }) },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { width: '47%', backgroundColor: colors.card, borderRadius: radius.lg, padding: 12, alignItems: 'center' },
  tileRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 3 },
  tileName: { ...sans(700, 14.5, { color: colors.ink }) },
  addTile: {
    width: '47%', borderRadius: radius.lg, borderWidth: 1.5, borderColor: 'rgba(29,36,24,0.25)', borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', paddingVertical: 30, gap: 6
  },
  addPlus: { ...sans(700, 22, { color: colors.acc }) },
  addLabel: { ...sans(800, 11.5, { color: colors.acc, textAlign: 'center', lineHeight: 15 }) }
});
