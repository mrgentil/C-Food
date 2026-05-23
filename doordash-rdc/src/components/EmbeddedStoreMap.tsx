import React, { forwardRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import type MapView from 'react-native-maps';

import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import type { EmbeddedStoreMapProps } from './EmbeddedStoreMap.types';

/**
 * Carte embarquée sans clé Google:
 * - iOS/Android: tuiles OpenStreetMap (UrlTile) via react-native-maps
 * - web: fallback (react-native-maps n’y est pas supporté)
 *
 * Le `require('react-native-maps')` est dans la branche native uniquement pour que le bundle web ne charge pas le module natif.
 */
const EmbeddedStoreMap = forwardRef<MapView | null, EmbeddedStoreMapProps>(function EmbeddedStoreMap(
  { initialRegion, storesWithCoords, selectedStoreId, onMarkerPress, onOpenList },
  ref
) {
  if (Platform.OS === 'web') {
    return (
      <View style={webStyles.wrap}>
        <Text style={webStyles.title}>Carte (OpenStreetMap)</Text>
        <Text style={webStyles.sub}>
          La carte embarquée est disponible sur l’application iOS ou Android (build native ou Expo Go).
        </Text>
        <TouchableOpacity style={webStyles.btn} onPress={() => onOpenList?.()}>
          <Text style={webStyles.btnText}>Voir la liste</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { default: MapView, Marker, UrlTile } = require('react-native-maps') as typeof import('react-native-maps');

  return (
    <MapView
      ref={ref}
      style={StyleSheet.absoluteFill}
      initialRegion={initialRegion}
      showsUserLocation
      showsMyLocationButton={false}
    >
      <UrlTile
        /**
         * OSM raster tiles. Note: les serveurs publics ont des limites; pour la prod, utiliser un fournisseur ou un cache.
         */
        urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maximumZ={19}
        flipY={false}
      />
      {storesWithCoords.map((store) => (
        <Marker
          key={store.id}
          coordinate={{
            latitude: store.latitude as number,
            longitude: store.longitude as number,
          }}
          title={store.name}
          onPress={() => onMarkerPress(store)}
          pinColor={selectedStoreId === store.id ? COLORS.error : COLORS.primary}
        />
      ))}
    </MapView>
  );
});

const webStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  sub: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  btn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  btnText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
});

export default EmbeddedStoreMap;
