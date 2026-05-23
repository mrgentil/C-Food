import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ApiFavorite,
  ApiFavoriteCheckResponse,
  ApiFavoriteToggleResponse,
  ApiFavoritesIndexResponse,
} from '../types/api';

let favoriteIdsCache: Set<string> | null = null;
let cacheLoadedAtMs = 0;
let inFlightLoad: Promise<Set<string>> | null = null;

const CACHE_TTL_MS = 60_000;

async function hasToken(): Promise<boolean> {
  const token = await AsyncStorage.getItem('auth_token');
  return !!token;
}

function extractFavoriteRestaurantIds(payload: any): string[] {
  const list: ApiFavorite[] = payload?.data ?? payload?.favorites ?? payload ?? [];
  if (!Array.isArray(list)) return [];
  return list
    .map((f: any) => String(f?.restaurant_id ?? f?.restaurantId ?? f?.restaurant?.id ?? ''))
    .filter(Boolean);
}

async function loadFavoritesIntoCache(force = false): Promise<Set<string>> {
  if (!force && favoriteIdsCache && Date.now() - cacheLoadedAtMs < CACHE_TTL_MS) {
    return favoriteIdsCache;
  }
  if (inFlightLoad) return inFlightLoad;

  inFlightLoad = (async () => {
    if (!(await hasToken())) {
      favoriteIdsCache = new Set<string>();
      cacheLoadedAtMs = Date.now();
      return favoriteIdsCache;
    }

    const response = await api.get<ApiFavoritesIndexResponse>('/favorites');
    const ids = extractFavoriteRestaurantIds(response.data);
    favoriteIdsCache = new Set(ids);
    cacheLoadedAtMs = Date.now();
    return favoriteIdsCache;
  })().finally(() => {
    inFlightLoad = null;
  });

  return inFlightLoad;
}

export const favoritesService = {
  async prefetch(): Promise<void> {
    await loadFavoritesIntoCache(false);
  },

  async getFavorites(): Promise<ApiFavoritesIndexResponse> {
    const response = await api.get<ApiFavoritesIndexResponse>('/favorites');
    return response.data;
  },

  async toggle(restaurantId: string): Promise<ApiFavoriteToggleResponse> {
    const response = await api.post<ApiFavoriteToggleResponse>('/favorites/toggle', { restaurant_id: restaurantId });

    // Update cache optimistically so UI doesn't need N "check" calls.
    const id = String(restaurantId);
    if (!favoriteIdsCache) {
      favoriteIdsCache = new Set<string>();
    }
    const isFav = Boolean((response.data as any)?.is_favorite ?? (response.data as any)?.data?.is_favorite);
    if (isFav) favoriteIdsCache.add(id);
    else favoriteIdsCache.delete(id);
    cacheLoadedAtMs = Date.now();

    return response.data;
  },

  async isFavorite(restaurantId: string): Promise<boolean> {
    const id = String(restaurantId);

    // If cache exists or a single load is in-flight, use it.
    try {
      const cache = await loadFavoritesIntoCache(false);
      if (cache.has(id)) return true;
      // if not in favorites list, return false without calling /check
      return false;
    } catch {
      // Fallback to old endpoint (should be rare).
      const response = await api.get<ApiFavoriteCheckResponse>(`/favorites/check/${id}`);
      return response.data.is_favorite;
    }
  },
};
