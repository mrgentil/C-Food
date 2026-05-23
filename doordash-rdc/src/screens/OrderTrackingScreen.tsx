import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  Dimensions,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import MapView, { Marker, Polyline, AnimatedRegion, MarkerAnimated, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { DriverMapMarker, useMarkerTracksPhoto } from '../components/tracking/DriverMapMarker';
import { TrackingProgressBar } from '../components/tracking/TrackingProgressBar';
import { DOORDASH_LIGHT_MAP_STYLE } from '../constants/mapStyle';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import { useOrderTracking } from '../hooks/useOrderTracking';
import { regionFromPoints, toCoordinate, type LatLng } from '../utils/coordinates';
import { resolvePhotoUrl } from '../utils/mediaUrl';
import { getTrackingMetrics } from '../utils/tracking';
import {
  formatEtaRange,
  formatPickedUpTime,
  getTrackingDescription,
  getTrackingHeadline,
  isOnTimeDelivery,
} from '../utils/trackingUi';
import type { RootStackParamList } from '../navigation/types';
import type { ApiOrderStatus } from '../types/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteParams = RouteProp<RootStackParamList, 'OrderTracking'>;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.48;

const STATUS_STEPS: { key: ApiOrderStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'pending', label: 'Reçue', icon: 'time-outline' },
  { key: 'preparing', label: 'Préparation', icon: 'restaurant' },
  { key: 'picked_up', label: 'Récupérée', icon: 'bag-check' },
  { key: 'delivering', label: 'En route', icon: 'bicycle' },
  { key: 'delivered', label: 'Livrée', icon: 'flag' },
];

function getStatusSteps(status: ApiOrderStatus) {
  const order = STATUS_STEPS.map((s) => s.key);
  const currentIndex = Math.max(0, order.indexOf(status));

  return STATUS_STEPS.map((step, index) => ({
    ...step,
    isActive: index === currentIndex,
    isCompleted: index < currentIndex,
  }));
}

function liveLabel(status: string, wsLive: boolean) {
  if (wsLive) return 'En direct';
  if (status === 'polling') return 'Mise à jour auto';
  if (status === 'connecting') return 'Connexion…';
  return 'Hors ligne';
}

function LiveBadge({ connected, liveStatus }: { connected: boolean; liveStatus: string }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!connected) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [connected, pulse]);

  const dotScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });

  return (
    <View style={styles.liveBadge}>
      <Animated.View
        style={[
          styles.liveDot,
          (connected || liveStatus === 'polling') && styles.liveDotOn,
          connected && { transform: [{ scale: dotScale }] },
        ]}
      />
      <Text style={styles.liveText}>{liveLabel(liveStatus, connected)}</Text>
    </View>
  );
}

