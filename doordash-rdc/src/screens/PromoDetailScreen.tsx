import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import type { ApiPromoCode } from '../types/api';

type Nav = NativeStackNavigationProp<RootStackParamList, 'PromoDetail'>;
type Rt = RouteProp<RootStackParamList, 'PromoDetail'>;

function formatExpiry(expires_at?: string | null): string {
  if (!expires_at) return 'Aucune date d’expiration';
  const d = new Date(expires_at);
  if (Number.isNaN(d.getTime())) return 'Expiration inconnue';
  return `Expire le ${d.toLocaleDateString('fr-FR')}`;
}

export default function PromoDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const promo: ApiPromoCode = route.params.promo;

  const discountLabel =
    promo.type === 'percent' ? `${promo.value}%` : `${promo.value.toLocaleString()} FC`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offre</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.card}>
        <View style={styles.badge}>
          <Ionicons name="pricetag" size={22} color={COLORS.primary} />
          <Text style={styles.code}>{promo.code}</Text>
        </View>

        <Text style={styles.title}>{discountLabel} de réduction</Text>
        <Text style={styles.sub}>
          Minimum panier: {promo.min_subtotal.toLocaleString()} FC
        </Text>
        <Text style={styles.sub}>{formatExpiry(promo.expires_at)}</Text>

        <TouchableOpacity
          style={styles.useButton}
          onPress={() => navigation.navigate('PromoCodes')}
        >
          <Text style={styles.useButtonText}>Utiliser ce code</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text },
  headerRight: { width: 40 },
  card: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  code: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.primary },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  sub: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  useButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  useButtonText: { color: '#FFF', fontSize: FONT_SIZES.md, fontWeight: '700' },
});

