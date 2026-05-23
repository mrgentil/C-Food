import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import { PromoBanner, RestaurantCard } from '../components';
import { RESTAURANTS } from '../data/mockData';
import type { RootStackParamList } from '../navigation/types';
import { promoService } from '../services/promoService';
import type { ApiPromoCode } from '../types/api';
import type { Promotion } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DealsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [promotions, setPromotions] = useState<Array<{ banner: Promotion; promo: ApiPromoCode }>>(
    []
  );
  const handleBack = () => {
    if ((navigation as any).canGoBack?.()) navigation.goBack();
    else navigation.navigate('Main');
  };

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

  useEffect(() => {
    (async () => {
      try {
        const res = await promoService.list();
        const rows: ApiPromoCode[] = Array.isArray(res.data) ? res.data : [];
        setPromotions(rows.map((p) => ({ banner: mapPromoToBanner(p), promo: p })));
      } catch {
        setPromotions([]);
      }
    })();
  }, []);

  const discountedRestaurants = useMemo(() =>
    RESTAURANTS.filter(r => r.discount && r.isOpen),
    []
  );

  const freeDeliveryRestaurants = useMemo(() =>
    RESTAURANTS.filter(r => r.deliveryFee === 0 && r.isOpen),
    []
  );

  const renderPromoItem = ({ item }: { item: { banner: Promotion; promo: ApiPromoCode } }) => (
    <TouchableOpacity
      style={styles.promoCard}
      onPress={() => navigation.navigate('PromoDetail', { promo: item.promo })}
    >
      <PromoBanner promotion={item.banner} onPress={() => navigation.navigate('PromoDetail', { promo: item.promo })} />
    </TouchableOpacity>
  );

  const renderDiscountedRestaurant = ({ item }: { item: typeof RESTAURANTS[0] }) => (
    <View style={styles.restaurantCard}>
      <RestaurantCard
        restaurant={item}
        onPress={() => navigation.navigate('Restaurant', { restaurant: item })}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Promos</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Promotions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Promotions près de chez vous</Text>
          </View>
          <FlatList
            data={promotions}
            keyExtractor={(item) => item.promo.code}
            renderItem={renderPromoItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promoList}
          />
        </View>

        {/* Restaurants with Discounts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Restaurants avec réductions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          {discountedRestaurants.length > 0 ? (
            <FlatList
              data={discountedRestaurants}
              keyExtractor={item => item.id}
              renderItem={renderDiscountedRestaurant}
              scrollEnabled={false}
              contentContainerStyle={styles.restaurantList}
            />
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>Aucune réduction disponible</Text>
            </View>
          )}
        </View>

        {/* Free Delivery Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.freeDeliveryHeader}>
              <Ionicons name="bicycle" size={20} color={COLORS.success} />
              <Text style={styles.sectionTitle}>Livraison gratuite</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          {freeDeliveryRestaurants.length > 0 ? (
            <FlatList
              data={freeDeliveryRestaurants}
              keyExtractor={item => item.id}
              renderItem={renderDiscountedRestaurant}
              scrollEnabled={false}
              contentContainerStyle={styles.restaurantList}
            />
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>Aucune livraison gratuite</Text>
            </View>
          )}
        </View>

        {/* DashPass Promo */}
        <TouchableOpacity
          style={styles.dashPassBanner}
          onPress={() => navigation.navigate('DashPass')}
        >
          <View style={styles.dashPassContent}>
            <View style={styles.dashPassBadge}>
              <Ionicons name="star" size={24} color={'#FFF'} />
            </View>
            <View style={styles.dashPassTextContainer}>
              <Text style={styles.dashPassTitle}>CFoodPass</Text>
              <Text style={styles.dashPassSubtitle}>
                Livraison gratuite sur toutes vos commandes
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={'#FFF'} />
          </View>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  freeDeliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  promoList: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  promoCard: {
    width: 300,
    marginRight: SPACING.md,
  },
  restaurantList: {
    paddingHorizontal: SPACING.md,
  },
  restaurantCard: {
    marginBottom: SPACING.md,
  },
  emptySection: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  dashPassBanner: {
    margin: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  dashPassContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  dashPassBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashPassTextContainer: {
    flex: 1,
  },
  dashPassTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: '#FFF',
  },
  dashPassSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.xs,
  },
  bottomSpacer: {
    height: SPACING.xxl,
  },
});
