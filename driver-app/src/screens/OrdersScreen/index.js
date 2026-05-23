import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  Vibration
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as navigationUtils from "../../utils/navigationUtils";

import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import * as Location from "expo-location";
import api from "../../services/api";
import { config } from "../../config";
import { getEcho } from "../../services/echo";
import DashMapHeader from "../../components/DashMapHeader";
import { DRIVER_COLORS } from "../../theme/driverTheme";
import { mapDriverOrder } from "../../utils/mapDriverOrder";
import { formatPrice } from "../../utils/formatters";
import { distanceMeters, formatDistance } from "../../utils/geo";
import { useNetInfo } from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

const estimatedCommission = (total) =>
  new Intl.NumberFormat("fr-CD").format(Math.round((total || 0) * 0.1)) + " FC";

const OrderCard = ({ order, driverProfile, handleAcceptOrder, rejectOrder, isOffline, styles }) => {
  const isAssigned = order.driverId === driverProfile?.id;
  const earnText = estimatedCommission(order.total);
  // Fix: "My Order" is any order assigned to me, not just 'picked_up'
  const isMyOrder = isAssigned;
  const distanceText = formatDistance(order.distance);

  return (
    <View style={[styles.card, isMyOrder && styles.cardActive]}>
      {/* Changed to View to handle separate click areas */}
      <TouchableOpacity
        onPress={() => navigationUtils.navigate('OrdersDeliveryScreen', { order })}
        style={{ flex: 1 }}

      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, isMyOrder && styles.iconActive]}>
            <MaterialIcons name="restaurant" size={24} color={isMyOrder ? 'white' : '#0EA5E9'} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.restaurantName}>{order.restaurantName}</Text>
            <Text style={styles.restaurantAddress} numberOfLines={1}>{order.restaurantAddress}</Text>
          </View>
          <View style={styles.headerRight}>
            {distanceText && (
              <View style={styles.distanceBadge}>
                <Ionicons name="navigate" size={12} color="#3B82F6" />
                <Text style={styles.distanceText}>{distanceText}</Text>
              </View>
            )}
            <View style={[styles.badge, isMyOrder ? styles.badgeGreen : styles.badgeYellow]}>
              <Text style={[styles.badgeText, isMyOrder && styles.badgeTextWhite]}>
                {isMyOrder ? 'EN COURS' : 'DISPONIBLE'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.clientRow}>
          <Ionicons name="person-outline" size={18} color="#6B7280" />
          <Text style={styles.clientName}>{order.userFirstName} {order.userLastName}</Text>
        </View>

        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={18} color="#6B7280" />
          <Text style={styles.addressText} numberOfLines={2}>{order.userAddress}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.footer}>
        <View style={styles.priceBlock}>
          <Text style={styles.priceLabel}>{isMyOrder ? "TOTAL" : "GAIN ESTIMÉ"}</Text>
          <Text style={[styles.priceValue, !isMyOrder && styles.earnValue]}>
            {isMyOrder ? formatPrice(order.total) : earnText}
          </Text>
          {!isMyOrder ? (
            <Text style={styles.orderTotalHint}>Commande {formatPrice(order.total)}</Text>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row' }}>
          {!isMyOrder && (
            <TouchableOpacity
              onPress={() => isOffline ? Alert.alert('Mode Hors Ligne', 'Vous devez être connecté pour refuser une commande.') : rejectOrder(order.id)}
              style={[styles.actionButton, { backgroundColor: isOffline ? '#FCA5A5' : '#EF4444', marginRight: 8 }]}
              disabled={isOffline}
            >
              <MaterialIcons name="close" size={16} color="white" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => {
              if (isMyOrder) {
                navigationUtils.navigate('OrdersDeliveryScreen', { order });
              } else {
                if (isOffline) {
                  Alert.alert('Mode Hors Ligne', 'Vous devez être connecté pour accepter une commande.');
                } else {
                  handleAcceptOrder(order);
                }
              }
            }}

            style={[styles.actionButton, !isMyOrder && isOffline && { backgroundColor: '#9CA3AF' }]}
            disabled={!isMyOrder && isOffline}
          >
            <Text style={styles.actionText}>{isMyOrder ? 'Continuer' : 'Accepter'}</Text>
            <MaterialIcons name="arrow-forward" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const OrdersScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const netInfo = useNetInfo();
  const isOffline = netInfo.isConnected === false;
  // const navigation = useNavigation();


  const { driverProfile, toggleOnlineStatus } = useAuth();

  const isOnlineRef = useRef(driverProfile?.isOnline);
  useEffect(() => {
    isOnlineRef.current = driverProfile?.isOnline;
  }, [driverProfile?.isOnline]);

  /** Zone de service = profil driver (pas le GPS), pour éviter les filtres USA/RDC. */
  const serviceCity = driverProfile?.city || "Kinshasa";
  const visibleRadiusKm = config.DELIVERY_VISIBLE_RADIUS_KM;

  // Position GPS pour tri et filtre rayon restaurant
  useEffect(() => {
    const loadLocation = async () => {
      setLocationLoading(true);
      try {
        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          Alert.alert(
            "GPS désactivé",
            "Veuillez activer le GPS de votre téléphone pour pouvoir recevoir et accepter des commandes.",
            [{ text: "OK" }]
          );
          try {
            await Location.enableNetworkProviderAsync();
          } catch (e) {
            console.log("Impossible d'ouvrir le menu GPS automatiquement", e);
          }
        }

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission requise",
            "L'application a besoin d'accéder à votre position pour fonctionner correctement."
          );
          console.log("Permission GPS refusée — fallback Kinshasa");
          setDriverLocation({ latitude: -4.3250, longitude: 15.3222 });
          return;
        }

        const location = await Location.getCurrentPositionAsync({
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
      } finally {
        setLocationLoading(false);
      }
    };

    loadLocation();
  }, []);



  // Charger commandes : assignées toujours ; disponibles si en ligne + GPS/zone
  useEffect(() => {
    if (!driverProfile?.id) return;

    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);

        if (isOffline) {
          const cachedOrders = await AsyncStorage.getItem(`@driver_orders_${driverProfile.id}`);
          if (cachedOrders && !cancelled) {
            setOrders(JSON.parse(cachedOrders));
          }
          return;
        }

        const params = {
          city: serviceCity,
          mode: driverProfile.isOnline ? "all" : "mine",
        };
        if (driverProfile.isOnline && driverLocation) {
          params.latitude = driverLocation.latitude;
          params.longitude = driverLocation.longitude;
        }

        const res = await api.get("/driver/orders", { params });
        const rows = Array.isArray(res?.data?.data) ? res.data.data : [];

        const ordersList = rows.map((o) => {
          const mapped = mapDriverOrder(o, driverProfile?.id);
          const restaurantLat = mapped.restaurantLatitude;
          const restaurantLng = mapped.restaurantLongitude;
          const distance =
            driverLocation && restaurantLat && restaurantLng
              ? distanceMeters(
                  driverLocation.latitude,
                  driverLocation.longitude,
                  Number(restaurantLat),
                  Number(restaurantLng)
                )
              : null;
          return { ...mapped, distance };
        });

        ordersList.sort((a, b) => {
          const aIsAssigned = a.driverId === driverProfile?.id;
          const bIsAssigned = b.driverId === driverProfile?.id;
          if (aIsAssigned && !bIsAssigned) return -1;
          if (!aIsAssigned && bIsAssigned) return 1;
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });

        if (!cancelled) {
          setOrders(ordersList);
          await AsyncStorage.setItem(`@driver_orders_${driverProfile.id}`, JSON.stringify(ordersList));
        }
      } catch (e) {
        console.error("Erreur commandes API:", e?.message, e?.response?.status, e?.response?.data);
        const cachedOrders = await AsyncStorage.getItem(`@driver_orders_${driverProfile.id}`);
        if (cachedOrders && !cancelled) {
          setOrders(JSON.parse(cachedOrders));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [driverProfile?.id, driverProfile?.isOnline, driverLocation, serviceCity, locationLoading, refreshTick, isOffline]);

  // WebSocket pour mises à jour en temps réel
  useEffect(() => {
    let echoInstance = null;
    let channel = null;

    const setupEcho = async () => {
      if (!serviceCity) return;
      try {
        echoInstance = await getEcho();
        if (!echoInstance) return;

        channel = echoInstance.private(`driver-orders.${serviceCity}`);
        channel.listen('.order.available', async (data) => {
          if (!isOnlineRef.current) {
            console.log("Commande reçue mais ignorée car le livreur est HORS LIGNE");
            return;
          }
          console.log("Nouvelle commande en temps réel reçue:", data);
          setRefreshTick((prev) => prev + 1);

          Vibration.vibrate([0, 500, 200, 500]);
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "🔔 Nouvelle Commande !",
              body: "Une nouvelle course est disponible dans votre zone.",
              sound: true,
            },
            trigger: null,
          });
        });
      } catch (err) {
        console.error("Erreur WebSocket OrdersScreen:", err);
      }
    };

    setupEcho();

    return () => {
      if (channel) {
        echoInstance?.leave(`driver-orders.${serviceCity}`);
      }
    };
  }, [serviceCity]);

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshTick((x) => x + 1);
    setRefreshing(false); // Simplified for brevity
  };

  // Accept Order Function
  const handleAcceptOrder = async (order) => {
    if (!driverProfile?.id) return;
    if (!driverLocation?.latitude || !driverLocation?.longitude) {
      alert("Activez le GPS pour accepter une commande.");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/driver/orders/${order.id}/accept`, {
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
      });

      navigationUtils.navigate('OrdersDeliveryScreen', { order: { ...order, driverId: driverProfile.id } });
    } catch (error) {
      console.error("Error accepting order:", error);
      const msg =
        error?.response?.data?.message ||
        "Impossible d'accepter cette commande. Elle a peut-être déjà été prise.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const rejectOrder = async (orderId) => {
    Alert.alert(
      "Refuser la commande",
      "Êtes-vous sûr de vouloir refuser cette commande ? (Swipe left?)",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Refuser", 
          style: "destructive",
          onPress: () => {
             // ... (Logic kept simple for now)
             alert("Fonctionnalité de rejet à venir (Swipe left?)");
          }
        }
      ]
    );
  };



  if (loading && orders.length === 0 && locationLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3FC060" />
        <Text style={styles.loadingText}>Localisation...</Text>
      </SafeAreaView>
    );
  }

  const goToEarnings = () => {
    navigation.getParent()?.navigate("Earnings");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.dashHeader}>
        <View>
          <Text style={styles.dashTitle}>Courses</Text>
          <Text style={styles.dashZone}>{serviceCity} · {visibleRadiusKm} km</Text>
        </View>
        <TouchableOpacity style={styles.earningsChip} onPress={goToEarnings}>
          <Ionicons name="cash-outline" size={16} color={DRIVER_COLORS.primary} />
          <Text style={styles.earningsChipText}>Gains</Text>
        </TouchableOpacity>
      </View>

      <DashMapHeader
        driverLocation={driverLocation}
        orders={orders}
        isOnline={!!driverProfile?.isOnline}
        driverProfile={driverProfile}
      />

      {isOffline && (
        <View style={{ backgroundColor: '#EF4444', padding: 10, alignItems: 'center' }}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>⚠️ Mode Hors Ligne - Vérifiez votre connexion</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={toggleOnlineStatus}
        style={[
          styles.dashToggle,
          driverProfile?.isOnline ? styles.dashToggleOn : styles.dashToggleOff,
        ]}
      >
        <Ionicons
          name={driverProfile?.isOnline ? "radio-button-on" : "radio-button-off"}
          size={24}
          color="#fff"
        />
        <Text style={styles.dashToggleText}>
          {driverProfile?.isOnline ? "En ligne" : "Hors ligne"}
        </Text>
      </TouchableOpacity>

      {!driverProfile?.isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineTitle}>Hors ligne</Text>
          <Text style={styles.offlineSub}>
            Passez en ligne pour voir les offres à {serviceCity}
          </Text>
        </View>
      )}

      {!driverProfile?.isOnline && orders.length > 0 && (
        <View style={[styles.gpsBar, { backgroundColor: '#FEF3C7' }]}>
          <Ionicons name="bicycle" size={14} color="#B45309" />
          <Text style={[styles.gpsText, { color: '#92400E' }]}>
            {orders.length} livraison{orders.length !== 1 ? 's' : ''} en cours (hors ligne)
          </Text>
        </View>
      )}

      {/* Liste : en ligne = tout ; hors ligne = assignées uniquement */}
      {(driverProfile?.isOnline || orders.length > 0) && (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <OrderCard 
              order={item} 
              driverProfile={driverProfile} 
              handleAcceptOrder={handleAcceptOrder} 
              rejectOrder={rejectOrder} 
              isOffline={isOffline}
              styles={styles}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            driverProfile?.isOnline ? (
              <Text style={styles.listSectionTitle}>
                {orders.length > 0 ? "Offres disponibles" : "En attente d'offres"}
              </Text>
            ) : null
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3FC060']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>
                {driverProfile?.isOnline
                  ? `Aucune course à ${visibleRadiusKm} km`
                  : 'Aucune livraison en cours'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {driverProfile?.isOnline
                  ? `Zone ${serviceCity} · approchez un restaurant pour voir des commandes`
                  : 'Passez en ligne pour recevoir de nouvelles commandes'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default OrdersScreen;

const getStyles = (colors, isDark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background || '#F4F7FE' },
  loadingContainer: { flex: 1, backgroundColor: colors.background || '#F4F7FE', justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: colors.textSecondary || '#6B7280', fontSize: 14 },
  dashHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  dashTitle: { fontSize: 26, fontWeight: '800', color: '#111C44' },
  dashZone: { fontSize: 13, color: '#64748B', marginTop: 2 },
  earningsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
    elevation: 2,
  },
  earningsChipText: { fontWeight: '700', color: '#111C44', fontSize: 14 },
  dashToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 10,
  },
  dashToggleOn: { backgroundColor: '#16A34A' },
  dashToggleOff: { backgroundColor: '#64748B' },
  dashToggleText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  offlineBanner: {
    backgroundColor: '#FEF3C7',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  offlineTitle: { color: '#92400E', fontWeight: '800', fontSize: 14 },
  offlineSub: { color: '#B45309', fontSize: 12, marginTop: 4, textAlign: 'center' },
  listSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  listContent: { padding: 16, paddingTop: 0 },
  earnValue: { color: '#059669' },
  orderTotalHint: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  welcomeBox: {
    backgroundColor: '#111C44',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20
  },
  welcomeText: { fontWeight: 'bold', color: 'white' },
  logoutButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  profileButton: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0EA5E9', marginRight: 8 },
  statusText: { fontSize: 16, fontWeight: 'bold', color: '#111C44' },
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10
  },
  cityText: { fontSize: 12, fontWeight: 'bold', color: '#0369A1', marginLeft: 4 },
  gpsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8
  },
  gpsText: { fontSize: 13, color: '#3B82F6', marginLeft: 6, fontWeight: '500' },
  card: {
    backgroundColor: 'white',
    marginBottom: 12,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5
  },
  cardActive: { borderWidth: 2, borderColor: '#0EA5E9' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconContainer: { backgroundColor: '#F0F9FF', padding: 10, borderRadius: 12 },
  iconActive: { backgroundColor: '#0EA5E9' },
  headerText: { flex: 1, marginLeft: 12 },
  headerRight: { alignItems: 'flex-end' },
  restaurantName: { fontWeight: 'bold', fontSize: 16, color: '#1F2937' },
  restaurantAddress: { color: '#6B7280', fontSize: 12 },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4
  },
  distanceText: { fontSize: 11, fontWeight: 'bold', color: '#3B82F6', marginLeft: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeGreen: { backgroundColor: '#0EA5E9' },
  badgeYellow: { backgroundColor: '#FEF3C7' },
  badgeText: { fontSize: 11, fontWeight: 'bold', color: '#D97706' },
  badgeTextWhite: { color: 'white' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  clientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  clientName: { marginLeft: 8, color: '#374151', fontWeight: '500' },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start' },
  addressText: { marginLeft: 8, color: '#6B7280', flex: 1 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  priceBlock: { flex: 1 },
  priceContainer: { flexDirection: 'row', alignItems: 'center' },
  priceLabel: { fontSize: 11, color: '#9CA3AF' },
  priceValue: { marginLeft: 8, fontWeight: 'bold', fontSize: 18, color: '#3FC060' },
  actionButton: {
    backgroundColor: '#111C44',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionText: { color: 'white', fontWeight: '600', fontSize: 12, marginRight: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#374151' },
  emptySubtitle: { color: '#6B7280', marginTop: 4 }
});


