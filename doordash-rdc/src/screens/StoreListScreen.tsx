import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import { RestaurantCard, BottomCartBar, CartBadge } from '../components';
import { useCart } from '../context/CartContext';
import { useStoreRestaurants } from '../hooks/useStoreRestaurants';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteParams = RouteProp<RootStackParamList, 'StoreList'>;

const DELIVERY_FILTERS = [
  { label: 'Tous', value: 'all' },
  { label: 'Livraison gratuite', value: 'free' },
  { label: 'Rapide', value: 'fast' },
];

export default function StoreListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParams>();
  const { storeType, title } = route.params;
  const { cartCount, cartTotal } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeDeliveryFilter, setActiveDeliveryFilter] = useState('all');
  const [activeSubcategory, setActiveSubcategory] = useState('Tous');

  const { loading, error, restaurants } = useStoreRestaurants(storeType);

  const subcategoryOptions = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach((s) => {
      (s.categories || []).forEach((c) => {
        if (c && String(c).trim()) set.add(String(c));
      });
    });
    const sorted = Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
    return ['Tous', ...sorted];
  }, [restaurants]);

  const filteredStores = useMemo(() => {
    return restaurants.filter((store) => {
      if (activeSubcategory !== 'Tous') {
        const cats = store.categories || [];
        if (!cats.includes(activeSubcategory)) return false;
      }
      if (activeDeliveryFilter === 'free' && (store.deliveryFee ?? 0) > 0) return false;
      if (activeDeliveryFilter === 'fast') {
        const time = parseInt(String(store.deliveryTime).split('-')[0], 10);
        if (Number.isFinite(time) && time > 30) return false;
      }
      if (searchQuery && !store.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [restaurants, activeDeliveryFilter, searchQuery, activeSubcategory]);

  const storeLabel = title.toLowerCase();

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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerRight}>
          <CartBadge variant="pill" count={cartCount} onPress={() => navigation.navigate('Cart')} />
          <TouchableOpacity style={styles.searchButton} onPress={() => setShowSearch(!showSearch)}>
            <Ionicons name="search" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      {showSearch && (
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textSecondary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={`Rechercher ${storeLabel}…`}
            placeholderTextColor={COLORS.textSecondary}
            style={styles.searchInput}
            autoCorrect={false}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => { setShowSearch(false); setSearchQuery(''); }}>
            <Ionicons name="close" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {subcategoryOptions.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.subcategoryScroll}
          contentContainerStyle={styles.subcategoryContent}
        >
          {subcategoryOptions.map((label) => {
            const active = activeSubcategory === label;
            return (
              <TouchableOpacity
                key={label}
                style={[styles.subcategoryChip, active && styles.subcategoryChipActive]}
                onPress={() => setActiveSubcategory(label)}
              >
                <Text style={[styles.subcategoryText, active && styles.subcategoryTextActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <ScrollFilters
        activeDeliveryFilter={activeDeliveryFilter}
        onChange={setActiveDeliveryFilter}
      />

      <Text style={styles.storeCount}>
        {filteredStores.length} résultat{filteredStores.length > 1 ? 's' : ''}
      </Text>

      <FlatList
        data={filteredStores}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.storesList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="storefront-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>Aucun établissement</Text>
            <Text style={styles.emptySubtitle}>Revenez plus tard ou modifiez votre recherche.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            variant="list"
            onPress={() => navigation.navigate('Restaurant', { restaurant: item })}
          />
        )}
      />

      <BottomCartBar
        count={cartCount}
        total={cartTotal}
        onPress={() => navigation.navigate('Cart')}
      />
    </SafeAreaView>
  );
}

function ScrollFilters({
  activeDeliveryFilter,
  onChange,
}: {
  activeDeliveryFilter: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.deliveryFiltersContent}>
      {DELIVERY_FILTERS.map((filter) => (
        <TouchableOpacity
          key={filter.value}
          style={[styles.filterChip, activeDeliveryFilter === filter.value && styles.filterChipActive]}
          onPress={() => onChange(filter.value)}
        >
          <Text
            style={[
              styles.filterText,
              activeDeliveryFilter === filter.value && styles.filterTextActive,
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButton: { padding: SPACING.xs, marginRight: SPACING.xs },
  headerTitle: { flex: 1, fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text },
  subcategoryScroll: { maxHeight: 48, marginBottom: SPACING.sm },
  subcategoryContent: { paddingHorizontal: SPACING.md, gap: SPACING.sm, alignItems: 'center' },
  subcategoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.backgroundSecondary,
    marginRight: SPACING.sm,
  },
  subcategoryChipActive: {
    backgroundColor: COLORS.primary + '18',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  subcategoryText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: '600' },
  subcategoryTextActive: { color: COLORS.primary },
  errorText: { color: COLORS.error, marginHorizontal: SPACING.md, marginBottom: SPACING.sm },
  deliveryFiltersContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.backgroundSecondary,
  },
  filterChipActive: { backgroundColor: COLORS.primary + '20' },
  filterText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  filterTextActive: { color: COLORS.primary, fontWeight: '600' },
  storeCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  storesList: { paddingHorizontal: SPACING.md, paddingBottom: 100 },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xl * 2 },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', marginTop: SPACING.md },
  emptySubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: SPACING.xs },
});
