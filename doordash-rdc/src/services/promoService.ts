import api from './api';
import type { ApiPromoValidateRequest, ApiPromoValidateResponse, ApiPromosIndexResponse } from '../types/api';

export const promoService = {
  async list(): Promise<ApiPromosIndexResponse> {
    const res = await api.get<ApiPromosIndexResponse>('/promos');
    return res.data;
  },

  async validate(code: string, subtotal: number): Promise<ApiPromoValidateResponse> {
    const payload: ApiPromoValidateRequest = { code, subtotal };
    const res = await api.post<ApiPromoValidateResponse>('/promos/validate', payload);
    return res.data;
  },
};

