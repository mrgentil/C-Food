import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import { CustomHeader } from '../components';
import { useCart } from '../context/CartContext';
import type { RootStackParamList } from '../navigation/types';
import { addressService } from '../services/addressService';

const SHADOWS = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 3,
};

const SHADOWS_LG = {
  shadowColor: COLORS.primary,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 6,
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CartScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { cart, updateQuantity, removeFromCart, cartTotal, deliveryType } = useCart();
  const [addressLabel, setAddressLabel] = useState<string>('Chargement...');
  const [addressLoading, setAddressLoading] = useState<boolean>(true);

  const deliveryFee = deliveryType === 'pickup' ? 0 : 1500;
  const serviceFee = Math.round(cartTotal * 0.05);
  const total = cartTotal + deliveryFee + serviceFee;

  const fetchAddress = async () => {
    try {
      setAddressLoading(true);
      // 1) quick fallback from stored location
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        const saved = await AsyncStorage.default.getItem('user_location');
        if (saved) {
          const loc = JSON.parse(saved);
          if (loc?.address) setAddressLabel(String(loc.address));
        }
      } catch {
        /* ignore */
      }

      // 2) authoritative default address from API
      const res = await addressService.getAll();
      const addrs = res.data || [];
      const def = addrs.find((a: any) => a.is_default) || addrs[0];
      if (def) {
        const street = def.street || def.label || 'Adresse';
        setAddressLabel(String(street));
      }
    } catch {
      if (addressLabel === 'Chargement...') setAddressLabel('Adresse non disponible');
    } finally {
      setAddressLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAddress();
    }, [])
  );

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Panier" />
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={80} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>Votre panier est vide</Text>
          <Text style={styles.emptyText}>
            Ajoutez des articles depuis un restaurant pour commencer
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Main')}
          >
            <Text style={styles.emptyButtonText}>Parcourir les restaurants</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Panier" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <View style={styles.section}>
          {cart.map((item) => (
            <View key={item.lineId} style={styles.cartItem}>
              {item.menuItem.image && (
                <Image source={{ uri: item.menuItem.image }} style={styles.itemImage} />
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.menuItem.name}</Text>
                {item.specialInstructions ? (
                  <Text style={styles.itemNote} numberOfLines={3}>Note : {item.specialInstructions}</Text>
                ) : null}
                <Text style={styles.itemPrice}>{item.menuItem.price.toLocaleString()} FC</Text>
              </View>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={[styles.quantityButton, item.quantity === 1 && styles.removeButton]}
                  onPress={() => item.quantity === 1 ? removeFromCart(item.lineId) : updateQuantity(item.lineId, item.quantity - 1)}
                >
                  <Ionicons
                    name={item.quantity === 1 ? 'trash-outline' : 'remove'}
                    size={20}
                    color={item.quantity === 1 ? COLORS.error : "#ffffff"}
                  />
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.lineId, item.quantity + 1)}
                >
                  <Ionicons name="add" size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Récapitulatif</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>{cartTotal.toLocaleString()} FC</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Frais de {deliveryType === 'pickup' ? 'retrait' : 'livraison'}</Text>
            <Text style={styles.summaryValue}>{deliveryFee.toLocaleString()} FC</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Frais de service</Text>
            <Text style={styles.summaryValue}>{serviceFee.toLocaleString()} FC</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{total.toLocaleString()} FC</Text>
          </View>
        </View>

        {/* Delivery Info */}
        <View style={styles.infoCard}>
          <Ionicons name="location-outline" size={20} color={COLORS.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>{deliveryType === 'pickup' ? 'Adresse de retrait' : 'Adresse de livraison'}</Text>
            <Text style={styles.infoText}>{addressLabel}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('SavedPlaces')}>
            <Text style={styles.changeText}>{addressLoading ? '...' : 'Modifier'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="time-outline" size={20} color={COLORS.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Livraison estimée</Text>
            <Text style={styles.infoText}>25-35 minutes</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.checkoutContainer}>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => navigation.navigate('Checkout', { total: cartTotal })}
        >
          <Text style={styles.checkoutText}>Commander • {total.toLocaleString()} FC</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: '#8e8e93',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  section: {
    padding: SPACING.md,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2e',
    gap: SPACING.md,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.sm,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: SPACING.xs,
  },
  itemNote: {
    fontSize: FONT_SIZES.xs,
    color: '#8e8e93',
    fontStyle: 'italic',
    marginBottom: SPACING.xs,
  },
  itemPrice: {
    fontSize: FONT_SIZES.sm,
    color: '#8e8e93',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.xs,
    gap: SPACING.sm,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c2c2e',
    borderRadius: BORDER_RADIUS.sm,
  },
  removeButton: {
    backgroundColor: COLORS.error + '30',
  },
  quantity: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#ffffff',
    minWidth: 24,
    textAlign: 'center',
  },
  summary: {
    backgroundColor: '#1c1c1e',
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.md,
    color: '#8e8e93',
  },
  summaryValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: '#ffffff',
  },
  divider: {
    height: 1,
    backgroundColor: '#2c2c2e',
    marginVertical: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: '#ffffff',
  },
  totalValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: '#ffffff',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: '#1c1c1e',
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.md,
    ...SHADOWS,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: '#8e8e93',
  },
  changeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  checkoutContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    ...SHADOWS_LG,
  },
  checkoutText: {
    color: '#FFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
});

