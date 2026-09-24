import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { Screen } from '../components/Screen';
import { BackHeader } from '../components/Header';
import { ActionPill } from '../components/ui';
import { PlantAvatar } from '../components/PlantAvatar';
import { useAppData } from '../context/AppDataContext';
import { colors, toneColor } from '../theme/colors';
import { radius, shadows } from '../theme/layout';
import { baloo, sans } from '../theme/typography';

function LeafDot({ color, size = 18 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M20 4C10 4 4 10 4 20c10 0 16-6 16-16z" fill={color} />
    </Svg>
  );
}

export function RoomDetailScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { rooms, plants, renameRoom, deleteRoom, showToast } = useAppData();
  const room = rooms.find((r) => r.id === params.id);
  const list = plants.filter((p) => p.room?.id === params.id);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(room?.name || '');

  if (!room) return null;

  const attention = list.filter((p) => p.hasSensor && p.mood !== 'happy').length;
  const statusText = list.length === 0 ? '' : attention > 0 ? `${attention} ${attention === 1 ? 'meldet' : 'melden'} sich` : 'alle zufrieden';

  async function saveRename() {
    if (draft.trim() && draft.trim() !== room.name) await renameRoom(room.id, draft.trim());
    setEditing(false);
  }

  function confirmDeleteRoom() {
    if (list.length > 0) {
      return showToast('Erst alle Pflanzen aus dem Raum verschieben oder entfernen.');
    }
    Alert.alert(`${room.name} entfernen?`, 'Das kann nicht rückgängig gemacht werden.', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Entfernen', style: 'destructive',
        onPress: async () => {
          try {
            await deleteRoom(room.id);
            navigation.goBack();
          } catch (err) {
            showToast(err.message);
          }
        }
      }
    ]);
  }

  return (
    <Screen>
      <BackHeader
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pressable onPress={confirmDeleteRoom} style={styles.trashBtn}>
              <Svg width={16} height={17} viewBox="0 0 16 17">
                <Path d="M2 4h12M6 4V2h4v2M3 4l1 11.5A1 1 0 0 0 5 16.5h6a1 1 0 0 0 1-1L13 4" stroke={colors.mut} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
            <Pressable onPress={() => setEditing((e) => !e)} style={styles.renameBtn}>
              <Text style={styles.renameBtnText}>Umbenennen</Text>
            </Pressable>
          </View>
        }
      />

      <View style={styles.titleRow}>
        <LeafDot color={colors.ok} />
        <Text style={styles.title}>{room.name}</Text>
      </View>
      <Text style={styles.sub}>
        {list.length} {list.length === 1 ? 'Pflanze' : 'Pflanzen'}{statusText ? ` · ${statusText}` : ''}
      </Text>

      {editing && (
        <View style={styles.editRow}>
          <TextInput
            value={draft} onChangeText={setDraft} onSubmitEditing={saveRename} autoFocus
            style={styles.editInput} placeholderTextColor={colors.mut}
          />
          <Pressable onPress={saveRename} style={styles.editConfirm}>
            <Text style={styles.editConfirmText}>Passt</Text>
          </Pressable>
        </View>
      )}

      <View style={{ marginBottom: 20 }}>
        {list.map((p) => (
          <Pressable key={p.id} onPress={() => navigation.navigate('PlantDetail', { id: p.id })} style={[styles.plantRow, shadows.sm]}>
            <View style={styles.plantIcon}>
              <PlantAvatar kind={p.kind} mood={p.face} size={40} sway={false} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.plantName}>{p.name}</Text>
              <Text style={styles.plantSub}>{p.short}{p.hasSensor ? ` · Sensor ${p.sensor.id}` : ' · ohne Sensor'}</Text>
            </View>
            {p.hasSensor && (
              <View style={[styles.plantBadge, { backgroundColor: toneColor(p.tone) + '26' }]}>
                <Text style={[styles.plantBadgeText, { color: toneColor(p.tone) }]}>
                  {p.tone === 'ok' ? 'wohlauf' : p.moodLabel}
                </Text>
              </View>
            )}
          </Pressable>
        ))}
        {list.length === 0 && <Text style={styles.empty}>Noch keine Pflanze hier.</Text>}
      </View>

      <ActionPill label="+ Neue Pflanze scannen" onPress={() => navigation.navigate('AddPlant', { roomId: room.id })} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  trashBtn: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', ...shadows.sm },
  renameBtn: { height: 44, paddingHorizontal: 18, borderRadius: radius.pill, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', ...shadows.sm },
  renameBtnText: { ...sans(800, 14, { color: colors.acc }) },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 },
  title: { ...baloo(700, 30, { color: colors.ink, letterSpacing: -0.6 }) },
  sub: { ...sans(600, 14, { color: colors.mut, marginBottom: 18 }) },
  editRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  editInput: { flex: 1, borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.xl, height: 52, paddingHorizontal: 16, ...sans(700, 15, { color: colors.ink }), backgroundColor: colors.card },
  editConfirm: { paddingHorizontal: 20, borderRadius: radius.xl, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  editConfirmText: { ...sans(800, 14, { color: colors.bg }) },
  plantRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radius.lg, padding: 10, marginBottom: 10 },
  plantIcon: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: colors.soft2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  plantName: { ...sans(800, 15.5, { color: colors.ink }) },
  plantSub: { ...sans(600, 12.5, { color: colors.mut, marginTop: 2 }) },
  plantBadge: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: radius.pill },
  plantBadgeText: { ...sans(800, 12) },
  empty: { ...sans(600, 14, { color: colors.mut }) }
});
