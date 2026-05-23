import { Restaurant, Order, MenuItem, CartItem } from '../types';
import { Store } from '../data/mockData';
import type { ApiPromoCode } from '../types/api';

export type { Order, CartItem, MenuItem };

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Home: undefined;
  Search: { category?: string } | undefined;
  Orders: undefined;
  Profile: undefined;
  AdminDashboard: undefined;
  AdminOrders: undefined;
  AdminOrderDetail: { orderId: string };
  AdminUsers: undefined;
  AdminRestaurants: undefined;
  Restaurant: { restaurant: Restaurant };
  StoreList: { 
    title: string; 
    filter?: { 
      type?: string; 
      category?: string; 
      brand?: string; 
      featured?: boolean; 
      nearby?: boolean; 
    } 
  };
  GenericGrid: { 
    title: string; 
    type: 'shop_type' | 'category' | 'brand'; 
    data: any[]; 
  };
  Grocery: undefined;
  GroceryDetail: { store: Store };
  Alcohol: undefined;
  AlcoholDetail: { store: Store };
  Flowers: undefined;
  FlowersDetail: { store: Store };
  Pharmacy: undefined;
  PharmacyDetail: { store: Store };
  PetStore: undefined;
  PetStoreDetail: { store: Store };
  ItemDetail: { item: MenuItem };
  Cart: undefined;
  Checkout: { total: number };
  OrderTracking: { order?: Order; orderId?: string };
  OrderPlaced: { orderId?: string };
  CategoryDetail: { category: string };
  Deals: undefined;
  DashPass: undefined;
  EditProfile: undefined;
  SavedPlaces: undefined;
  PaymentMethods: undefined;
  Notifications: undefined;
  OrderRating: { orderId: string };
  ScheduleDelivery: undefined;
  GroupOrder: undefined;
  HelpSupport: undefined;
  Settings: undefined;
  OrderHistory: undefined;
  OrderDetail: { order: Order };
  AdvancedFilter: { filters?: any };
  MapView: { category?: string };
  DriverChat: { driver: any; orderId?: string };
  ChangePassword: undefined;
  Favorites: undefined;
  PromoCodes: undefined;
  PromoDetail: { promo: ApiPromoCode };
  NotificationSettings: undefined;
  LanguageSettings: undefined;
  DeleteAccount: undefined;
  Onboarding: undefined;
};
