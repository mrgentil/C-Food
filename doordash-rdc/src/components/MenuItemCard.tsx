import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';

const SHADOWS = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 4,
};
import { MenuItem } from '../types';

interface Props {
  item: MenuItem;
  onPress: () => void;
  onAdd: () => void;
}

export default function MenuItemCard({ item, onPress, onAdd }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.info}>
        {item.isPopular && <Text style={styles.popular}>Populaire</Text>}
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.price}>{item.price.toLocaleString()} FC</Text>
      </View>
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]} />
        )}
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <Ionicons name="add" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  info: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  popular: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  name: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  price: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  imageContainer: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.md,
  },
  placeholder: {
    backgroundColor: COLORS.backgroundSecondary,
  },
  addButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.round,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS,
  },
});
