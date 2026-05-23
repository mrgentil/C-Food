import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { config } from '../config';

export const DRIVER_LOCATION_TASK = 'CFoodDriverLocationTask';
const ACTIVE_ORDER_KEY = 'active_delivery_order_id';

async function postLocation(orderId, latitude, longitude) {
  const token = await AsyncStorage.getItem('auth_token');
  if (!token || !orderId) {
    return;
  }

  const url = `${config.API_BASE_URL}/driver/orders/${orderId}/location`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ latitude, longitude }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

TaskManager.defineTask(DRIVER_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.warn('[locationTask]', error.message);
    return;
  }

  const orderId = await AsyncStorage.getItem(ACTIVE_ORDER_KEY);
  if (!orderId || !data?.locations?.length) {
    return;
  }

  const latest = data.locations[data.locations.length - 1];
  const { latitude, longitude } = latest.coords;

  try {
    await postLocation(orderId, latitude, longitude);
  } catch (e) {
    console.warn('[locationTask] upload failed', e?.message);
  }
});
