/**
 * Types aligned with the Laravel API responses (snake_case fields).
 * Keep UI/domain models in `src/types/index.ts` separate from API DTOs.
 */

export type ApiId = string | number;

export type ApiTimestamp = string;

export type ApiOrderStatus =
  | 'pending'
  | 'preparing'
  | 'picked_up'
  | 'delivering'
  | 'delivered'
  | 'cancelled';

export type ApiPaymentMethod = 'cash' | 'mpesa' | 'airtel_money' | 'orange_money';

export interface ApiLaravelPaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface ApiLaravelPaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

/**
 * Laravel paginator JSON shape (common across admin + user lists).
 */
export interface ApiPaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: Array<{ url: string | null; label: string; active: boolean }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface ApiWrappedData<T> {
  data: T;
}

export interface ApiWrappedList<T> {
  data: T[];
}

export interface ApiMessage {
  message: string;
}

export interface ApiAuthUser {
  id: ApiId;
  name: string;
  email: string;
  phone?: string | null;
  photo?: string | null;
  dash_pass?: boolean;
  dash_pass_expires_at?: ApiTimestamp | null;
  is_admin?: boolean;
  is_restaurant?: boolean;
  is_driver?: boolean;
}

export interface ApiLoginResponse {
  message?: string;
  user: ApiAuthUser;
  token: string;
}

export interface ApiRegisterResponse {
  message?: string;
  user: ApiAuthUser;
  token: string;
}

export interface ApiLogoutResponse {
  message: string;
}

export interface ApiUpdateProfileResponse {
  message?: string;
  user: ApiAuthUser;
}

export interface ApiUpdatePhotoResponse {
  message?: string;
  user: ApiAuthUser;
  photo_url?: string;
}

export interface ApiRestaurant {
  id: string;
  user_id?: ApiId | null;
  name: string;
  image?: string | null;
  logo?: string | null;
  rating?: string | number | null;
  review_count?: number | null;
  delivery_time?: string | null;
  delivery_fee?: number | null;
  distance?: string | number | null;
  min_order?: number | null;
  is_open?: boolean;
  is_featured?: boolean;
  is_new?: boolean;
  is_promoted?: boolean;
  discount?: string | null;
  type?: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
  created_at?: ApiTimestamp;
  updated_at?: ApiTimestamp;
  categories?: ApiCategory[];
  pivot?: Record<string, unknown>;
  orders_count?: number;
  menu_items_count?: number;
}

export interface ApiCategory {
  id: ApiId;
  name: string;
  icon?: string | null;
  color?: string | null;
  image?: string | null;
  created_at?: ApiTimestamp;
  updated_at?: ApiTimestamp;
}

export interface ApiCategoriesIndexResponse {
  categories: ApiCategory[];
}

export interface ApiCategoryRestaurantsResponse {
  category: ApiCategory & { restaurants?: ApiRestaurant[] };
  restaurants: ApiRestaurant[];
}

export interface ApiMenuItemOption {
  id: string;
  menu_item_id?: string;
  name: string;
  price: number;
}

export interface ApiMenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  category?: string | null;
  category_id?: ApiId | null;
  is_popular?: boolean;
  is_veg?: boolean;
  is_spicy?: boolean;
  is_available?: boolean;
  /**
   * May be either:
   * - related `menu_item_options` rows (`ApiMenuItemOption`)
   * - legacy JSON options stored on the `menu_items.options` column
   */
  options?: unknown;
  created_at?: ApiTimestamp;
  updated_at?: ApiTimestamp;
}

export interface ApiAddress {
  id: ApiId;
  user_id?: ApiId;
  label: string;
  street: string;
  city: string;
  neighborhood?: string | null;
  instructions?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  is_default?: boolean;
  created_at?: ApiTimestamp;
  updated_at?: ApiTimestamp;
}

export interface ApiOrderItem {
  id: string;
  order_id?: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  selected_options?: unknown[] | Record<string, unknown> | null;
  special_instructions?: string | null;
  menu_item?: ApiMenuItem;
  created_at?: ApiTimestamp;
  updated_at?: ApiTimestamp;
}

export interface ApiOrder {
  id: string;
  user_id?: ApiId;
  restaurant_id: string;
  driver_id?: ApiId | null;
  address_id?: ApiId;
  order_type?: 'delivery' | 'pickup';
  subtotal: number;
  delivery_fee: number;
  service_fee?: number;
  discount_amount?: number;
  tax?: number;
  tip?: number;
  total: number;
  status: ApiOrderStatus;
  payment_method?: ApiPaymentMethod | string;
  transaction_id?: string | null;
  promo_code?: string | null;
  delivery_instructions?: string | null;
  is_group_order?: boolean;
  scheduled_for?: ApiTimestamp | null;
  estimated_delivery?: ApiTimestamp | null;
  created_at?: ApiTimestamp;
  updated_at?: ApiTimestamp;
  user?: Partial<ApiAuthUser>;
  restaurant?: ApiRestaurant;
  driver?: Partial<ApiAuthUser> | null;
  address?: ApiAddress;
  items?: ApiOrderItem[];
  /** Laravel `withExists('review')` */
  review_exists?: boolean;
}

