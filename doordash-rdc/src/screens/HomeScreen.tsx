import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SPACING, BORDER_RADIUS, FONT_SIZES, COLORS } from '../theme';
import {
  PromoBanner,
  BottomCartBar,
  CartBadge,
  CategoryItem,
  SectionHeader,
  ShopTypeCard,
  EnategaRestaurantCard,
} from '../components';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { restaurantService } from '../services/restaurantService';
import { shopTypeService, ShopType } from '../services/shopTypeService';
import { brandService, Brand } from '../services/brandService';
import type { RootStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { getUserAvatarUri } from '../utils/resolveUserPhotoUrl';
import { mapApiCategoryToUi, mapApiRestaurantToUi } from '../utils/mapApiToUi';
import type { Promotion, Restaurant } from '../types';
import { promoService } from '../services/promoService';
import type { ApiPromoCode } from '../types/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Bannières publicitaires (à remplacer par des données API plus tard)
const AD_BANNERS = [
  {
    id: '1',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Livraison GRATUITE',
    subtitle: 'Sur votre 1ère commande avec le code BIENVENUE',
    color: '#0EA5E9',
  },
  {
    id: '2',
    image: 'https://images.pexels.com/photos/1049620/pexels-photo-1049620.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: '-30% sur les Pizzas',
    subtitle: 'Offre limitée ce weekend uniquement',
    color: '#FF6B00',
  },
  {
    id: '3',
    image: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Parrainez un ami',
    subtitle: 'Gagnez 5000 FC pour chaque ami parrainé',
    color: '#8B5CF6',
  },
  {
    id: '4',
    image: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Menu du jour',
    subtitle: 'Découvrez notre sélection spéciale à petit prix',
    color: '#10B981',
  },
];

function formatGeocodedAddress(addr: Location.LocationGeocodedAddress): string {
  const streetLine = [addr.streetNumber, addr.street].filter(Boolean).join(' ').trim();
  const chunks = [
    streetLine || (addr.name?.trim() ?? ''),
    addr.city,
    addr.region,
  ]
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter(Boolean);
  return [...new Set(chunks)].join(', ');
}

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { cartCount, cartTotal } = useCart();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const adBannerRef = useRef<FlatList>(null);
  const adIndexRef = useRef(0);
  const [error, setError] = useState('');

  // Data States
  const [shopTypes, setShopTypes] = useState<ShopType[]>([]);
  const [freshFinds, setFreshFinds] = useState<ShopType[]>([]);
  const [groceryPicks, setGroceryPicks] = useState<ShopType[]>([]);
  const [ourBrands, setOurBrands] = useState<Brand[]>([]);
  const [restaurantBrands, setRestaurantBrands] = useState<Brand[]>([]);
  const [groceryBrands, setGroceryBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [promotions, setPromotions] = useState<Array<{ banner: Promotion; promo: ApiPromoCode }>>([]);

  const [currentLocation, setCurrentLocation] = useState<string>('Chargement...');
  const avatarUri = getUserAvatarUri(user?.photo);

  const mapPromoToBanner = (p: ApiPromoCode): Promotion => {
    const discount = p.type === 'percent' ? `${p.value}%` : `${p.value.toLocaleString()} FC`;
    const min = p.min_subtotal ? ` · min ${p.min_subtotal.toLocaleString()} FC` : '';
    const expiry = p.expires_at ? new Date(p.expires_at).toLocaleDateString('fr-FR') : '—';
    return {
      id: p.code,
      title: `Offre ${discount}`,
      description: `Code: ${p.code}${min}`,
      image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=800',
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
          prev !== 'Chargement...' && prev.length > 2 ? prev : 'Location requise'
        );
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = location.coords;
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });

      let locStr = addresses?.length
        ? formatGeocodedAddress(addresses[0])
        : `Position (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;
      setCurrentLocation(locStr || 'Position actuelle');
      await AsyncStorage.setItem(
        'user_location',
        JSON.stringify({ latitude, longitude, address: locStr })
      );
    } catch (err) {
      setCurrentLocation('Position inconnue');
    }
  }, []);

  // Auto-scroll ad banners
  useEffect(() => {
    const interval = setInterval(() => {
      adIndexRef.current = (adIndexRef.current + 1) % AD_BANNERS.length;
      adBannerRef.current?.scrollToIndex({
        index: adIndexRef.current,
        animated: true,
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshUser();
      getCurrentLocation();
    }, [refreshUser, getCurrentLocation])
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      let loc: { latitude?: number; longitude?: number } | null = null;
      try {
        const raw = await AsyncStorage.getItem('user_location');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof parsed?.latitude === 'number' && typeof parsed?.longitude === 'number') {
            loc = { latitude: parsed.latitude, longitude: parsed.longitude };
          }
        }
      } catch {}

      const [
        resRestaurants,
        resCategories,
        resPromos,
        resShopTypes,
        resFreshFinds,
        resGroceryPicks,
        resOurBrands,
        resRestaurantBrands,
        resGroceryBrands,
      ] = await Promise.all([
        restaurantService.getAll(
          'restaurant',
          loc ? { lat: loc.latitude, lng: loc.longitude, radius_km: 25 } : undefined
        ),
        restaurantService.getCategories(),
        promoService.list().catch(() => ({ data: [] } as any)),
        shopTypeService.getByCategory('shop_type').catch(() => []),
        shopTypeService.getByCategory('fresh_finds').catch(() => []),
        shopTypeService.getByCategory('grocery_picks').catch(() => []),
        brandService.getByType('our_brand').catch(() => []),
        brandService.getByType('restaurant').catch(() => []),
        brandService.getByType('grocery').catch(() => []),
      ]);

      if (resRestaurants?.data) {
        setRestaurants(resRestaurants.data.map(mapApiRestaurantToUi));
      }
      if (Array.isArray(resCategories.categories)) {
        setCategories(resCategories.categories.map(mapApiCategoryToUi));
      }
      const promoRows: ApiPromoCode[] = Array.isArray((resPromos as any)?.data)
        ? (resPromos as any).data
        : [];
      setPromotions(promoRows.map((p) => ({ banner: mapPromoToBanner(p), promo: p })));

      setShopTypes(resShopTypes);
      setFreshFinds(resFreshFinds);
      setGroceryPicks(resGroceryPicks);
      setOurBrands(resOurBrands);
      setRestaurantBrands(resRestaurantBrands);
      setGroceryBrands(resGroceryBrands);
    } catch (err: any) {
      setError('Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  };

  // ── Brand row renderer ──
  const renderBrandRow = (brands: Brand[]) => (
    <FlatList
      horizontal
      data={brands}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.brandContainer}
          onPress={() => navigation.navigate('StoreList', { title: item.name, filter: { brand: item.name } })}
        >
          <View style={styles.brandCircle}>
            <Image
              source={{ uri: item.logo || 'https://via.placeholder.com/100' }}
              style={styles.brandLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brandName}>{item.name}</Text>
        </TouchableOpacity>
      )}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalList}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {/* ═══ HEADER ═══ */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.location}
          onPress={() => navigation.navigate('SavedPlaces')}
        >
          <View style={styles.locationIconWrapper}>
            <Ionicons name="location-outline" size={18} color="#a0a0a0" />
          </View>
          <View style={styles.locationText}>
            <Text style={styles.address} numberOfLines={1}>
              {currentLocation}
            </Text>
            <Text style={styles.deliveryLabel}>Localisation</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <CartBadge
            variant="pill"
            count={cartCount}
            onPress={() => navigation.navigate('Cart')}
          />
          <TouchableOpacity style={styles.circleBtn}>
            <Ionicons name="options-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => navigation.navigate('MapView', { category: 'restaurant' })}
          >
            <Ionicons name="map-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ═══ 1. BARRE DE RECHERCHE ═══ */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.9}
        >
          <Ionicons name="search" size={20} color="#a0a0a0" />
          <Text style={styles.searchPlaceholder}>
            Rechercher des restaurants, plats...
          </Text>
        </TouchableOpacity>

        {/* ═══ 2. SLIDER PROMOS ═══ */}
        {promotions.length > 0 && (
          <View style={styles.heroSection}>
            <FlatList
              horizontal
              data={promotions}
              keyExtractor={(item) => item.promo.code}
              renderItem={({ item }) => (
                <PromoBanner
                  promotion={item.banner}
                  onPress={() =>
                    navigation.navigate('PromoDetail', { promo: item.promo })
                  }
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.heroPromoList}
              pagingEnabled
              snapToInterval={SCREEN_WIDTH}
              decelerationRate="fast"
            />
          </View>
        )}
        {/* ═══ BANNIÈRE PUBLICITAIRE (Auto-scroll) ═══ */}
        <View style={styles.adSection}>
          <FlatList
            ref={adBannerRef}
            horizontal
            data={AD_BANNERS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.adBanner, { backgroundColor: item.color }]}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.adBannerImage}
                  resizeMode="cover"
                />
                <View style={styles.adBannerOverlay} />
                <View style={styles.adBannerContent}>
                  <Text style={styles.adBannerTitle}>{item.title}</Text>
                  <Text style={styles.adBannerSubtitle}>{item.subtitle}</Text>
                </View>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToInterval={SCREEN_WIDTH - SPACING.md * 2}
            snapToAlignment="center"
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: SPACING.md }}
            onScrollToIndexFailed={() => {}}
          />
        </View>

        {/* ═══ 3. POPULAIRE EN CE MOMENT ═══ */}
        {restaurants.filter((r) => r.featured).length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Populaire en ce moment"
              onSeeAllPress={() => navigation.navigate('StoreList', { title: 'Populaire en ce moment', filter: { featured: true } })}
            />
            <FlatList
              horizontal
              data={restaurants.filter((r) => r.featured)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <EnategaRestaurantCard
                  restaurant={item}
                  onPress={() =>
                    navigation.navigate('Restaurant', { restaurant: item })
                  }
                  width={300}
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}


        {/* ═══ 4. CATÉGORIES (Shop Types) ═══ */}
        {shopTypes.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Catégories"
              subtitle="Parcourir les boutiques"
              onSeeAllPress={() => navigation.navigate('GenericGrid', { title: 'Catégories', type: 'shop_type', data: shopTypes })}
            />
            <FlatList
              horizontal
              data={shopTypes}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <ShopTypeCard
                  name={item.name}
                  image={item.image || ''}
                  onPress={() => navigation.navigate('StoreList', { title: item.name, filter: { category: item.name } })}
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* ═══ 5. J'AI ENVIE DE MANGER (Cuisines) ═══ */}
        {categories.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="J'ai envie de manger"
              onSeeAllPress={() => navigation.navigate('GenericGrid', { title: 'Cuisines', type: 'category', data: categories })}
            />
            <FlatList
              horizontal
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <CategoryItem
                  isDark
                  category={item}
                  onPress={() =>
                    navigation.navigate('CategoryDetail', { category: item.name })
                  }
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* ═══ 6. RESTAURANTS PRÈS DE CHEZ VOUS (carrousel horizontal) ═══ */}
        {restaurants.filter((r) => r.isOpen).length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Restaurants près de chez vous"
              subtitle="Ouverts maintenant"
              onSeeAllPress={() => navigation.navigate('StoreList', { title: 'Près de chez vous', filter: { nearby: true } })}
            />
            <FlatList
              horizontal
              data={restaurants.filter((r) => r.isOpen)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <EnategaRestaurantCard
                  restaurant={item}
                  onPress={() =>
                    navigation.navigate('Restaurant', { restaurant: item })
                  }
                  width={300}
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* ═══ 7. TROUVAILLES FRAÎCHES (Fresh Finds Await) ═══ */}
        {freshFinds.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Trouvailles fraîches"
              subtitle="Des produits frais vous attendent"
              onSeeAllPress={() => navigation.navigate('GenericGrid', { title: 'Trouvailles fraîches', type: 'shop_type', data: freshFinds })}
            />
            <FlatList
              horizontal
              data={freshFinds}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <ShopTypeCard
                  name={item.name}
                  image={item.image || ''}
                  onPress={() => navigation.navigate('StoreList', { title: item.name, filter: { category: item.name } })}
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* ═══ 8. TOP ÉPICERIE (Top Grocery Picks) ═══ */}
        {groceryPicks.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Top épicerie"
              subtitle="Les meilleurs produits"
              onSeeAllPress={() => navigation.navigate('GenericGrid', { title: 'Top épicerie', type: 'shop_type', data: groceryPicks })}
            />
            <FlatList
              horizontal
              data={groceryPicks}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <ShopTypeCard
                  name={item.name}
                  image={item.image || ''}
                  onPress={() => navigation.navigate('StoreList', { title: item.name, filter: { category: item.name } })}
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* ═══ 9. NOS MARQUES (Our Brands) ═══ */}
        {ourBrands.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Nos marques" onSeeAllPress={() => navigation.navigate('GenericGrid', { title: 'Nos marques', type: 'brand', data: ourBrands })} />
            {renderBrandRow(ourBrands)}
          </View>
        )}

        {/* ═══ 10. GRANDES MARQUES RESTAURANTS ═══ */}
        {restaurantBrands.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Grandes marques restaurants"
              onSeeAllPress={() => navigation.navigate('GenericGrid', { title: 'Grandes marques restaurants', type: 'brand', data: restaurantBrands })}
            />
            {renderBrandRow(restaurantBrands)}
          </View>
        )}

        {/* ═══ 11. MARQUES ÉPICERIE (Grocery Brands) ═══ */}
        {groceryBrands.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Marques épicerie"
              onSeeAllPress={() => navigation.navigate('GenericGrid', { title: 'Marques épicerie', type: 'brand', data: groceryBrands })}
            />
            {renderBrandRow(groceryBrands)}
          </View>
        )}

        {/* ═══ 12. TOUS LES RESTAURANTS ═══ */}
        {restaurants.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Tous les restaurants"
              subtitle="Les plus commandés"
              onSeeAllPress={() => navigation.navigate('StoreList', { title: 'Tous les restaurants' })}
            />
            <View style={styles.verticalList}>
              {restaurants.map((restaurant) => (
                <EnategaRestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onPress={() =>
                    navigation.navigate('Restaurant', { restaurant })
                  }
                  width={SCREEN_WIDTH - SPACING.md * 2}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

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
    backgroundColor: '#000000',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 999,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    justifyContent: 'space-between',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  address: {
    color: '#ffffff',
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  deliveryLabel: {
    color: '#a0a0a0',
    fontSize: FONT_SIZES.xs,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1c1c1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: '#a0a0a0',
    marginLeft: SPACING.sm,
  },
  heroSection: {
    marginBottom: SPACING.md,
  },
  heroPromoList: {
    paddingHorizontal: 0,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  adSection: {
    marginBottom: SPACING.xl,
  },
  adBanner: {
    width: SCREEN_WIDTH - SPACING.md * 2,
    height: 140,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginRight: SPACING.md,
    position: 'relative',
  },
  adBannerImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  adBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  adBannerContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: SPACING.md,
  },
  adBannerTitle: {
    color: '#ffffff',
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
  },
  adBannerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FONT_SIZES.sm,
    marginTop: 4,
  },
  horizontalList: {
    paddingHorizontal: SPACING.md,
  },
  verticalList: {
    paddingHorizontal: SPACING.md,
  },
  brandContainer: {
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  brandCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  brandLogo: {
    width: '80%',
    height: '80%',
  },
  brandName: {
    color: '#ffffff',
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
});
