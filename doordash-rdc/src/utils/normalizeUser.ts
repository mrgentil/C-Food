import type { ApiAuthUser } from '../types/api';

export function normalizeApiUserToStoredUser(u: ApiAuthUser) {
  return {
    id: String(u.id),
    name: u.name,
    email: u.email,
    phone: u.phone ?? '',
    photo: u.photo ?? undefined,
    dash_pass: u.dash_pass,
    is_admin: !!u.is_admin,
    is_restaurant: !!u.is_restaurant,
    is_driver: !!u.is_driver,
  };
}
