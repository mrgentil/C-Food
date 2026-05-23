import Echo from 'laravel-echo';
import PusherImport from 'pusher-js/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { config } from '../config';

function resolvePusherConstructor() {
  const mod = PusherImport;
  if (typeof mod === 'function') return mod;
  if (typeof mod?.default === 'function') return mod.default;
  if (typeof mod?.Pusher === 'function') return mod.Pusher;
  throw new Error('Import Pusher invalide');
}

const Pusher = resolvePusherConstructor();
global.Pusher = Pusher;

let echoInstance = null;

function resolveApiOrigin() {
  const base = config.API_BASE_URL.replace(/\/api\/?$/, '');
  try {
    return new URL(base).origin;
  } catch {
    return base;
  }
}

function buildPusherOptions(token, apiOrigin) {
  const useTLS = config.REVERB_SCHEME === 'https';
  const authEndpoint = `${apiOrigin}/api/broadcasting/auth`;

  return {
    wsHost: config.REVERB_HOST,
    wsPort: config.REVERB_PORT,
    wssPort: config.REVERB_PORT,
    forceTLS: useTLS,
    enabledTransports: useTLS ? ['wss'] : ['ws'],
    enableStats: false,
    cluster: '',
    channelAuthorization: {
      customHandler: (params, callback) => {
        fetch(authEndpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            socket_id: params.socketId,
            channel_name: params.channelName,
          }),
        })
          .then(async (res) => {
            if (!res.ok) {
              callback(new Error(`Auth ${res.status}`), null);
              return;
            }
            const data = await res.json();
            callback(null, data);
          })
          .catch((err) => callback(err, null));
      },
    },
  };
}

export async function getEcho() {
  const token = await AsyncStorage.getItem('auth_token');
  if (!token) return null;

  if (echoInstance) return echoInstance;

  const apiOrigin = resolveApiOrigin();
  const pusherClient = new Pusher(config.REVERB_APP_KEY, buildPusherOptions(token, apiOrigin));

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: config.REVERB_APP_KEY,
    client: pusherClient,
    withoutInterceptors: true,
  });

  return echoInstance;
}
