import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../theme';

interface Props {
  count: number;
  onPress: () => void;
  /** Icône claire sur fond sombre (ex. header transparent) */
  light?: boolean;
  /** header = icône seule · pill = bouton rond · accent = bouton coloré */
  variant?: 'header' | 'pill' | 'accent';
}

export default function CartBadge({ count, onPress, light = false, variant = 'header' }: Props) {
  const iconColor = light ? '#FFF' : variant === 'accent' ? '#FFF' : COLORS.text;
  const iconName = count > 0 ? 'cart' : 'cart-outline';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        variant === 'pill' && styles.pill,
        variant === 'accent' && styles.accent,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={count > 0 ? `Panier, ${count} article${count > 1 ? 's' : ''}` : 'Panier'}
    >
      <Ionicons name={iconName} size={24} color={iconColor} />
      {count > 0 && (
        <View style={[styles.badge, variant === 'pill' && styles.badgePill, light && styles.badgeLight]}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pill: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.backgroundSecondary,
    padding: 0,
  },
  accent: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginRight: SPACING.sm,
    ...SHADOWS.md,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.round,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  badgePill: {
    top: -2,
    right: -2,
  },
  badgeLight: {
    backgroundColor: COLORS.secondary,
    borderColor: 'transparent',
  },
  badgeText: {
    color: '#FFF',
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
});
