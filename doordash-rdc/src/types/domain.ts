export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  image?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  logo?: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  categories: string[];
  distance: string;
  isNew?: boolean;
  isPromoted?: boolean;
  discount?: string;
  minOrder: number;
  isOpen: boolean;
  latitude?: number;
  longitude?: number;
  featured?: boolean;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  isPopular?: boolean;
  isVeg?: boolean;
  isSpicy?: boolean;
  options?: MenuItemOption[];
}

export interface MenuItemOption {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  /** Identifiant stable de la ligne panier (côté client ou id order_item après commande). */
  lineId: string;
  menuItem: MenuItem;
  quantity: number;
  selectedOptions: MenuItemOption[];
  /** Instructions par article (allergies, cuisson, etc.) */
  specialInstructions?: string;
}

export interface Order {
  id: string;
  restaurant: Restaurant;
  items: CartItem[];
  orderType?: 'delivery' | 'pickup';
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discountAmount?: number;
  tax: number;
  tip: number;
  total: number;
  status: 'pending' | 'preparing' | 'picked_up' | 'delivering' | 'delivered' | 'cancelled';
  createdAt: string;
  deliveryAddress: string;
  paymentMethod: string;
  transactionId?: string;
  paymentStatus?: 'paid' | 'pending_cash' | 'unpaid' | 'cancelled';
  paymentStatusLabel?: string;
  isPaid?: boolean;
  paidAtLabel?: string;
  invoiceNumber?: string;
  estimatedDeliveryTime: string;
  driver?: Driver;
  /** True si un avis a déjà été enregistré pour cette commande (API `review_exists`) */
  hasReview?: boolean;
}

export interface Driver {
  id: string;
  name: string;
  photo: string;
  rating: number;
  deliveries: number;
  vehicle: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  dashPass?: boolean;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  neighborhood: string;
  instructions?: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'mpesa' | 'airtel_money' | 'orange_money' | 'cash';
  number?: string;
  isDefault: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  image: string;
  code?: string;
  discount: string;
  expiryDate: string;
  restaurantId?: string;
}
