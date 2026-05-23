import api from './api';

export interface Brand {
  id: number;
  name: string;
  type: string; // 'our_brand' | 'restaurant' | 'grocery'
  logo: string | null;
  status: boolean;
  order_index: number;
}

export const brandService = {
  async getBrands(type?: string): Promise<Brand[]> {
    const params = type ? { type } : {};
    const response = await api.get('/brands', { params });
    return response.data.data;
  },

  async getByType(type: string): Promise<Brand[]> {
    return this.getBrands(type);
  },
};
