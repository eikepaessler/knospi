import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { colors } from '../theme/colors';

// KeyboardAvoidingView + ScrollView, damit ein fokussiertes Eingabefeld nicht
// von der Tastatur verdeckt wird, egal auf welchem Screen es steht - einmal
// hier geloest, statt jeden Screen mit einem Eingabefeld einzeln zu flicken.
export function Screen({ children, scroll = true, contentStyle, style }) {
  const insets = useSafeAreaInsets();
  const Container = scroll ? ScrollView : View;
  const topPad = { paddingTop: insets.top + 8 };
  return (
    <View style={[styles.outer, style]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Container
          style={scroll ? styles.inner : [styles.contentNoScroll, topPad, contentStyle]}
          contentContainerStyle={scroll ? [styles.content, topPad, contentStyle] : undefined}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </Container>
      </KeyboardAvoidingView>
      {/* Weichzeichner hinter der Statusleiste (Uhrzeit, Akku, ...), damit
          hochscrollender Inhalt dort nicht hart abgeschnitten wirkt - analog
          zum Blur in der Fussnavigation (TabBar.js). */}
      <View style={[styles.topBlurWrap, { height: insets.top + 8 }]} pointerEvents="none">
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: colors.bg },
  inner: { flex: 1 },
  content: { padding: 20, paddingBottom: 140 },
  contentNoScroll: { flex: 1, padding: 20, paddingBottom: 140 },
  topBlurWrap: { position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' }
});
