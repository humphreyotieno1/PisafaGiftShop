'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import type { CartResponse, CheckoutCreate, CheckoutResponse } from '@/types/api';

interface CartContextType {
  cart: CartResponse | null;
  loading: boolean;
  error: string | null;
  addToCart: (productId: number, quantity?: number) => Promise<boolean>;
  updateQuantity: (productId: number, quantity: number) => Promise<boolean>;
  removeFromCart: (productId: number) => Promise<boolean>;
  clearCart: () => void;
  checkout: (checkoutData: CheckoutCreate) => Promise<CheckoutResponse | null>;
  refreshCart: () => Promise<void>;
  clearError: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cart = useCart();

  // Calculate cart count and total
  const cartCount = cart.cart?.products.reduce((total, item) => total + item.quantity, 0) || 0;
  const cartTotal = cart.cart?.total || 0;

  const value: CartContextType = {
    cart: cart.cart,
    loading: cart.loading === 'loading',
    error: cart.error,
    addToCart: cart.addToCart,
    updateQuantity: cart.updateQuantity,
    removeFromCart: cart.removeFromCart,
    clearCart: cart.clearCart,
    checkout: cart.checkout,
    refreshCart: cart.refreshCart,
    clearError: cart.clearError,
    cartCount,
    cartTotal,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
} 