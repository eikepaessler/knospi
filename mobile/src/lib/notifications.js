import { Platform } from 'react-native';
import Constants, { AppOwnership } from 'expo-constants';
import * as Device from 'expo-device';
import { api } from './api';

// Seit Expo SDK 53 unterstützt die normale Expo-Go-App keine echten
// Push-Benachrichtigungen mehr (nur ein "Development Build" kann das).
// In Expo Go überspringen wir das Modul komplett, statt beim Import
// abzustürzen.
const isExpoGo = Constants.appOwnership === AppOwnership.Expo;

if (!isExpoGo) {
  try {
    // eslint-disable-next-line global-require
    const Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false,
        shouldShowBanner: true, shouldShowList: true
      })
    });
  } catch (err) {
    console.warn('expo-notifications: Handler konnte nicht gesetzt werden', err);
  }
}

// Fragt Berechtigung an und registriert das Expo-Push-Token beim Server.
// Wird beim App-Start aufgerufen; scheitert leise auf Simulator/Web/Expo Go,
// wo es keine echten Push-Tokens gibt.
export async function registerForPushNotifications() {
  if (isExpoGo) return null;

  try {
    // eslint-disable-next-line global-require
    const Notifications = require('expo-notifications');

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default', importance: Notifications.AndroidImportance.DEFAULT
      });
    }
    if (!Device.isDevice) return null;

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== 'granted') return null;

    const { data: token } = await Notifications.getExpoPushTokenAsync();
    await api.registerPush(token);
    return token;
  } catch (err) {
    console.warn('Push-Registrierung übersprungen', err);
    return null;
  }
}
