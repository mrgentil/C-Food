import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';

const SHADOWS = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
};

type DeliveryType = 'delivery' | 'pickup';

interface Props {
  type: DeliveryType;
  onChange: (type: DeliveryType) => void;
}

export default function DeliveryTypeSelector({ type, onChange }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, type === 'delivery' && styles.buttonActive]}
        onPress={() => onChange('delivery')}
      >
        <Ionicons
          name="bicycle-outline"
          size={20}
          color={type === 'delivery' ? COLORS.primary : COLORS.textSecondary}
        />
        <Text style={[styles.label, type === 'delivery' && styles.labelActive]}>
          Livraison
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, type === 'pickup' && styles.buttonActive]}
        onPress={() => onChange('pickup')}
      >
        <Ionicons
          name="bag-handle-outline"
          size={20}
          color={type === 'pickup' ? COLORS.primary : COLORS.textSecondary}
        />
        <Text style={[styles.label, type === 'pickup' && styles.labelActive]}>
          À emporter
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
    marginHorizontal: SPACING.md,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
  },
  buttonActive: {
    backgroundColor: COLORS.background,
    ...SHADOWS,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  labelActive: {
    color: COLORS.primary,
  },
});
