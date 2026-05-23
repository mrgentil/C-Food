import api from './api';

export interface ShopType {
  id: number;
  name: string;
  category: string; // 'shop_type' | 'fresh_finds' | 'grocery_picks'
  image: string | null;
  status: boolean;
  order_index: number;
}

export const shopTypeService = {
  async getShopTypes(category?: string): Promise<ShopType[]> {
    const params = category ? { category } : {};
    const response = await api.get('/shop-types', { params });
    return response.data.data;
  },

  async getByCategory(category: string): Promise<ShopType[]> {
    return this.getShopTypes(category);
  },
};
