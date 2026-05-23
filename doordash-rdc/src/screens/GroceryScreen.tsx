import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import { RestaurantCard, BottomCartBar, CartBadge } from '../components';
import { useCart } from '../context/CartContext';
import type { RootStackParamList } from '../navigation/types';
import { useStoreRestaurants } from '../hooks/useStoreRestaurants';

const SUBCATEGORIES = [
  'Tous',
  'Fruits & Légumes',
  'Céréales',
  'Boissons',
  'Produits laitiers',
  'Viandes',
  'Huiles',
  'Snacks',
];

const DELIVERY_FILTERS = [
  { label: 'Tout', value: 'all' },
  { label: 'Livraison gratuite', value: 'free' },
  { label: 'Moins de 30 min', value: 'fast' },
];

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function GroceryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { cartCount, cartTotal } = useCart();
  const [activeSubcategory, setActiveSubcategory] = useState('Tous');
  const [activeDeliveryFilter, setActiveDeliveryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const { loading, error, restaurants } = useStoreRestaurants('grocery');

  const filteredStores = useMemo(() => {
    return restaurants.filter(store => {
      if (activeSubcategory !== 'Tous' && !(store.categories || []).includes(activeSubcategory)) {
        return false;
      }
      if (activeDeliveryFilter === 'free' && (store.deliveryFee ?? 0) > 0) {
        return false;
      }
      if (activeDeliveryFilter === 'fast') {
        const time = parseInt(String(store.deliveryTime).split('-')[0]);
        if (Number.isFinite(time) && time > 30) return false;
      }
      if (searchQuery && !store.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [restaurants, activeSubcategory, activeDeliveryFilter, searchQuery]);

  const handleStorePress = (store: any) => {
    navigation.navigate('Restaurant', { restaurant: store });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (filteredStores.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Épicerie</Text>
          <View style={styles.headerRight}>
            <CartBadge variant="pill" count={cartCount} onPress={() => navigation.navigate('Cart')} />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => setShowSearch(!showSearch)}
            >
              <Ionicons name="search" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>

        {showSearch && (
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={COLORS.textSecondary} />
            <TouchableOpacity
              style={styles.closeSearch}
              onPress={() => {
                setShowSearch(false);
                setSearchQuery('');
              }}
            >
              <Ionicons name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.subcategories}
          contentContainerStyle={styles.subcategoriesContent}
        >
          {SUBCATEGORIES.map((sub) => (
            <TouchableOpacity
              key={sub}
              style={[
                styles.subcategoryChip,
                activeSubcategory === sub && styles.subcategoryChipActive,
              ]}
              onPress={() => setActiveSubcategory(sub)}
            >
              <Text
                style={[
                  styles.subcategoryText,
                  activeSubcategory === sub && styles.subcategoryTextActive,
                ]}
              >
                {sub}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>Aucune épicerie trouvée</Text>
          <Text style={styles.emptySubtitle}>
            Essayez de modifier vos filtres ou votre recherche
          </Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setActiveSubcategory('Tous');
              setActiveDeliveryFilter('all');
              setSearchQuery('');
            }}
          >
            <Text style={styles.resetButtonText}>Réinitialiser les filtres</Text>
          </TouchableOpacity>
        </View>

        <BottomCartBar
          count={cartCount}
          total={cartTotal}
          onPress={() => navigation.navigate('Cart')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Épicerie</Text>
        <View style={styles.headerRight}>
          <CartBadge variant="pill" count={cartCount} onPress={() => navigation.navigate('Cart')} />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setShowSearch(!showSearch)}
          >
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
            placeholder="Rechercher une épicerie…"
            placeholderTextColor={COLORS.textSecondary}
            style={styles.searchInput}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.closeSearch}
            onPress={() => {
              setShowSearch(false);
              setSearchQuery('');
            }}
          >
            <Ionicons name="close" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.subcategories}
        contentContainerStyle={styles.subcategoriesContent}
      >
        {SUBCATEGORIES.map((sub) => (
          <TouchableOpacity
            key={sub}
            style={[
              styles.subcategoryChip,
              activeSubcategory === sub && styles.subcategoryChipActive,
            ]}
            onPress={() => setActiveSubcategory(sub)}
          >
            <Text
              style={[
                styles.subcategoryText,
                activeSubcategory === sub && styles.subcategoryTextActive,
              ]}
            >
              {sub}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.deliveryFilters}
        contentContainerStyle={styles.deliveryFiltersContent}
      >
        {DELIVERY_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterChip,
              activeDeliveryFilter === filter.value && styles.filterChipActive,
            ]}
            onPress={() => setActiveDeliveryFilter(filter.value)}
          >
            <Ionicons
              name={
                filter.value === 'free'
                  ? 'car-outline'
                  : filter.value === 'fast'
                  ? 'time-outline'
                  : 'list-outline'
              }
              size={14}
              color={activeDeliveryFilter === filter.value ? COLORS.primary : COLORS.textSecondary}
            />
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
      </ScrollView>

      <Text style={styles.storeCount}>
        {filteredStores.length} épicerie{filteredStores.length > 1 ? 's' : ''} disponible{filteredStores.length > 1 ? 's' : ''}
      </Text>

      <FlatList
        data={filteredStores}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.storesList}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            variant="list"
            onPress={() => handleStorePress(item)}
          />
        )}
      />

      <View style={styles.minOrderInfo}>
        <Ionicons name="information-circle-outline" size={16} color={COLORS.info} />
        <Text style={styles.minOrderText}>
          Commande minimum varie selon le magasin
        </Text>
      </View>

      <BottomCartBar
        count={cartCount}
        total={cartTotal}
        onPress={() => navigation.navigate('Cart')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.sm },
  loadingText: { color: COLORS.textSecondary },
  errorText: { color: COLORS.error, textAlign: 'center', paddingHorizontal: SPACING.md, paddingTop: SPACING.sm },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
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
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    paddingVertical: 0,
  },
  closeSearch: {
    marginLeft: 'auto',
  },
  subcategories: {
    marginTop: SPACING.sm,
    maxHeight: 48,
  },
  subcategoriesContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    alignItems: 'center',
  },
  subcategoryChip: {
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 0,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.backgroundSecondary,
    marginRight: SPACING.sm,
  },
  subcategoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  subcategoryText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  subcategoryTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  deliveryFilters: {
    marginTop: SPACING.md,
    maxHeight: 44,
  },
  deliveryFiltersContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 0,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  filterChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  filterText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  filterTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  storeCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  storesList: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  minOrderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.info + '10',
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.sm,
  },
  minOrderText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.info,
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  resetButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
