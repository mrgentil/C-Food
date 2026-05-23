import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import { Category } from '../types';

interface Props {
  category: Category;
  onPress: () => void;
  size?: 'small' | 'medium';
}

export default function CategoryItem({ category, onPress, size = 'medium' }: Props) {
  const isSmall = size === 'small';
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
        <Ionicons name={category.icon as any} size={isSmall ? 24 : 28} color={category.color} />
      </View>
      <Text style={[styles.name, isSmall && styles.smallName]} numberOfLines={1}>{category.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
    width: 80,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  name: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
  },
  smallName: {
    fontSize: FONT_SIZES.xs,
  },
});
