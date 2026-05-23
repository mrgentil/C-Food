import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import { orderService } from '../services/orderService';
import type { RootStackParamList } from '../navigation/types';
import type { Order } from '../types';
import { mapApiOrderToUi } from '../utils/mapApiToUi';

const SHADOWS = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 3,
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'pending': return { label: 'En attente', color: COLORS.warning, icon: 'time-outline' };
    case 'preparing': return { label: 'En préparation', color: COLORS.info, icon: 'restaurant-outline' };
    case 'picked_up': return { label: 'Récupéré', color: COLORS.info, icon: 'bag-check-outline' };
    case 'delivering': return { label: 'En livraison', color: COLORS.primary, icon: 'bicycle-outline' };
    case 'delivered': return { label: 'Livré', color: COLORS.success, icon: 'checkmark-circle-outline' };
    case 'cancelled': return { label: 'Annulé', color: COLORS.error, icon: 'close-circle-outline' };
    default: return { label: status, color: COLORS.textSecondary, icon: 'help-outline' };
  }
};

export default function OrdersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  const activeOrders = useMemo(() => orders.filter(o => !['delivered', 'cancelled'].includes(o.status)), [orders]);
  const pastOrders = useMemo(() => orders.filter(o => ['delivered', 'cancelled'].includes(o.status)), [orders]);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAll();
      const rows = response.data?.data;
      if (Array.isArray(rows)) {
        setOrders(rows.map(mapApiOrderToUi));
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Erreur de chargement';
      setError(errorMsg);
      console.log('API unavailable, using mock data');
    } finally {
      setLoading(false);
    }
  };

  const renderOrder = (order: Order, isActive: boolean) => {
    const statusInfo = getStatusInfo(order.status);

    return (
      <TouchableOpacity
        key={order.id}
        style={styles.orderCard}
        onPress={() =>
          isActive ? navigation.navigate('OrderTracking', { order }) : navigation.navigate('OrderDetail', { order })
        }
      >
        <Image source={{ uri: order.restaurant.image }} style={styles.restaurantImage} />
        <View style={styles.orderInfo}>
          <View style={styles.orderHeader}>
            <Text style={styles.restaurantName}>{order.restaurant.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
              <Ionicons name={statusInfo.icon as any} size={14} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
            </View>
          </View>
          <Text style={styles.orderDetails}>
            {order.items.length} article{order.items.length > 1 ? 's' : ''} • {order.total.toLocaleString()} FC
          </Text>
          <Text style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            {isActive ? ` • ${order.estimatedDeliveryTime}` : ''}
          </Text>
          {isActive && (
            <TouchableOpacity style={styles.trackButton} onPress={() => navigation.navigate('OrderTracking', { order })}>
              <Text style={styles.trackButtonText}>Suivre la livraison</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          )}
          {!isActive && (
            <TouchableOpacity
              style={styles.reorderButton}
              onPress={async () => {
                try {
                  setReorderingId(order.id);
                  const created = await orderService.reorder(order.id);
                  await fetchOrders();
                  if (created?.data?.id) {
                    navigation.navigate('OrderTracking', { orderId: String(created.data.id) });
                  }
                } catch (e: any) {
                  setError(e?.response?.data?.message || e?.message || 'Impossible de recommander');
                } finally {
                  setReorderingId(null);
                }
              }}
              disabled={reorderingId === order.id}
            >
              {reorderingId === order.id ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <>
                  <Ionicons name="refresh-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.reorderButtonText}>Recommander</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vos commandes</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>En cours</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>Historique</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 'active' && activeOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Commande en cours</Text>
            {activeOrders.map(order => renderOrder(order, true))}
          </View>
        )}

        {activeTab === 'past' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historique</Text>
            {pastOrders.map(order => renderOrder(order, false))}
            {pastOrders.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>Aucune commande</Text>
              <Text style={styles.emptyText}>
                Vos commandes passées apparaîtront ici
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('Main')}
              >
                <Text style={styles.emptyButtonText}>Parcourir les restaurants</Text>
              </TouchableOpacity>
            </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    backgroundColor: '#1c1c1e',
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#2c2c2e',
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: '#8e8e93',
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: '#ffffff',
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: '#8e8e93',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: '#1c1c1e',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2c2c2e',
    ...SHADOWS,
  },
  restaurantImage: {
    width: 100,
    height: 120,
  },
  orderInfo: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  restaurantName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    marginRight: SPACING.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  orderDetails: {
    fontSize: FONT_SIZES.sm,
    color: '#8e8e93',
    marginBottom: SPACING.xs,
  },
  orderDate: {
    fontSize: FONT_SIZES.sm,
    color: '#636366',
    marginBottom: SPACING.sm,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  trackButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  reorderButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  empty: {
    alignItems: 'center',
    marginTop: SPACING.xxl,
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: '#8e8e93',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  loadingContainer: {
    position: 'absolute',
    top:0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    zIndex: 999,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    padding: SPACING.md,
  },
});

