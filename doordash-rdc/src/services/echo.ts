import Echo from 'laravel-echo';
import PusherImport from 'pusher-js/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { config } from '../config';

/** Metro/RN : l’export est souvent `{ Pusher: class }` et non un default callable */
function resolvePusherConstructor(): new (
  key: string,
  options?: object
) => InstanceType<typeof PusherImport> {
  const mod = PusherImport as unknown as {
    default?: new (key: string, options?: object) => InstanceType<typeof PusherImport>;
    Pusher?: new (key: string, options?: object) => InstanceType<typeof PusherImport>;
  };

  if (typeof mod === 'function') {
    return mod as new (key: string, options?: object) => InstanceType<typeof PusherImport>;
  }
  if (typeof mod.default === 'function') {
    return mod.default;
  }
  if (typeof mod.Pusher === 'function') {
    return mod.Pusher;
  }

  throw new Error('Import Pusher invalide (constructor introuvable)');
}

const Pusher = resolvePusherConstructor();
global.Pusher = Pusher as unknown as typeof global.Pusher;

if (__DEV__) {
  Pusher.logToConsole = true;
}

let echoInstance: Echo<'reverb'> | null = null;

function resolveApiOrigin(): string {
  const base = config.API_BASE_URL.replace(/\/api\/?$/, '');
  try {
    return new URL(base).origin;
  } catch {
    return base;
  }
}

function buildPusherOptions(token: string, apiOrigin: string) {
  const useTLS = config.REVERB_SCHEME === 'https';
  const authEndpoint = `${apiOrigin}/api/broadcasting/auth`;

  return {
    wsHost: config.REVERB_HOST,
    wsPort: config.REVERB_PORT,
    wssPort: config.REVERB_PORT,
    forceTLS: useTLS,
    enabledTransports: useTLS ? (['wss'] as const) : (['ws'] as const),
    enableStats: false,
    cluster: '',
    channelAuthorization: {
      customHandler: (
        params: { socketId: string; channelName: string },
        callback: (error: Error | null, authData: { auth: string } | null) => void
      ) => {
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
              const body = await res.text();
              console.warn('[Echo] Auth HTTP', res.status, body.slice(0, 200));
              callback(new Error(`Auth ${res.status}`), null);
              return;
            }
            const data = await res.json();
            callback(null, data);
          })
          .catch((err: Error) => {
            console.warn('[Echo] Auth réseau', err.message);
            callback(err, null);
          });
      },
    },
  };
}

export async function getEcho(): Promise<Echo<'reverb'> | null> {
  const token = await AsyncStorage.getItem('auth_token');
  if (!token) {
    console.warn('[Echo] Pas de token auth — reconnectez-vous');
    return null;
  }

  if (echoInstance) {
    return echoInstance;
  }

  const apiOrigin = resolveApiOrigin();
  const useTLS = config.REVERB_SCHEME === 'https';

  console.log('[Echo] Init', {
    ws: `${useTLS ? 'wss' : 'ws'}://${config.REVERB_HOST}:${config.REVERB_PORT}`,
    auth: `${apiOrigin}/api/broadcasting/auth`,
    key: config.REVERB_APP_KEY,
  });

  const pusherClient = new Pusher(config.REVERB_APP_KEY, buildPusherOptions(token, apiOrigin));

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: config.REVERB_APP_KEY,
    client: pusherClient,
    withoutInterceptors: true,
  });

  return echoInstance;
}

export function watchEchoConnection(
  echo: Echo<'reverb'>,
  onStatus: (status: 'connected' | 'connecting' | 'disconnected' | 'failed') => void
): () => void {
  const connector = echo.connector;
  if (!connector || typeof connector.onConnectionChange !== 'function') {
    return () => undefined;
  }

  onStatus(connector.connectionStatus() as 'connected');

  return connector.onConnectionChange((status) => {
    console.log('[Echo] WS state:', status);
    if (status === 'connected' || status === 'connecting') {
      onStatus(status);
    } else if (status === 'failed') {
      onStatus('failed');
    } else {
      onStatus('disconnected');
    }
  });
}

export function resetEcho(): void {
  if (echoInstance) {
    try {
      echoInstance.disconnect();
    } catch {
      // ignore
    }
    echoInstance = null;
  }
}

export function disconnectEcho(): void {
  resetEcho();
}
