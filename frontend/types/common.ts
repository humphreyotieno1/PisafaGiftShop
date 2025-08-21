// Common types and constants

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface BaseState {
  loading: LoadingState;
  error: string | null;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  category_id?: number;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  is_featured?: boolean;
  is_bestseller?: boolean;
}

export interface SortOption {
  value: string;
  label: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

// Constants
export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,
} as const;

export const SORT_OPTIONS: SortOption[] = [
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'price_asc', label: 'Price (Low to High)' },
  { value: 'price_desc', label: 'Price (High to Low)' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

export const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
} as const;

export const USER_ROLES = {
  admin: { label: 'Admin', color: 'bg-red-100 text-red-800' },
  user: { label: 'User', color: 'bg-blue-100 text-blue-800' },
} as const;

export const PAYMENT_METHODS = [
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'cash_on_delivery', label: 'Cash on Delivery' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
] as const;

export const CURRENCY = 'KES';

export const TAX_RATE = 0.16; // 16% VAT

export const SHIPPING_COST = 500; // 500 KES

export const IMAGE_PLACEHOLDER = '/placeholders/no-image.svg';

export const UPLOAD_MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USER: {
    PROFILE: '/user/profile',
    CART: '/user/cart',
    WISHLIST: '/user/wishlist',
    ORDERS: '/user/orders',
  },
  SHOP: {
    CATEGORIES: '/shop/categories',
    PRODUCTS: '/shop/products',
    BESTSELLERS: '/shop/bestsellers',
    FEATURED: '/shop/featured',
  },
  ADMIN: {
    USERS: '/admin/users',
    CATEGORIES: '/admin/categories',
    PRODUCTS: '/admin/products',
    ORDERS: '/admin/orders',
    ANALYTICS: '/admin/analytics',
  },
} as const; 