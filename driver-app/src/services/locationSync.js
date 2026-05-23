import api from './api';

const MIN_INTERVAL_MS = 8000;
const MIN_MOVE_METERS = 20;
const LOCATION_TIMEOUT_MS = 8000;
const MAX_BACKOFF_MS = 60000;

let lastSentAt = 0;
let lastSentLat = null;
let lastSentLng = null;
let inFlight = false;
let failCount = 0;
let lastFailLogAt = 0;

function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function shouldSend(latitude, longitude) {
  const now = Date.now();
  const backoff = Math.min(MAX_BACKOFF_MS, failCount * 5000);
  if (now - lastSentAt < MIN_INTERVAL_MS + backoff) {
    return false;
  }
  if (lastSentLat != null && lastSentLng != null) {
    const moved = distanceMeters(lastSentLat, lastSentLng, latitude, longitude);
    if (moved < MIN_MOVE_METERS && now - lastSentAt < MIN_INTERVAL_MS * 2) {
      return false;
    }
  }
  return true;
}

function logFailOnce(message) {
  const now = Date.now();
  if (now - lastFailLogAt < 15000) {
    return;
  }
  lastFailLogAt = now;
  console.warn('[locationSync]', message);
}

/**
 * Envoie la position au serveur (throttle + anti-pile de requêtes).
 * Ne bloque pas l'UI ; ignore si API injoignable.
 */
export async function syncDriverLocation(orderId, latitude, longitude) {
  if (!orderId || latitude == null || longitude == null) {
    return false;
  }
  if (!shouldSend(latitude, longitude)) {
    return false;
  }
  if (inFlight) {
    return false;
  }

  inFlight = true;
  try {
    await api.post(
      `/driver/orders/${orderId}/location`,
      { latitude, longitude },
      { timeout: LOCATION_TIMEOUT_MS }
    );
    lastSentAt = Date.now();
    lastSentLat = latitude;
    lastSentLng = longitude;
    failCount = 0;
    return true;
  } catch (e) {
    failCount = Math.min(failCount + 1, 12);
    const code = e?.code || e?.message || 'erreur';
    if (e?.response?.status) {
      logFailOnce(`API ${e.response.status} — vérifiez API_BASE_URL et php artisan serve`);
    } else {
      logFailOnce(
        `Connexion impossible (${code}). Émulateur → http://10.0.2.2:8000/api · Téléphone → IP du PC`
      );
    }
    return false;
  } finally {
    inFlight = false;
  }
}

export function resetLocationSync() {
  lastSentAt = 0;
  lastSentLat = null;
  lastSentLng = null;
  inFlight = false;
  failCount = 0;
}
