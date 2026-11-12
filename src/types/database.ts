export interface Category {
  id: string;
  name: string;
  created_at?: string;
}

export interface Anime {
  id: string;
  name: string;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category_id: string;
  anime_id: string;
  stock: number;
  is_service: boolean;
  created_at: string;
  updated_at: string;
  anime?: Anime;
  category_ref?: Category;
}

export interface ProductInput {
  name: string;
  price: string;
  category_id: string;
  anime_id: string;
  description: string;
  images: string[];
  stock: number;
  is_service: boolean;
}

export type Filters = {
  search: string;
  category: string[];
  anime: string[];
  service: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  sortBy?: 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc';
};

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  favorite_anime: string | null;
  whatsapp: string | null;
  birthdate: string | null;
  birthdate_locked: boolean;
  is_admin: boolean;
  is_suspended: boolean;
  suspension_message: string | null;
  suspended_at: string | null;
  created_at: string;
  updated_at: string;
}

export type CouponDiscountType = 'percentage' | 'fixed';
export type CouponAssignmentType = 'general' | 'specific';
export type CouponAppliesTo = 'all' | 'products' | 'categories';

export interface Coupon {
  id: string;
  name: string;
  code: string;
  discount_type: CouponDiscountType;
  discount_value: number;
  starts_at: string | null;
  expires_at: string | null;
  max_uses: number | null;
  max_uses_per_user: number;
  assignment_type: CouponAssignmentType;
  applies_to: CouponAppliesTo;
  is_exclusion: boolean;
  is_active: boolean;
  is_revoked: boolean;
  uses_count: number;
  created_at: string;
  updated_at: string;
}

export interface CouponAssignment {
  id: string;
  coupon_id: string;
  user_id: string;
  assigned_at: string;
  revoked_at: string | null;
  revoked_by: string | null;
}

export interface CouponRedemption {
  id: string;
  coupon_id: string;
  coupon_code: string;
  coupon_name: string;
  user_id: string;
  amount: number;
  items: unknown[];
  order_ref: string | null;
  code: string | null;
  created_at: string;
}

export interface CouponProduct {
  coupon_id: string;
  product_id: string;
}

export interface CouponCategory {
  coupon_id: string;
  category_id: string;
}

export interface OrderStatus {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_completed: boolean;
  position: number;
  created_at?: string;
}

export interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  discount: number;
}

export interface Order {
  id: string;
  code: string | null;
  user_id: string | null;
  status_id: string | null;
  subtotal: number;
  discount_total: number;
  total: number;
  coupon_code: string | null;
  coupon_validation_code: string | null;
  items: OrderItem[];
  customer_note: string | null;
  created_at: string;
  updated_at: string;
  status?: OrderStatus | null;
}