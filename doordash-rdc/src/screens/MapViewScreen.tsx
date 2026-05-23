import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import type MapView from 'react-native-maps';

import EmbeddedStoreMap from '../components/EmbeddedStoreMap';
import type { MapRegion } from '../components/EmbeddedStoreMap.types';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import { restaurantService } from '../services/restaurantService';
import { mapApiRestaurantToUi } from '../utils/mapApiToUi';
import type { Restaurant } from '../types/domain';

/** Kinshasa — région par défaut si aucune coordonnée connue */
const DEFAULT_REGION: MapRegion = {
  latitude: -4.3217,
  longitude: 15.3125,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

function regionFromStores(stores: Restaurant[]): MapRegion {
  const coords = stores.filter((s) => s.latitude != null && s.longitude != null);
  if (coords.length === 0) return DEFAULT_REGION;

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;
  for (const s of coords) {
    const lat = s.latitude as number;
    const lng = s.longitude as number;
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  }

  const midLat = (minLat + maxLat) / 2;
  const midLng = (minLng + maxLng) / 2;
  const latDelta = Math.max((maxLat - minLat) * 1.35, 0.015);
  const lngDelta = Math.max((maxLng - minLng) * 1.35, 0.015);

  return {
    latitude: midLat,
    longitude: midLng,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
}

const MapViewScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const category = route.params?.category;

  const mapRef = useRef<MapView | null>(null);

  const [selectedStore, setSelectedStore] = useState<Restaurant | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stores, setStores] = useState<Restaurant[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        const isStoreType =
          category === 'grocery' ||
          category === 'supermarket' ||
          category === 'alcohol' ||
          category === 'flowers' ||
          category === 'pharmacy' ||
          category === 'pet';
        const type = isStoreType ? category : 'restaurant';
        const res = await restaurantService.getAll(type);
        const rows = res.data;
        setStores(Array.isArray(rows) ? rows.map(mapApiRestaurantToUi) : []);
      } catch (err: any) {
        setStores([]);
        setError(err.response?.data?.message || err.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    })();
  }, [category]);

  const filteredStores = useMemo(() => stores, [stores]);

  const storesWithCoords = useMemo(
    () => filteredStores.filter((s) => s.latitude != null && s.longitude != null),
    [filteredStores]
  );

  const initialRegion = useMemo(() => regionFromStores(filteredStores), [filteredStores]);

  const markerCoordinates = useMemo(
    () =>
      storesWithCoords.map((s) => ({
        latitude: s.latitude as number,
        longitude: s.longitude as number,
      })),
    [storesWithCoords]
  );

  useEffect(() => {
    if (Platform.OS === 'web' || loading || markerCoordinates.length === 0) return;

    const id = setTimeout(() => {
      mapRef.current?.fitToCoordinates(markerCoordinates, {
        edgePadding: { top: 100, right: 36, bottom: 220, left: 36 },
        animated: true,
      });
    }, 300);

    return () => clearTimeout(id);
  }, [loading, markerCoordinates]);

  const fitAllStores = () => {
    if (Platform.OS === 'web' || markerCoordinates.length === 0) return;
    mapRef.current?.fitToCoordinates(markerCoordinates, {
      edgePadding: { top: 100, right: 36, bottom: 220, left: 36 },
      animated: true,
    });
  };

  const recenterOnUser = async () => {
    if (Platform.OS === 'web') return;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      mapRef.current?.animateToRegion(
        {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        },
        400
      );
    } catch {
      // permission or location failure — ignore
    }
  };

  const openInMaps = async (store: Restaurant) => {
    const lat = store.latitude;
    const lng = store.longitude;
    if (lat == null || lng == null) return;
    const label = encodeURIComponent(store.name);
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}(${label})`;
    await Linking.openURL(url);
  };

  const handleBack = () => {
    // Certains parcours ouvrent MapView sans historique stack (ou via navigate),
    // donc goBack() ne fait rien. On garde un fallback vers l’accueil.
    if (navigation.canGoBack?.()) navigation.goBack();
    else navigation.navigate('Main');
  };

  const renderStoreCard = (store: Restaurant) => (
    <TouchableOpacity
      key={store.id}
      style={styles.storeCard}
      onPress={() => setSelectedStore(store)}
    >
      <View style={styles.storeImagePlaceholder}>
        <Text style={styles.storeImageText}>{store.name[0]}</Text>
      </View>
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{store.name}</Text>
        <View style={styles.storeMeta}>
          <Text style={styles.storeRating}>★ {store.rating}</Text>
          <Text style={styles.storeDot}>•</Text>
          <Text style={styles.storeTime}>{store.deliveryTime}</Text>
          <Text style={styles.storeDot}>•</Text>
          <Text style={styles.storeDistance}>{store.distance}</Text>
        </View>
        <View style={styles.storeFooter}>
          <Text style={styles.storePrice}>{store.categories?.[0] ?? ''}</Text>
          <Text style={styles.storeDelivery}>{(store.deliveryFee ?? 0).toLocaleString()} FC</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMapBody = () => {
    if (loading) {
      return (
        <View style={styles.mapPlaceholder}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.mapSubtext}>Chargement...</Text>
        </View>
      );
    }

    return (
      <EmbeddedStoreMap
        ref={mapRef}
        initialRegion={initialRegion}
        storesWithCoords={storesWithCoords}
        selectedStoreId={selectedStore?.id ?? null}
        onMarkerPress={setSelectedStore}
        onOpenList={() => setViewMode('list')}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carte</Text>
        <TouchableOpacity onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}>
          <Text style={styles.toggleButton}>{viewMode === 'map' ? 'Liste' : 'Carte'}</Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'map' ? (
        <>
          <View style={styles.mapContainer}>
            {renderMapBody()}

            {!loading && error ? (
              <View style={styles.mapErrorOverlay} pointerEvents="box-none">
                <Text style={styles.mapErrorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity style={styles.locationButton} onPress={recenterOnUser} accessibilityLabel="Ma position">
              <Text style={styles.locationIcon}>📍</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.searchAreaButton} onPress={fitAllStores}>
              <Text style={styles.searchAreaText}>Ajuster la zone</Text>
            </TouchableOpacity>
          </View>

          {selectedStore && (
            <View style={styles.bottomCard}>
              {renderStoreCard(selectedStore)}
              {selectedStore.latitude != null && selectedStore.longitude != null ? (
                <TouchableOpacity style={styles.openMapsBtn} onPress={() => openInMaps(selectedStore)}>
                  <Text style={styles.openMapsText}>Ouvrir dans Maps</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.mapSubtext}>Coordonnées manquantes pour ce restaurant.</Text>
              )}
            </View>
          )}
        </>
      ) : (
        <ScrollView style={styles.listContainer}>
          {filteredStores.map(renderStoreCard)}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    zIndex: 10,
  },
  backButton: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  toggleButton: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  mapErrorOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    pointerEvents: 'none',
  },
  mapErrorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  mapSubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  locationButton: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.background,
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  locationIcon: {
    fontSize: FONT_SIZES.lg,
  },
  searchAreaButton: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  searchAreaText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  openMapsBtn: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  openMapsText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  bottomCard: {
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  listContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  storeCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  storeImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeImageText: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.background,
    fontWeight: '700',
  },
  storeInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  storeName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  storeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  storeRating: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    fontWeight: '500',
  },
  storeDot: {
    marginHorizontal: SPACING.xs,
    color: COLORS.textLight,
  },
  storeTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  storeDistance: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  storeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  storePrice: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  storeDelivery: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    fontWeight: '500',
  },
});

export default MapViewScreen;
