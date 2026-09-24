import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: colors.bg },
  inner: { flex: 1 },
  content: { padding: 20, paddingBottom: 140 },
  contentNoScroll: { flex: 1, padding: 20, paddingBottom: 140 }
});
