import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ApiLoginResponse,
  ApiLogoutResponse,
  ApiRegisterResponse,
  ApiUpdatePhotoResponse,
  ApiUpdateProfileResponse,
  ApiAuthUser,
} from '../types/api';
import { normalizeApiUserToStoredUser } from '../utils/normalizeUser';

export interface LoginData {
  /** Email ou numéro de téléphone */
  login: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation?: string;
}

export const authService = {
  async login(data: LoginData): Promise<ApiLoginResponse> {
    const response = await api.post<ApiLoginResponse>('/auth/login', {
      login: data.login.trim(),
      password: data.password,
    });
    if (response.data.token) {
      await AsyncStorage.setItem('auth_token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(normalizeApiUserToStoredUser(response.data.user)));
    }
    return response.data;
  },

  async register(data: RegisterData): Promise<ApiRegisterResponse> {
    const response = await api.post<ApiRegisterResponse>('/auth/register', data);
    if (response.data.token) {
      await AsyncStorage.setItem('auth_token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(normalizeApiUserToStoredUser(response.data.user)));
    }
    return response.data;
  },

  async logout(): Promise<ApiLogoutResponse> {
    const response = await api.post<ApiLogoutResponse>('/auth/logout');
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user');
    return response.data;
  },

  async getUser() {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  async fetchUserFromApi(): Promise<ApiAuthUser> {
    const response = await api.get<ApiAuthUser>('/user');
    await AsyncStorage.setItem('user', JSON.stringify(normalizeApiUserToStoredUser(response.data)));
    return response.data;
  },

  async updateProfile(data: { name?: string; phone?: string }): Promise<ApiUpdateProfileResponse> {
    const response = await api.put<ApiUpdateProfileResponse>('/profile', data);
    await AsyncStorage.setItem('user', JSON.stringify(normalizeApiUserToStoredUser(response.data.user)));
    return response.data;
  },

  async updatePhoto(formData: FormData): Promise<ApiUpdatePhotoResponse> {
    const response = await api.post<ApiUpdatePhotoResponse>('/profile/photo', formData);
    if (response.data.user) {
      await AsyncStorage.setItem('user', JSON.stringify(normalizeApiUserToStoredUser(response.data.user)));
    }
    return response.data;
  },
};
