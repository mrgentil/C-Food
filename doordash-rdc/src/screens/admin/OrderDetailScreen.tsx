import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../theme';
import { adminService, OrderStatus } from '../../services/adminService';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATUSES: OrderStatus[] = ['pending', 'preparing', 'picked_up', 'delivering', 'delivered', 'cancelled'];

export default function AdminOrderDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();
  const orderId = route.params?.orderId as string | undefined;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState<any | null>(null);

  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const data = await adminService.order(orderId);
      setOrder(data?.data ?? data);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de charger la commande.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const updateStatus = async (status: OrderStatus) => {
    if (!orderId) return;
    try {
      setSaving(true);
      await adminService.updateOrderStatus(orderId, status);
      await fetchOrder();
      Alert.alert('OK', 'Statut mis à jour.');
    } catch (e) {
      Alert.alert('Erreur', 'Échec de mise à jour du statut.');
    } finally {
      setSaving(false);
    }
  };

  const body = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.muted}>Chargement...</Text>
        </View>
      );
    }

    if (!order) {
      return (
        <View style={styles.center}>
          <Text style={styles.muted}>Commande introuvable.</Text>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.h1}>Commande #{order.id}</Text>
          <Text style={styles.line}>Client: {order.user?.name ?? 'N/A'}</Text>
          <Text style={styles.line}>Restaurant: {order.restaurant?.name ?? 'N/A'}</Text>
          <Text style={styles.line}>Total: {Number(order.total ?? 0).toLocaleString()} FC</Text>
          <Text style={styles.line}>Statut actuel: {order.status}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.h2}>Changer le statut</Text>
          <View style={styles.statusGrid}>
            {STATUSES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.statusBtn,
                  order.status === s && { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
                ]}
                disabled={saving}
                onPress={() => updateStatus(s)}
              >
                <Text style={[styles.statusText, order.status === s && { color: COLORS.primary }]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {saving ? <Text style={styles.muted}>Mise à jour...</Text> : null}
        </View>
      </ScrollView>
    );
  }, [loading, order, saving]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Détail commande</Text>
        <View style={{ width: 36 }} />
      </View>
      {body}
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
  content: { padding: SPACING.md, gap: SPACING.md },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  h1: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  h2: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  line: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.sm },
  statusBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.backgroundSecondary,
  },
  statusText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textSecondary },
});

