/** Distance en mètres (formule Haversine) */
export function distanceMeters(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return null;
  }
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(meters) {
  if (meters == null || Number.isNaN(meters)) {
    return '—';
  }
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/** Rayon pour considérer le livreur « sur place » */
export const ARRIVAL_RADIUS_M = 80;

/** ~30 km/h en ville */
export const METERS_PER_MINUTE = 500;

export function etaMinutesFromMeters(meters) {
  if (meters == null || Number.isNaN(meters)) {
    return null;
  }
  return Math.max(1, Math.ceil(meters / METERS_PER_MINUTE));
}
