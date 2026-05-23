import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../theme';
import { adminService } from '../../services/adminService';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AdminRestaurantsScreen() {
  const navigation = useNavigation<Nav>();
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<any[]>([]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const data = await adminService.restaurants({ page: 1 });
      setRestaurants(Array.isArray(data.data.data) ? data.data.data : []);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de charger les restaurants.');
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Restaurants (Admin)</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.muted}>Chargement...</Text>
        </View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(r) => String(r.id)}
          contentContainerStyle={restaurants.length === 0 ? styles.empty : styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name ?? 'N/A'}</Text>
              <Text style={styles.line}>{item.address ? `Adresse: ${item.address}` : 'Adresse: N/A'}</Text>
              <Text style={styles.line}>
                Commandes: {item.orders_count ?? 0} · Menus: {item.menu_items_count ?? item.menuItems_count ?? item.menu_items?.length ?? 0}
              </Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.muted}>Aucun restaurant.</Text>}
        />
      )}
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
  name: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text },
  line: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
});

