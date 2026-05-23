import api from './api';

export async function syncPushTokenToBackend(token) {
  await api.post('/notifications/push-token', { expo_push_token: token });
}

