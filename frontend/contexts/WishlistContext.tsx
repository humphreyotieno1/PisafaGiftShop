'use client';

import React, { createContext, useContext } from 'react';
import { useWishlist } from '@/hooks/useWishlist';
import type { WishlistResponse } from '@/types/api';

interface WishlistContextType {
  wishlist: WishlistResponse | null;
  loading: boolean;
  error: string | null;
  addToWishlist: (productId: number) => Promise<boolean>;
  removeFromWishlist: (productId: number) => Promise<boolean>;
  // toggle removed
  isInWishlist: (productId: number) => boolean;
  refreshWishlist: () => Promise<void>;
  clearError: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const wishlist = useWishlist();

  // Calculate wishlist count
  const wishlistCount = wishlist.wishlist?.products.length || 0;

  const value: WishlistContextType = {
    wishlist: wishlist.wishlist,
    loading: wishlist.loading === 'loading',
    error: wishlist.error,
    addToWishlist: wishlist.addToWishlist,
    removeFromWishlist: wishlist.removeFromWishlist,
    // toggle removed
    isInWishlist: wishlist.isInWishlist,
    refreshWishlist: wishlist.refreshWishlist,
    clearError: wishlist.clearError,
    wishlistCount,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlistContext(): WishlistContextType {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlistContext must be used within a WishlistProvider');
  }
  return context;
} 