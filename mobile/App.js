import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Baloo2_500Medium, Baloo2_600SemiBold, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import {
  PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold,
  PlusJakartaSans_600SemiBold_Italic
} from '@expo-google-fonts/plus-jakarta-sans';

import { AppDataProvider, useAppData } from './src/context/AppDataContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { Toast } from './src/components/ui';
import { StickerOverlay } from './src/components/StickerOverlay';
import { colors } from './src/theme/colors';
import { registerForPushNotifications } from './src/lib/notifications';

SplashScreen.preventAutoHideAsync().catch(() => {});

function AppShell() {
  const { toast, reward } = useAppData();
  useEffect(() => { registerForPushNotifications().catch(() => {}); }, []);

  return (
    <>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      <Toast message={toast} />
      <StickerOverlay sticker={reward} />
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Baloo2_500Medium, Baloo2_600SemiBold, Baloo2_700Bold, Baloo2_800ExtraBold,
    PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold,
    PlusJakartaSans_600SemiBold_Italic
  });
  const [ready, setReady] = useState(false);

  const onLayout = useCallback(async () => {
    if (fontsLoaded && !ready) {
      setReady(true);
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, ready]);

  useEffect(() => { onLayout(); }, [onLayout]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.outerBg }}>
      <SafeAreaProvider>
        <AppDataProvider>
          <StatusBar style="dark" />
          <AppShell />
        </AppDataProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
