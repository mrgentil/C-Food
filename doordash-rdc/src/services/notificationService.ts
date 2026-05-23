import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

import api from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    // eslint-disable-next-line no-console
    console.log('[PUSH] Not a physical device (Device.isDevice=false). No token.');
    return null;
  }

  const existing = await Notifications.getPermissionsAsync();
  const getStatus = (p: any) => (p?.status ?? p?.ios?.status ?? p?.android?.status) as string | undefined;
  let finalStatus = getStatus(existing) ?? 'undetermined';

  if (finalStatus !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    finalStatus = getStatus(requested) ?? finalStatus;
  }

  if (finalStatus !== 'granted') {
    // eslint-disable-next-line no-console
    console.log('[PUSH] Permission not granted:', finalStatus);
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0EA5E9',
    });
  }

  const projectId =
    (Constants as any)?.expoConfig?.extra?.eas?.projectId ??
    (Constants as any)?.easConfig?.projectId ??
    undefined;

  // eslint-disable-next-line no-console
  console.log('[PUSH] projectId:', projectId ?? '(none)');

  const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : (undefined as any));
  const data = token.data ?? null;

  // eslint-disable-next-line no-console
  console.log('[PUSH] Expo token:', data ?? '(null)');

  return data;
}

export async function syncPushTokenToBackend(token: string): Promise<void> {
  try {
    const res = await api.post('/notifications/push-token', { expo_push_token: token });
    // eslint-disable-next-line no-console
    console.log('[PUSH] Synced token to backend:', res.status);
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('[PUSH] Failed to sync token to backend:', e?.message, e?.response?.status, e?.response?.data);
    throw e;
  }
}

