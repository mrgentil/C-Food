import { config } from '../config';

export const DEFAULT_AVATAR_URI =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200';

/** URL absolue pour <Image /> : l’API renvoie souvent un chemin relatif (ex. photos/…). */
export function resolveUserPhotoUrl(photo?: string | null): string | undefined {
  if (!photo?.trim()) return undefined;
  const p = photo.trim();
  if (/^https?:\/\//i.test(p)) return p;
  const origin = config.API_BASE_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
  return `${origin}/${p.replace(/^\//, '')}`;
}

export function getUserAvatarUri(photo?: string | null): string {
  return resolveUserPhotoUrl(photo) ?? DEFAULT_AVATAR_URI;
}
