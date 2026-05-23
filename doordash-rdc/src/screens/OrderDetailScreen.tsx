import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import { useCart } from '../context/CartContext';
import type { Order, CartItem } from '../types';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusColor(status: Order['status']) {
  switch (status) {
    case 'delivered': return COLORS.success;
    case 'cancelled': return COLORS.error;
    case 'delivering': return COLORS.primary;
    case 'preparing': return COLORS.warning;
    default: return COLORS.textSecondary;
  }
}

function getStatusText(status: Order['status']) {
  switch (status) {
    case 'delivered': return 'Livré';
    case 'cancelled': return 'Annulé';
    case 'delivering': return 'En livraison';
    case 'preparing': return 'En préparation';
    case 'pending': return 'En attente';
    case 'picked_up': return 'Récupéré';
    default: return status;
  }
}

export default function OrderDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'OrderDetail'>>();
  const { order } = route.params;
  const { addToCart } = useCart();

  const handleReorder = () => {
    order.items.forEach(item => {
      addToCart(item.menuItem, item.quantity, item.selectedOptions, item.specialInstructions);
    });
    navigation.navigate('Cart');
  };

  const handleRateOrder = () => {
    navigation.navigate('OrderRating', { orderId: order.id });
  };

  const handleGetHelp = () => {
    navigation.navigate('HelpSupport');
  };

  const handleChatDriver = () => {
    if (!order?.driver) return;
    navigation.navigate('DriverChat', { orderId: order.id, driver: order.driver });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Détails de la commande</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statusBanner}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(order.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {getStatusText(order.status)}
          </Text>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.restaurantInfo}>
            <Image source={{ uri: order.restaurant.image }} style={styles.restaurantImage} />
            <View style={styles.restaurantDetails}>
              <Text style={styles.restaurantName}>{order.restaurant.name}</Text>
              <Text style={styles.restaurantAddress}>{order.deliveryAddress}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Articles commandés</Text>
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.orderItem}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                {item.menuItem.image && (
                  <Image source={{ uri: item.menuItem.image }} style={styles.itemImage} />
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.menuItem.name}</Text>
                {item.specialInstructions ? (
                  <Text style={styles.itemNoteLine}>Note : {item.specialInstructions}</Text>
                ) : null}
                <Text style={styles.itemDescription} numberOfLines={2}>
                  {item.menuItem.description}
                </Text>
              </View>
              <Text style={styles.itemPrice}>
                {(item.menuItem.price * item.quantity).toLocaleString()} FC
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{order.orderType === 'pickup' ? 'Retrait' : 'Livraison'}</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                {order.orderType === 'pickup' ? 'Adresse de retrait' : 'Adresse de livraison'}
              </Text>
              <Text style={styles.infoValue}>
                {order.orderType === 'pickup'
                  ? 'Récupération à l’établissement'
                  : (order.deliveryAddress || '—')}
              </Text>
            </View>
          </View>
          {order.driver && (
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Livreur</Text>
                <Text style={styles.infoValue}>{order.driver.name} • {order.driver.rating} ★</Text>
              </View>
              <TouchableOpacity onPress={handleChatDriver} style={{ padding: 8 }}>
                <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color={COLORS.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Temps estimé</Text>
              <Text style={styles.infoValue}>{order.estimatedDeliveryTime}</Text>
            </View>
          </View>
          {order.deliveryInstructions ? (
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>
                  {order.orderType === 'pickup' ? 'Instructions pour l’établissement' : 'Instructions de livraison'}
                </Text>
                <Text style={styles.infoValue}>{order.deliveryInstructions}</Text>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Facture & paiement</Text>
          <View
            style={[
              styles.paymentBadge,
              order.isPaid ? styles.paymentBadgePaid : styles.paymentBadgePending,
            ]}
          >
            <Ionicons
              name={order.isPaid ? 'checkmark-circle' : 'time-outline'}
              size={18}
              color={order.isPaid ? COLORS.success : COLORS.warning}
            />
            <Text
              style={[
                styles.paymentBadgeText,
                { color: order.isPaid ? COLORS.success : COLORS.warning },
              ]}
            >
              {order.paymentStatusLabel || (order.isPaid ? 'Payé' : 'En attente')}
            </Text>
          </View>
          {order.invoiceNumber ? (
            <Text style={styles.invoiceMeta}>N° {order.invoiceNumber}</Text>
          ) : null}
          {order.paidAtLabel ? (
            <Text style={styles.invoiceMeta}>Payé le {order.paidAtLabel}</Text>
          ) : null}
          <View style={styles.infoRow}>
            <Ionicons name="card-outline" size={20} color={COLORS.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Méthode</Text>
              <Text style={styles.infoValue}>{order.paymentMethod || '—'}</Text>
            </View>
          </View>
          {order.transactionId ? (
            <View style={styles.infoRow}>
              <Ionicons name="receipt-outline" size={20} color={COLORS.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Référence transaction</Text>
                <Text style={[styles.infoValue, styles.mono]}>{order.transactionId}</Text>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reçu</Text>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Sous-total</Text>
            <Text style={styles.receiptValue}>{order.subtotal.toLocaleString()} FC</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>{order.orderType === 'pickup' ? 'Frais de retrait' : 'Frais de livraison'}</Text>
            <Text style={styles.receiptValue}>{order.deliveryFee.toLocaleString()} FC</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Frais de service</Text>
            <Text style={styles.receiptValue}>{order.serviceFee.toLocaleString()} FC</Text>
          </View>
          {!!order.discountAmount && order.discountAmount > 0 && (
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Réduction</Text>
              <Text style={styles.receiptValue}>- {order.discountAmount.toLocaleString()} FC</Text>
            </View>
          )}
          {order.tip > 0 && (
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Pourboire</Text>
              <Text style={styles.receiptValue}>{order.tip.toLocaleString()} FC</Text>
            </View>
          )}
          <View style={[styles.receiptRow, styles.receiptTotal]}>
            <Text style={styles.receiptTotalLabel}>Total</Text>
            <Text style={styles.receiptTotalValue}>{order.total.toLocaleString()} FC</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleGetHelp}>
            <Ionicons name="help-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>Obtenir de l'aide</Text>
          </TouchableOpacity>
          {order.status === 'delivered' && !order.hasReview && (
            <TouchableOpacity style={styles.actionButton} onPress={handleRateOrder}>
              <Ionicons name="star-outline" size={20} color={COLORS.primary} />
              <Text style={styles.actionText}>Évaluer la commande</Text>
            </TouchableOpacity>
          )}
          {order.status === 'delivered' && order.hasReview && (
            <View style={[styles.actionButton, styles.actionButtonDisabled]}>
              <Ionicons name="star" size={20} color={COLORS.textLight} />
              <Text style={[styles.actionText, styles.actionTextMuted]}>Déjà évaluée</Text>
            </View>
          )}
          <TouchableOpacity style={styles.actionButton} onPress={handleReorder}>
            <Ionicons name="refresh-outline" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>Commander à nouveau</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  statusBanner: {
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.backgroundSecondary,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: SPACING.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  orderDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  section: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.md,
  },
  restaurantDetails: {
    flex: 1,
  },
  restaurantName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  restaurantAddress: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  itemQuantity: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
    width: 30,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.xs,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  itemNoteLine: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  itemDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  itemPrice: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  infoContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
    marginTop: SPACING.xs,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    marginBottom: SPACING.sm,
  },
  paymentBadgePaid: {
    backgroundColor: COLORS.success + '18',
  },
  paymentBadgePending: {
    backgroundColor: COLORS.warning + '18',
  },
  paymentBadgeText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  invoiceMeta: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: FONT_SIZES.sm,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  receiptLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  receiptValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  receiptTotal: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
    marginTop: SPACING.sm,
  },
  receiptTotalLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  receiptTotalValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  actions: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  actionButtonDisabled: {
    opacity: 0.85,
  },
  actionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  actionTextMuted: {
    color: COLORS.textSecondary,
  },
});
