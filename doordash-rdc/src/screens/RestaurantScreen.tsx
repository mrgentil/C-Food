import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import { CustomHeader, MenuItemCard, BottomCartBar } from '../components';
import { useCart } from '../context/CartContext';
import { restaurantService } from '../services/restaurantService';
import type { RootStackParamList } from '../navigation/types';
import { mapApiMenuItemToUi, mapApiRestaurantToUi } from '../utils/mapApiToUi';

const SHADOWS = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 3,
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteParams = RouteProp<RootStackParamList, 'Restaurant'>;

const { width } = Dimensions.get('window');

export default function RestaurantScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParams>();
  const { restaurant: initialRestaurant } = route.params;
  const { addToCart, cartCount, cartTotal } = useCart();
  const [activeCategory, setActiveCategory] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [restaurant, setRestaurant] = useState(initialRestaurant);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const categories = [...new Set(menuItems.map(item => item.category))];
  const visibleMenuItems =
    categories.length > 0 ? menuItems.filter(i => i.category === categories[activeCategory]) : menuItems;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [restaurantRes, menuRes] = await Promise.all([
        restaurantService.getById(initialRestaurant.id),
        restaurantService.getMenu(initialRestaurant.id),
      ]);
      if (restaurantRes?.data) {
        setRestaurant(mapApiRestaurantToUi(restaurantRes.data));
      }
      if (menuRes?.data) {
        setMenuItems(menuRes.data.map(mapApiMenuItemToUi));
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Erreur de chargement';
      setError(errorMsg);
      console.log('API unavailable, using mock data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Hero Image */}
      <View style={styles.heroContainer}>
        <Image source={{ uri: restaurant.image }} style={styles.heroImage} />
        <View style={styles.heroOverlay} />
        <CustomHeader title={restaurant.name} transparent showCart />
      </View>

      {/* Restaurant Info */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.ratingBox}>
            <Text style={styles.rating}>{restaurant.rating}</Text>
            <Text style={styles.reviews}>({restaurant.reviewCount} avis)</Text>
          </View>
          <View style={styles.infoDivider} />
          <Text style={styles.deliveryTime}>{restaurant.deliveryTime}</Text>
          <View style={styles.infoDivider} />
          <Text style={styles.distance}>{restaurant.distance}</Text>
        </View>
        <View style={styles.tags}>
          {restaurant.categories.map((cat, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{cat}</Text>
            </View>
          ))}
        </View>
        {restaurant.discount && (
          <View style={styles.discountBadge}>
            <Ionicons name="pricetag" size={16} color={COLORS.primary} />
            <Text style={styles.discountText}>{restaurant.discount} sur cette commande</Text>
          </View>
        )}
      </View>

      {/* Category Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
        {categories.map((cat, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.tab, activeCategory === index && styles.tabActive]}
            onPress={() => setActiveCategory(index)}
          >
            <Text style={[styles.tabText, activeCategory === index && styles.tabTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Menu Items */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.menu}>
        {visibleMenuItems.map(item => (
          <MenuItemCard
            key={item.id}
            item={item}
            onPress={() => navigation.navigate('ItemDetail', { item })}
            onAdd={() => addToCart(item)}
          />
        ))}
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
    backgroundColor: '#000000',
  },
  heroContainer: {
    height: 220,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  infoCard: {
    backgroundColor: '#1c1c1e',
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#2c2c2e',
    ...SHADOWS,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  ratingBox: {
    alignItems: 'center',
  },
  rating: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: '#ffffff',
  },
  reviews: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  infoDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#2c2c2e',
  },
  deliveryTime: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#ffffff',
  },
  distance: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tag: {
    backgroundColor: '#2c2c2e',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  tagText: {
    fontSize: FONT_SIZES.sm,
    color: '#ffffff',
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.sm,
  },
  discountText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  tabs: {
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2e',
  },
  tab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  menu: {
    flex: 1,
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
});

