import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { Screen } from '../components/Screen';
import { TopHeader } from '../components/Header';
import { Card, Chip } from '../components/ui';
import { useAppData } from '../context/AppDataContext';
import { colors, toneColor } from '../theme/colors';
import { radius, shadows } from '../theme/layout';
import { baloo, sans } from '../theme/typography';

function LeafDot({ color, size = 13 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M20 4C10 4 4 10 4 20c10 0 16-6 16-16z" fill={color} />
    </Svg>
  );
}

export function RoomsScreen() {
  const navigation = useNavigation();
  const { plants, rooms, addRoom, showToast } = useAppData();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  async function confirmAdd() {
    if (!newName.trim()) return setAdding(false);
    try {
      await addRoom(newName.trim());
      setNewName('');
      setAdding(false);
    } catch (err) {
      showToast(err.message);
    }
  }

  return (
    <Screen>
      <TopHeader />
      <Text style={styles.title}>Räume</Text>
      <Text style={styles.sub}>{rooms.length} {rooms.length === 1 ? 'Raum' : 'Räume'}</Text>

      {rooms.map((room) => {
        const list = plants.filter((p) => p.room?.id === room.id);
        return (
          <Pressable key={room.id} onPress={() => navigation.navigate('RoomDetail', { id: room.id })}>
            <Card style={[styles.roomCard, shadows.lg]}>
              <View style={styles.roomHead}>
                <View style={styles.roomNameRow}>
                  <LeafDot color={colors.ok} />
                  <Text style={styles.roomName}>{room.name}</Text>
                </View>
                <Text style={styles.roomCount}>{list.length} {list.length === 1 ? 'Pflanze' : 'Pflanzen'}</Text>
              </View>
              <View style={styles.chipRow}>
                {list.map((p) => (
                  <Chip key={p.id} label={p.name} dotColor={p.hasSensor ? toneColor(p.tone) : 'rgba(29,36,24,0.2)'} />
                ))}
                {list.length === 0 && <Text style={styles.empty}>Noch keine Pflanze hier.</Text>}
              </View>
            </Card>
          </Pressable>
        );
      })}

      {adding ? (
        <View style={styles.addRow}>
          <TextInput
            value={newName} onChangeText={setNewName} placeholder="Raumname" placeholderTextColor={colors.mut}
            style={styles.addInput} autoFocus onSubmitEditing={confirmAdd}
          />
          <Pressable onPress={confirmAdd} style={styles.addConfirm}>
            <Text style={styles.addConfirmText}>Anlegen</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.addRoomBtn} onPress={() => setAdding(true)}>
          <Text style={styles.addRoomPlus}>+</Text>
          <Text style={styles.addRoomLabel}>Neuen Raum anlegen</Text>
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...baloo(700, 26, { color: colors.ink, marginBottom: 2 }) },
  sub: { ...sans(600, 14, { color: colors.mut, marginBottom: 18 }) },
  roomCard: { marginBottom: 12 },
  roomHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  roomNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roomName: { ...baloo(600, 20, { color: colors.ink }) },
  roomCount: { ...sans(700, 13, { color: colors.mut }) },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  empty: { ...sans(600, 13, { color: colors.mut }) },
  addRoomBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.line, borderRadius: radius.xl, paddingVertical: 16, marginBottom: 20
  },
  addRoomPlus: { ...sans(800, 16, { color: colors.acc }) },
  addRoomLabel: { ...sans(700, 14, { color: colors.acc }) },
  addRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  addInput: { flex: 1, borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.xl, height: 52, paddingHorizontal: 16, ...sans(700, 15, { color: colors.ink }), backgroundColor: colors.card },
  addConfirm: { paddingHorizontal: 18, borderRadius: radius.xl, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  addConfirmText: { ...sans(800, 14, { color: colors.bg }) }
});
