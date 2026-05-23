import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import api from "../services/api";
import { DRIVER_COLORS } from "../theme/driverTheme";
import * as navigationUtils from "../utils/navigationUtils";
import { formatPrice, formatDate } from "../utils/formatters";

export default function EarningsScreen({ navigation }) {
  const { driverProfile } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [todayCount, setTodayCount] = useState(0);



  const load = useCallback(async () => {
    if (!driverProfile?.id) return;
    try {
      const walletRes = await api.get("/driver/wallet");

      const wallet = walletRes?.data?.data;
      const tx = Array.isArray(wallet?.transactions) ? wallet.transactions : [];
      setBalance(wallet?.balance ?? 0);
      setTransactions(tx);
      setTodayTotal(wallet?.today_total ?? 0);
      setTodayCount(wallet?.today_count ?? 0);
    } catch (e) {
      console.error("Earnings load:", e?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [driverProfile?.id]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionCard}>
      <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#DCFCE7' }]}>
        <MaterialCommunityIcons name="arrow-down-left" size={22} color={isDark ? '#4ADE80' : '#166534'} />
      </View>
      <View style={styles.transactionContent}>
        <Text style={styles.transactionTitle}>Commission course</Text>
        <Text style={styles.transactionRef}>{item.reference}</Text>
      </View>
      <View style={styles.transactionRight}>
        <Text style={styles.transactionAmount}>+{formatPrice(item.amount)}</Text>
        <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gains</Text>
        <Text style={styles.subtitle}>{driverProfile?.firstName || "Livreur"}</Text>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Solde commissions</Text>
        <Text style={styles.heroAmount}>{formatPrice(balance)}</Text>
        <View style={styles.heroRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatPrice(todayTotal)}</Text>
            <Text style={styles.statLabel}>Aujourd'hui</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{todayCount}</Text>
            <Text style={styles.statLabel}>Courses du jour</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.linkRow}
        onPress={() => navigationUtils.navigateToTab("History")}
      >
        <Ionicons name="time-outline" size={20} color={colors.primary} />
        <Text style={styles.linkText}>Voir l'historique complet</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Dernières commissions</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={colors.primary} />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderTransaction}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[colors.primary]} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>Aucune commission pour le moment</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  heroCard: {
    marginHorizontal: 16,
    backgroundColor: isDark ? colors.surfaceSecondary : "#111C44",
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
  },
  heroLabel: { color: isDark ? colors.textMuted : "#94A3B8", fontSize: 13, fontWeight: "600" },
  heroAmount: { color: "#4ADE80", fontSize: 32, fontWeight: "800", marginTop: 4 },
  heroRow: { flexDirection: "row", marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: isDark ? colors.border : "#1E293B" },
  statBox: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, backgroundColor: isDark ? colors.border : "#334155" },
  statValue: { color: isDark ? colors.text : "#F8FAFC", fontSize: 16, fontWeight: "700" },
  statLabel: { color: isDark ? colors.textSecondary : "#94A3B8", fontSize: 11, marginTop: 4 },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    gap: 8,
  },
  linkText: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.text },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
    marginHorizontal: 20,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  iconContainer: { padding: 10, borderRadius: 12, marginRight: 12 },
  transactionContent: { flex: 1 },
  transactionTitle: { fontSize: 14, fontWeight: "600", color: colors.text },
  transactionRef: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  transactionRight: { alignItems: "flex-end" },
  transactionAmount: { fontSize: 14, fontWeight: "700", color: isDark ? '#4ADE80' : "#166534" },
  transactionDate: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  empty: { textAlign: "center", color: colors.textMuted, marginTop: 24 },
});