/** Payload from GET /orders/{id}/track and WebSocket `tracking.updated` */
export interface ApiOrderTracking {
  id: string;
  status: ApiOrderStatus;
  total: number;
  estimated_delivery?: ApiTimestamp | null;
  driver_latitude?: number | null;
  driver_longitude?: number | null;
  last_location_update?: ApiTimestamp | null;
  accepted_at?: ApiTimestamp | null;
  preparing_at?: ApiTimestamp | null;
  picked_up_at?: ApiTimestamp | null;
  delivering_at?: ApiTimestamp | null;
  delivered_at?: ApiTimestamp | null;
  delivery_photo_url?: string | null;
  review_exists?: boolean;
  restaurant?: {
    id: string;
    name: string;
    image?: string | null;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  address?: {
    id: ApiId;
    street: string;
    city: string;
    neighborhood?: string | null;
    instructions?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    label?: string | null;
  } | null;
  driver?: {
    id: ApiId;
    name: string;
    phone?: string | null;
    photo?: string | null;
    rating?: number | string | null;
  } | null;
  tracking?: {
    phase: string;
    target?: string | null;
    distance_meters?: number | null;
    distance_label?: string | null;
    eta_minutes?: number | null;
    eta_label?: string | null;
    proximity: 'waiting' | 'far' | 'approaching' | 'near' | 'arrived';
    client_message: string;
    driver_message?: string | null;
    show_driver_on_map?: boolean;
    delivery_address_label?: string | null;
  };
  items?: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    menu_item?: { id: string; name: string } | null;
  }>;
}

export interface ApiPromoCode {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_subtotal: number;
  starts_at?: ApiTimestamp | null;
  expires_at?: ApiTimestamp | null;
}

export interface ApiPromosIndexResponse {
  data: ApiPromoCode[];
}

export interface ApiPromoValidateRequest {
  code: string;
  subtotal: number;
}

export interface ApiPromoValidateResponse {
  data: {
    code: string;
    discount_amount: number;
    type: 'percent' | 'fixed';
    value: number;
  };
}

export interface ApiQuoteRequestItem {
  menu_item_id: string;
  quantity: number;
}

export interface ApiQuoteRequest {
  restaurant_id: string;
  items: ApiQuoteRequestItem[];
  order_type?: 'delivery' | 'pickup';
  tip?: number;
  promo_code?: string;
}

export interface ApiQuoteResponse {
  data: {
    subtotal: number;
    delivery_fee: number;
    service_fee: number;
    discount_amount: number;
    tip: number;
    total: number;
    currency: string;
    currency_symbol: string;
  };
}

export type ApiOrderMessageType = 'text' | 'image' | 'video' | 'audio' | 'link';

export interface ApiOrderMessage {
  id: number;
  order_id: string;
  type?: ApiOrderMessageType;
  message?: string | null;
  media_url?: string | null;
  media_meta?: Record<string, unknown> | null;
  sender_role: 'user' | 'driver' | 'admin';
  user?: { id: ApiId; name: string; photo?: string | null } | null;
  created_at?: ApiTimestamp;
}

export interface ApiOrderMessagesIndexResponse {
  data: ApiOrderMessage[];
}

export interface ApiOrderMessageCreateResponse {
  data: ApiOrderMessage;
}

export interface ApiOrdersIndexResponse {
  data: ApiPaginatedResponse<ApiOrder>;
}

export interface ApiOrderMutationResponse {
  message?: string;
  data: ApiOrder;
}

export interface ApiOrderCancelResponse {
  message: string;
}

export interface ApiOrderRatePayload {
  restaurant_rating: number;
  /** Obligatoire côté API seulement si la commande a un livreur assigné */
  driver_rating?: number;
  feedback?: string;
  tags?: string[];
}

export interface ApiOrderRateResponse {
  message: string;
  data?: {
    restaurant_id: string;
    restaurant_rating: number;
    driver_rating: number | null;
  };
}

export interface ApiFavorite {
  id: ApiId;
  user_id?: ApiId;
  restaurant_id: string;
  restaurant?: ApiRestaurant;
  created_at?: ApiTimestamp;
  updated_at?: ApiTimestamp;
}

export interface ApiFavoriteToggleResponse {
  message: string;
  is_favorite: boolean;
}

export interface ApiFavoriteCheckResponse {
  is_favorite: boolean;
}

export interface ApiFavoritesIndexResponse {
  data: ApiFavorite[];
}

export interface ApiPaymentProcessRequest {
  order_id: string;
  method: ApiPaymentMethod;
  amount: number;
  phone_number?: string;
}

export interface ApiPaymentProcessResponse {
  success: boolean;
  message: string;
  transaction_id: string;
  order?: ApiOrder;
}

export interface ApiAdminDashboardStats {
  total_orders: number;
  pending_orders: number;
  total_users: number;
  total_restaurants: number;
  revenue_today: number;
  revenue_month: number;
}

export interface ApiAdminDashboardResponse {
  stats: ApiAdminDashboardStats;
  recent_orders: ApiOrder[];
}

export interface ApiAdminUsersResponse {
  data: ApiPaginatedResponse<ApiAuthUser>;
}

export interface ApiAdminRestaurantsResponse {
  data: ApiPaginatedResponse<ApiRestaurant>;
}
