import api from './api';
import type { ApiAddress, ApiMessage, ApiWrappedData } from '../types/api';

export interface Address {
  id?: string;
  label: string;
  street: string;
  city: string;
  neighborhood: string;
  instructions?: string;
  latitude: number;
  longitude: number;
  is_default: boolean;
}

export const addressService = {
  async getAll(): Promise<ApiWrappedData<ApiAddress[]>> {
    const response = await api.get<ApiWrappedData<ApiAddress[]>>('/addresses');
    return response.data;
  },

  async create(data: Address): Promise<ApiWrappedData<ApiAddress>> {
    const response = await api.post<ApiWrappedData<ApiAddress>>('/addresses', data);
    return response.data;
  },

  async update(id: string, data: Partial<Address>): Promise<ApiWrappedData<ApiAddress>> {
    const response = await api.put<ApiWrappedData<ApiAddress>>(`/addresses/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete<ApiMessage>(`/addresses/${id}`);
  },

  async setDefault(id: string): Promise<ApiWrappedData<ApiAddress>> {
    const response = await api.put<ApiWrappedData<ApiAddress>>(`/addresses/${id}/default`);
    return response.data;
  },
};
