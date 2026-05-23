import api from './api';
import type {
  ApiOrderMessageCreateResponse,
  ApiOrderMessageType,
  ApiOrderMessagesIndexResponse,
} from '../types/api';

export type SendMessagePayload = {
  message?: string;
  type?: ApiOrderMessageType;
  media_url?: string;
  media_meta?: Record<string, unknown>;
};

export const messageService = {
  async list(orderId: string): Promise<ApiOrderMessagesIndexResponse> {
    const res = await api.get<ApiOrderMessagesIndexResponse>(`/orders/${orderId}/messages`);
    return res.data;
  },

  async send(orderId: string, payload: SendMessagePayload): Promise<ApiOrderMessageCreateResponse> {
    const res = await api.post<ApiOrderMessageCreateResponse>(`/orders/${orderId}/messages`, payload);
    return res.data;
  },
};
