import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

import { DRIVER_LOCATION_TASK } from '../tasks/locationTask';

const ACTIVE_ORDER_KEY = 'active_delivery_order_id';

/** Envoi position au serveur (visible côté client sur la carte) */
const TRACKING_STATUSES = new Set([
  'picked_up',
  'delivering',
  'arrived_at_customer',
  'arrived_at_restaurant',
]);

export async function startDeliveryLocationTracking(orderId) {
  if (!orderId) {
    return false;
  }

  try {
    const { status: fg } = await Location.requestForegroundPermissionsAsync();
    if (fg !== 'granted') {
      return false;
    }

    try {
      const { status: bg } = await Location.requestBackgroundPermissionsAsync();
      if (bg !== 'granted') {
        console.warn('[locationTracking] background permission denied — foreground only');
      }
    } catch (e) {
      console.warn('[locationTracking] background permission error (Expo Go limitation?):', e.message);
    }

    await AsyncStorage.setItem(ACTIVE_ORDER_KEY, String(orderId));

    const started = await Location.hasStartedLocationUpdatesAsync(DRIVER_LOCATION_TASK);
    if (started) {
      await Location.stopLocationUpdatesAsync(DRIVER_LOCATION_TASK);
    }

    await Location.startLocationUpdatesAsync(DRIVER_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 10000,
      distanceInterval: 25,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'C-Food Driver',
        notificationBody: 'Suivi de livraison en cours',
        notificationColor: '#0EA5E9',
      },
      pausesUpdatesAutomatically: false,
    });

    return true;
  } catch (e) {
    console.warn('[locationTracking] start error:', e.message);
    // On ne lève pas l'erreur pour ne pas bloquer la mise à jour du statut de la commande
    return false;
  }
}

export async function stopDeliveryLocationTracking() {
  await AsyncStorage.removeItem(ACTIVE_ORDER_KEY);

  const started = await Location.hasStartedLocationUpdatesAsync(DRIVER_LOCATION_TASK);
  if (started) {
    await Location.stopLocationUpdatesAsync(DRIVER_LOCATION_TASK);
  }
}

export function shouldTrackForStatus(status) {
  return TRACKING_STATUSES.has(status);
}
