import type { ApiOrderStatus, ApiOrderTracking } from '../types/api';
import type { OrderTrackingMetrics } from './tracking';

/** Titre principal type DoorDash (« En route vers vous ») */
export function getTrackingHeadline(status: ApiOrderStatus): string {
  switch (status) {
    case 'pending':
      return 'Commande reçue';
    case 'preparing':
      return 'Préparation en cours';
    case 'picked_up':
      return 'En route vers vous';
    case 'delivering':
      return 'En route vers vous';
    case 'delivered':
      return 'Commande livrée';
    case 'cancelled':
      return 'Commande annulée';
    default:
      return 'Suivi en cours';
  }
}

/** Sous-texte descriptif (phrase complète) */
export function getTrackingDescription(
  order: ApiOrderTracking,
  metrics: OrderTrackingMetrics | null
): string {
  const restaurant = order.restaurant?.name || 'Le restaurant';
  const driver = order.driver?.name?.split(' ')[0] || 'Votre livreur';

  if (metrics?.client_message && order.driver) {
    return metrics.client_message;
  }

  switch (order.status) {
    case 'preparing':
      return `${restaurant} prépare votre commande. ${order.driver ? `${driver} se dirige vers le restaurant.` : 'Un livreur sera assigné sous peu.'}`;
    case 'picked_up':
    case 'delivering':
      return `${driver} est en route vers votre adresse. Nous vous préviendrons quand il sera proche.`;
    case 'delivered':
      return 'Votre commande a été livrée. Bon appétit !';
    default:
      return 'Suivi de votre commande en temps réel.';
  }
}

/** Fourchette horaire « 14:30 – 14:40 » */
export function formatEtaRange(
  estimatedIso?: string | null,
  windowMinutes = 5
): string | null {
  if (!estimatedIso) {
    return null;
  }
  const center = new Date(estimatedIso);
  if (Number.isNaN(center.getTime())) {
    return null;
  }
  const start = new Date(center.getTime() - windowMinutes * 60 * 1000);
  const end = new Date(center.getTime() + windowMinutes * 60 * 1000);
  const fmt = (d: Date) =>
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${fmt(start)} – ${fmt(end)}`;
}

/** Badge vert « À l'heure » si l'ETA live tient dans le créneau */
export function isOnTimeDelivery(
  order: ApiOrderTracking,
  metrics: OrderTrackingMetrics | null
): boolean {
  if (!order.estimated_delivery || order.status === 'delivered' || order.status === 'cancelled') {
    return true;
  }
  const slotEnd = new Date(order.estimated_delivery);
  slotEnd.setMinutes(slotEnd.getMinutes() + 8);
  const etaMin = metrics?.eta_minutes;
  if (etaMin == null) {
    return true;
  }
  const projected = new Date(Date.now() + etaMin * 60 * 1000);
  return projected.getTime() <= slotEnd.getTime();
}

export function formatPickedUpTime(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
