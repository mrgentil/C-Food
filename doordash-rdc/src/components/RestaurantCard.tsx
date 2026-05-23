import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../theme';
import { Restaurant } from '../types';
import { favoritesService } from '../services/favoritesService';

interface Props {
  restaurant: Restaurant;
  onPress: () => void;
  showFavorite?: boolean;
  variant?: 'carousel' | 'list';
}

export default function RestaurantCard({
  restaurant,
  onPress,
  showFavorite = true,
  variant = 'carousel',
}: Props) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!showFavorite) return;
    checkFavorite();
  }, [restaurant.id]);

  const checkFavorite = async () => {
    try {
      const fav = await favoritesService.isFavorite(String(restaurant.id));
      setIsFavorite(fav);
    } catch (err) {}
  };

  const toggleFavorite = async () => {
    try {
      await favoritesService.toggle(String(restaurant.id));
      setIsFavorite(!isFavorite);
    } catch (err) {}
  };

  return (
    <TouchableOpacity
      style={[styles.container, variant === 'list' && styles.containerList]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={[styles.imageContainer, variant === 'list' && styles.imageContainerList]}>
        <Image source={{ uri: restaurant.image }} style={styles.image} />
        {restaurant.isNew && <View style={[styles.badge, { backgroundColor: COLORS.success }]}><Text style={styles.badgeText}>Nouveau</Text></View>}
        {restaurant.discount && <View style={[styles.badge, { backgroundColor: COLORS.primary }]}><Text style={styles.badgeText}>{restaurant.discount}</Text></View>}
        {restaurant.isPromoted && !restaurant.isNew && !restaurant.discount && <View style={[styles.badge, { backgroundColor: COLORS.info }]}><Text style={styles.badgeText}>Promo</Text></View>}
        {!restaurant.isOpen && <View style={styles.overlay}><Text style={styles.closedText}>Fermé</Text></View>}
        {showFavorite && (
          <TouchableOpacity style={styles.heartButton} onPress={toggleFavorite} activeOpacity={0.7}>
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? COLORS.error : '#FFF'} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
        <View style={styles.meta}>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>{restaurant.rating}</Text>
            <Text style={styles.reviews}>({restaurant.reviewCount})</Text>
          </View>
          <Text style={styles.deliveryTime}>{restaurant.deliveryTime}</Text>
        </View>
        <View style={styles.tags}>
          <Text style={styles.deliveryFee}>{restaurant.deliveryFee === 0 ? 'Livraison gratuite' : `${restaurant.deliveryFee.toLocaleString()} FC`}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.distance}>{restaurant.distance}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    marginHorizontal: SPACING.sm,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  containerList: {
    width: '100%',
    marginHorizontal: 0,
    marginBottom: SPACING.md,
  },
  imageContainer: {
    position: 'relative',
    height: 160,
  },
  imageContainerList: {
    height: 190,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  badgeText: {
    color: '#FFF',
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  closedText: {
    color: '#FFF',
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  heartButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 6,
  },
  info: {
    padding: SPACING.sm,
  },
  name: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  reviews: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  deliveryTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  tags: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryFee: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  dot: {
    marginHorizontal: 4,
    color: COLORS.textSecondary,
  },
  distance: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});
