import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableWithoutFeedback, Image, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../theme';
import { Restaurant } from '../types';
import { favoritesService } from '../services/favoritesService';
import { TouchableOpacity } from 'react-native';

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
  const scaleValue = useRef(new Animated.Value(1)).current;

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

  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View style={[
        styles.container,
        variant === 'list' && styles.containerList,
        { transform: [{ scale: scaleValue }] }
      ]}>
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
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{restaurant.rating}</Text>
              <Ionicons name="star" size={12} color={COLORS.warning} />
            </View>
          </View>
          <View style={styles.meta}>
            <Text style={styles.deliveryTime}>{restaurant.deliveryTime} • </Text>
            <Text style={styles.deliveryFee}>{restaurant.deliveryFee === 0 ? 'Livraison gratuite' : `${restaurant.deliveryFee.toLocaleString()} FC`}</Text>
          </View>
          <View style={styles.tags}>
            <Text style={styles.distance}>{restaurant.distance}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.reviews}>({restaurant.reviewCount} avis)</Text>
          </View>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 290,
    marginHorizontal: SPACING.sm,
    backgroundColor: '#1c1c1e',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: '#2c2c2e',
  },
  containerList: {
    width: '100%',
    marginHorizontal: 0,
    marginBottom: SPACING.lg,
  },
  imageContainer: {
    position: 'relative',
    height: 170,
  },
  imageContainerList: {
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    ...SHADOWS.sm,
  },
  badgeText: {
    color: '#FFF',
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closedText: {
    color: '#FFF',
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heartButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 8,
    ...SHADOWS.sm,
  },
  info: {
    padding: SPACING.md,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    paddingRight: SPACING.sm,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c2c2e',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
    gap: 2,
  },
  ratingText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: '#ffffff',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  deliveryTime: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#8e8e93',
  },
  deliveryFee: {
    fontSize: FONT_SIZES.sm,
    color: '#8e8e93',
  },
  tags: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    marginHorizontal: 4,
    color: '#636366',
  },
  distance: {
    fontSize: FONT_SIZES.xs,
    color: '#636366',
  },
  reviews: {
    fontSize: FONT_SIZES.xs,
    color: '#636366',
  },
});
