import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../theme';
import { adminService } from '../../services/adminService';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import type { ApiAdminDashboardStats, ApiOrder } from '../../types/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AdminDashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ApiAdminDashboardStats>({
    total_orders: 0,
    pending_orders: 0,
    total_users: 0,
    total_restaurants: 0,
    revenue_today: 0,
    revenue_month: 0,
  });
  const [recentOrders, setRecentOrders] = useState<ApiOrder[]>([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const data = await adminService.dashboard();
      setStats(data.stats || {});
      setRecentOrders(data.recent_orders || []);
    } catch (err) {
      console.log('Admin dashboard error', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return COLORS.warning;
      case 'preparing': return COLORS.info;
      case 'picked_up': return '#FF9800';
      case 'delivering': return COLORS.primary;
      case 'delivered': return COLORS.success;
      case 'cancelled': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AdminOrders')}>
            <Ionicons name="list" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>Commandes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AdminUsers')}>
            <Ionicons name="people" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>Utilisateurs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AdminRestaurants')}>
            <Ionicons name="restaurant" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>Restaurants</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: COLORS.primary }]}>
            <Ionicons name="receipt" size={24} color="#FFF" />
            <Text style={styles.statValue}>{stats.total_orders || 0}</Text>
            <Text style={styles.statLabel}>Total Commandes</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: COLORS.warning }]}>
            <Ionicons name="time" size={24} color="#FFF" />
            <Text style={styles.statValue}>{stats.pending_orders || 0}</Text>
            <Text style={styles.statLabel}>En Cours</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: COLORS.success }]}>
            <Ionicons name="people" size={24} color="#FFF" />
            <Text style={styles.statValue}>{stats.total_users || 0}</Text>
            <Text style={styles.statLabel}>Utilisateurs</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#9C27B0' }]}>
            <Ionicons name="restaurant" size={24} color="#FFF" />
            <Text style={styles.statValue}>{stats.total_restaurants || 0}</Text>
            <Text style={styles.statLabel}>Restaurants</Text>
          </View>
        </View>

        {/* Revenue */}
        <View style={styles.revenueCard}>
          <Text style={styles.revenueTitle}>Revenu</Text>
          <View style={styles.revenueRow}>
            <View style={styles.revenueItem}>
              <Text style={styles.revenueLabel}>Aujourd'hui</Text>
              <Text style={styles.revenueValue}>{(stats.revenue_today || 0).toLocaleString()} FC</Text>
            </View>
            <View style={styles.revenueItem}>
              <Text style={styles.revenueLabel}>Ce mois</Text>
              <Text style={styles.revenueValue}>{(stats.revenue_month || 0).toLocaleString()} FC</Text>
            </View>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Commandes Récentes</Text>
          {recentOrders.length === 0 ? (
            <Text style={styles.empty}>Aucune commande</Text>
          ) : (
            recentOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => Alert.alert(
                  `Commande #${order.id}`,
                  `Client: ${order.user?.name}\nRestaurant: ${order.restaurant?.name}\nTotal: ${order.total} FC`,
                  [{ text: 'OK' }]
                )}
              >
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>#{order.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                      {order.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.orderClient}>{order.user?.name || 'N/A'}</Text>
                <Text style={styles.orderRestaurant}>{order.restaurant?.name || 'N/A'}</Text>
                <View style={styles.orderFooter}>
                  <Text style={styles.orderTotal}>{order.total} FC</Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.created_at ?? Date.now()).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.text },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  actionText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    padding: SPACING.md, gap: SPACING.md,
  },
  statCard: {
    width: '47%', borderRadius: BORDER_RADIUS.md, padding: SPACING.md,
    alignItems: 'center', gap: SPACING.xs,
  },
  statValue: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: '#FFF' },
  statLabel: { fontSize: FONT_SIZES.sm, color: '#FFF', opacity: 0.9 },
  revenueCard: {
    backgroundColor: COLORS.card, margin: SPACING.md, padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  revenueTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.md },
  revenueRow: { flexDirection: 'row', justifyContent: 'space-between' },
  revenueItem: { flex: 1 },
  revenueLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  revenueValue: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text, marginTop: 4 },
  section: { marginTop: SPACING.lg, paddingHorizontal: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.md },
  empty: { textAlign: 'center', color: COLORS.textLight, padding: SPACING.xl },
  orderCard: {
    backgroundColor: COLORS.card, padding: SPACING.md, marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  orderId: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.sm },
  statusText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  orderClient: { fontSize: FONT_SIZES.sm, color: COLORS.text, marginBottom: 2 },
  orderRestaurant: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTotal: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  orderDate: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
});
