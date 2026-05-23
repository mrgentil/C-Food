/**
 * Normalise une commande API livreur vers le format UI (course + reçu).
 */
export function mapDriverOrder(o, driverId = null) {
  const ps = o?.payment_summary || {};
  const total = o?.total ?? 0;

  const restaurantLat = o?.restaurant?.latitude ?? null;
  const restaurantLng = o?.restaurant?.longitude ?? null;

  return {
    id: o.id,
    status: o.status,
    subtotal: o.subtotal ?? 0,
    deliveryFee: o.delivery_fee ?? 0,
    serviceFee: o.service_fee ?? 0,
    discountAmount: o.discount_amount ?? 0,
    tip: o.tip ?? 0,
    total,
    commission: o.commission ?? Math.round((total || 0) * 0.1),
    driverId: o.driver_id,
    restaurantName: o?.restaurant?.name,
    restaurantAddress: o?.restaurant?.address,
    restaurantLatitude: restaurantLat,
    restaurantLongitude: restaurantLng,
    userId: o?.customer?.id,
    userFirstName: (o?.customer?.name || '').split(' ')[0] || '',
    userLastName: (o?.customer?.name || '').split(' ').slice(1).join(' '),
    userPhotoURL: o?.customer?.photo || null,
    userPhone: o?.customer?.phone,
    userPhoneNumber: o?.customer?.phone,
    userAddress: [o?.delivery_address?.street, o?.delivery_address?.neighborhood, o?.delivery_address?.city]
      .filter(Boolean)
      .join(', '),
    userLatitude: o?.delivery_address?.latitude ?? null,
    userLongitude: o?.delivery_address?.longitude ?? null,
    invoiceNumber: ps.invoice_number ?? null,
    paymentMethod: ps.payment_method_label ?? ps.payment_method ?? null,
    paymentStatus: ps.payment_status ?? null,
    paymentStatusLabel: ps.payment_status_label ?? null,
    requiresCashCollection: !!ps.requires_cash_collection,
    cashCollected: !!ps.cash_collected,
    cashCollectedAtLabel: ps.cash_collected_at_label ?? null,
    isPaid: !!ps.is_paid,
    paidAtLabel: ps.paid_at_label ?? null,
    transactionId: ps.transaction_id ?? null,
    deliveryPhotoURL: o.delivery_photo_url ?? null,
    createdAt: o.created_at,
    deliveredAt: o.delivered_at,
    cancelledAt: o.cancelled_at,
    updatedAt: o.updated_at,
    customerName: o?.customer?.name,
    neighborhood: o?.delivery_address?.neighborhood,
    city: o?.delivery_address?.city,
  };
}
