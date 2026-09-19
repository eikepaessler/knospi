import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { TopHeader } from '../components/Header';
import { Card, Chip } from '../components/ui';
import { useAppData } from '../context/AppDataContext';
import { colors, toneColor } from '../theme/colors';
import { shadows } from '../theme/layout';
import { baloo, sans } from '../theme/typography';

export function RoomsScreen() {
  const navigation = useNavigation();
  const { plants, rooms } = useAppData();

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
                <Text style={styles.roomName}>{room.name}</Text>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...baloo(700, 26, { color: colors.ink, marginBottom: 2 }) },
  sub: { ...sans(600, 14, { color: colors.mut, marginBottom: 18 }) },
  roomCard: { marginBottom: 12 },
  roomHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  roomName: { ...baloo(600, 20, { color: colors.ink }) },
  roomCount: { ...sans(700, 13, { color: colors.mut }) },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  empty: { ...sans(600, 13, { color: colors.mut }) }
});