export default function OrderTrackingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParams>();
  const { orderId: initialOrderId, order: initialOrder } = route.params || {};
  const orderId = String(initialOrder?.id || initialOrderId || '');

  const mapRef = useRef<MapView>(null);
  const sheetAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const nearAlertShown = useRef(false);
  const followDriverRef = useRef(true);
  const lastMapAnimateAt = useRef(0);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const { order, loading, error, connected, liveStatus } = useOrderTracking(orderId);
  const metrics = useMemo(() => getTrackingMetrics(order), [order]);

  const driverPhotoUri = resolvePhotoUrl(order?.driver?.photo);
  const tracksDriverMarker = useMarkerTracksPhoto(order?.driver?.photo);

  const restaurantCoord = useMemo(
    () => toCoordinate(order?.restaurant?.latitude, order?.restaurant?.longitude),
    [order?.restaurant?.latitude, order?.restaurant?.longitude]
  );

  const deliveryCoord = useMemo(
    () => toCoordinate(order?.address?.latitude, order?.address?.longitude),
    [order?.address?.latitude, order?.address?.longitude]
  );

  const driverCoord = useMemo((): LatLng | null => {
    if (order?.driver_latitude == null || order?.driver_longitude == null) {
      return null;
    }
    return toCoordinate(order.driver_latitude, order.driver_longitude, restaurantCoord);
  }, [order?.driver_latitude, order?.driver_longitude, restaurantCoord]);

  const driverRegion = useRef(
    new AnimatedRegion({
      latitude: restaurantCoord.latitude,
      longitude: restaurantCoord.longitude,
      latitudeDelta: 0,
      longitudeDelta: 0,
    })
  ).current;

  const mapPoints = useMemo(() => {
    const pts: LatLng[] = [restaurantCoord, deliveryCoord];
    if (driverCoord) {
      pts.push(driverCoord);
    }
    return pts;
  }, [restaurantCoord, deliveryCoord, driverCoord]);

  const mapRegion = useMemo(() => regionFromPoints(mapPoints), [mapPoints]);

  useEffect(() => {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [sheetAnim]);

  useEffect(() => {
    if (!driverCoord) {
      return;
    }
    driverRegion
      .timing({
        latitude: driverCoord.latitude,
        longitude: driverCoord.longitude,
        duration: 900,
        useNativeDriver: false,
      })
      .start();

    if (!followDriverRef.current || !mapRef.current) {
      return;
    }
    const now = Date.now();
    if (now - lastMapAnimateAt.current < 2500) {
      return;
    }
    lastMapAnimateAt.current = now;
    mapRef.current.animateToRegion(
      {
        ...driverCoord,
        latitudeDelta: Math.max(mapRegion.latitudeDelta * 0.85, 0.022),
        longitudeDelta: Math.max(mapRegion.longitudeDelta * 0.85, 0.022),
      },
      600
    );
  }, [driverCoord?.latitude, driverCoord?.longitude, mapRegion.latitudeDelta, mapRegion.longitudeDelta]);

  useEffect(() => {
    if (!metrics || metrics.proximity !== 'near' && metrics.proximity !== 'arrived') {
      return;
    }
    if (nearAlertShown.current) {
      return;
    }
    if (!['picked_up', 'delivering'].includes(order?.status || '')) {
      return;
    }
    nearAlertShown.current = true;
    Alert.alert(
      metrics.proximity === 'arrived' ? 'Livreur à proximité' : 'Livreur en approche',
      metrics.client_message,
      [{ text: 'OK' }]
    );
  }, [metrics?.proximity, metrics?.client_message, order?.status]);

  const deliveryAddressLabel =
    metrics?.delivery_address_label ||
    [order?.address?.street, order?.address?.neighborhood, order?.address?.city]
      .filter(Boolean)
      .join(', ');

  const statusSteps = order ? getStatusSteps(order.status) : [];
  const activeStep = statusSteps.find((s) => s.isActive);
  const showDriverOnMap = Boolean(order?.driver && (driverCoord || order.status !== 'pending'));
  const headline = order ? getTrackingHeadline(order.status) : 'Suivi en cours';
  const statusDescription = order ? getTrackingDescription(order, metrics) : '';
  const etaRange = formatEtaRange(order?.estimated_delivery);
  const onTime = order ? isOnTimeDelivery(order, metrics) : true;
  const restaurantImageUri = resolvePhotoUrl(order?.restaurant?.image);
  const deliveryProofUri = resolvePhotoUrl(order?.delivery_photo_url);
  const showPickupCard =
    order?.picked_up_at &&
    ['picked_up', 'delivering', 'delivered'].includes(order.status);

  const routeTarget =
    order && ['preparing'].includes(order.status) ? restaurantCoord : deliveryCoord;
  const showRouteLine =
    driverCoord &&
    order &&
    ['preparing', 'picked_up', 'delivering'].includes(order.status);

  const handleCallDriver = async () => {
    const raw = order?.driver?.phone;
    if (!order?.driver) {
      Alert.alert('Info', 'Aucun livreur assigné pour le moment');
      return;
    }
    if (raw == null || String(raw).trim() === '') {
      Alert.alert('Info', 'Numéro du livreur non disponible');
      return;
    }
    const phone = String(raw).trim().replace(/[^\d+]/g, '');
    try {
      await Linking.openURL(`tel:${phone}`);
    } catch {
      Alert.alert('Erreur', "Impossible d'ouvrir l'appel.");
    }
  };

  const handleChatDriver = () => {
    if (!orderId || !order?.driver) {
      Alert.alert('Info', 'Aucun livreur assigné pour le moment');
      return;
    }
    navigation.navigate('DriverChat', { orderId, driver: order.driver as any });
  };

  const recenterMap = () => {
    followDriverRef.current = true;
    lastMapAnimateAt.current = 0;
    const target = driverCoord || deliveryCoord;
    mapRef.current?.animateToRegion(
      {
        ...target,
        latitudeDelta: 0.022,
        longitudeDelta: 0.022,
      },
      400
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'Aide livraison',
      'Un problème avec votre commande ? Contactez le support C-Food ou discutez avec votre livreur.',
      [
        { text: 'OK', style: 'cancel' },
        ...(order?.driver
          ? [{ text: 'Contacter le livreur', onPress: handleChatDriver }]
          : []),
      ]
    );
  };

  const handleTip = () => {
    Alert.alert(
      'Pourboire',
      'Merci ! Le pourboire pour votre livreur sera bientôt disponible dans C-Food.',
      [{ text: 'OK' }]
    );
  };

  if (loading && !order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement du suivi…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        customMapStyle={Platform.OS === 'android' ? DOORDASH_LIGHT_MAP_STYLE : undefined}
        initialRegion={mapRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        rotateEnabled={false}
        onRegionChangeStart={() => {
          followDriverRef.current = false;
        }}
      >
        {showRouteLine ? (
          <Polyline
            coordinates={[driverCoord!, routeTarget]}
            strokeColor="#111827"
            strokeWidth={5}
            lineCap="round"
            lineJoin="round"
          />
        ) : null}
        <Marker coordinate={restaurantCoord} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={[styles.marker, { backgroundColor: COLORS.primary }]}>
            <Ionicons name="restaurant" size={18} color="#FFF" />
          </View>
        </Marker>

        <Marker coordinate={deliveryCoord} anchor={{ x: 0.5, y: 1 }}>
          <View style={styles.deliveryMarkerWrap}>
            {deliveryAddressLabel ? (
              <View style={styles.addressCallout}>
                <Text style={styles.addressCalloutText} numberOfLines={2}>
                  {deliveryAddressLabel}
                </Text>
              </View>
            ) : null}
            <View style={[styles.marker, { backgroundColor: COLORS.text }]}>
              <Ionicons name="home" size={18} color="#FFF" />
            </View>
          </View>
        </Marker>

        {showDriverOnMap ? (
          driverCoord ? (
            <MarkerAnimated coordinate={driverRegion} anchor={{ x: 0.5, y: 1 }} tracksViewChanges={tracksDriverMarker}>
              <DriverMapMarker name={order?.driver?.name || 'Livreur'} photo={order?.driver?.photo} />
            </MarkerAnimated>
          ) : (
            <Marker coordinate={restaurantCoord} anchor={{ x: 0.5, y: 1 }} tracksViewChanges={tracksDriverMarker}>
              <DriverMapMarker name={order?.driver?.name || 'Livreur'} photo={order?.driver?.photo} />
            </Marker>
          )
        ) : null}
      </MapView>

      <SafeAreaView style={styles.topBar} edges={['top']}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.helpButton} onPress={handleHelp}>
          <Text style={styles.helpButtonText}>Aide</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.mapControls}>
        <LiveBadge connected={connected} liveStatus={liveStatus} />
        <TouchableOpacity style={styles.mapControlBtn} onPress={recenterMap}>
          <Ionicons name="locate" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {metrics && order?.driver && metrics.proximity !== 'waiting' ? (
        <View
          style={[
            styles.trackingBanner,
            (metrics.proximity === 'near' || metrics.proximity === 'arrived') && styles.trackingBannerUrgent,
          ]}
        >
          <Ionicons
            name={metrics.proximity === 'arrived' ? 'checkmark-circle' : 'bicycle'}
            size={20}
            color={metrics.proximity === 'near' || metrics.proximity === 'arrived' ? '#047857' : COLORS.primary}
          />
          <View style={styles.trackingBannerTextWrap}>
            <Text
              style={[
                styles.trackingBannerTitle,
                (metrics.proximity === 'near' || metrics.proximity === 'arrived') && styles.trackingBannerTitleUrgent,
              ]}
            >
              {metrics.client_message}
            </Text>
            {metrics.distance_label && metrics.eta_minutes != null ? (
              <Text style={styles.trackingBannerSub}>
                {metrics.distance_label} · ~{metrics.eta_minutes} min
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}

      <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetAnim }] }]}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.sheetHandle} />

        <View style={styles.sheetHeaderRow}>
          <View style={styles.sheetHeaderLeft}>
            <View style={styles.sheetTitleRow}>
              <Text style={styles.statusTitle}>{headline}</Text>
              {onTime && order?.status !== 'delivered' ? (
                <View style={styles.onTimeBadge}>
                  <Text style={styles.onTimeText}>À l'heure</Text>
                </View>
              ) : null}
            </View>
            {etaRange ? <Text style={styles.etaRangeText}>{etaRange}</Text> : null}
          </View>
          {restaurantImageUri ? (
            <Image source={{ uri: restaurantImageUri }} style={styles.restaurantLogo} />
          ) : (
            <View style={styles.restaurantLogoPlaceholder}>
              <Ionicons name="restaurant" size={22} color={COLORS.primary} />
            </View>
          )}
        </View>

        <Text style={styles.statusDescription}>{statusDescription}</Text>

        <TrackingProgressBar steps={statusSteps} />

        {showPickupCard ? (
          <View style={styles.pickupCard}>
            <View style={styles.pickupCardHeader}>
              <Ionicons name="bag-check" size={20} color={COLORS.success} />
              <Text style={styles.pickupCardTitle}>Commande récupérée</Text>
              {formatPickedUpTime(order.picked_up_at) ? (
                <Text style={styles.pickupCardTime}>{formatPickedUpTime(order.picked_up_at)}</Text>
              ) : null}
            </View>
            {deliveryProofUri && order.status === 'delivered' ? (
              <Image source={{ uri: deliveryProofUri }} style={styles.pickupProofImage} />
            ) : (
              <Text style={styles.pickupCardSub}>
                Votre livreur a récupéré la commande au restaurant.
              </Text>
            )}
          </View>
        ) : null}

        {order?.driver ? (
          <View style={styles.driverRow}>
            {driverPhotoUri ? (
              <Image source={{ uri: driverPhotoUri }} style={styles.driverPhoto} />
            ) : (
              <View style={[styles.driverPhoto, styles.driverPhotoPlaceholder]}>
                <Ionicons name="person" size={24} color={COLORS.textSecondary} />
              </View>
            )}
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{order.driver.name}</Text>
              <Text style={styles.driverSub}>Votre livreur</Text>
            </View>
            <TouchableOpacity style={styles.tipBtn} onPress={handleTip}>
              <Text style={styles.tipBtnText}>Pourboire</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleCallDriver}>
              <Ionicons name="call" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleChatDriver}>
              <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.info} />
            </TouchableOpacity>
          </View>
        ) : null}

        {order?.items && order.items.length > 0 ? (
          <TouchableOpacity
            style={styles.detailsToggle}
            onPress={() => setDetailsExpanded((v) => !v)}
            activeOpacity={0.8}
          >
            <Text style={styles.detailsToggleText}>Détails de la commande</Text>
            <Ionicons
              name={detailsExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        ) : null}
        {detailsExpanded && order?.items ? (
          <View style={styles.itemsPreview}>
            <Text style={styles.itemsTitle}>
              {order.items.length} article{order.items.length > 1 ? 's' : ''} ·{' '}
              {order.total?.toLocaleString()} FC
            </Text>
            {order.items.map((i) => (
              <Text key={i.id} style={styles.itemLine}>
                {i.quantity}× {i.menu_item?.name || 'Article'}
              </Text>
            ))}
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  map: { ...StyleSheet.absoluteFillObject },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: { marginTop: SPACING.md, color: COLORS.textSecondary },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    zIndex: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  helpButton: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helpButtonText: { fontWeight: '700', fontSize: FONT_SIZES.sm, color: COLORS.text },
  mapControls: {
    position: 'absolute',
    top: 56,
    right: SPACING.md,
    alignItems: 'flex-end',
    gap: 10,
    zIndex: 11,
  },
  mapControlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  liveDotOn: { backgroundColor: COLORS.success },
  liveText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: SHEET_HEIGHT,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.sm,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  errorText: { color: COLORS.error, fontSize: FONT_SIZES.sm, marginBottom: SPACING.sm },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  sheetHeaderLeft: { flex: 1, paddingRight: SPACING.sm },
  sheetTitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  statusTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  onTimeBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onTimeText: { color: '#047857', fontSize: FONT_SIZES.xs, fontWeight: '800' },
  etaRangeText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
  },
  restaurantLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.backgroundSecondary,
  },
  restaurantLogoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  pickupCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  pickupCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  pickupCardTitle: { fontWeight: '700', fontSize: FONT_SIZES.md, color: COLORS.text, flex: 1 },
  pickupCardTime: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  pickupCardSub: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  pickupProofImage: {
    width: '100%',
    height: 120,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.border,
  },
  tipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 4,
  },
  tipBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.text },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    marginTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  detailsToggleText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  itemLine: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 4 },
  trackingBanner: {
    position: 'absolute',
    top: 112,
    left: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.card,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  trackingBannerUrgent: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0' },
  trackingBannerTextWrap: { flex: 1 },
  trackingBannerTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  trackingBannerTitleUrgent: { color: '#047857' },
  trackingBannerSub: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  deliveryMarkerWrap: { alignItems: 'center' },
  addressCallout: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 6,
    maxWidth: 200,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  addressCalloutText: { fontSize: 11, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  driverPhoto: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.backgroundSecondary,
  },
  driverPhotoPlaceholder: {
    position: 'absolute',
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverInfo: { flex: 1 },
  driverName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  driverSub: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemsPreview: { marginTop: SPACING.sm },
  itemsTitle: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  itemsNames: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  marker: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFF',
  },
});
