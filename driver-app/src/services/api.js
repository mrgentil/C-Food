import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config';

const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (cfg) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      cfg.headers.Authorization = `Bearer ${token}`;
    }
    return cfg;
  },
  (error) => Promise.reject(error)
);

export default api;

