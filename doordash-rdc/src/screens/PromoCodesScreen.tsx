import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { promoService } from '../services/promoService';
import type { ApiPromoCode } from '../types/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SHADOWS = {
  shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08, shadowRadius: 4, elevation: 3,
};

type StoredPromo = { id: string; code: string; addedAt: string };

export default function PromoCodesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [code, setCode] = useState('');
  const [promos, setPromos] = useState<StoredPromo[]>([]);
  const [available, setAvailable] = useState<ApiPromoCode[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('promo_codes');
        setPromos(raw ? JSON.parse(raw) : []);
      } catch {
        setPromos([]);
      }
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await promoService.list();
        setAvailable(Array.isArray(res.data) ? res.data : []);
      } catch {
        setAvailable([]);
      }
    })();
  }, []);

  const handleAddCode = () => {
    if (!code.trim()) {
      Alert.alert('Erreur', 'Entrez un code promo');
      return;
    }
    const next: StoredPromo[] = [
      { id: Date.now().toString(), code: code.trim().toUpperCase(), addedAt: new Date().toISOString() },
      ...promos,
    ];
    setPromos(next);
    AsyncStorage.setItem('promo_codes', JSON.stringify(next));
    Alert.alert('Code enregistré', `Le code ${code.trim().toUpperCase()} sera appliqué lors du paiement (si valide).`);
    setCode('');
  };

  const handleUseCode = async (c: string) => {
    await AsyncStorage.setItem('selected_promo_code', c);
    Alert.alert('OK', `Code ${c} sélectionné. Il sera appliqué au paiement.`);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Promotions</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.addSection}>
          <Text style={styles.sectionTitle}>Ajouter un code promo</Text>
          <View style={styles.codeInput}>
            <Ionicons name="pricetag-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Entrez votre code"
              placeholderTextColor={COLORS.textLight}
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.applyButton} onPress={handleAddCode}>
              <Text style={styles.applyButtonText}>Appliquer</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Mes codes</Text>
        {promos.map((promo) => (
          <View key={promo.id} style={styles.promoCard}>
            <View style={styles.promoIcon}>
              <Ionicons name="gift-outline" size={28} color={COLORS.primary} />
            </View>
            <View style={styles.promoInfo}>
              <Text style={styles.promoCode}>{promo.code}</Text>
              <Text style={styles.promoDesc}>Ajouté le {new Date(promo.addedAt).toLocaleDateString('fr-FR')}</Text>
              <Text style={styles.promoExpiry}>La validation se fait au paiement</Text>
            </View>
            <View style={styles.promoBadge}>
              <Text style={styles.promoBadgeText}>En attente</Text>
            </View>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>Codes disponibles</Text>
        {available.length === 0 ? (
          <Text style={styles.promoExpiry}>Aucun code disponible pour le moment.</Text>
        ) : (
          available.map((p) => (
            <TouchableOpacity key={p.code} style={styles.promoCard} onPress={() => handleUseCode(p.code)}>
              <View style={styles.promoIcon}>
                <Ionicons name="gift-outline" size={28} color={COLORS.primary} />
              </View>
              <View style={styles.promoInfo}>
                <Text style={styles.promoCode}>{p.code}</Text>
                <Text style={styles.promoDesc}>
                  {p.type === 'percent' ? `${p.value}%` : `${p.value.toLocaleString()} FC`} · min {p.min_subtotal.toLocaleString()} FC
                </Text>
                <Text style={styles.promoExpiry}>Appuyer pour utiliser</Text>
              </View>
              <View style={styles.promoBadge}>
                <Text style={styles.promoBadgeText}>Utiliser</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text },
  headerRight: { width: 40 },
  content: { padding: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  addSection: { marginBottom: SPACING.xl },
  codeInput: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary, borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md, gap: SPACING.sm,
  },
  input: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text, paddingVertical: SPACING.sm },
  applyButton: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.sm },
  applyButtonText: { color: '#FFF', fontSize: FONT_SIZES.sm, fontWeight: '600' },
  promoCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.md,
    ...SHADOWS,
  },
  promoIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  promoInfo: { flex: 1 },
  promoCode: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  promoDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  promoExpiry: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  promoBadge: { backgroundColor: COLORS.primary + '15', paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.round },
  promoBadgeText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.primary },
});
