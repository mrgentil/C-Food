import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export const authService = {
  async login({ login, password }) {
    const res = await api.post('/auth/login', {
      login: String(login || '').trim(),
      password,
    });
    const token = res?.data?.token;
    const user = res?.data?.user;

    if (token) {
      await AsyncStorage.setItem('auth_token', token);
    }
    if (user) {
      await AsyncStorage.setItem('user', JSON.stringify(user));
    }

    return { token, user };
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user');
  },

  async getStoredUser() {
    const raw = await AsyncStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  },

  async updateStoredUser(patch) {
    const current = await this.getStoredUser();
    if (!current) return null;
    const merged = { ...current, ...patch };
    await AsyncStorage.setItem('user', JSON.stringify(merged));
    return merged;
  },
};

