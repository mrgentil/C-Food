import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';

export interface CategoryTabItem {
  id: string;
  name: string;
  icon: string;
}

interface CategorySwitcherProps {
  tabs: CategoryTabItem[];
  activeCategory: string;
  onChange: (categoryId: string) => void;
  onPress?: (categoryId: string) => void;
}

export default function CategorySwitcher({
  tabs,
  activeCategory,
  onChange,
  onPress,
}: CategorySwitcherProps) {
  const handlePress = (categoryId: string) => {
    onChange(categoryId);
    onPress?.(categoryId);
  };

  if (!tabs.length) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {tabs.map((category) => {
        const isActive = activeCategory === category.id;
        return (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryItem, isActive && styles.activeCategory]}
            onPress={() => handlePress(category.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={(category.icon || 'grid-outline') as keyof typeof Ionicons.glyphMap}
              size={18}
              color={isActive ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[styles.categoryName, isActive && styles.activeCategoryName]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.backgroundSecondary,
    marginRight: SPACING.sm,
    gap: SPACING.xs,
  },
  activeCategory: {
    backgroundColor: COLORS.primary + '15',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  categoryName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeCategoryName: {
    color: COLORS.primary,
  },
});
