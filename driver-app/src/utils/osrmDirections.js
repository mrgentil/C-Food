/**
 * Itinéraire via OSRM (gratuit, sans clé Google / Mapbox).
 * Serveur public : limites en prod — prévoir instance OSRM dédiée si besoin.
 */
export async function fetchDrivingRoute(origin, destination) {
  if (!origin?.latitude || !destination?.latitude) {
    return null;
  }

  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${origin.longitude},${origin.latitude};` +
    `${destination.longitude},${destination.latitude}` +
    `?overview=full&geometries=geojson`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.code !== "Ok" || !data.routes?.[0]) {
    return null;
  }

  const route = data.routes[0];
  const coordinates = route.geometry.coordinates.map(([lng, lat]) => ({
    latitude: lat,
    longitude: lng,
  }));

  return {
    coordinates,
    durationMinutes: route.duration / 60,
    distanceKm: route.distance / 1000,
  };
}
