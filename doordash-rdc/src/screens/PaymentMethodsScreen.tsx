import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PaymentMethodsScreen() {
  const navigation = useNavigation<NavigationProp>();

  const paymentMethods = [
    { id: '1', type: 'mpesa', number: '*** *** 1234', isDefault: true },
    { id: '2', type: 'airtel_money', number: '*** *** 5678', isDefault: false },
    { id: '3', type: 'cash', number: 'Paiement au livreur', isDefault: false },
  ];

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'mpesa': return 'phone-portrait-outline';
      case 'airtel_money': return 'phone-portrait-outline';
      case 'orange_money': return 'phone-portrait-outline';
      default: return 'cash-outline';
    }
  };

  const getPaymentName = (type: string) => {
    switch (type) {
      case 'mpesa': return 'M-Pesa';
      case 'airtel_money': return 'Airtel Money';
      case 'orange_money': return 'Orange Money';
      default: return 'Cash';
    }
  };

  const getPaymentColor = (type: string) => {
    switch (type) {
      case 'mpesa': return COLORS.payment.mpesa;
      case 'airtel_money': return COLORS.payment.airtel;
      case 'orange_money': return COLORS.payment.orange;
      default: return COLORS.payment.cash;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Méthodes de paiement</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {paymentMethods.map(method => (
          <TouchableOpacity key={method.id} style={styles.paymentCard}>
            <View style={[styles.iconContainer, { backgroundColor: getPaymentColor(method.type) + '20' }]}>
              <Ionicons name={getPaymentIcon(method.type)} size={24} color={getPaymentColor(method.type)} />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>{getPaymentName(method.type)}</Text>
              <Text style={styles.paymentNumber}>{method.number}</Text>
            </View>
            {method.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Par défaut</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
          <Text style={styles.addButtonText}>Ajouter une méthode de paiement</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: SPACING.md,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  paymentNumber: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  defaultBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.sm,
  },
  defaultText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  addButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
