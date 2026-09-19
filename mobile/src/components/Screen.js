import { ScrollView, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

export function Screen({ children, scroll = true, contentStyle, style }) {
  const Container = scroll ? ScrollView : View;
  return (
    <View style={[styles.outer, style]}>
      <Container
        style={styles.inner}
        contentContainerStyle={scroll ? [styles.content, contentStyle] : undefined}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: colors.bg },
  inner: { flex: 1 },
  content: { padding: 20, paddingBottom: 140 }
});
