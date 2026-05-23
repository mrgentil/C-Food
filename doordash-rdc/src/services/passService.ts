import api from './api';
import type { ApiAuthUser } from '../types/api';

export const passService = {
  async status(): Promise<{ data: { active: boolean; expires_at: string | null } }> {
    const res = await api.get('/pass');
    return res.data;
  },

  async subscribe(duration_days: number = 30): Promise<{ message: string; user: ApiAuthUser }> {
    const res = await api.post('/pass/subscribe', { duration_days });
    return res.data;
  },

  async cancel(): Promise<{ message: string; user: ApiAuthUser }> {
    const res = await api.post('/pass/cancel');
    return res.data;
  },
};

