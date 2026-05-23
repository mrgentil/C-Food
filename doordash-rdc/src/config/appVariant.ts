import Constants from 'expo-constants';

export type AppVariant = 'customer' | 'driver';

const raw = (Constants.expoConfig?.extra?.APP_VARIANT as string | undefined)?.toLowerCase();

export const appVariant: AppVariant = raw === 'driver' ? 'driver' : 'customer';

export const isDriverApp = appVariant === 'driver';
