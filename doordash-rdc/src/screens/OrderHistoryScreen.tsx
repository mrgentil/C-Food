import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import type { RootStackParamList } from '../navigation/types';
import type { Order } from '../types';
import { mapApiOrderToUi } from '../utils/mapApiToUi';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FILTERS = ['All', 'Delivered', 'Cancelled'];

function groupOrdersByMonth(orders: Order[]) {
  const groups: { [key: string]: Order[] } = {};
  orders.forEach(order => {
    const date = new Date(order.createdAt);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!groups[monthYear]) groups[monthYear] = [];
    groups[monthYear].push(order);
  });
  return Object.entries(groups).sort((a, b) => {
    const dateA = new Date(a[1][0].createdAt);
    const dateB = new Date(b[1][0].createdAt);
    return dateB.getTime() - dateA.getTime();
  });
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getStatusColor(status: Order['status']) {
  switch (status) {
    case 'delivered': return COLORS.success;
    case 'cancelled': return COLORS.error;
    case 'delivering': return COLORS.primary;
    case 'preparing': return COLORS.warning;
    default: return COLORS.textSecondary;
  }
}

function getStatusText(status: Order['status']) {
  switch (status) {
    case 'delivered': return 'Livré';
    case 'cancelled': return 'Annulé';
    case 'delivering': return 'En livraison';
    case 'preparing': return 'En préparation';
    case 'pending': return 'En attente';
    case 'picked_up': return 'Récupéré';
    default: return status;
  }
}

function getItemsSummary(items: Order['items']) {
  return items.map(i => `${i.quantity}x ${i.menuItem.name}`).join(', ');
}

export default function OrderHistoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { addToCart } = useCart();
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);

  React.useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getAll();
      const rows = res.data?.data;
      setOrders(Array.isArray(rows) ? rows.map(mapApiOrderToUi) : []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erreur de chargement');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'All') return orders;
    const statusMap: { [key: string]: string } = {
      'Delivered': 'delivered',
      'Cancelled': 'cancelled',
    };
    return orders.filter(o => o.status === statusMap[activeFilter]);
  }, [activeFilter, orders]);

  const groupedOrders = useMemo(() => groupOrdersByMonth(filteredOrders), [filteredOrders]);

  const handleReorder = (order: Order) => {
    order.items.forEach(item => {
      addToCart(item.menuItem, item.quantity, item.selectedOptions, item.specialInstructions);
    });
    navigation.navigate('Cart');
  };

  const renderOrder = (order: Order) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', { order })}
      activeOpacity={0.9}
    >
      <Image source={{ uri: order.restaurant.image }} style={styles.restaurantImage} />
      <View style={styles.orderInfo}>
        <View style={styles.orderHeader}>
          <Text style={styles.restaurantName} numberOfLines={1}>{order.restaurant.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {getStatusText(order.status)}
            </Text>
          </View>
        </View>
        <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        <Text style={styles.itemsSummary} numberOfLines={2}>{getItemsSummary(order.items)}</Text>
        <View style={styles.orderFooter}>
          <Text style={styles.orderTotal}>{order.total.toLocaleString()} FC</Text>
          <TouchableOpacity
            style={styles.reorderButton}
            onPress={() => handleReorder(order)}
          >
            <Text style={styles.reorderText}>Commander à nouveau</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Historique des commandes</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.filters}>
        {FILTERS.map(filter => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
              {filter === 'All' ? 'Tout' : filter === 'Delivered' ? 'Livré' : 'Annulé'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={48} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>Chargement...</Text>
        </View>
      ) : groupedOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>Aucune commande</Text>
          <Text style={styles.emptyText}>{error || 'Vos commandes passées apparaîtront ici'}</Text>
        </View>
      ) : (
        <FlatList
          data={groupedOrders}
          keyExtractor={([month]) => month}
          renderItem={({ item: [month, orders] }) => (
            <View style={styles.monthGroup}>
              <Text style={styles.monthHeader}>{month}</Text>
              {orders.map(order => (
                <View key={order.id} style={styles.orderWrapper}>
                  {renderOrder(order)}
                </View>
              ))}
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.backgroundSecondary,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: COLORS.background,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  monthGroup: {
    marginBottom: SPACING.lg,
  },
  monthHeader: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  orderWrapper: {
    marginBottom: SPACING.md,
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  restaurantImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  orderInfo: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  itemsSummary: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  orderTotal: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  reorderButton: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  reorderText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});
