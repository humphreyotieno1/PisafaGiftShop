// API Response Types based on OpenAPI Schema

export interface User {
  id: number;
  username: string;
  email?: string;
  full_name?: string;
  phone?: string;
  address?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface UserCreate {
  username: string;
  email?: string;
  full_name?: string;
  phone?: string;
  address?: string;
  password: string;
  role?: UserRole;
}

export interface UserUpdate {
  email?: string;
  full_name?: string;
  phone?: string;
  address?: string;
}

export interface AdminUserUpdate {
  email?: string;
  full_name?: string;
  phone?: string;
  address?: string;
  username?: string;
  password?: string;
  role?: UserRole;
  is_active?: boolean;
}

export type UserRole = 'admin' | 'user';

export interface Token {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
  image_url?: string;
  is_bestseller: boolean;
  is_featured: boolean;
  updated_at: string;
}

export interface ProductBase {
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
  image_url?: string;
  is_bestseller: boolean;
  is_featured: boolean;
}

export interface ProductCreate extends ProductBase {}

export interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  products: Product[];
}

export interface CategoryCreate {
  name: string;
  description?: string;
  image_url?: string;
}

export interface CategoryUpdate {
  name?: string;
  description?: string;
  image_url?: string;
}

export interface CartItemResponse {
  product_id: number;
  quantity: number;
  product: ProductBase;
  item_total: number;
}

export interface CartResponse {
  id?: number;
  products: CartItemResponse[];
  subtotal: number;
  tax: number;
  total: number;
  tax_rate: number;
  currency: string;
}

export interface CartAddRequest {
  product_id: number;
  quantity: number;
}

export interface CartUpdateRequest {
  quantity: number;
}

export interface WishlistResponse {
  id?: number | null;
  products: ProductBase[];
}

export interface WishlistAddRequest {
  product_id: number;
}

export interface Order {
  id: number;
  user_id: number;
  total: number;
  status: OrderStatus;
  created_at: string;
}

export interface OrderBase {
  total: number;
  status?: OrderStatus;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItemProduct {
  id: number;
  name: string;
  image_url?: string;
}

export interface OrderItemResponse {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  item_total: number;
  product: OrderItemProduct;
}

export interface OrderSummaryResponse {
  order_id: number;
  status: OrderStatus;
  created_at: string;
  items: OrderItemResponse[];
  subtotal: number;
  tax: number;
  tax_rate: number;
  shipping_cost: number;
  total: number;
  currency: string;
}

export interface CheckoutCreate {
  payment_method: string;
  address: string;
  phone_number: string;
}

export interface CheckoutResponse {
  message: string;
  order_id: number;
  checkout_id: number;
  order_summary: OrderSummaryResponse;
}

export interface AnalyticsResponse {
  total_users: number;
  total_orders: number;
  total_revenue: number;
  top_products: Record<string, any>[];
  category_performance: Record<string, any>[];
  currency: string;
}

export interface Msg {
  detail: string;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

// API Request/Response wrapper types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Form data types
export interface LoginFormData {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  username: string;
  email?: string;
  full_name?: string;
  phone?: string;
  address?: string;
  password: string;
  confirmPassword: string;
}

export interface ProfileFormData {
  email?: string;
  full_name?: string;
  phone?: string;
  address?: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
  image_url?: string;
  is_bestseller?: boolean;
  is_featured?: boolean;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  image_url?: string;
}

export interface CheckoutFormData {
  payment_method: string;
  address: string;
  phone_number: string;
} 