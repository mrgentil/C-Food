import { useCallback, useEffect, useState } from 'react';
import { restaurantService } from '../services/restaurantService';
import { mapApiRestaurantToUi } from '../utils/mapApiToUi';
import type { Restaurant } from '../types/domain';

export function useStoreRestaurants(type: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await restaurantService.getAll(type);
      const rows = res.data;
      setRestaurants(Array.isArray(rows) ? rows.map(mapApiRestaurantToUi) : []);
    } catch (err: any) {
      setRestaurants([]);
      setError(err.response?.data?.message || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  return { loading, error, restaurants, refresh: fetchRestaurants };
}

