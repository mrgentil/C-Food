import { config } from '../config';

const API_ORIGIN = config.API_BASE_URL.replace(/\/api\/?$/, '');

/** URL absolue pour photo livreur (chemins relatifs type photos/xxx.jpg) */
export function resolvePhotoUrl(photo?: string | null): string | null {
  if (!photo || String(photo).trim() === '') {
    return null;
  }
  const trimmed = String(photo).trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${API_ORIGIN}${path}`;
}
