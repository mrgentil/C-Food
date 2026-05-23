import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import api from "../services/api";
import { mapDriverOrder } from "../utils/mapDriverOrder";
import { formatPrice, formatDate } from "../utils/formatters";

const STATUS_FILTERS = [
  { key: "all", label: "Toutes" },
  { key: "delivered", label: "Livrées" },
  { key: "cancelled", label: "Annulées" },
];

const PERIOD_FILTERS = [
  { key: "all", label: "Tout" },
  { key: "today", label: "Aujourd'hui" },
  { key: "week", label: "Semaine" },
  { key: "month", label: "Mois" },
];

const getStatusConfig = (isDark) => ({
  delivered: {
    label: "Livrée",
    badgeBg: isDark ? "rgba(22, 101, 52, 0.3)" : "#DCFCE7",
    badgeColor: isDark ? "#4ADE80" : "#166534",
    icon: "checkmark-circle",
  },
  cancelled: {
    label: "Annulée",
    badgeBg: isDark ? "rgba(153, 27, 27, 0.3)" : "#FEE2E2",
    badgeColor: isDark ? "#F87171" : "#991B1B",
    icon: "close-circle",
  },
});

const HistoryScreen = ({ navigation, route }) => {
  const tabRoot = route?.params?.tabRoot;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [period, setPeriod] = useState("all");
  const [meta, setMeta] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const { driverProfile } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const STATUS_CONFIG = getStatusConfig(isDark);

  const fetchHistory = useCallback(async () => {
    if (!driverProfile?.id) return;
    try {
      const res = await api.get("/driver/history", { params: { filter, period } });
      const rows = Array.isArray(res?.data?.data) ? res.data.data : [];
      setMeta(res?.data?.meta || null);
      setOrders(rows.map((o) => mapDriverOrder(o, driverProfile.id)));
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [driverProfile?.id, filter, period]);

  useEffect(() => {
    setLoading(true);
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };



  const displayDate = (item) =>
    formatDate(
      item.status === "cancelled"
        ? item.cancelledAt || item.updatedAt || item.createdAt
        : item.deliveredAt || item.updatedAt || item.createdAt,
      true
    );

  const renderItem = ({ item }) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.delivered;
    const locationLabel = [item.neighborhood, item.city].filter(Boolean).join(", ");

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("OrdersDeliveryScreen", {
            order: item,
            readOnly: true,
          })
        }
        activeOpacity={0.7}
      >
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="restaurant" size={20} color={colors.primary} />
          </View>
          <View style={styles.content}>
            <Text style={styles.restaurantName}>
              {item.restaurantName || "Restaurant"}
            </Text>
            {locationLabel ? (
              <Text style={styles.location}>{locationLabel}</Text>
            ) : null}
            <Text style={styles.date}>{displayDate(item)}</Text>
          </View>
          <Text style={styles.price}>{formatPrice(item.total)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.footerRow}>
          {item.status === "delivered" ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                Commission: {formatPrice(item.commission ?? Math.round((item.total || 0) * 0.1))}
              </Text>
            </View>
          ) : (
            <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(153, 27, 27, 0.15)' : "#FEF2F2" }]}>
              <Text style={[styles.badgeText, { color: isDark ? "#F87171" : "#B91C1C" }]}>
                Course non finalisée
              </Text>
            </View>
          )}

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {item.deliveryPhotoURL && item.status === "delivered" ? (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation?.();
                  setSelectedImage(item.deliveryPhotoURL);
                }}
                style={styles.cameraIcon}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="camera" size={20} color={colors.primary} />
                <Text style={styles.cameraText}>Preuve</Text>
              </TouchableOpacity>
            ) : null}
            <View style={[styles.statusBadge, { backgroundColor: cfg.badgeBg }]}>
              <Ionicons name={cfg.icon} size={12} color={cfg.badgeColor} />
              <Text style={[styles.statusText, { color: cfg.badgeColor }]}>
                {cfg.label.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const emptyMessage =
    filter === "delivered"
      ? "Aucune livraison terminée"
      : filter === "cancelled"
        ? "Aucune course annulée"
        : "Aucun historique pour le moment";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {!tabRoot ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <Text style={styles.title}>Historique</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.periodRow}>
        {PERIOD_FILTERS.map((p) => {
          const active = period === p.key;
          return (
            <TouchableOpacity
              key={p.key}
              style={[styles.periodChip, active && styles.periodChipActive]}
              onPress={() => setPeriod(p.key)}
            >
              <Text
                style={[
                  styles.periodChipText,
                  active && styles.periodChipTextActive,
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {meta?.commission_in_period != null && meta.commission_in_period > 0 ? (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            Commissions sur la période : {formatPrice(meta.commission_in_period)}
          </Text>
        </View>
      ) : null}

      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((f) => {
          const active = filter === f.key;
          const count =
            f.key === "all"
              ? meta?.total_count
              : f.key === "delivered"
                ? meta?.delivered_count
                : meta?.cancelled_count;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  active && styles.filterChipTextActive,
                ]}
              >
                {f.label}
                {count != null ? ` (${count})` : ""}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="time-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>{emptyMessage}</Text>
              <Text style={styles.emptyHint}>
                Seules les courses assignées à vous apparaissent ici
              </Text>
            </View>
          }
        />
      )}

      <Modal
        visible={!!selectedImage}
        transparent
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setSelectedImage(null)}
          >
            <Ionicons name="close-circle" size={40} color="white" />
          </TouchableOpacity>
          <Image
            source={{ uri: selectedImage }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = (colors, isDark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  backButton: { padding: 8, backgroundColor: colors.surface, borderRadius: 12 },
  title: { fontSize: 18, fontWeight: "bold", color: colors.text },
  periodRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  periodChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodChipActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  periodChipText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  periodChipTextActive: { color: colors.surface },
  summaryBar: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: isDark ? "rgba(5, 150, 105, 0.15)" : "#ECFDF5",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: isDark ? "rgba(16, 185, 129, 0.3)" : "#A7F3D0",
  },
  summaryText: {
    fontSize: 13,
    fontWeight: "700",
    color: isDark ? "#34D399" : "#166534",
    textAlign: "center",
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: "center",
  },
  filterChipActive: { backgroundColor: colors.primary },
  filterChipText: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  filterChipTextActive: { color: "white" },
  list: { padding: 16, paddingTop: 0 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  row: { flexDirection: "row", alignItems: "center" },
  iconContainer: {
    padding: 10,
    backgroundColor: isDark ? colors.surfaceSecondary : "#F0F9FF",
    borderRadius: 12,
    marginRight: 12,
  },
  content: { flex: 1 },
  restaurantName: { fontSize: 16, fontWeight: "bold", color: colors.text },
  location: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  date: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  price: { fontSize: 16, fontWeight: "bold", color: "#05CD99" },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    backgroundColor: isDark ? colors.surfaceSecondary : "#F4F7FE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  badgeText: { fontSize: 10, color: colors.textMuted, fontWeight: "bold" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 10, fontWeight: "bold" },
  emptyText: { color: colors.textSecondary, fontSize: 16, marginTop: 12, fontWeight: "600" },
  emptyHint: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },
  cameraIcon: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: isDark ? colors.surfaceSecondary : "#F0F9FF",
    padding: 4,
    borderRadius: 8,
  },
  cameraText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: { width: "100%", height: "80%" },
  closeModalButton: { position: "absolute", top: 50, right: 20, zIndex: 10 },
});

export default HistoryScreen;
