import Constants from 'expo-constants';

type ExtraConfig = Partial<{
  API_BASE_URL: string;
  GOOGLE_MAPS_API_KEY: string;
  REVERB_APP_KEY: string;
  REVERB_HOST: string;
  REVERB_PORT: string | number;
  REVERB_SCHEME: 'http' | 'https';
  PUSHER_KEY: string;
  PUSHER_CLUSTER: string;
  PAYMENT_MODE: 'simulation' | 'production';
}>;

function getExtra(): ExtraConfig {
  // expoConfig is available in modern Expo; manifest is for older runtimes.
  const extra =
    ((Constants.expoConfig as any)?.extra ??
      (Constants as any).manifest?.extra ??
      (Constants as any).manifest2?.extra ??
      {}) as ExtraConfig;
  return extra ?? {};
}

const extra = getExtra();

function deriveReverbHost(apiBase: string): string {
  try {
    return new URL(apiBase.replace(/\/api\/?$/, '')).hostname;
  } catch {
    return '127.0.0.1';
  }
}

const apiBase = extra.API_BASE_URL || 'http://127.0.0.1:8000/api';

export const config = {
  API_BASE_URL: apiBase,
  GOOGLE_MAPS_API_KEY: extra.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY_HERE',
  REVERB_APP_KEY: extra.REVERB_APP_KEY || extra.PUSHER_KEY || 'cfood-local-key',
  REVERB_HOST: extra.REVERB_HOST || deriveReverbHost(apiBase),
  REVERB_PORT: Number(extra.REVERB_PORT ?? 6001),
  REVERB_SCHEME: (extra.REVERB_SCHEME || 'http') as 'http' | 'https',
  PUSHER_KEY: extra.PUSHER_KEY || 'YOUR_PUSHER_KEY_HERE',
  PUSHER_CLUSTER: extra.PUSHER_CLUSTER || 'mt1',
  PAYMENT_MODE: (extra.PAYMENT_MODE || 'simulation') as 'simulation' | 'production',
  APP_NAME: 'C-Food',
  CURRENCY: 'CDF',
  CURRENCY_SYMBOL: 'FC',
  DEFAULT_DELIVERY_FEE: 1000,
  SUPPORTED_PAYMENT_METHODS: ['mpesa', 'airtel', 'orange'] as const,
};

export type PaymentMethod = typeof config.SUPPORTED_PAYMENT_METHODS[number];
