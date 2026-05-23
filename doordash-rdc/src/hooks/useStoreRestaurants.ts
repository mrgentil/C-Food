import { useCallback, useEffect, useState } from 'react';
import { restaurantService } from '../services/restaurantService';
import { mapApiRestaurantToUi } from '../utils/mapApiToUi';
import type { Restaurant } from '../types/domain';

export function useStoreRestaurants(filter?: any) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // Si on passe une chaîne simple, c'est pour rétro-compatibilité
      const type = typeof filter === 'string' ? filter : filter?.type || 'restaurant';
      
      // Construire les paramètres de requête
      const params: any = {};
      if (typeof filter === 'object' && filter !== null) {
        if (filter.category) params.category = filter.category;
        if (filter.brand) params.brand = filter.brand;
        if (filter.featured) params.featured = 1;
        // On pourrait ajouter d'autres filtres si supportés par l'API
      }

      const res = await restaurantService.getAll(type, params);
      const rows = res.data;
      setRestaurants(Array.isArray(rows) ? rows.map(mapApiRestaurantToUi) : []);
    } catch (err: any) {
      setRestaurants([]);
      setError(err.response?.data?.message || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filter)]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  return { loading, error, restaurants, refresh: fetchRestaurants };
}

