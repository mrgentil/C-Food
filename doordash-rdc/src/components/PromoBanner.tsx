import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';

const SHADOWS = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 8,
};
import { Promotion } from '../types';

interface Props {
  promotion: Promotion;
  onPress: () => void;
}

const { width } = Dimensions.get('window');

export default function PromoBanner({ promotion, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: promotion.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{promotion.title}</Text>
        <Text style={styles.description}>{promotion.description}</Text>
        {promotion.code && (
          <View style={styles.codeContainer}>
            <Text style={styles.code}>{promotion.code}</Text>
            <Ionicons name="copy-outline" size={16} color={COLORS.primary} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width - SPACING.lg,
    height: 160,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginHorizontal: SPACING.sm,
    ...SHADOWS,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: SPACING.md,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: '#FFF',
    marginBottom: SPACING.sm,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  code: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
});
