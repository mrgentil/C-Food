import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const formatPrice = (n) => new Intl.NumberFormat('fr-CD').format(n || 0) + ' FC';

function ReceiptLine({ label, value, bold, negative }) {
  return (
    <View style={styles.line}>
      <Text style={[styles.lineLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.lineValue, bold && styles.bold, negative && styles.negative]}>
        {negative ? `- ${formatPrice(value)}` : formatPrice(value)}
      </Text>
    </View>
  );
}

/**
 * Reçu / facture client visible par le livreur (+ sa commission).
 */
export function DriverOrderReceipt({ order, compact }) {
  if (!order) return null;

  const isPaid = !!order.isPaid;
  const isCashPending =
    order.requiresCashCollection || order.paymentStatus === 'pending_cash';

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.header}>
        <Ionicons name="receipt-outline" size={22} color="#111C44" />
        <Text style={styles.title}>Reçu commande</Text>
      </View>

      {order.invoiceNumber ? (
        <Text style={styles.invoiceNo}>N° {order.invoiceNumber}</Text>
      ) : null}

      <View style={styles.badgeRow}>
        <View style={[styles.badge, isPaid ? styles.badgePaid : styles.badgePending]}>
          <Ionicons
            name={isPaid ? 'checkmark-circle' : 'time-outline'}
            size={16}
            color={isPaid ? '#166534' : '#B45309'}
          />
          <Text style={[styles.badgeText, isPaid ? styles.badgeTextPaid : styles.badgeTextPending]}>
            {order.paymentStatusLabel || (isPaid ? 'Payé' : 'En attente')}
          </Text>
        </View>
      </View>

      {order.cashCollectedAtLabel ? (
        <Text style={styles.meta}>Espèces encaissées le {order.cashCollectedAtLabel}</Text>
      ) : null}
      {order.paidAtLabel ? (
        <Text style={styles.meta}>Payé le {order.paidAtLabel}</Text>
      ) : null}
      {order.paymentMethod ? (
        <Text style={styles.meta}>Mode : {order.paymentMethod}</Text>
      ) : null}
      {order.transactionId ? (
        <Text style={styles.metaMono}>Réf. {order.transactionId}</Text>
      ) : null}

      <View style={styles.divider} />

      <ReceiptLine label="Sous-total" value={order.subtotal} />
      <ReceiptLine label="Frais de livraison" value={order.deliveryFee} />
      <ReceiptLine label="Frais de service" value={order.serviceFee} />
      {order.discountAmount > 0 ? (
        <ReceiptLine label="Réduction" value={order.discountAmount} negative />
      ) : null}
      {order.tip > 0 ? <ReceiptLine label="Pourboire" value={order.tip} /> : null}

      <View style={styles.divider} />

      <ReceiptLine label="Total client" value={order.total} bold />

      <View style={styles.collectBox}>
        <Text style={styles.collectLabel}>
          {isPaid
            ? order.transactionId
              ? 'Client a payé en ligne'
              : 'Espèces encaissées'
            : isCashPending
              ? 'À encaisser du client'
              : 'Montant commande'}
        </Text>
        <Text style={styles.collectAmount}>{formatPrice(order.total)}</Text>
      </View>

      <View style={styles.commissionBox}>
        <Text style={styles.commissionLabel}>Votre gain (estimé)</Text>
        <Text style={styles.commissionValue}>{formatPrice(order.commission)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardCompact: { marginBottom: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  title: { fontSize: 16, fontWeight: '800', color: '#111C44' },
  invoiceNo: { fontSize: 12, color: '#64748B', marginBottom: 8, fontWeight: '600' },
  badgeRow: { flexDirection: 'row', marginBottom: 6 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgePaid: { backgroundColor: '#DCFCE7' },
  badgePending: { backgroundColor: '#FEF3C7' },
  badgeText: { fontSize: 13, fontWeight: '700' },
  badgeTextPaid: { color: '#166534' },
  badgeTextPending: { color: '#B45309' },
  meta: { fontSize: 12, color: '#64748B', marginTop: 2 },
  metaMono: { fontSize: 11, color: '#475569', marginTop: 4, fontFamily: 'monospace' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  lineLabel: { fontSize: 14, color: '#64748B' },
  lineValue: { fontSize: 14, color: '#1E293B', fontWeight: '500' },
  bold: { fontWeight: '800', color: '#111C44', fontSize: 15 },
  negative: { color: '#16A34A' },
  collectBox: {
    marginTop: 10,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collectLabel: { fontSize: 13, fontWeight: '600', color: '#0369A1', flex: 1 },
  collectAmount: { fontSize: 18, fontWeight: '800', color: '#0EA5E9' },
  commissionBox: {
    marginTop: 10,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commissionLabel: { fontSize: 13, fontWeight: '600', color: '#166534' },
  commissionValue: { fontSize: 17, fontWeight: '800', color: '#3FC060' },
});
