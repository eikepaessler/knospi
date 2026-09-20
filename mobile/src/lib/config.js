import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Waehrend der Entwicklung laeuft der Express-Server lokal auf Port 4000.
// Android-Emulatoren erreichen den Host-Rechner nicht ueber "localhost",
// sondern ueber die spezielle Adresse 10.0.2.2 - iOS-Simulator und Web
// koennen localhost direkt verwenden. Ein echtes Geraet (Expo Go) braucht
// die LAN-IP des Rechners - die steckt bereits in der Metro-Verbindung
// (Constants.expoConfig.hostUri, z.B. "192.168.0.184:8081"), daher wird
// sie hier automatisch abgeleitet statt eine manuelle Env-Variable zu
// verlangen.
function resolveDevHost() {
  const hostUri = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost;
  const lanHost = hostUri?.split(':')?.[0];
  if (lanHost && lanHost !== 'localhost' && lanHost !== '127.0.0.1') {
    return `http://${lanHost}:4000`;
  }
  return Platform.select({ android: 'http://10.0.2.2:4000', default: 'http://localhost:4000' });
}

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || resolveDevHost();
