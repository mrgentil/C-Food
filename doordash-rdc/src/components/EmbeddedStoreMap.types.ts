import type { Restaurant } from '../types/domain';

export type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type EmbeddedStoreMapProps = {
  initialRegion: MapRegion;
  storesWithCoords: Restaurant[];
  selectedStoreId: string | null;
  onMarkerPress: (store: Restaurant) => void;
  /** Utilisé uniquement sur web (fallback sans carte native). */
  onOpenList?: () => void;
};
