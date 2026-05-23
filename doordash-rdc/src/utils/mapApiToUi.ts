import type { ApiCategory, ApiMenuItem, ApiMenuItemOption, ApiOrder, ApiOrderItem, ApiRestaurant } from '../types/api';
import type { CartItem, Category, Driver, MenuItem, MenuItemOption, Order, Restaurant } from '../types/domain';
import { resolvePhotoUrl } from './mediaUrl';

function toNumber(value: string | number | null | undefined, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  const n = Number.parseFloat(String(value));
  return Number.isFinite(n) ? n : fallback;
}

function toStringSafe(value: string | number | null | undefined, fallback = ''): string {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

export function mapApiRestaurantToUi(r: ApiRestaurant): Restaurant {
  const categories =
    (r.categories?.map((c) => c.name).filter(Boolean) as string[] | undefined) ?? [];

  return {
    id: r.id,
    name: r.name,
    image: resolvePhotoUrl(r.image) || '',
    logo: resolvePhotoUrl(r.logo) || undefined,
    rating: toNumber(r.rating, 0),
    reviewCount: toNumber(r.review_count, 0),
    deliveryTime: toStringSafe(r.delivery_time, '30-40 min'),
    deliveryFee: toNumber(r.delivery_fee, 0),
    categories,
    distance: toStringSafe(r.distance, ''),
    isNew: !!r.is_new,
    isPromoted: !!r.is_promoted,
    discount: r.discount ?? undefined,
    minOrder: toNumber(r.min_order, 0),
    isOpen: r.is_open ?? true,
    latitude: r.latitude !== null && r.latitude !== undefined ? toNumber(r.latitude) : undefined,
    longitude: r.longitude !== null && r.longitude !== undefined ? toNumber(r.longitude) : undefined,
    featured: !!r.is_featured,
  };
}

export function mapApiCategoryToUi(c: ApiCategory): Category {
  return {
    id: String(c.id),
    name: c.name,
    icon: c.icon ?? 'grid-outline',
    color: c.color ?? '#111827',
    image: resolvePhotoUrl(c.image) || undefined,
  };
}

function mapApiMenuItemOptionToUi(o: ApiMenuItemOption): MenuItemOption {
  return {
    id: o.id,
    name: o.name,
    price: toNumber(o.price, 0),
  };
}

export function mapApiMenuItemToUi(item: ApiMenuItem): MenuItem {
  const normalizedOptions = (() => {
    const raw = item.options;
    if (!Array.isArray(raw) || raw.length === 0) return [];

    const first = raw[0];
    if (first && typeof first === 'object') {
      // Relation rows from `menu_item_options`
      if ('menu_item_id' in first || ('id' in first && 'name' in first && 'price' in first && !('description' in first))) {
        return (raw as ApiMenuItemOption[]).map(mapApiMenuItemOptionToUi);
      }

      // Legacy JSON options list
      return (raw as any[]).map((o, idx) => ({
        id: String(o.id ?? idx),
        name: String(o.name ?? ''),
        price: toNumber(o.price, 0),
      })) as MenuItemOption[];
    }

    return [];
  })();

  return {
    id: item.id,
    restaurantId: item.restaurant_id,
    name: item.name,
    description: item.description ?? '',
    price: toNumber(item.price, 0),
    image: resolvePhotoUrl(item.image) || undefined,
    category: item.category ?? 'Plats',
    isPopular: !!item.is_popular,
    isVeg: !!item.is_veg,
    isSpicy: !!item.is_spicy,
    options: normalizedOptions.length ? normalizedOptions : undefined,
  };
}

function mapApiOrderItemLineToCartItem(line: ApiOrderItem): CartItem {
  const mi = line.menu_item;
  const menuItem: MenuItem = mi
    ? mapApiMenuItemToUi(mi)
    : {
        id: line.menu_item_id,
        restaurantId: '',
        name: 'Article',
        description: '',
        price: toNumber(line.unit_price, 0),
        category: 'Plats',
      };

  const selectedOptions = Array.isArray(line.selected_options)
    ? (line.selected_options as any[])
        .filter((x) => x && typeof x === 'object' && 'name' in x && 'price' in x)
        .map((x, idx) => ({
          id: String((x as any).id ?? idx),
          name: String((x as any).name ?? ''),
          price: toNumber((x as any).price, 0),
        }))
    : [];

  const note = line.special_instructions?.trim();
  return {
    lineId: line.id ? String(line.id) : `tmp_${line.menu_item_id}_${Date.now()}`,
    menuItem,
    quantity: toNumber(line.quantity, 1),
    selectedOptions,
    ...(note ? { specialInstructions: note } : {}),
  };
}

export function mapApiOrderToUi(o: ApiOrder): Order {
  const restaurantUi: Restaurant = o.restaurant
    ? mapApiRestaurantToUi(o.restaurant)
    : {
        id: String(o.restaurant_id),
        name: 'Restaurant',
        image: '',
        rating: 0,
        reviewCount: 0,
        deliveryTime: '30-40 min',
        deliveryFee: 0,
        categories: [],
        distance: '',
        minOrder: 0,
        isOpen: true,
      };

  const itemsUi: CartItem[] = (o.items ?? []).map(mapApiOrderItemLineToCartItem);

  const createdAt = o.created_at ?? new Date().toISOString();

  const estimatedDeliveryTime = (() => {
    if (o.estimated_delivery) {
      const d = new Date(o.estimated_delivery);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      }
    }
    const base = new Date(createdAt);
    if (!Number.isNaN(base.getTime())) {
      base.setMinutes(base.getMinutes() + 45);
      return base.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return '--:--';
  })();

  const driverUi: Driver | undefined = o.driver
    ? {
        id: String((o.driver as any).id ?? 'driver'),
        name: String((o.driver as any).name ?? 'Livreur'),
        photo: String((o.driver as any).photo ?? ''),
        rating: toNumber((o.driver as any).rating, 0),
        deliveries: toNumber((o.driver as any).deliveries, 0),
        vehicle: String((o.driver as any).vehicle ?? 'Moto'),
        phone: (o.driver as any).phone ? String((o.driver as any).phone) : undefined,
      }
    : undefined;

  return {
    id: String(o.id),
    restaurant: restaurantUi,
    items: itemsUi,
    orderType: (o.order_type as any) ?? undefined,
    subtotal: toNumber(o.subtotal, 0),
    deliveryFee: toNumber(o.delivery_fee, 0),
    serviceFee: toNumber(o.service_fee, 0),
    discountAmount: o.discount_amount != null ? toNumber(o.discount_amount, 0) : undefined,
    tax: toNumber(o.tax, 0),
    tip: toNumber(o.tip, 0),
    total: toNumber(o.total, 0),
    status: o.status,
    createdAt,
    deliveryAddress: o.address?.street || o.address?.label || '',
    paymentMethod: String(o.payment_method ?? ''),
    transactionId: o.transaction_id ? String(o.transaction_id) : undefined,
    paymentStatus: (o.payment_summary as any)?.payment_status ?? undefined,
    paymentStatusLabel: (o.payment_summary as any)?.payment_status_label ?? undefined,
    isPaid: (o.payment_summary as any)?.is_paid ?? !!o.transaction_id,
    paidAtLabel: (o.payment_summary as any)?.paid_at_label ?? undefined,
    invoiceNumber: (o.payment_summary as any)?.invoice_number ?? undefined,
    estimatedDeliveryTime,
    driver: driverUi,
    deliveryInstructions: o.delivery_instructions?.trim()
      ? String(o.delivery_instructions).trim()
      : undefined,
    hasReview: !!o.review_exists,
  };
}
