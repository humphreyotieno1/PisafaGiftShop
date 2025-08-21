import { useState, useEffect, useCallback } from 'react';
import { userApi } from '@/lib/api';
import type { WishlistResponse, ProductBase } from '@/types/api';
import type { LoadingState } from '@/types/common';

interface WishlistState {
  wishlist: WishlistResponse | null;
  loading: LoadingState;
  error: string | null;
}

interface WishlistActions {
  addToWishlist: (productId: number) => Promise<boolean>;
  removeFromWishlist: (productId: number) => Promise<boolean>;
  // toggle removed; explicit add/remove only
  isInWishlist: (productId: number) => boolean;
  refreshWishlist: () => Promise<void>;
  clearError: () => void;
}

export function useWishlist(): WishlistState & WishlistActions {
  const [state, setState] = useState<WishlistState>({
    wishlist: null,
    loading: 'idle',
    error: null,
  });

  const refreshWishlist = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: 'loading', error: null }));
      const wishlistData = await userApi.getWishlist();
      setState({ wishlist: wishlistData, loading: 'success', error: null });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load wishlist';
      setState(prev => ({ ...prev, loading: 'error', error: errorMessage }));
    }
  }, []);

  const addToWishlist = useCallback(async (productId: number): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: 'loading', error: null }));
      const updatedWishlist = await userApi.addToWishlist(productId);
      setState({ wishlist: updatedWishlist, loading: 'success', error: null });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item to wishlist';
      setState(prev => ({ ...prev, loading: 'error', error: errorMessage }));
      return false;
    }
  }, []);

  const removeFromWishlist = useCallback(async (productId: number): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: 'loading', error: null }));
      await userApi.removeFromWishlist(productId);
      await refreshWishlist();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove item from wishlist';
      setState(prev => ({ ...prev, loading: 'error', error: errorMessage }));
      return false;
    }
  }, [refreshWishlist]);

  // toggle removed

  const isInWishlist = useCallback((productId: number): boolean => {
    if (!state.wishlist?.products) return false;
    return state.wishlist.products.some((product) => product.id === productId);
  }, [state.wishlist]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Load wishlist on mount
  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  return {
    ...state,
    addToWishlist,
    removeFromWishlist,
    // toggle removed
    isInWishlist,
    refreshWishlist,
    clearError,
  };
}
