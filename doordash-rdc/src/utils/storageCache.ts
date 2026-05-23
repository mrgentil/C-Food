import AsyncStorage from '@react-native-async-storage/async-storage';

export type CacheEntry<T> = {
  v: T;
  ts: number;
};

export async function getCached<T>(key: string, ttlMs: number): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.ts !== 'number') return null;
    if (Date.now() - parsed.ts > ttlMs) return null;
    return (parsed as any).v ?? null;
  } catch {
    return null;
  }
}

export async function setCached<T>(key: string, value: T): Promise<void> {
  const entry: CacheEntry<T> = { v: value, ts: Date.now() };
  try {
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch {
    /* ignore */
  }
}

