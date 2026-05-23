import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../theme';
import { adminService, OrderStatus } from '../../services/adminService';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'En attente',
  preparing: 'Préparation',
  picked_up: 'Récupérée',
  delivering: 'En livraison',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

export default function AdminOrdersScreen() {
  const navigation = useNavigation<Nav>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  const fetchOrders = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const data = await adminService.orders({ page: 1 });
      setOrders(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de charger les commandes admin.');
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const content = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.muted}>Chargement...</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={orders.length === 0 ? styles.empty : styles.list}
        refreshing={refreshing}
        onRefresh={() => fetchOrders(true)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
                onPress={() => navigation.navigate('AdminOrderDetail', { orderId: String(item.id) })}
              >
            <View style={styles.row}>
              <Text style={styles.id}>#{item.id}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{STATUS_LABEL[item.status as OrderStatus] ?? item.status}</Text>
              </View>
            </View>
            <Text style={styles.line}>{item.user?.name ? `Client: ${item.user.name}` : 'Client: N/A'}</Text>
            <Text style={styles.line}>{item.restaurant?.name ? `Restaurant: ${item.restaurant.name}` : 'Restaurant: N/A'}</Text>
            <Text style={styles.total}>{Number(item.total ?? 0).toLocaleString()} FC</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.muted}>Aucune commande.</Text>}
      />
    );
  }, [loading, orders, refreshing, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Commandes (Admin)</Text>
        <View style={{ width: 36 }} />
      </View>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  title: { flex: 1, textAlign: 'center', fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.sm },
  muted: { color: COLORS.textLight },
  list: { padding: SPACING.md, gap: SPACING.md },
  empty: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  id: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  badge: { backgroundColor: COLORS.backgroundSecondary, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.sm },
  badgeText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textSecondary },
  line: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  total: { marginTop: SPACING.sm, fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text },
});

