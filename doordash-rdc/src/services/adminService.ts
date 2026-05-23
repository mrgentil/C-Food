import api from './api';
import type {
  ApiAdminDashboardResponse,
  ApiAdminRestaurantsResponse,
  ApiAdminUsersResponse,
  ApiOrder,
  ApiOrderMutationResponse,
  ApiOrderStatus,
  ApiPaginatedResponse,
  ApiWrappedData,
} from '../types/api';

export type OrderStatus = ApiOrderStatus;

export const adminService = {
  async dashboard(): Promise<ApiAdminDashboardResponse> {
    const res = await api.get<ApiAdminDashboardResponse>('/admin/dashboard');
    return res.data;
  },

  async orders(params?: { page?: number }): Promise<ApiPaginatedResponse<ApiOrder>> {
    const res = await api.get<ApiPaginatedResponse<ApiOrder>>('/admin/orders', { params });
    return res.data;
  },

  async order(id: string | number): Promise<ApiWrappedData<ApiOrder>> {
    const res = await api.get<ApiWrappedData<ApiOrder>>(`/admin/orders/${id}`);
    return res.data;
  },

  async updateOrderStatus(id: string | number, status: ApiOrderStatus): Promise<ApiOrderMutationResponse> {
    const res = await api.patch<ApiOrderMutationResponse>(`/admin/orders/${id}/status`, { status });
    return res.data;
  },

  async users(params?: { page?: number }): Promise<ApiAdminUsersResponse> {
    const res = await api.get<ApiAdminUsersResponse>('/admin/users', { params });
    return res.data;
  },

  async restaurants(params?: { page?: number }): Promise<ApiAdminRestaurantsResponse> {
    const res = await api.get<ApiAdminRestaurantsResponse>('/admin/restaurants', { params });
    return res.data;
  },
};
