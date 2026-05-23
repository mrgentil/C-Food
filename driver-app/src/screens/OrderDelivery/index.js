import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Image,
  Platform
} from "react-native";
import { FontAwesome5, Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import MapView, { Marker, Polyline, UrlTile } from "react-native-maps";
import * as Location from "expo-location";
import { fetchDrivingRoute } from "../../utils/osrmDirections";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import * as ImagePicker from 'expo-image-picker';
import api from "../../services/api";
import { config } from "../../config";
import { syncDriverLocation, resetLocationSync } from "../../services/locationSync";
import {
  startDeliveryLocationTracking,
  stopDeliveryLocationTracking,
  shouldTrackForStatus,
} from "../../services/locationTracking";
import { distanceMeters, formatDistance, ARRIVAL_RADIUS_M, etaMinutesFromMeters } from "../../utils/geo";
import { formatPrice } from "../../utils/formatters";
import { mapDriverOrder } from "../../utils/mapDriverOrder";
import { DriverOrderReceipt } from "../../components/DriverOrderReceipt";

const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

function getActiveDestination(status, restaurant, delivery) {
  const toRestaurant = ["preparing", "arrived_at_restaurant"].includes(status);
  if (toRestaurant) {
    return {
      point: restaurant,
      label: "restaurant",
      labelFr: "du restaurant",
      arrivedHint: "Sur place au restaurant",
    };
  }
  return {
    point: delivery,
    label: "client",
    labelFr: "du client",
    arrivedHint: "Sur place chez le client",
  };
}

const OrderDelivery = ({ navigation, route }) => {
  const { order: orderParam, readOnly } = route.params || {};
  const [orderDetail, setOrderDetail] = useState(orderParam || null);
  const order = orderDetail || orderParam;
  const isHistoryView =
    readOnly || order?.status === "delivered" || order?.status === "cancelled";
  const { driverProfile } = useAuth();

  const [receiptLoading, setReceiptLoading] = useState(
    !!orderParam?.id && orderParam.paymentStatus == null
  );

  useEffect(() => {
    if (!orderParam?.id) {
      setOrderDetail(null);
      setReceiptLoading(false);
      return;
    }
    if (orderParam.paymentStatus != null) {
      setOrderDetail(orderParam);
      setReceiptLoading(false);
      return;
    }
    let cancelled = false;
    setReceiptLoading(true);
    (async () => {
      try {
        const res = await api.get(`/driver/orders/${orderParam.id}`);
        const row = res?.data?.data;
        if (!cancelled && row) {
          setOrderDetail(mapDriverOrder(row, driverProfile?.id));
        }
      } catch {
        if (!cancelled) setOrderDetail(orderParam);
      } finally {
        if (!cancelled) setReceiptLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderParam?.id, orderParam?.paymentStatus, driverProfile?.id]);

  const [driverLocation, setDriverLocation] = useState(null);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [totalKm, setTotalKm] = useState(0);
  const [orderStatus, setOrderStatus] = useState(orderParam?.status || "preparing");
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); // Chat Firebase removed for now
  const [proofImage, setProofImage] = useState(
    orderParam?.deliveryPhotoURL || null
  );
  const [uploadingProof, setUploadingProof] = useState(false);
  const [locationWatcher, setLocationWatcher] = useState(null);
  const [routeTrail, setRouteTrail] = useState([]);
  const [followDriver, setFollowDriver] = useState(true);
  const [gpsActive, setGpsActive] = useState(false);
  const [lastGpsAt, setLastGpsAt] = useState(null);
  const [distanceToDestination, setDistanceToDestination] = useState(null);
  const [showDirections, setShowDirections] = useState(true);
  const [routePolyline, setRoutePolyline] = useState([]);

  useEffect(() => {
    const url = order?.deliveryPhotoURL;
    if (url) setProofImage((prev) => prev || url);
  }, [order?.deliveryPhotoURL]);

  const mapRef = useRef(null);
  const followDriverRef = useRef(true);
  const lastMapAnimateAt = useRef(0);
  const directionsOriginRef = useRef(null);

  const { width, height } = useWindowDimensions();

  const clientFullName = `${order?.userFirstName || ""} ${order?.userLastName || ""}`.trim() || "Client";
  const clientInitials = clientFullName
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const restaurantLocation = useMemo(
    () => ({
      latitude: Number(order?.restaurantLatitude) || -4.4419,
      longitude: Number(order?.restaurantLongitude) || 15.2663,
    }),
    [order?.restaurantLatitude, order?.restaurantLongitude]
  );

  const deliveryLocation = useMemo(
    () => ({
      latitude: Number(order?.userLatitude) || -4.4419,
      longitude: Number(order?.userLongitude) || 15.2663,
    }),
    [order?.userLatitude, order?.userLongitude]
  );

  const activeDestination = useMemo(
    () => getActiveDestination(orderStatus, restaurantLocation, deliveryLocation),
    [orderStatus, restaurantLocation, deliveryLocation]
  );

  const isAtDestination =
    distanceToDestination != null && distanceToDestination <= ARRIVAL_RADIUS_M;

  useEffect(() => {
    getDriverLocation();
  }, []);

  const updateDriverPosition = useCallback((latitude, longitude) => {
    if (order?.id) syncDriverLocation(order.id, latitude, longitude);
  }, [order?.id]);

  const onGpsUpdate = useCallback(
    (latitude, longitude) => {
      setDriverLocation({ latitude, longitude });
      setGpsActive(true);
      setLastGpsAt(new Date());

      const dest = getActiveDestination(orderStatus, restaurantLocation, deliveryLocation);
      const meters = distanceMeters(
        latitude,
        longitude,
        dest.point.latitude,
        dest.point.longitude
      );
      setDistanceToDestination(meters);

      setRouteTrail((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.latitude === latitude && last.longitude === longitude) {
          return prev;
        }
        const next = [...prev, { latitude, longitude }];
        return next.length > 100 ? next.slice(-100) : next;
      });
      if (shouldTrackForStatus(orderStatus)) {
        updateDriverPosition(latitude, longitude);
      }
    },
    [orderStatus, updateDriverPosition, restaurantLocation, deliveryLocation]
  );

  // Suivi GPS continu sur l'écran livraison (carte + trace)
  useEffect(() => {
    let watcher = null;
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted" || cancelled) return;

      watcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 8000,
          distanceInterval: 15,
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          onGpsUpdate(latitude, longitude);
        }
      );
      if (!cancelled) {
        setLocationWatcher(watcher);
      }
    })();

    return () => {
      cancelled = true;
      watcher?.remove();
    };
  }, [order.id, onGpsUpdate]);

  // TaskManager arrière-plan + envoi serveur selon le statut
  useEffect(() => {
    const syncBackground = async () => {
      if (shouldTrackForStatus(orderStatus)) {
        await startDeliveryLocationTracking(order.id);
      } else {
        await stopDeliveryLocationTracking();
      }
    };
    syncBackground();
  }, [orderStatus, order.id]);

  useEffect(() => {
    followDriverRef.current = followDriver;
  }, [followDriver]);

  // Centrer la carte (debounce) — ne pas combattre le doigt de l'utilisateur
  useEffect(() => {
    if (!followDriverRef.current || !driverLocation || !mapRef.current) return;
    const now = Date.now();
    if (now - lastMapAnimateAt.current < 2500) return;
    lastMapAnimateAt.current = now;
    mapRef.current.animateToRegion(
      {
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
        latitudeDelta: 0.022,
        longitudeDelta: 0.022,
      },
      500
    );
  }, [driverLocation?.latitude, driverLocation?.longitude]);

  // Itinéraire OSRM (OpenStreetMap, sans Google)
  const routeDestination = activeDestination.point;
  useEffect(() => {
    if (!driverLocation || !showDirections || !routeDestination?.latitude) {
      return;
    }

    const prev = directionsOriginRef.current;
    const moved =
      !prev ||
      distanceMeters(prev.latitude, prev.longitude, driverLocation.latitude, driverLocation.longitude) > 80;

    if (!moved) return;

    directionsOriginRef.current = { ...driverLocation };

    let cancelled = false;
    (async () => {
      try {
        const route = await fetchDrivingRoute(
          directionsOriginRef.current || driverLocation,
          routeDestination
        );
        if (cancelled || !route) {
          if (!cancelled) setRoutePolyline([]);
          return;
        }
        setRoutePolyline(route.coordinates);
        setTotalMinutes(Math.round(route.durationMinutes));
        setTotalKm(route.distanceKm);
      } catch {
        if (!cancelled) {
          setRoutePolyline([]);
          setShowDirections(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    driverLocation?.latitude,
    driverLocation?.longitude,
    orderStatus,
    showDirections,
    routeDestination?.latitude,
    routeDestination?.longitude,
  ]);

  useEffect(() => {
    return () => {
      stopDeliveryLocationTracking();
      resetLocationSync();
      if (locationWatcher) {
        locationWatcher.remove();
      }
    };
  }, []);

  // Chat via Firestore removed: later we will add driver chat endpoints in Laravel.
  useEffect(() => {
    setUnreadCount(0);
  }, [order?.id]);

  const getDriverLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission refusée", "L'accès à la localisation est nécessaire");
      // Fallback pour continuer malgré le refus
      setDriverLocation({ latitude: -4.3250, longitude: 15.3222 });
      return;
    }
    try {
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      });
      setDriverLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.warn("⚠️ GPS indisponible, tentative dernière position connue...", error.message);
      try {
        const last = await Location.getLastKnownPositionAsync();
        if (last) {
          setDriverLocation({
            latitude: last.coords.latitude,
            longitude: last.coords.longitude,
          });
          return;
        }
      } catch (_) {}
      // Fallback : centre de Kinshasa (simulateur / émulateur)
      console.warn("📍 Fallback GPS → Kinshasa (-4.3250, 15.3222)");
      setDriverLocation({ latitude: -4.3250, longitude: 15.3222 });
    }
  };

  const hasDeliveryProof = () =>
    !!(proofImage || order?.deliveryPhotoURL);

  const pickProofAsset = (result) => {
    if (!result.canceled && result.assets?.[0]?.uri) {
      setProofImage(result.assets[0].uri);
    }
  };

  const takeProofPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission refusée",
        "Autorisez la caméra pour prendre la preuve de livraison."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6,
    });
    pickProofAsset(result);
  };

  const pickProofFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission refusée",
        "Autorisez l'accès aux photos pour joindre une preuve."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6,
    });
    pickProofAsset(result);
  };

  const uploadProofImage = async (uri) => {
    setUploadingProof(true);
    const CLOUDINARY_URL = config.CLOUDINARY_URL;
    const UPLOAD_PRESET = config.CLOUDINARY_UPLOAD_PRESET;

    try {
      const formData = new FormData();
      formData.append("file", {
        uri: uri,
        type: "image/jpeg",
        name: "delivery_proof.jpg",
      });
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("folder", "delivery-proofs");

      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        }
      });

      const data = await response.json();
      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error("Erreur upload Cloudinary");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Erreur", "Impossible d'envoyer la photo");
      return null;
    } finally {
      setUploadingProof(false);
    }
  };


  const needsCashCollection =
    order?.requiresCashCollection ||
    order?.paymentStatus === "pending_cash";

  const updateOrderStatus = async (newStatus, { cashCollected = false } = {}) => {
    setLoading(true);
    try {
      let photoURL = null;

      if (newStatus === "delivered") {
        const localUri = proofImage;
        const existingUrl = order?.deliveryPhotoURL;
        const isRemote =
          existingUrl &&
          (existingUrl.startsWith("http://") ||
            existingUrl.startsWith("https://"));

        if (localUri && !isRemote) {
          photoURL = await uploadProofImage(localUri);
          if (!photoURL) {
            setLoading(false);
            return;
          }
        } else if (isRemote) {
          photoURL = existingUrl;
        } else if (localUri) {
          photoURL = await uploadProofImage(localUri);
          if (!photoURL) {
            setLoading(false);
            return;
          }
        }
      }

      await api.post(`/driver/orders/${order.id}/status`, {
        status: newStatus,
        ...(photoURL ? { delivery_photo_url: photoURL } : {}),
        ...(newStatus === "delivered" && cashCollected ? { cash_collected: true } : {}),
      });

      setOrderStatus(newStatus);
      if (newStatus === "delivered" && cashCollected) {
        setOrderDetail((prev) =>
          prev
            ? {
                ...prev,
                requiresCashCollection: false,
                cashCollected: true,
                isPaid: true,
                paymentStatus: "paid",
                paymentStatusLabel: "Payé",
              }
            : prev
        );
      }

      if (newStatus === 'delivered') {
        await stopDeliveryLocationTracking();
      } else if (shouldTrackForStatus(newStatus)) {
        await startDeliveryLocationTracking(order.id);
      }
    } catch (e) {
      console.error("Erreur mise à jour:", e);
      const data = e?.response?.data;
      const msg =
        data?.message ||
        (data?.requires_delivery_photo
          ? "Prenez une photo du colis remis au client."
          : e?.response?.status === 422
            ? "Confirmez l'encaissement des espèces avant de clôturer."
            : "Impossible de mettre à jour le statut");
      Alert.alert("Erreur", msg);
    }
    setLoading(false);
  };

  const getButtonConfig = () => {
    switch (orderStatus) {
      case 'preparing':
        return { label: "🏢 Arrivé au restaurant", color: "#0EA5E9", nextStatus: "arrived_at_restaurant" };
      case 'arrived_at_restaurant':
        return { label: "📦 Commande Récupérée", color: "#3B82F6", nextStatus: "picked_up" };
      case 'picked_up':
        return { label: "📍 Arrivé chez le client", color: "#F59E0B", nextStatus: "arrived_at_customer" };
      case 'arrived_at_customer':
        return { label: "✅ Commande Livrée", color: "#10B981", nextStatus: "delivered" };
      case 'delivered':
      case 'cancelled':
        return { label: "⬅️ Retour à l'historique", color: "#111C44", isHistory: true };
      default:
        return isHistoryView
          ? { label: "⬅️ Retour à l'historique", color: "#111C44", isHistory: true }
          : null;
    }
  };

  const handleMainAction = () => {
    const config = getButtonConfig();
    if (!config) return;

    if (config.isHistory) {
      navigation.goBack();
      return;
    }

    if (config.nextStatus === "delivered") {
      if (!hasDeliveryProof()) {
        Alert.alert(
          "Photo obligatoire",
          "Prenez une photo montrant le colis remis au client (porte, sac, main du client…) avant de clôturer la livraison."
        );
        return;
      }

      const totalLabel = formatPrice(order?.total);

      if (needsCashCollection) {
        Alert.alert(
          "Encaissement espèces",
          `Confirmez avoir remis la commande au client et encaissé ${totalLabel} en espèces.`,
          [
            { text: "Annuler", style: "cancel" },
            {
              text: "Espèces reçues",
              onPress: () => {
                Alert.alert(
                  "Clôturer la livraison",
                  `Montant encaissé : ${totalLabel}\n\nConfirmer la livraison ?`,
                  [
                    { text: "Retour", style: "cancel" },
                    {
                      text: "Confirmer",
                      onPress: async () => {
                        await updateOrderStatus("delivered", { cashCollected: true });
                        Alert.alert(
                          "Bravo !",
                          "Livraison et encaissement enregistrés.",
                          [{ text: "OK", onPress: () => navigation.goBack() }]
                        );
                      },
                    },
                  ]
                );
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Livraison terminée",
          "Confirmez-vous avoir livré la commande au client ?",
          [
            { text: "Annuler", style: "cancel" },
            {
              text: "Oui, livrée",
              onPress: async () => {
                await updateOrderStatus("delivered");
                Alert.alert("Bravo !", "Livraison effectuée avec succès !", [
                  { text: "OK", onPress: () => navigation.goBack() },
                ]);
              },
            },
          ]
        );
      }
    } else {
      updateOrderStatus(config.nextStatus);
    }
  };

  const openMap = (lat, lng, label) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lng}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://maps.google.com/?q=${latLng}`);
    });
  };

  const callClient = () => {
    const phone = order.userPhoneNumber || order.userPhone;
    if (phone) Linking.openURL(`tel:${phone}`);
    else Alert.alert("Erreur", "Numéro non disponible");
  };

  const openChat = () => {
    navigation.navigate("ChatScreen", {
      orderId: order.id,
      clientName: `${order.userFirstName} ${order.userLastName}`,
      clientId: order.userId
    });
  };


  const buttonConfig = getButtonConfig();
  const mapCenter = driverLocation || restaurantLocation;
  const directionsOrigin = driverLocation || restaurantLocation;
  const isTrackingServer = shouldTrackForStatus(orderStatus);
  const destPoint = activeDestination.point;
  const etaMinutes = etaMinutesFromMeters(distanceToDestination);
  const distanceLabel = isAtDestination
    ? activeDestination.arrivedHint
    : etaMinutes != null
      ? `Environ ${etaMinutes} min ${activeDestination.labelFr} (${formatDistance(distanceToDestination)})`
      : distanceToDestination != null
        ? `${formatDistance(distanceToDestination)} ${activeDestination.labelFr}`
        : "Calcul distance…";

  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3FC060" />
        <Text style={{ marginTop: 12, color: '#64748B' }}>Chargement…</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map - 40% height */}
      <View style={{ height: height * 0.4 }}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          showsUserLocation={false}
          showsMyLocationButton={false}
          rotateEnabled={false}
          pitchEnabled={false}
          onRegionChangeStart={() => {
            followDriverRef.current = false;
            setFollowDriver(false);
          }}
          initialRegion={{
            latitude: mapCenter.latitude,
            longitude: mapCenter.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <UrlTile
            urlTemplate={OSM_TILE_URL}
            maximumZ={19}
            flipY={false}
          />
          {routeTrail.length >= 2 ? (
            <Polyline
              coordinates={routeTrail}
              strokeColor="rgba(14, 165, 233, 0.55)"
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
            />
          ) : null}
          {routePolyline.length >= 2 && showDirections ? (
            <Polyline
              coordinates={routePolyline}
              strokeWidth={5}
              strokeColor="#0EA5E9"
              lineCap="round"
              lineJoin="round"
            />
          ) : null}
          {driverLocation ? (
            <Marker coordinate={driverLocation} title="Vous" anchor={{ x: 0.5, y: 0.5 }} zIndex={999}>
              {driverProfile?.photoURL ? (
                <Image source={{ uri: driverProfile.photoURL }} style={styles.driverPhoto} />
              ) : (
                <View style={styles.driverMarker}>
                  <MaterialCommunityIcons name="motorbike" size={22} color="#FFF" />
                </View>
              )}
            </Marker>
          ) : null}
          <Marker coordinate={restaurantLocation} title={order.restaurantName}>
            <View style={[styles.marker, { backgroundColor: (orderStatus === 'preparing' || orderStatus === 'arrived_at_restaurant') ? '#0EA5E9' : '#6B7280' }]}>
              <MaterialIcons name="restaurant" size={20} color="white" />
            </View>
          </Marker>
          <Marker coordinate={deliveryLocation} title={clientFullName} anchor={{ x: 0.5, y: 1 }}>
            <View style={styles.deliveryPinWrap}>
              {order.userAddress ? (
                <View style={styles.addressMapCallout}>
                  <Text style={styles.addressMapCalloutTitle}>Livraison client</Text>
                  <Text style={styles.addressMapCalloutText} numberOfLines={3}>
                    {order.userAddress}
                  </Text>
                </View>
              ) : null}
              {order.userPhotoURL ? (
                <Image source={{ uri: order.userPhotoURL }} style={styles.clientMapPhoto} />
              ) : (
                <View style={[styles.marker, { backgroundColor: (orderStatus === 'picked_up' || orderStatus === 'arrived_at_customer') ? '#0EA5E9' : '#111C44' }]}>
                  <FontAwesome5 name="user" size={18} color="white" />
                </View>
              )}
            </View>
          </Marker>
        </MapView>

        {!driverLocation ? (
          <View style={styles.mapLoading}>
            <ActivityIndicator size="small" color="#0EA5E9" />
            <Text style={styles.mapLoadingText}>Acquisition GPS…</Text>
          </View>
        ) : null}

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111C44" />
        </TouchableOpacity>

        <View style={[styles.liveBadge, isTrackingServer && styles.liveBadgeOn]}>
          <View style={[styles.liveDot, gpsActive && styles.liveDotOn]} />
          <Text style={styles.liveText}>
            {isTrackingServer ? 'Partagé avec le client' : 'GPS local'}
          </Text>
        </View>

        <View style={[styles.distanceBanner, isAtDestination && styles.distanceBannerArrived]}>
          <Ionicons
            name={isAtDestination ? "checkmark-circle" : "navigate"}
            size={18}
            color={isAtDestination ? "#059669" : "#0EA5E9"}
          />
          <Text style={[styles.distanceBannerText, isAtDestination && styles.distanceBannerTextArrived]}>
            {distanceLabel}
          </Text>
          {!isAtDestination && etaMinutes != null ? (
            <Text style={styles.distanceBannerEta}> · ~{etaMinutes} min</Text>
          ) : null}
        </View>

        {driverLocation ? (
          <TouchableOpacity
            style={styles.recenterBtn}
            onPress={() => {
              followDriverRef.current = true;
              setFollowDriver(true);
              lastMapAnimateAt.current = 0;
              mapRef.current?.animateToRegion({
                latitude: driverLocation.latitude,
                longitude: driverLocation.longitude,
                latitudeDelta: 0.018,
                longitudeDelta: 0.018,
              }, 400);
            }}
          >
            <Ionicons name="locate" size={22} color="#0EA5E9" />
          </TouchableOpacity>
        ) : null}

        {lastGpsAt ? (
          <Text style={styles.gpsTime}>
            Position {lastGpsAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </Text>
        ) : null}

        <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.statusText, { color: '#D97706' }]} numberOfLines={1}>
            {buttonConfig?.label || 'COMMANDE'}
          </Text>
        </View>
      </View>

      {/* Details - 60% height */}
      <ScrollView style={styles.detailsContainer} contentContainerStyle={{ paddingBottom: 150 }}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalMinutes > 0 ? Math.round(totalMinutes) : "—"}</Text>
            <Text style={styles.statLabel}>min (route)</Text>
          </View>
          <View style={[styles.statHighlight, isAtDestination && styles.statHighlightArrived]}>
            <Text style={[styles.statHighlightValue, isAtDestination && styles.statHighlightValueArrived]}>
              {isAtDestination ? "Sur place" : etaMinutes != null ? `~${etaMinutes} min` : formatDistance(distanceToDestination)}
            </Text>
            <Text style={styles.statHighlightLabel}>
              {isAtDestination
                ? activeDestination.label === "client"
                  ? "Chez le client"
                  : "Au restaurant"
                : `${formatDistance(distanceToDestination)} · ${activeDestination.label}`}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalKm > 0 ? totalKm.toFixed(1) : "—"}</Text>
            <Text style={styles.statLabel}>km (route)</Text>
          </View>
        </View>

        {/* Restaurant */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.sectionTitle}>{order.restaurantName}</Text>
            <Text style={styles.sectionSubtitle}>{order.restaurantAddress}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => openMap(order.restaurantLatitude, order.restaurantLongitude, order.restaurantName)}
          >
            <Ionicons name="navigate-circle" size={40} color="#0EA5E9" />
          </TouchableOpacity>
        </View>

        {/* Client */}
        <View style={styles.clientCard}>
          <View style={styles.clientHeader}>
            {order.userPhotoURL ? (
              <Image source={{ uri: order.userPhotoURL }} style={styles.clientAvatar} />
            ) : (
              <View style={styles.clientAvatarPlaceholder}>
                <Text style={styles.clientAvatarInitials}>{clientInitials || "?"}</Text>
              </View>
            )}
            <View style={styles.clientHeaderText}>
              <Text style={styles.clientName}>{clientFullName}</Text>
              <Text style={styles.clientDistance}>
                {activeDestination.label === "client"
                  ? isAtDestination
                    ? "✓ Vous êtes chez le client"
                    : `À ${formatDistance(distanceToDestination)} du client`
                  : isAtDestination
                    ? "✓ Vous êtes au restaurant"
                    : `À ${formatDistance(distanceToDestination)} du restaurant`}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={[styles.clientRow, { flex: 1, paddingRight: 10 }]}>
              <FontAwesome5 name="map-marker-alt" size={16} color="#0EA5E9" />
              <Text style={styles.clientAddress}>{order.userAddress}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => openMap(order.userLatitude, order.userLongitude, clientFullName)}
            >
              <Ionicons name="navigate-circle" size={40} color="#0EA5E9" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Preuve de livraison */}
        {isHistoryView && (proofImage || order?.deliveryPhotoURL) ? (
          <View style={styles.proofContainer}>
            <Text style={styles.proofTitle}>Preuve de livraison</Text>
            <Image
              source={{ uri: proofImage || order?.deliveryPhotoURL }}
              style={styles.proofPreviewHistory}
            />
          </View>
        ) : null}

        {!isHistoryView &&
        ["arrived_at_customer", "delivering"].includes(orderStatus) ? (
          <View style={styles.proofContainer}>
            <Text style={styles.proofTitle}>
              Preuve de livraison <Text style={styles.proofRequired}>*</Text>
            </Text>
            <Text style={styles.proofHint}>
              Photo du colis remis (obligatoire pour clôturer). Visible par l'admin et
              l'établissement.
            </Text>
            <TouchableOpacity
              onPress={takeProofPhoto}
              style={styles.photoButton}
              disabled={uploadingProof}
            >
              {proofImage ? (
                <Image source={{ uri: proofImage }} style={styles.proofPreview} />
              ) : (
                <View style={styles.cameraPlaceholder}>
                  <Ionicons name="camera" size={32} color="#6B7280" />
                  <Text style={styles.cameraText}>Prendre une photo</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={pickProofFromGallery}
              style={styles.galleryButton}
              disabled={uploadingProof}
            >
              <Ionicons name="images-outline" size={18} color="#0EA5E9" />
              <Text style={styles.galleryButtonText}>Choisir depuis la galerie</Text>
            </TouchableOpacity>
            {uploadingProof ? (
              <ActivityIndicator size="small" color="#0EA5E9" style={{ marginTop: 8 }} />
            ) : proofImage ? (
              <Text style={styles.photoTakenText}>Photo prête — vous pouvez livrer ✅</Text>
            ) : (
              <Text style={styles.photoMissingText}>Photo requise avant « Commande livrée »</Text>
            )}
          </View>
        ) : null}

        {/* Contact Buttons */}
        <View style={styles.contactRow}>
          <TouchableOpacity onPress={callClient} style={[styles.contactButton, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="call" size={20} color="#3B82F6" />
            <Text style={[styles.contactText, { color: '#3B82F6' }]}>Appeler</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={openChat} style={[styles.contactButton, { backgroundColor: '#F0F9FF', position: 'relative' }]}>
            <Ionicons name="chatbubble" size={20} color="#0EA5E9" />
            <Text style={[styles.contactText, { color: '#0EA5E9' }]}>Message</Text>
            {unreadCount > 0 && (
              <View style={{
                position: 'absolute',
                top: -5,
                right: -5,
                backgroundColor: '#EF4444',
                width: 20,
                height: 20,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: 'white'
              }}>
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>!</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {receiptLoading ? (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <ActivityIndicator color="#3FC060" />
            <Text style={{ marginTop: 8, color: '#64748B', fontSize: 13 }}>Chargement du reçu…</Text>
          </View>
        ) : (
          <DriverOrderReceipt order={order} />
        )}
      </ScrollView>

      {/* Action Button */}
      {buttonConfig && (
        <TouchableOpacity
          onPress={handleMainAction}
          disabled={loading || uploadingProof}
          style={[styles.actionButton, { backgroundColor: buttonConfig.color }]}
        >
          {loading || uploadingProof ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator color="white" style={{ marginRight: 10 }} />
              <Text style={styles.actionText}>{uploadingProof ? 'Envoi photo...' : 'Chargement...'}</Text>
            </View>
          ) : (
            <Text style={styles.actionText}>{buttonConfig.label}</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FE' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111C44' },
  loadingText: { color: 'white', marginTop: 16 },
  marker: { padding: 8, borderRadius: 20, borderWidth: 3, borderColor: 'white' },
  driverPhoto: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, borderColor: '#0EA5E9' },
  driverMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#0EA5E9',
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 8,
  },
  mapLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLoadingText: { marginTop: 8, color: '#64748B', fontSize: 13, fontWeight: '600' },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: 'white', padding: 12, borderRadius: 16, zIndex: 5 },
  recenterBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 5,
  },
  liveBadge: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 5,
  },
  liveBadgeOn: { backgroundColor: '#ECFDF5' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#CBD5E1' },
  liveDotOn: { backgroundColor: '#22C55E' },
  liveText: { fontSize: 11, fontWeight: '700', color: '#334155' },
  distanceBanner: {
    position: 'absolute',
    top: 88,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.97)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    maxWidth: '92%',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 6,
  },
  distanceBannerArrived: { backgroundColor: '#ECFDF5' },
  distanceBannerText: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginLeft: 6 },
  distanceBannerTextArrived: { color: '#047857' },
  distanceBannerEta: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  deliveryPinWrap: { alignItems: 'center', maxWidth: 220 },
  addressMapCallout: {
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: 210,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  addressMapCalloutTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0EA5E9',
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  addressMapCalloutText: { fontSize: 11, fontWeight: '600', color: '#334155', lineHeight: 15 },
  clientMapPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  gpsTime: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    fontSize: 10,
    color: '#64748B',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    zIndex: 5,
  },
  statusBadge: { position: 'absolute', top: 132, right: 12, left: 12, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, alignItems: 'center', zIndex: 4 },
  statusText: { fontWeight: 'bold', fontSize: 12 },
  detailsContainer: { flex: 1, backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -20, paddingHorizontal: 20, paddingTop: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  statItem: { alignItems: 'center', marginHorizontal: 20 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#111C44' },
  statLabel: { color: '#6B7280', fontSize: 12 },
  statHighlight: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    minWidth: 110,
  },
  statHighlightArrived: { backgroundColor: '#ECFDF5' },
  statHighlightValue: { fontSize: 22, fontWeight: '800', color: '#0EA5E9' },
  statHighlightValueArrived: { color: '#059669' },
  statHighlightLabel: { fontSize: 11, color: '#64748B', fontWeight: '600', marginTop: 2 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#111C44', marginTop: 16 },
  sectionSubtitle: { color: '#6B7280', marginBottom: 16 },
  clientCard: { backgroundColor: '#F4F7FE', padding: 16, borderRadius: 16, marginBottom: 16 },
  clientHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  clientAvatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: '#0EA5E9' },
  clientAvatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientAvatarInitials: { color: '#FFF', fontWeight: '800', fontSize: 18 },
  clientHeaderText: { flex: 1, marginLeft: 14 },
  clientDistance: { marginTop: 4, fontSize: 13, fontWeight: '700', color: '#0EA5E9' },
  clientRow: { flexDirection: 'row', alignItems: 'flex-start' },
  clientName: { fontWeight: '700', color: '#111C44', fontSize: 17 },
  clientAddress: { marginLeft: 12, color: '#6B7280', flex: 1 },
  contactRow: { flexDirection: 'row', marginBottom: 16 },
  contactButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, marginHorizontal: 4 },
  contactText: { marginLeft: 8, fontWeight: '600' },
  paymentCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paymentCardTitle: { fontSize: 14, fontWeight: '700', color: '#111C44', marginBottom: 8 },
  paymentBadgeRow: { flexDirection: 'row', marginBottom: 6 },
  paymentPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  paymentPillPaid: { backgroundColor: '#DCFCE7' },
  paymentPillPending: { backgroundColor: '#FEF3C7' },
  paymentPillText: { fontSize: 13, fontWeight: '700' },
  paymentPillTextPaid: { color: '#166534' },
  paymentPillTextPending: { color: '#B45309' },
  paymentMeta: { fontSize: 12, color: '#64748B', marginTop: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  totalLabel: { color: '#6B7280' },
  totalValue: { fontSize: 24, fontWeight: 'bold', color: '#3FC060' },
  actionButton: { position: 'absolute', bottom: 30, left: 20, right: 20, paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  actionText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  proofContainer: { marginBottom: 16, alignItems: "center", width: "100%" },
  proofTitle: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 4, alignSelf: "flex-start" },
  proofRequired: { color: "#EF4444" },
  proofHint: { fontSize: 12, color: "#6B7280", marginBottom: 10, alignSelf: "flex-start", lineHeight: 18 },
  proofPreviewHistory: { width: "100%", height: 220, borderRadius: 12, resizeMode: "cover" },
  galleryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingVertical: 8,
  },
  galleryButtonText: { fontSize: 14, fontWeight: "600", color: "#0EA5E9" },
  photoMissingText: { fontSize: 12, color: "#B45309", marginTop: 8, fontWeight: "600" },
  photoButton: { width: '100%', height: 200, backgroundColor: '#F3F4F6', borderRadius: 16, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#D1D5DB' },
  proofPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  cameraPlaceholder: { alignItems: 'center' },
  cameraText: { color: '#6B7280', marginTop: 8, fontWeight: '500' },
  photoTakenText: { color: '#10B981', fontWeight: 'bold', marginTop: 4, alignSelf: 'flex-end' }
});

export default OrderDelivery;
