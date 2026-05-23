import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Restaurant } from '../types';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';

interface EnategaRestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
  width?: number; // Allows overriding the width for lists vs grids
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const EnategaRestaurantCard: React.FC<EnategaRestaurantCardProps> = ({
  restaurant,
  onPress,
  width = SCREEN_WIDTH - SPACING.md * 2, // Default to full width minus padding
}) => {
  return (
    <TouchableOpacity 
      style={[styles.container, { width }]} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: restaurant.image_url || 'https://via.placeholder.com/400x200' }} 
          style={styles.image} 
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
        <Text style={styles.description} numberOfLines={1}>
          {restaurant.description || 'Nourriture délicieuse • Livraison rapide'}
        </Text>
        
        <View style={styles.divider} />
        
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={COLORS.primary} />
            <Text style={[styles.metaText, { color: COLORS.primary }]}>15 Min</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="bicycle-outline" size={14} color="#a0a0a0" />
            <Text style={styles.metaText}>AD 5</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="star-outline" size={14} color="#a0a0a0" />
            <Text style={styles.metaText}>{restaurant.rating} ({Math.floor(Math.random() * 100)})</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1c1c1e',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginRight: SPACING.md,
    marginBottom: SPACING.md,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    backgroundColor: '#2c2c2e',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: SPACING.xs,
  },
  infoContainer: {
    padding: SPACING.md,
  },
  name: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: '#a0a0a0',
  },
  divider: {
    height: 1,
    borderWidth: 1,
    borderColor: '#3a3a3c',
    borderStyle: 'dashed',
    marginVertical: SPACING.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  metaText: {
    color: '#a0a0a0',
    fontSize: FONT_SIZES.sm,
    marginLeft: 4,
  },
});
