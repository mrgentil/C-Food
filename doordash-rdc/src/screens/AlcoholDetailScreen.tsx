import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import { BottomCartBar } from '../components';
import { ALCOHOL_ITEMS } from '../data/mockData';
import { useCart } from '../context/CartContext';
import type { RootStackParamList } from '../navigation/types';
import type { Store } from '../data/mockData';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteParams = RouteProp<RootStackParamList, 'AlcoholDetail'>;

const SHADOWS = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 3,
};

const ADD_SHADOWS = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 4,
};

export default function AlcoholDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParams>();
  const { store } = route.params;
  const { addToCart, cartCount, cartTotal } = useCart();
  const [activeCategory, setActiveCategory] = useState(0);

  const items = ALCOHOL_ITEMS[store.id] || [];
  const categories = [...new Set(items.map(item => item.category))];

  const filteredItems = activeCategory === 0
    ? items
    : items.filter(item => item.category === categories[activeCategory - 1]);

  const allCategories = ['Tous', ...categories];

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      restaurantId: item.storeId,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      category: item.category,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroContainer}>
        <Image source={{ uri: store.image }} style={styles.heroImage} />
        <View style={styles.heroOverlay} />
        <View style={styles.heroHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => Alert.alert('Partager', 'Lien de partage copié!')}
          >
            <Ionicons name="share-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.nameRow}>
          <Text style={styles.storeName}>{store.name}</Text>
          <View style={styles.ageBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#FFF" />
            <Text style={styles.ageBadgeText}>18+</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={16} color={COLORS.warning} />
            <Text style={styles.rating}>{store.rating}</Text>
            <Text style={styles.reviews}>({store.reviewCount})</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.deliveryTime}>{store.deliveryTime}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.distance}>{store.distance}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.deliveryFee}>
            {store.deliveryFee === 0 ? 'Livraison gratuite' : `Livraison: ${store.deliveryFee.toLocaleString()} FC`}
          </Text>
          <View style={styles.minOrderBadge}>
            <Ionicons name="basket-outline" size={14} color={COLORS.primary} />
            <Text style={styles.minOrderText}>Min. {store.minOrder.toLocaleString()} FC</Text>
          </View>
        </View>
      </View>

      <View style={styles.responsibleBanner}>
        <Ionicons name="warning" size={16} color={COLORS.warning} />
        <Text style={styles.responsibleText}>
          À consommer avec modération. Vente interdite aux mineurs.
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabs}
        contentContainerStyle={styles.tabsContent}
      >
        {allCategories.map((cat, index) => (
          <TouchableOpacity
            key={cat}
            style={[styles.tab, activeCategory === index && styles.tabActive]}
            onPress={() => setActiveCategory(index)}
          >
            <Text style={[styles.tabText, activeCategory === index && styles.tabTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.productsList}>
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wine-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Aucun produit dans cette catégorie</Text>
          </View>
        ) : (
          filteredItems.map(item => (
            <View key={item.id} style={styles.productCard}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.productFooter}>
                  <Text style={styles.productPrice}>{item.price.toLocaleString()} FC</Text>
                  <Text style={styles.productUnit}>/{item.unit}</Text>
                </View>
              </View>
              {item.image && (
                <Image source={{ uri: item.image }} style={styles.productImage} />
              )}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddToCart(item)}
              >
                <Ionicons name="add" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          ))
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
    backgroundColor: COLORS.background,
  },
  heroContainer: {
    height: 200,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: COLORS.card,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  storeName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  ageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  ageBadgeText: {
    color: '#FFF',
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 2,
    marginRight: 2,
  },
  reviews: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  infoDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryTime: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  distance: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryFee: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  minOrderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  minOrderText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.primary,
  },
  responsibleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.warning + '10',
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.sm,
  },
  responsibleText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    fontWeight: '500',
  },
  tabs: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tabsContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  tab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
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
  productsList: {
    flex: 1,
  },
  productCard: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  productInfo: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  productName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  productDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  productPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  productUnit: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.md,
  },
  addButton: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.round,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...ADD_SHADOWS,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
});
