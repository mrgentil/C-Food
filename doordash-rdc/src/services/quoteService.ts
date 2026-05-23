import api from './api';
import type { ApiQuoteRequest, ApiQuoteResponse } from '../types/api';

export const quoteService = {
  async quote(payload: ApiQuoteRequest): Promise<ApiQuoteResponse> {
    const res = await api.post<ApiQuoteResponse>('/quote', payload);
    return res.data;
  },
};

