export type LatLng = { latitude: number; longitude: number };

const KINSHASA_FALLBACK: LatLng = { latitude: -4.3217, longitude: 15.312 };

export function toCoordinate(
  latitude?: number | string | null,
  longitude?: number | string | null,
  fallback: LatLng = KINSHASA_FALLBACK
): LatLng {
  const lat = latitude != null && latitude !== '' ? Number(latitude) : NaN;
  const lng = longitude != null && longitude !== '' ? Number(longitude) : NaN;

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { latitude: lat, longitude: lng };
  }

  return fallback;
}

export function regionFromPoints(points: LatLng[], padding = 0.02) {
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(maxLat - minLat + padding, 0.03),
    longitudeDelta: Math.max(maxLng - minLng + padding, 0.03),
  };
}
