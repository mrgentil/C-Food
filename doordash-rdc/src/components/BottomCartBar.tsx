import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../theme';

interface Props {
  count: number;
  total: number;
  onPress: () => void;
}

export default function BottomCartBar({ count, total, onPress }: Props) {
  if (count === 0) return null;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.content}>
        <View style={styles.left}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
          <Text style={styles.label}>Voir le panier</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.total}>{total.toLocaleString()} FC</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.lg,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: BORDER_RADIUS.sm,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  countText: {
    color: '#FFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  label: {
    color: '#FFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  right: {
    alignItems: 'flex-end',
  },
  total: {
    color: '#FFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
});
