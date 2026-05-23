import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';

interface ShopTypeCardProps {
  name: string;
  image: string;
  onPress: () => void;
}

export const ShopTypeCard: React.FC<ShopTypeCardProps> = ({
  name,
  image,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 110,
    backgroundColor: '#1c1c1e', // Dark mode card bg
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 80,
    width: '100%',
    backgroundColor: '#2c2c2e',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    padding: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  name: {
    color: '#ffffff',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
});
