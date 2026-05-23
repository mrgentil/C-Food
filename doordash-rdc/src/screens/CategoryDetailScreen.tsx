import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import { RestaurantCard } from '../components';
import { RESTAURANTS } from '../data/mockData';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteParams = RouteProp<RootStackParamList, 'CategoryDetail'>;

type SortOption = 'rating' | 'deliveryTime' | 'distance';

export default function CategoryDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParams>();
  const categoryName = route.params?.category || '';

  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [filterRating, setFilterRating] = useState(false);
  const [filterDeliveryTime, setFilterDeliveryTime] = useState(false);
  const [filterDistance, setFilterDistance] = useState(false);

  const filteredRestaurants = useMemo(() => {
    let results = RESTAURANTS.filter(r =>
      r.categories.includes(categoryName) && r.isOpen
    );

    if (filterRating) {
      results = results.filter(r => r.rating >= 4.5);
    }
    if (filterDeliveryTime) {
      results = results.filter(r => {
        const time = parseInt(r.deliveryTime.split('-')[0]);
        return time <= 30;
      });
    }
    if (filterDistance) {
      results = results.filter(r => {
        const dist = parseFloat(r.distance);
        return dist <= 2.0;
      });
    }

    switch (sortBy) {
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'deliveryTime':
        results.sort((a, b) => {
          const aTime = parseInt(a.deliveryTime.split('-')[0]);
          const bTime = parseInt(b.deliveryTime.split('-')[0]);
          return aTime - bTime;
        });
        break;
      case 'distance':
        results.sort((a, b) => {
          const aDist = parseFloat(a.distance);
          const bDist = parseFloat(b.distance);
          return aDist - bDist;
        });
        break;
    }

    return results;
  }, [categoryName, sortBy, filterRating, filterDeliveryTime, filterDistance]);

  const toggleFilter = (filter: SortOption) => {
    setSortBy(filter);
    switch (filter) {
      case 'rating':
        setFilterRating(!filterRating);
        setFilterDeliveryTime(false);
        setFilterDistance(false);
        break;
      case 'deliveryTime':
        setFilterDeliveryTime(!filterDeliveryTime);
        setFilterRating(false);
        setFilterDistance(false);
        break;
      case 'distance':
        setFilterDistance(!filterDistance);
        setFilterRating(false);
        setFilterDeliveryTime(false);
        break;
    }
  };

  const getFilterStyle = (filter: SortOption) => {
    const isActive = (filter === 'rating' && filterRating) ||
                     (filter === 'deliveryTime' && filterDeliveryTime) ||
                     (filter === 'distance' && filterDistance);
    return [
      styles.filterButton,
      isActive && styles.filterButtonActive,
    ];
  };

  const getFilterTextStyle = (filter: SortOption) => {
    const isActive = (filter === 'rating' && filterRating) ||
                     (filter === 'deliveryTime' && filterDeliveryTime) ||
                     (filter === 'distance' && filterDistance);
    return [
      styles.filterText,
      isActive && styles.filterTextActive,
    ];
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryName}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={getFilterStyle('rating')}
          onPress={() => toggleFilter('rating')}
        >
          <Ionicons
            name="star"
            size={16}
            color={filterRating ? '#FFF' : COLORS.warning}
          />
          <Text style={getFilterTextStyle('rating')}>Note</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={getFilterStyle('deliveryTime')}
          onPress={() => toggleFilter('deliveryTime')}
        >
          <Ionicons
            name="time"
            size={16}
            color={filterDeliveryTime ? '#FFF' : COLORS.primary}
          />
          <Text style={getFilterTextStyle('deliveryTime')}>Livraison</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={getFilterStyle('distance')}
          onPress={() => toggleFilter('distance')}
        >
          <Ionicons
            name="location"
            size={16}
            color={filterDistance ? '#FFF' : COLORS.info}
          />
          <Text style={getFilterTextStyle('distance')}>Distance</Text>
        </TouchableOpacity>

        <View style={styles.resultsCount}>
          <Text style={styles.resultsCountText}>
            {filteredRestaurants.length} résultat{filteredRestaurants.length > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Restaurant List */}
      {filteredRestaurants.length > 0 ? (
        <FlatList
          data={filteredRestaurants}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <RestaurantCard
                restaurant={item}
                onPress={() => navigation.navigate('Restaurant', { restaurant: item })}
              />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.empty}>
          <Ionicons name="restaurant-outline" size={80} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>Aucun restaurant</Text>
          <Text style={styles.emptyText}>
            Aucun restaurant ouvert dans cette catégorie pour le moment
          </Text>
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={() => {
              setFilterRating(false);
              setFilterDeliveryTime(false);
              setFilterDistance(false);
              setSortBy('rating');
            }}
          >
            <Text style={styles.clearFiltersText}>Effacer les filtres</Text>
          </TouchableOpacity>
        </View>
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerRight: {
    width: 40,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.backgroundSecondary,
    gap: SPACING.xs,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFF',
  },
  resultsCount: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  resultsCountText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  listItem: {
    marginBottom: SPACING.md,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  clearFiltersButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  clearFiltersText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
