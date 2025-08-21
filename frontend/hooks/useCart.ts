import { useState, useEffect, useCallback } from 'react';
import { userApi } from '@/lib/api';
import type { CartResponse, CartItemResponse, CheckoutCreate, CheckoutResponse } from '@/types/api';
import type { LoadingState } from '@/types/common';

interface CartState {
  cart: CartResponse | null;
  loading: LoadingState;
  error: string | null;
}

interface CartActions {
  addToCart: (productId: number, quantity?: number) => Promise<boolean>;
  updateQuantity: (productId: number, quantity: number) => Promise<boolean>;
  removeFromCart: (productId: number) => Promise<boolean>;
  clearCart: () => void;
  checkout: (checkoutData: CheckoutCreate) => Promise<CheckoutResponse | null>;
  refreshCart: () => Promise<void>;
}

export function useCart(): CartState & CartActions {
  const [state, setState] = useState<CartState>({
    cart: null,
    loading: 'idle',
    error: null,
  });

  const refreshCart = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: 'loading', error: null }));
      const cartData = await userApi.getCart();
      setState({ cart: cartData, loading: 'success', error: null });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load cart';
      setState(prev => ({ ...prev, loading: 'error', error: errorMessage }));
    }
  }, []);

  const addToCart = useCallback(async (productId: number, quantity = 1): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: 'loading', error: null }));
      const updatedCart = await userApi.addToCart(productId, quantity);
      setState({ cart: updatedCart, loading: 'success', error: null });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item to cart';
      setState(prev => ({ ...prev, loading: 'error', error: errorMessage }));
      return false;
    }
  }, []);

  const updateQuantity = useCallback(async (productId: number, quantity: number): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: 'loading', error: null }));
      const updatedCart = await userApi.updateCartItem(productId, quantity);
      setState({ cart: updatedCart, loading: 'success', error: null });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update cart item';
      setState(prev => ({ ...prev, loading: 'error', error: errorMessage }));
      return false;
    }
  }, []);

  const removeFromCart = useCallback(async (productId: number): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: 'loading', error: null }));
      await userApi.removeFromCart(productId);
      await refreshCart();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove item from cart';
      setState(prev => ({ ...prev, loading: 'error', error: errorMessage }));
      return false;
    }
  }, [refreshCart]);

  const clearCart = useCallback(() => {
    setState({ cart: null, loading: 'idle', error: null });
  }, []);

  const checkout = useCallback(async (checkoutData: CheckoutCreate): Promise<CheckoutResponse | null> => {
    try {
      setState(prev => ({ ...prev, loading: 'loading', error: null }));
      const checkoutResponse = await userApi.checkout(checkoutData);
      setState(prev => ({ ...prev, loading: 'success' }));
      return checkoutResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Checkout failed';
      setState(prev => ({ ...prev, loading: 'error', error: errorMessage }));
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Load cart on mount
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return {
    ...state,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    checkout,
    refreshCart,
    clearError,
  };
}
