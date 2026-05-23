import type { ApiOrderTracking } from '../types/api';

export type TrackingProximity = 'waiting' | 'far' | 'approaching' | 'near' | 'arrived';

export type OrderTrackingMetrics = {
  phase: string;
  target: string | null;
  distance_meters: number | null;
  distance_label: string | null;
  eta_minutes: number | null;
  eta_label: string | null;
  proximity: TrackingProximity;
  client_message: string;
  driver_message?: string | null;
  show_driver_on_map?: boolean;
  delivery_address_label?: string | null;
};

const METERS_PER_MINUTE = 500;
const ARRIVAL_RADIUS_M = 80;

function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters: number | null): string | null {
  if (meters == null) return null;
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/** Utilise le bloc `tracking` API ou recalcule côté client */
export function getTrackingMetrics(order: ApiOrderTracking | null): OrderTrackingMetrics | null {
  if (!order) return null;
  if (order.tracking) {
    return order.tracking as OrderTrackingMetrics;
  }

  const status = order.status;
  const showDriver = Boolean(order.driver) && ['preparing', 'picked_up', 'delivering'].includes(status);
  const dLat = order.driver_latitude;
  const dLng = order.driver_longitude;

  if (!showDriver || dLat == null || dLng == null) {
    return {
      phase: 'waiting',
      target: null,
      distance_meters: null,
      distance_label: null,
      eta_minutes: null,
      eta_label: null,
      proximity: 'waiting',
      client_message: order.driver ? 'Position du livreur en cours…' : 'En attente d\'un livreur',
    };
  }

  const toRestaurant = status === 'preparing';
  const targetLat = toRestaurant
    ? order.restaurant?.latitude
    : order.address?.latitude;
  const targetLng = toRestaurant
    ? order.restaurant?.longitude
    : order.address?.longitude;

  if (targetLat == null || targetLng == null) {
    return null;
  }

  const distance_meters = distanceMeters(dLat, dLng, targetLat, targetLng);
  const eta_minutes = Math.max(1, Math.ceil(distance_meters / METERS_PER_MINUTE));
  const distance_label = formatDistance(distance_meters);

  let proximity: TrackingProximity = 'far';
  if (distance_meters <= ARRIVAL_RADIUS_M) proximity = 'arrived';
  else if (eta_minutes <= 2) proximity = 'near';
  else if (eta_minutes <= 10) proximity = 'approaching';

  const firstName = order.driver?.name?.split(' ')[0] || 'Votre livreur';
  let client_message = `${firstName} est en route`;
  if (proximity === 'arrived') {
    client_message = `${firstName} est tout près de chez vous`;
  } else if (proximity === 'near') {
    client_message = `${firstName} arrive dans environ ${eta_minutes} minute${eta_minutes > 1 ? 's' : ''}`;
  } else if (proximity === 'approaching') {
    client_message = `${firstName} s'approche — ${distance_label}, ~${eta_minutes} min`;
  } else {
    client_message = `${firstName} est en route — environ ${eta_minutes} min`;
  }

  return {
    phase: toRestaurant ? 'to_restaurant' : 'to_customer',
    target: toRestaurant ? 'restaurant' : 'delivery',
    distance_meters: Math.round(distance_meters),
    distance_label,
    eta_minutes,
    eta_label: `environ ${eta_minutes} min`,
    proximity,
    client_message,
    show_driver_on_map: true,
    delivery_address_label: order.address?.label ?? null,
  };
}
