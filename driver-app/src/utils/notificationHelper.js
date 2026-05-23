import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/** Expo Go ne supporte plus les push Android (SDK 53+) */
function isPushSupported() {
  if (Constants.appOwnership === 'expo') {
    return false;
  }
  if (!Device.isDevice) {
    return false;
  }
  return true;
}

export async function registerForPushNotificationsAsync() {
  if (!isPushSupported()) {
    console.log('[Push] Ignoré (Expo Go, émulateur ou appareil virtuel)');
    return null;
  }

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('[Push] Permission refusée');
      return null;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const token = (
      await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
      )
    ).data;

    console.log('[Push] Driver Expo token:', token);
    return token;
  } catch (e) {
    console.warn('[Push] Enregistrement impossible:', e?.message);
    return null;
  }
}
