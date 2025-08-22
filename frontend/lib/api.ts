import type {
  User,
  UserCreate,
  UserUpdate,
  AdminUserUpdate,
  Token,
  Product,
  ProductCreate,
  Category,
  CategoryCreate,
  CategoryUpdate,
  CartResponse,
  CartAddRequest,
  CartUpdateRequest,
  WishlistResponse,
  WishlistAddRequest,
  Order,
  OrderBase,
  OrderSummaryResponse,
  CheckoutCreate,
  CheckoutResponse,
  AnalyticsResponse,
  Msg,
} from '@/types/api';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pisafa-api.onrender.com';

// Helper function to handle API requests
async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Something went wrong');
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: async (username: string, password: string, rememberMe = false): Promise<Token> => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('remember_me', rememberMe.toString());

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Login failed');
    }

    const data: Token = await response.json();
    if (typeof window !== 'undefined' && data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    return data;
  },

  register: (userData: UserCreate): Promise<User> =>
    fetchWithAuth<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getCurrentUser: (): Promise<User> => fetchWithAuth<User>('/user/profile'),

  logout: (): Promise<Msg> =>
    fetchWithAuth<Msg>('/auth/logout', {
      method: 'POST',
    }).finally(() => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }),

  refreshToken: (refreshToken: string): Promise<Token> =>
    fetchWithAuth<Token>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  forgotPassword: (email: string): Promise<Msg> =>
    fetchWithAuth<Msg>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string): Promise<Msg> =>
    fetchWithAuth<Msg>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    }),
};

// User API
export const userApi = {
  getProfile: (): Promise<User> => fetchWithAuth<User>('/user/profile'),
  
  updateProfile: (userData: UserUpdate): Promise<User> =>
    fetchWithAuth<User>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  // Cart endpoints
  getCart: (): Promise<CartResponse> => fetchWithAuth<CartResponse>('/user/cart'),
  
  addToCart: (productId: number, quantity = 1): Promise<CartResponse> =>
    fetchWithAuth<CartResponse>('/user/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    }),

  updateCartItem: (productId: number, quantity: number): Promise<CartResponse> =>
    fetchWithAuth<CartResponse>(`/user/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),

  removeFromCart: (productId: number): Promise<Msg> =>
    fetchWithAuth<Msg>(`/user/cart/${productId}`, {
      method: 'DELETE',
    }),

  checkout: (checkoutData: CheckoutCreate): Promise<CheckoutResponse> =>
    fetchWithAuth<CheckoutResponse>('/user/cart/checkout', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    }),

  // Wishlist endpoints
  getWishlist: (): Promise<WishlistResponse> => fetchWithAuth<WishlistResponse>('/user/wishlist'),
  
  addToWishlist: (productId: number): Promise<WishlistResponse> =>
    fetchWithAuth<WishlistResponse>('/user/wishlist', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    }),

  removeFromWishlist: (productId: number): Promise<Msg> =>
    fetchWithAuth<Msg>(`/user/wishlist/${productId}`, {
      method: 'DELETE',
    }),

  // Toggle endpoint removed on backend. Use add/remove explicitly in UI.

  // Order endpoints
  getOrders: (): Promise<Order[]> => fetchWithAuth<Order[]>('/user/orders'),
  
  getOrderById: (orderId: number): Promise<Order> => fetchWithAuth<Order>(`/user/orders/${orderId}`),
  
  getOrderSummary: (orderId: number): Promise<OrderSummaryResponse> => 
    fetchWithAuth<OrderSummaryResponse>(`/user/orders/${orderId}/summary`),
};

// Shop API
export const shopApi = {
  // Categories
  getCategories: (): Promise<Category[]> => fetchWithAuth<Category[]>('/shop/categories'),
  
  getCategoryById: (categoryId: number): Promise<Category> => 
    fetchWithAuth<Category>(`/shop/categories/${categoryId}`),
  
  // Products
  getProducts: (): Promise<Product[]> => fetchWithAuth<Product[]>('/shop/products'),
  
  getProductById: (productId: number): Promise<Product> => 
    fetchWithAuth<Product>(`/shop/products/${productId}`),
  
  getBestsellers: (limit = 10): Promise<Product[]> => 
    fetchWithAuth<Product[]>(`/shop/bestsellers?limit=${limit}`),
    
  getFeatured: (limit = 10): Promise<Product[]> =>
    fetchWithAuth<Product[]>(`/shop/featured?limit=${limit}`),
};

// Admin API
export const adminApi = {
  // Users
  getUsers: (): Promise<User[]> => fetchWithAuth<User[]>('/admin/users'),
  
  getUserById: (userId: number): Promise<User> => fetchWithAuth<User>(`/admin/users/${userId}`),
  
  createUser: (userData: UserCreate): Promise<User> =>
    fetchWithAuth<User>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    
  updateUser: (userId: number, userData: AdminUserUpdate): Promise<User> =>
    fetchWithAuth<User>(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
    
  deleteUser: (userId: number): Promise<Msg> =>
    fetchWithAuth<Msg>(`/admin/users/${userId}`, {
      method: 'DELETE',
    }),

  // Categories
  getCategories: (): Promise<Category[]> => fetchWithAuth<Category[]>('/admin/categories'),
  
  createCategory: (categoryData: CategoryCreate): Promise<Category> =>
    fetchWithAuth<Category>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    }),
    
  updateCategory: (categoryId: number, categoryData: CategoryUpdate): Promise<Category> =>
    fetchWithAuth<Category>(`/admin/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    }),
    
  deleteCategory: (categoryId: number): Promise<Msg> =>
    fetchWithAuth<Msg>(`/admin/categories/${categoryId}`, {
      method: 'DELETE',
    }),

  // Products
  getProducts: (): Promise<Product[]> => fetchWithAuth<Product[]>('/admin/products'),
  
  createProduct: (productData: ProductCreate): Promise<Product> =>
    fetchWithAuth<Product>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),
    
  updateProduct: (productId: number, productData: Partial<ProductCreate>): Promise<Product> =>
    fetchWithAuth<Product>(`/admin/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    }),
    
  deleteProduct: (productId: number): Promise<Msg> =>
    fetchWithAuth<Msg>(`/admin/products/${productId}`, {
      method: 'DELETE',
    }),

  // Orders
  getOrders: (): Promise<Order[]> => fetchWithAuth<Order[]>('/admin/orders'),
  
  getOrder: (orderId: number): Promise<Order> => fetchWithAuth<Order>(`/admin/orders/${orderId}`),
  
  updateOrder: (orderId: number, orderData: OrderBase): Promise<Order> =>
    fetchWithAuth<Order>(`/admin/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    }),
    
  deleteOrder: (orderId: number): Promise<Msg> =>
    fetchWithAuth<Msg>(`/admin/orders/${orderId}`, {
      method: 'DELETE',
    }),
    
  getOrderSummary: (orderId: number): Promise<OrderSummaryResponse> =>
    fetchWithAuth<OrderSummaryResponse>(`/admin/orders/${orderId}/summary`),
    
  // Analytics
  getAnalytics: (): Promise<AnalyticsResponse> => fetchWithAuth<AnalyticsResponse>('/admin/analytics'),
};

// Export all APIs for convenience
export const api = {
  auth: authApi,
  user: userApi,
  shop: shopApi,
  admin: adminApi,
};

export default api;
