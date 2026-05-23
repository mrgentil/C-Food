import api from './api';
import type {
  ApiOrder,
  ApiOrderTracking,
  ApiOrderCancelResponse,
  ApiOrderMutationResponse,
  ApiOrderRatePayload,
  ApiOrderRateResponse,
  ApiOrdersIndexResponse,
  ApiWrappedData,
} from '../types/api';

export interface OrderItem {
  menu_item_id: string;
  quantity: number;
  selected_options?: unknown[] | null;
  special_instructions?: string | null;
}

export interface CreateOrderData {
  restaurant_id: string;
  items: OrderItem[];
  address_id: number;
  order_type?: 'delivery' | 'pickup';
  payment_method: string;
  tip?: number;
  promo_code?: string;
  delivery_instructions?: string;
}

export const orderService = {
  async create(data: CreateOrderData): Promise<ApiOrderMutationResponse> {
    const response = await api.post<ApiOrderMutationResponse>('/orders', data);
    return response.data;
  },

  async getAll(): Promise<ApiOrdersIndexResponse> {
    const response = await api.get<ApiOrdersIndexResponse>('/orders');
    return response.data;
  },

  async getById(id: string): Promise<ApiWrappedData<ApiOrder>> {
    const response = await api.get<ApiWrappedData<ApiOrder>>(`/orders/${id}`);
    return response.data;
  },

  async track(id: string): Promise<ApiWrappedData<ApiOrderTracking>> {
    const response = await api.get<ApiWrappedData<ApiOrderTracking>>(`/orders/${id}/track`);
    return response.data;
  },

  async cancel(id: string): Promise<ApiOrderCancelResponse> {
    const response = await api.post<ApiOrderCancelResponse>(`/orders/${id}/cancel`);
    return response.data;
  },

  async rate(id: string, rating: ApiOrderRatePayload): Promise<ApiOrderRateResponse> {
    const response = await api.post<ApiOrderRateResponse>(`/orders/${id}/rate`, rating);
    return response.data;
  },

  async reorder(id: string): Promise<ApiOrderMutationResponse> {
    const response = await api.post<ApiOrderMutationResponse>(`/orders/${id}/reorder`);
    return response.data;
  },
};
