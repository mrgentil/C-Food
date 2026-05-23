import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import { CustomHeader } from '../components';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { paymentService, mapUiPaymentMethodToApi } from '../services/paymentService';
import { addressService } from '../services/addressService';
import { promoService } from '../services/promoService';
import { quoteService } from '../services/quoteService';
import { useCart } from '../context/CartContext';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Checkout'>;
type RouteParams = RouteProp<RootStackParamList, 'Checkout'>;

const SHADOWS = {
  shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08, shadowRadius: 4, elevation: 3,
};
const SHADOWS_LG = {
  shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
};

export default function CheckoutScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParams>();
  const { total } = route.params || { total: 0 };
  const { user } = useAuth();
  const { items, clearCart, deliveryType } = useCart();

  const [selectedPayment, setSelectedPayment] = useState('mpesa');
  const [tip, setTip] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoApplying, setPromoApplying] = useState(false);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<string>('Chargement...');
  const [addressId, setAddressId] = useState<string>('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getDefaultAddress();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        const stored = await AsyncStorage.default.getItem('selected_promo_code');
        if (stored && typeof stored === 'string') {
          setPromoCode(stored);
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const getDefaultAddress = async () => {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const saved = await AsyncStorage.default.getItem('user_location');
      if (saved) {
        const loc = JSON.parse(saved);
        setSelectedAddress(loc.address || 'Kinshasa');
      } else {
        setSelectedAddress('Kinshasa');
      }
    } catch (err) {
      setSelectedAddress('Kinshasa');
    }

    // Try to get default address from API (if authenticated)
    try {
      const res = await addressService.getAll();
      const addrs = res.data || [];
      const defaultAddr = addrs.find((a: any) => a.is_default) || addrs[0];
      if (defaultAddr) {
        setSelectedAddress(defaultAddr.street || defaultAddr.label || 'Adresse');
        setAddressId(defaultAddr.id.toString());
      }
    } catch (e) {
      // User not authenticated or no addresses, use fallback
    }
  };

  const tipOptions = [0, 500, 1000, 2000, 3000];
  const [quote, setQuote] = useState<{
    subtotal: number;
    delivery_fee: number;
    service_fee: number;
    discount_amount: number;
    tip: number;
    total: number;
  } | null>(null);

  // `total` (route param) représente le sous-total des articles (sans frais).
  const computedSubtotal = quote?.subtotal ?? Math.max(0, total);
  const serviceFee = quote?.service_fee ?? Math.round(computedSubtotal * 0.05);
  const deliveryFee = quote?.delivery_fee ?? (deliveryType === 'pickup' ? 0 : 1500);
  const appliedDiscount = quote?.discount_amount ?? discountAmount;
  const finalTotal =
    quote?.total ?? Math.max(0, computedSubtotal + serviceFee + deliveryFee + tip - appliedDiscount);

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      Alert.alert('Erreur', 'Votre panier est vide');
      return;
    }

    if (!items[0]?.menuItem?.restaurantId) {
      Alert.alert('Erreur', 'Impossible de déterminer le restaurant');
      return;
    }

    if (deliveryType === 'delivery' && (!addressId || String(addressId).trim().length === 0)) {
      Alert.alert('Adresse requise', 'Sélectionnez une adresse de livraison.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const apiPaymentMethod = mapUiPaymentMethodToApi(selectedPayment as any);
      const orderData = {
        restaurant_id: items[0]?.menuItem?.restaurantId || '',
        items: items.map(item => ({
          menu_item_id: item.menuItem.id,
          quantity: item.quantity,
          selected_options: item.selectedOptions || null,
          special_instructions: item.specialInstructions?.trim() || undefined,
        })),
        address_id: parseInt(addressId) || 1,
        order_type: deliveryType,
        payment_method: apiPaymentMethod,
        tip,
        promo_code: promoCode || undefined,
        delivery_instructions: deliveryInstructions.trim() || undefined,
      };

      console.log('Order data:', JSON.stringify(orderData, null, 2));
      console.log('Items being sent:', items.map(i => ({
        menuItemId: i.menuItem.id,
        restaurantId: i.menuItem.restaurantId,
        name: i.menuItem.name
      })));

      const orderRes = await orderService.create(orderData);
      console.log('Order created:', orderRes);

      // Process payment
      if (selectedPayment !== 'cash') {
        await paymentService.process({
          order_id: orderRes.data.id,
          method: selectedPayment as any,
          amount: finalTotal,
          phone_number: user?.phone,
        });
      }

      clearCart();
      navigation.navigate('OrderPlaced', { orderId: orderRes.data.id });
    } catch (err: any) {
      console.log('Order error:', err.response?.data || err);
      let errorMsg = 'Erreur lors de la commande';

      if (err.response?.status === 422) {
        if (err.response.data?.errors) {
          errorMsg = Object.values(err.response.data.errors).flat().join('\n');
        } else if (err.response.data?.message) {
          errorMsg = err.response.data.message;
        }
      } else {
        errorMsg = err.response?.data?.message || err.message || errorMsg;
      }

      setError(errorMsg);
      Alert.alert('Erreur', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPromo = async () => {
    const code = promoCode.trim();
    if (!code) {
      setDiscountAmount(0);
      return;
    }
    try {
      setPromoApplying(true);
      setError('');
      // Prefer quote endpoint: it's the same logic used by order creation.
      const q = await quoteService.quote({
        restaurant_id: items[0]?.menuItem?.restaurantId || '',
        items: items.map((it) => ({ menu_item_id: it.menuItem.id, quantity: it.quantity })),
        order_type: deliveryType,
        tip,
        promo_code: code,
      });
      setQuote(q.data);
      setDiscountAmount(q.data.discount_amount ?? 0);
    } catch (err: any) {
      setQuote(null);
      setDiscountAmount(0);
      const msg = err.response?.data?.message || err.message || 'Code promo invalide';
      setError(msg);
    } finally {
      setPromoApplying(false);
    }
  };

  useEffect(() => {
    if (!items || items.length === 0) return;
    (async () => {
      try {
        const q = await quoteService.quote({
          restaurant_id: items[0]?.menuItem?.restaurantId || '',
          items: items.map((it) => ({ menu_item_id: it.menuItem.id, quantity: it.quantity })),
          order_type: deliveryType,
          tip,
          promo_code: promoCode.trim() || undefined,
        });
        setQuote(q.data);
      } catch {
        setQuote(null);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tip, deliveryType, promoCode, items]);

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Paiement" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Delivery / Pickup */}
        <View style={styles.section}>
          <View style={styles.modeRow}>
            <View style={styles.modeBadge}>
              <Ionicons
                name={deliveryType === 'delivery' ? 'bicycle-outline' : 'bag-handle-outline'}
                size={18}
                color={deliveryType === 'delivery' ? COLORS.primary : COLORS.success}
              />
              <Text style={styles.modeText}>
                {deliveryType === 'delivery' ? 'Livraison' : 'À emporter'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Main')}>
              <Text style={styles.modeChange}>Changer</Text>
            </TouchableOpacity>
          </View>

          {deliveryType === 'delivery' ? (
            <>
              <Text style={styles.sectionTitle}>Adresse de livraison</Text>
              <TouchableOpacity
                style={styles.addressCard}
                onPress={() => navigation.navigate('SavedPlaces')}
              >
                <View style={styles.addressIcon}>
                  <Ionicons name="home" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.addressInfo}>
                  <Text style={styles.addressLabel}>Adresse</Text>
                  <Text style={styles.addressText}>{selectedAddress}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.pickupCard}>
              <Ionicons name="storefront-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.pickupText}>
                Vous récupérez la commande directement chez l’établissement.
              </Text>
            </View>
          )}
        </View>

        {/* Instructions (livraison ou retrait) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {deliveryType === 'delivery' ? 'Instructions de livraison (optionnel)' : 'Instructions pour l’établissement (optionnel)'}
          </Text>
          <TextInput
            style={styles.instructionsInput}
            placeholder={
              deliveryType === 'delivery'
                ? 'Ex: Sonner 3 fois, laisser à la réception...'
                : 'Ex: Heure souhaitée, allergies, précisions sur la préparation...'
            }
            placeholderTextColor={COLORS.textLight}
            value={deliveryInstructions}
            onChangeText={setDeliveryInstructions}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Méthode de paiement</Text>
          {[
            { id: 'mpesa', name: 'M-Pesa', icon: 'phone-portrait-outline', color: '#00A650' },
            { id: 'airtel', name: 'Airtel Money', icon: 'phone-portrait-outline', color: '#FF0000' },
            { id: 'orange', name: 'Orange Money', icon: 'phone-portrait-outline', color: '#FF6600' },
            { id: 'cash', name: 'Cash à la livraison', icon: 'cash-outline', color: '#4CAF50' },
          ].map(method => (
            <TouchableOpacity
              key={method.id}
              style={[styles.paymentOption, selectedPayment === method.id && styles.paymentOptionSelected]}
              onPress={() => setSelectedPayment(method.id)}
            >
              <View style={[styles.paymentIcon, { backgroundColor: method.color + '20' }]}>
                <Ionicons name={method.icon as any} size={24} color={method.color} />
              </View>
              <Text style={styles.paymentName}>{method.name}</Text>
              {selectedPayment === method.id && (
                <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Tip */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pourboire pour le livreur</Text>
          <Text style={styles.sectionSubtitle}>100% du pourboire va au livreur</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tipOptions}>
            {tipOptions.map(amount => (
              <TouchableOpacity
                key={amount}
                style={[styles.tipOption, tip === amount && styles.tipOptionSelected]}
                onPress={() => setTip(amount)}
              >
                <Text style={[styles.tipText, tip === amount && styles.tipTextSelected]}>
                  {amount === 0 ? 'Aucun' : `${amount.toLocaleString()} FC`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Promo Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Code promo</Text>
          <View style={styles.promoContainer}>
            <TextInput
              style={styles.promoInput}
              placeholder="Entrez votre code"
              placeholderTextColor={COLORS.textLight}
              value={promoCode}
              onChangeText={(v) => {
                setPromoCode(v);
                setDiscountAmount(0);
              }}
            />
            <TouchableOpacity style={styles.promoButton} onPress={handleApplyPromo} disabled={promoApplying}>
              <Text style={styles.promoButtonText}>{promoApplying ? '...' : 'Appliquer'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Récapitulatif</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>{computedSubtotal.toLocaleString()} FC</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {deliveryType === 'pickup' ? 'Retrait' : 'Livraison'}
            </Text>
            <Text style={styles.summaryValue}>{deliveryFee.toLocaleString()} FC</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Frais de service</Text>
            <Text style={styles.summaryValue}>{serviceFee.toLocaleString()} FC</Text>
          </View>
          {appliedDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Réduction</Text>
              <Text style={styles.summaryValue}>- {appliedDiscount.toLocaleString()} FC</Text>
            </View>
          )}
          {tip > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pourboire</Text>
              <Text style={styles.summaryValue}>{tip.toLocaleString()} FC</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{finalTotal.toLocaleString()} FC</Text>
          </View>
        </View>
      </ScrollView>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Place Order Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.orderButton, loading && styles.orderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.orderButtonText}>
              Confirmer {finalTotal.toLocaleString()} FC via {selectedPayment === 'cash' ? 'Cash' :
                selectedPayment === 'mpesa' ? 'M-Pesa' :
                selectedPayment === 'airtel' ? 'Airtel' : 'Orange'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  section: { padding: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: '#ffffff', marginBottom: SPACING.sm },
  sectionSubtitle: { fontSize: FONT_SIZES.sm, color: '#8e8e93', marginBottom: SPACING.md },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: '#1c1c1e',
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  modeText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#ffffff' },
  modeChange: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.primary },
  pickupCard: {
    flexDirection: 'row',
    gap: SPACING.sm,
    backgroundColor: '#1c1c1e',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  pickupText: { flex: 1, fontSize: FONT_SIZES.md, color: '#8e8e93' },
  addressCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1c1e',
    padding: SPACING.md, borderRadius: BORDER_RADIUS.md, gap: SPACING.md, ...SHADOWS,
    borderWidth: 1, borderColor: '#2c2c2e',
  },
  addressIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primary + '15%', justifyContent: 'center', alignItems: 'center',
  },
  addressInfo: { flex: 1 },
  addressLabel: { fontSize: FONT_SIZES.md, fontWeight: '600', color: '#ffffff' },
  addressText: { fontSize: FONT_SIZES.sm, color: '#8e8e93', marginTop: 2 },
  instructionsInput: {
    backgroundColor: '#1c1c1e', borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, fontSize: FONT_SIZES.md, color: '#ffffff', minHeight: 80,
  },
  paymentOption: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1c1e',
    padding: SPACING.md, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.sm,
    gap: SPACING.md, borderWidth: 1, borderColor: '#2c2c2e',
  },
  paymentOptionSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '05' },
  paymentIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  paymentName: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: '500', color: '#ffffff' },
  tipOptions: { flexDirection: 'row', marginVertical: SPACING.sm },
  tipOption: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round, backgroundColor: '#1c1c1e',
    marginRight: SPACING.sm,
  },
  tipOptionSelected: { backgroundColor: COLORS.primary },
  tipText: { fontSize: FONT_SIZES.md, fontWeight: '500', color: '#ffffff' },
  tipTextSelected: { color: '#FFF' },
  promoContainer: { flexDirection: 'row', gap: SPACING.sm },
  promoInput: {
    flex: 1, backgroundColor: '#1c1c1e', borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, fontSize: FONT_SIZES.md, color: '#ffffff',
  },
  promoButton: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.sm },
  promoButtonText: { color: '#FFF', fontSize: FONT_SIZES.sm, fontWeight: '600' },
  summary: {
    backgroundColor: '#1c1c1e', margin: SPACING.md, padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md, ...SHADOWS, borderWidth: 1, borderColor: '#2c2c2e',
  },
  summaryTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: '#ffffff', marginBottom: SPACING.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.sm },
  summaryLabel: { fontSize: FONT_SIZES.md, color: '#8e8e93' },
  summaryValue: { fontSize: FONT_SIZES.md, fontWeight: '500', color: '#ffffff' },
  divider: { height: 1, backgroundColor: '#2c2c2e', marginVertical: SPACING.sm },
  totalLabel: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: '#ffffff' },
  totalValue: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: '#ffffff' },
  bottomBar: {
    padding: SPACING.md, paddingBottom: SPACING.lg,
    backgroundColor: '#000000', borderTopWidth: 1, borderTopColor: '#1c1c1e',
  },
  orderButton: {
    backgroundColor: COLORS.primary, paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md, alignItems: 'center', ...SHADOWS_LG,
  },
  orderButtonText: { color: '#FFF', fontSize: FONT_SIZES.lg, fontWeight: '700', textAlign: 'center' },
  orderButtonDisabled: { opacity: 0.7 },
  errorText: { color: COLORS.error, fontSize: FONT_SIZES.sm, textAlign: 'center', padding: SPACING.md },
});
