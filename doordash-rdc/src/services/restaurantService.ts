import api from './api';
import type {
  ApiCategoriesIndexResponse,
  ApiCategoryRestaurantsResponse,
  ApiMenuItem,
  ApiRestaurant,
  ApiWrappedData,
} from '../types/api';
import { getCached, setCached } from '../utils/storageCache';

export const restaurantService = {
  async getAll(
    type: string = 'restaurant',
    options?: { lat?: number; lng?: number; radius_km?: number }
  ): Promise<ApiWrappedData<ApiRestaurant[]>> {
    const cacheKey = `cache:restaurants:${type}:${options?.lat ?? ''}:${options?.lng ?? ''}:${options?.radius_km ?? ''}`;
    const ttlMs = 2 * 60 * 1000;

    const cached = await getCached<ApiWrappedData<ApiRestaurant[]>>(cacheKey, ttlMs);
    if (cached) {
      // Fire-and-forget refresh in background.
      api
        .get<ApiWrappedData<ApiRestaurant[]>>('/restaurants', { params: { type, ...(options ?? {}) } })
        .then((r) => setCached(cacheKey, r.data))
        .catch(() => null);
      return cached;
    }

    try {
      const response = await api.get<ApiWrappedData<ApiRestaurant[]>>('/restaurants', {
        params: { type, ...(options ?? {}) },
      });
      await setCached(cacheKey, response.data);
      return response.data;
    } catch (err) {
      // If network fails, return stale cache if exists (longer TTL).
      const stale = await getCached<ApiWrappedData<ApiRestaurant[]>>(cacheKey, 24 * 60 * 60 * 1000);
      if (stale) return stale;
      throw err;
    }
  },

  async getById(id: string): Promise<ApiWrappedData<ApiRestaurant>> {
    const response = await api.get<ApiWrappedData<ApiRestaurant>>(`/restaurants/${id}`);
    return response.data;
  },

  async getFeatured(type: string = 'restaurant'): Promise<ApiWrappedData<ApiRestaurant[]>> {
    const response = await api.get<ApiWrappedData<ApiRestaurant[]>>('/restaurants/featured', { params: { type } });
    return response.data;
  },

  async search(
    query: string,
    filters?: Record<string, unknown>,
    options?: { lat?: number; lng?: number; radius_km?: number }
  ): Promise<ApiWrappedData<ApiRestaurant[]>> {
    const response = await api.get<ApiWrappedData<ApiRestaurant[]>>('/restaurants/search', {
      params: { q: query, ...(filters ?? {}), ...(options ?? {}) },
    });
    return response.data;
  },

  async getMenu(restaurantId: string): Promise<ApiWrappedData<ApiMenuItem[]>> {
    const cacheKey = `cache:menu:${restaurantId}`;
    const ttlMs = 5 * 60 * 1000;

    const cached = await getCached<ApiWrappedData<ApiMenuItem[]>>(cacheKey, ttlMs);
    if (cached) {
      api
        .get<ApiWrappedData<ApiMenuItem[]>>(`/restaurants/${restaurantId}/menu`)
        .then((r) => setCached(cacheKey, r.data))
        .catch(() => null);
      return cached;
    }

    try {
      const response = await api.get<ApiWrappedData<ApiMenuItem[]>>(`/restaurants/${restaurantId}/menu`);
      await setCached(cacheKey, response.data);
      return response.data;
    } catch (err) {
      const stale = await getCached<ApiWrappedData<ApiMenuItem[]>>(cacheKey, 24 * 60 * 60 * 1000);
      if (stale) return stale;
      throw err;
    }
  },

  async getCategories(): Promise<ApiCategoriesIndexResponse> {
    const response = await api.get<ApiCategoriesIndexResponse>('/categories');
    return response.data;
  },

  async getByCategory(categoryId: string): Promise<ApiCategoryRestaurantsResponse> {
    const response = await api.get<ApiCategoryRestaurantsResponse>(`/categories/${categoryId}/restaurants`);
    return response.data;
  },
};
