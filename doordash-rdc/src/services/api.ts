import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { config } from '../config';

function buildNetworkHelpMessage(error: any): string {
  const baseURL = config.API_BASE_URL;
  const method = String(error?.config?.method ?? '').toUpperCase();
  const url = String(error?.config?.url ?? '');
  const fullUrl = url ? `${baseURL}${url.startsWith('/') ? url : `/${url}`}` : baseURL;

  const code = String(error?.code ?? '');
  const isTimeout = code === 'ECONNABORTED' || String(error?.message ?? '').toLowerCase().includes('timeout');

  // Common dev causes: wrong IP/baseURL, backend not listening on LAN, firewall blocks port, device not on same LAN.
  const lines = [
    "Impossible de contacter le serveur.",
    fullUrl ? `URL: ${method ? `${method} ` : ''}${fullUrl}` : '',
    isTimeout ? "Cause probable: délai dépassé (serveur trop lent ou inaccessible)." : "Cause probable: API inaccessible (IP/baseURL incorrecte, serveur arrêté, pare-feu, réseau différent).",
    "Vérifie:",
    "- ton `API_BASE_URL` (il doit pointer vers l'IP de ton PC sur le hotspot, pas 127.0.0.1)",
    "- Laravel lancé en écoute réseau: `php artisan serve --host 0.0.0.0 --port 8000`",
    "- sur iPhone Safari: `http://IP_DU_PC:8000/api/test` doit répondre",
  ].filter(Boolean);

  return lines.join('\n');
}

function logApiError(error: any) {
  try {
    const baseURL = config.API_BASE_URL;
    const method = String(error?.config?.method ?? '').toUpperCase();
    const url = String(error?.config?.url ?? '');
    const fullUrl = url ? `${baseURL}${url.startsWith('/') ? url : `/${url}`}` : baseURL;

    const status = error?.response?.status;
    const code = error?.code;

    // eslint-disable-next-line no-console
    console.error(
      '[API ERROR]',
      method ? `${method} ${fullUrl}` : fullUrl,
      status ? `status=${status}` : '',
      code ? `code=${code}` : '',
      '\nmessage:',
      error?.message,
      '\nresponse:',
      error?.response?.data ?? '(no response body)'
    );
  } catch {
    // eslint-disable-next-line no-console
    console.error('[API ERROR]', error);
  }
}

const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user');
    }

    // Network error: no HTTP response (DNS, refused, blocked, wrong IP, offline, etc.)
    if (!error.response) {
      error.message = buildNetworkHelpMessage(error);
    }

    logApiError(error);
    return Promise.reject(error);
  }
);

export default api;
