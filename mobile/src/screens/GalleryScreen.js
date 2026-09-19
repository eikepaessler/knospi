import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { TopHeader } from '../components/Header';
import { useAppData } from '../context/AppDataContext';
import { colors } from '../theme/colors';
import { radius } from '../theme/layout';
import { baloo, sans } from '../theme/typography';

export function GalleryScreen() {
  const navigation = useNavigation();
  const { plants } = useAppData();

  const photos = plants
    .flatMap((p) => p.photos.map((photo) => ({ ...photo, plant: p })))
    .sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt));

  return (
    <Screen>
      <TopHeader />
      <Text style={styles.title}>Galerie</Text>
      <Text style={styles.sub}>{photos.length} {photos.length === 1 ? 'Foto' : 'Fotos'} aus allen Fotoalben</Text>

      {photos.length === 0 && (
        <Text style={styles.empty}>Noch keine Fotos. Mach im Pflanzen-Detail dein erstes Foto.</Text>
      )}

      <View style={styles.grid}>
        {photos.map((p) => (
          <Pressable key={p.id} onPress={() => navigation.navigate('PlantDetail', { id: p.plant.id })} style={styles.tile}>
            <Image source={{ uri: p.uri }} style={styles.img} />
            <Text style={styles.tileName} numberOfLines={1}>{p.plant.name}</Text>
            <Text style={styles.tileDate}>{new Date(p.takenAt).toLocaleDateString('de-DE')}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...baloo(700, 26, { color: colors.ink, marginBottom: 2 }) },
  sub: { ...sans(600, 14, { color: colors.mut, marginBottom: 18 }) },
  empty: { ...sans(600, 14, { color: colors.mut }) },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '31%', gap: 3 },
  img: { width: '100%', aspectRatio: 3 / 4, borderRadius: radius.md, backgroundColor: colors.soft },
  tileName: { ...sans(700, 12, { color: colors.ink }) },
  tileDate: { ...sans(600, 10.5, { color: colors.mut }) }
});
