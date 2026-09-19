import { Platform } from 'react-native';

// Waehrend der Entwicklung laeuft der Express-Server lokal auf Port 4000.
// Android-Emulatoren erreichen den Host-Rechner nicht ueber "localhost",
// sondern ueber die spezielle Adresse 10.0.2.2 - iOS-Simulator und Web
// koennen localhost direkt verwenden. Fuer ein echtes Geraet (Expo Go)
// muss API_BASE_URL auf die LAN-IP oder die deployte Server-URL zeigen.
const DEV_HOST = Platform.select({ android: 'http://10.0.2.2:4000', default: 'http://localhost:4000' });

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEV_HOST;
