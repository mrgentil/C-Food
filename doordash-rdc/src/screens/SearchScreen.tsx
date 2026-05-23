import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../theme';
import { RestaurantCard, CustomHeader } from '../components';
import { restaurantService } from '../services/restaurantService';
import type { RootStackParamList } from '../navigation/types';
import type { Category, Restaurant } from '../types/domain';
import { mapApiCategoryToUi, mapApiRestaurantToUi } from '../utils/mapApiToUi';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteParams = RouteProp<RootStackParamList, 'Search'>;

type SortKey = 'relevance' | 'distance' | 'rating' | 'delivery_fee';

const RECENTS_KEY = 'recent_searches';

function parseDistanceKm(value: string): number | null {
  const s = String(value ?? '').replace(',', '.');
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParams>();
  const initial = route.params?.category || '';
  const [searchQuery, setSearchQuery] = useState(initial);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initial || null);
  const [sortKey, setSortKey] = useState<SortKey>('relevance');
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        const raw = await AsyncStorage.default.getItem(RECENTS_KEY);
        setRecentSearches(raw ? (JSON.parse(raw) as string[]) : []);
      } catch {
        setRecentSearches([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await restaurantService.getCategories();
        const rows = res.categories;
        setCategories(Array.isArray(rows) ? rows.map(mapApiCategoryToUi) : []);
      } catch {
        setCategories([]);
      }
    })();
  }, []);

  const persistRecent = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    const upper = trimmed.length > 48 ? trimmed.slice(0, 48) : trimmed;
    const next = [upper, ...recentSearches.filter((x) => x.toLowerCase() !== upper.toLowerCase())].slice(0, 10);
    setRecentSearches(next);
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.setItem(RECENTS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const runSearch = async (q: string) => {
    if (!q.trim()) {
      setRestaurants([]);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Send last known location so backend can sort by distance.
      let loc: { latitude?: number; longitude?: number } | null = null;
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        const raw = await AsyncStorage.default.getItem('user_location');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof parsed?.latitude === 'number' && typeof parsed?.longitude === 'number') {
            loc = { latitude: parsed.latitude, longitude: parsed.longitude };
          }
        }
      } catch {
        loc = null;
      }

      const res = await restaurantService.search(
        q,
        selectedCategory ? { category: selectedCategory } : undefined,
        loc ? { lat: loc.latitude, lng: loc.longitude, radius_km: 50 } : undefined
      );
      const rows = res.data;
      const mapped = Array.isArray(rows) ? rows.map(mapApiRestaurantToUi) : [];
      setRestaurants(mapped);
      persistRecent(q);
    } catch (err: any) {
      setRestaurants([]);
      setError(err.response?.data?.message || err.message || 'Erreur de recherche');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) return;
    runSearch(searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeQuery = (q: string) => {
    setSearchQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(q), 350);
  };

  const filteredAndSorted = useMemo(() => {
    let rows = restaurants;
    if (onlyOpen) rows = rows.filter((r) => r.isOpen);

    const toDistance = (r: Restaurant) => {
      const km = parseDistanceKm(r.distance);
      return km ?? Number.POSITIVE_INFINITY;
    };

    if (sortKey === 'distance') {
      rows = [...rows].sort((a, b) => toDistance(a) - toDistance(b));
    } else if (sortKey === 'rating') {
      rows = [...rows].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (sortKey === 'delivery_fee') {
      rows = [...rows].sort((a, b) => (a.deliveryFee ?? 0) - (b.deliveryFee ?? 0));
    }
    return rows;
  }, [restaurants, onlyOpen, sortKey]);

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Rechercher" showCart showBack={false} />

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Restaurants, plats, cuisines..."
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={onChangeQuery}
          autoFocus
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setSelectedCategory(null);
              setRestaurants([]);
              setError('');
            }}
          >
            <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {!searchQuery ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Recent Searches */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recherches récentes</Text>
              <TouchableOpacity
                onPress={async () => {
                  setRecentSearches([]);
                  try {
                    const AsyncStorage = await import('@react-native-async-storage/async-storage');
                    await AsyncStorage.default.removeItem(RECENTS_KEY);
                  } catch {
                    /* ignore */
                  }
                }}
              >
                <Text style={styles.clearAll}>Tout effacer</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.recentList}>
              {recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentItem}
                  onPress={() => onChangeQuery(search)}
                >
                  <Ionicons name="time-outline" size={18} color={COLORS.textSecondary} />
                  <Text style={styles.recentText}>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* All Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parcourir par catégorie</Text>
            <View style={styles.categoryGrid}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    selectedCategory === category.name && styles.categoryCardSelected,
                  ]}
                  onPress={() => setSelectedCategory(
                    selectedCategory === category.name ? null : category.name
                  )}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                    <Ionicons name={category.icon as any} size={28} color={category.color} />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        loading ? (
          <View style={styles.empty}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.emptyText}>Recherche...</Text>
          </View>
        ) :
        <FlatList
          data={filteredAndSorted}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <RestaurantCard
                restaurant={item}
                onPress={() => navigation.navigate('Restaurant', { restaurant: item })}
              />
            </View>
          )}
          ListHeaderComponent={
            <View style={styles.filtersBar}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
                <TouchableOpacity
                  style={[styles.chip, sortKey === 'distance' && styles.chipActive]}
                  onPress={() => setSortKey('distance')}
                >
                  <Text style={[styles.chipText, sortKey === 'distance' && styles.chipTextActive]}>Distance</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.chip, sortKey === 'rating' && styles.chipActive]}
                  onPress={() => setSortKey('rating')}
                >
                  <Text style={[styles.chipText, sortKey === 'rating' && styles.chipTextActive]}>Note</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.chip, sortKey === 'delivery_fee' && styles.chipActive]}
                  onPress={() => setSortKey('delivery_fee')}
                >
                  <Text style={[styles.chipText, sortKey === 'delivery_fee' && styles.chipTextActive]}>Frais</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.chip, onlyOpen && styles.chipActive]}
                  onPress={() => setOnlyOpen((v) => !v)}
                >
                  <Text style={[styles.chipText, onlyOpen && styles.chipTextActive]}>Ouvert</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>Aucun résultat</Text>
              <Text style={styles.emptyText}>
                {error || "Essayez avec d'autres termes de recherche"}
              </Text>
            </View>
          }
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    margin: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  clearAll: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  filtersBar: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  filtersRow: {
    gap: SPACING.sm,
  },
  chip: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.background,
  },
  recentList: {
    paddingHorizontal: SPACING.md,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: SPACING.sm,
  },
  recentText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.sm,
    gap: SPACING.sm,
  },
  categoryCard: {
    width: '30%',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  categoryCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  listItem: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  empty: {
    alignItems: 'center',
    marginTop: SPACING.xxl * 2,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
});
