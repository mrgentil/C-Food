import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../theme';
import { RestaurantCard, CategoryItem, PromoBanner, BottomCartBar, CartBadge, DeliveryTypeSelector, CategorySwitcher } from '../components';
import type { CategoryTabItem } from '../components/CategorySwitcher';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { restaurantService } from '../services/restaurantService';
import { appTabService, type AppTab } from '../services/appTabService';
import { mergeAppTabsWithFallback } from '../utils/mergeAppTabs';
import type { RootStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { getUserAvatarUri } from '../utils/resolveUserPhotoUrl';
import { mapApiCategoryToUi, mapApiRestaurantToUi } from '../utils/mapApiToUi';
import type { Promotion } from '../types';
import { promoService } from '../services/promoService';
import type { ApiPromoCode } from '../types/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function formatGeocodedAddress(addr: Location.LocationGeocodedAddress): string {
  const streetLine = [addr.streetNumber, addr.street].filter(Boolean).join(' ').trim();
  const chunks = [
    streetLine || (addr.name?.trim() ?? ''),
    addr.district,
    addr.subregion,
    addr.city,
    addr.region,
    addr.country,
  ]
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter(Boolean);
  return [...new Set(chunks)].join(', ');
}

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { cartCount, cartTotal, deliveryType, setDeliveryType } = useCart();
  const { user, refreshUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const hasCFoodPass = useMemo(() => !!user?.dash_pass, [user?.dash_pass]);
  const [activeCategory, setActiveCategory] = useState('restaurant');
  const [appTabs, setAppTabs] = useState<AppTab[]>([]);

  const switcherTabs: CategoryTabItem[] = useMemo(() => {
    if (appTabs.length > 0) {
      return mergeAppTabsWithFallback(appTabs);
    }
    return mergeAppTabsWithFallback([]);
  }, [appTabs]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [featuredRestaurants, setFeaturedRestaurants] = useState<any[]>([]);
  const [nearRestaurants, setNearRestaurants] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string>('Chargement...');

  const avatarUri = getUserAvatarUri(user?.photo);
  const [promotions, setPromotions] = useState<Array<{ banner: Promotion; promo: ApiPromoCode }>>(
    []
  );

  const mapPromoToBanner = (p: ApiPromoCode): Promotion => {
    const discount = p.type === 'percent' ? `${p.value}%` : `${p.value.toLocaleString()} FC`;
    const min = p.min_subtotal ? ` · min ${p.min_subtotal.toLocaleString()} FC` : '';
    const expiry = p.expires_at ? new Date(p.expires_at).toLocaleDateString('fr-FR') : '—';
    return {
      id: p.code,
      title: `Offre ${discount}`,
      description: `Code: ${p.code}${min}`,
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200',
      code: p.code,
      discount,
      expiryDate: expiry,
    };
  };

  const getCurrentLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setCurrentLocation((prev) =>
          prev !== 'Chargement...' && prev.length > 2 ? prev : 'Activez la localisation (réglages)'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });

      let locStr = '';
      if (addresses?.length) {
        locStr = formatGeocodedAddress(addresses[0]);
      }
      if (!locStr) {
        locStr = `Position actuelle (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°)`;
      }

      setCurrentLocation(locStr);

      await AsyncStorage.setItem(
        'user_location',
        JSON.stringify({
          latitude,
          longitude,
          address: locStr,
        })
      );
    } catch (err) {
      console.log('Erreur géolocalisation:', err);
      setCurrentLocation((prev) =>
        prev !== 'Chargement...' && prev.length > 2 ? prev : 'Impossible de lire la position'
      );
    }
  }, []);

  const loadAppTabs = useCallback(async (selectHomeTab = false) => {
    try {
      const tabs = await appTabService.listPublished();
      setAppTabs(tabs);
      if (selectHomeTab) {
        const home = tabs.find((t) => t.is_home_tab) || tabs[0];
        if (home) setActiveCategory(home.slug);
      }
    } catch {
      setAppTabs([]);
    }
  }, []);

  useEffect(() => {
    fetchData();
    loadAppTabs(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshUser();
      getCurrentLocation();
      loadAppTabs(false);
    }, [refreshUser, getCurrentLocation, loadAppTabs])
  );

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('user_location');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.address && typeof parsed.address === 'string') {
            setCurrentLocation(parsed.address);
          }
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Use last known location to fetch restaurants sorted by distance (\"près de chez vous\").
      let loc: { latitude?: number; longitude?: number } | null = null;
      try {
        const raw = await AsyncStorage.getItem('user_location');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof parsed?.latitude === 'number' && typeof parsed?.longitude === 'number') {
            loc = { latitude: parsed.latitude, longitude: parsed.longitude };
          }
        }
      } catch {
        loc = null;
      }

      const [restaurantsRes, categoriesRes, promosRes] = await Promise.all([
        restaurantService.getAll('restaurant', loc ? { lat: loc.latitude, lng: loc.longitude, radius_km: 25 } : undefined),
        restaurantService.getCategories(),
        promoService.list().catch(() => ({ data: [] } as any)),
      ]);
      if (restaurantsRes?.data) {
        const allRestaurants = restaurantsRes.data.map(mapApiRestaurantToUi);
        setFeaturedRestaurants(allRestaurants.filter((r) => r.featured));
        // Near = open restaurants ordered by computed distance (when available).
        setNearRestaurants(allRestaurants.filter((r) => r.isOpen));
      }
      const apiCategories = categoriesRes.categories;
      if (Array.isArray(apiCategories)) {
        setCategories(apiCategories.map(mapApiCategoryToUi));
      }

      const promoRows: ApiPromoCode[] = Array.isArray((promosRes as any)?.data)
        ? (promosRes as any).data
        : [];
      setPromotions(promoRows.map((p) => ({ banner: mapPromoToBanner(p), promo: p })));
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Erreur de chargement';
      setError(errorMsg);
      console.log('API unavailable, using mock data');
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    const normalized = categoryId === 'restaurants' ? 'restaurant' : categoryId;
    const apiTab = appTabs.find((t) => t.slug === normalized);

    if (apiTab?.is_home_tab || normalized === 'restaurant') {
      setActiveCategory(normalized);
      return;
    }

    const label =
      apiTab?.name || switcherTabs.find((t) => t.id === normalized)?.name || normalized;

    navigation.navigate('StoreList', {
      storeType: normalized,
      title: label,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.location} onPress={() => navigation.navigate('SavedPlaces')}>
          <Ionicons name="location" size={20} color={COLORS.primary} />
          <View style={styles.locationText}>
            <Text style={styles.deliveryLabel}>
              {deliveryType === 'delivery' ? 'Livraison à' : 'Récupération à'}
            </Text>
            <View style={styles.addressRow}>
              <Text style={styles.address} numberOfLines={1}>{currentLocation}</Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.primary} />
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <CartBadge
            variant="pill"
            count={cartCount}
            onPress={() => navigation.navigate('Cart')}
          />
          <View style={styles.headerDivider} />
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
            <Image source={{ uri: avatarUri }} style={styles.headerAvatar} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Delivery Type Selector */}
        <DeliveryTypeSelector type={deliveryType} onChange={setDeliveryType} />

        {/* Category Switcher */}
        <CategorySwitcher
          tabs={switcherTabs}
          activeCategory={activeCategory}
          onChange={setActiveCategory}
          onPress={handleCategoryChange}
        />

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.9}
        >
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <Text style={styles.searchPlaceholder}>Restaurants, plats, cuisines...</Text>
          <View style={styles.filterButton}>
            <Ionicons name="options-outline" size={20} color={COLORS.primary} />
          </View>
        </TouchableOpacity>

        {/* Deals Button */}
        <TouchableOpacity
          style={styles.dealsButton}
          onPress={() => navigation.navigate('Deals')}
        >
          <View style={styles.dealsIconContainer}>
            <Ionicons name="pricetag-outline" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.dealsInfo}>
            <Text style={styles.dealsTitle}>Offres & Promotions</Text>
            <Text style={styles.dealsSubtitle}>Découvrez nos meilleures offres</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {/* CFoodPass Promo */}
        {hasCFoodPass ? (
          <TouchableOpacity
            style={styles.dashPassBadge}
            onPress={() => navigation.navigate('DashPass')}
          >
            <View style={styles.dashPassContent}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.background} />
              <Text style={styles.dashPassText}>CFoodPass Actif</Text>
            </View>
            <Text style={styles.dashPassSubtext}>Livraison gratuite incluse</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.dashPassPromo}
            onPress={() => navigation.navigate('DashPass')}
          >
            <View style={styles.dashPassPromoLeft}>
              <Ionicons name="flash" size={20} color={COLORS.background} />
              <View>
                <Text style={styles.dashPassPromoTitle}>Essai CFoodPass Gratuit</Text>
                <Text style={styles.dashPassPromoSubtitle}>Livraison gratuite sur toutes les commandes</Text>
              </View>
            </View>
            <Text style={styles.dashPassPromoButton}>S'abonner</Text>
          </TouchableOpacity>
        )}

        {/* Map View Toggle */}
        <TouchableOpacity
          style={styles.mapToggle}
          onPress={() => navigation.navigate('MapView', { category: activeCategory })}
        >
          <Ionicons name="map-outline" size={20} color={COLORS.primary} />
          <Text style={styles.mapToggleText}>Voir sur la carte</Text>
        </TouchableOpacity>

        {/* Promotions */}
        <View style={styles.section}>
          <FlatList
            horizontal
            data={promotions}
            keyExtractor={(item) => item.promo.code}
            renderItem={({ item }) => (
              <PromoBanner
                promotion={item.banner}
                onPress={() => navigation.navigate('PromoDetail', { promo: item.promo })}
              />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promoList}
            snapToInterval={350}
            decelerationRate="fast"
          />
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cuisines & styles</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={categories}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <CategoryItem
                category={item}
                onPress={() => navigation.navigate('CategoryDetail', { category: item.name })}
              />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          />
        </View>

        {/* Featured Restaurants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>En vedette</Text>
          <FlatList
            horizontal
            data={featuredRestaurants}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <RestaurantCard restaurant={item} onPress={() => navigation.navigate('Restaurant', { restaurant: item })} />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.restaurantList}
          />
        </View>

        {/* Nearby Restaurants */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Près de chez vous</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.nearbyList}>
            {nearRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                variant="list"
                onPress={() => navigation.navigate('Restaurant', { restaurant })}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Cart Bar */}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    paddingRight: SPACING.xs,
  },
  locationText: {
    marginLeft: SPACING.sm,
    flex: 1,
    minWidth: 0,
  },
  deliveryLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  address: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: SPACING.sm,
    paddingLeft: SPACING.xs,
  },
  headerDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.borderLight,
  },
  profileButton: {
    padding: 2,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    ...SHADOWS.sm,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    marginLeft: SPACING.sm,
  },
  filterButton: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.xs,
  },
  dealsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  dealsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  dealsInfo: {
    flex: 1,
  },
  dealsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  dealsSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dashPassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.success + '20',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  dashPassContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dashPassText: {
    color: COLORS.success,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  dashPassSubtext: {
    color: COLORS.success,
    fontSize: FONT_SIZES.sm,
  },
  dashPassPromo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  dashPassPromoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  dashPassPromoTitle: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  dashPassPromoSubtitle: {
    color: COLORS.background,
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  dashPassPromoButton: {
    color: COLORS.primary,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  mapToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  mapToggleText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
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
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  seeAll: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  promoList: {
    paddingHorizontal: SPACING.sm,
  },
  categoryList: {
    paddingHorizontal: SPACING.sm,
  },
  restaurantList: {
    paddingHorizontal: SPACING.sm,
  },
  nearbyList: {
    paddingHorizontal: SPACING.md,
  },
});
