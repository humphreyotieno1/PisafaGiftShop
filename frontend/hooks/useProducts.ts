import { useState, useEffect, useCallback } from 'react';
import { shopApi } from '@/lib/api';
import type { Product, Category } from '@/types/api';
import type { LoadingState, FilterParams, PaginationParams } from '@/types/common';

interface ProductsState {
  products: Product[];
  categories: Category[];
  featured: Product[];
  bestsellers: Product[];
  loading: LoadingState;
  error: string | null;
}

interface ProductsActions {
  getProducts: (params?: PaginationParams & FilterParams) => Promise<Product[]>;
  getProductById: (id: number) => Promise<Product | null>;
  getCategories: () => Promise<Category[]>;
  getCategoryById: (id: number) => Promise<Category | null>;
  getFeatured: (limit?: number) => Promise<Product[]>;
  getBestsellers: (limit?: number) => Promise<Product[]>;
  refreshProducts: () => Promise<void>;
  clearError: () => void;
}

export function useProducts(): ProductsState & ProductsActions {
  const [state, setState] = useState<ProductsState>({
    products: [],
    categories: [],
    featured: [],
    bestsellers: [],
    loading: 'idle',
    error: null,
  });

  const refreshProducts = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: 'loading', error: null }));
      const [products, categories, featured, bestsellers] = await Promise.all([
        shopApi.getProducts(),
        shopApi.getCategories(),
        shopApi.getFeatured(),
        shopApi.getBestsellers(),
      ]);
      
      setState({
        products,
        categories,
        featured,
        bestsellers,
        loading: 'success',
        error: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
      setState(prev => ({ ...prev, loading: 'error', error: errorMessage }));
    }
  }, []);

  const getProducts = useCallback(async (params?: PaginationParams & FilterParams): Promise<Product[]> => {
    try {
      setState(prev => ({ ...prev, loading: 'loading', error: null }));
      const products = await shopApi.getProducts();
      setState(prev => ({ ...prev, products, loading: 'success', error: null }));
      return products;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
      setState(prev => ({ ...prev, loading: 'error', error: errorMessage }));
      return [];
    }
  }, []);

  const getProductById = useCallback(async (id: number): Promise<Product | null> => {
    try {
      setState(prev => ({ ...prev, loading: 'loading', error: null }));
      const product = await shopApi.getProductById(id);
      setState(prev => ({ ...prev, loading: 'success', error: null }));
      return product;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load product';
      setState(prev => ({ ...prev, loading: 'error', error: errorMessage }));
      return null;
    }
  }, []);

  const getCategories = useCallback(async (): Promise<Category[]> => {
    try {
      setState(prev => ({ ...prev, loading: 'loading', error: null }));
      const categories = await shopApi.getCategories();
      setState(prev => ({ ...prev, categories, loading: 'success', error: null }));
      return categories;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load categories';
      setState(prev => ({ ...prev, loading: 'error', error: errorMessage }));
      return [];
    }
  }, []);

  const getCategoryById = useCallback(async (id: number): Promise<Category | null> => {
    try {
      setState(prev => ({ ...prev, loading: 'loading', error: null }));
      const category = await shopApi.getCategoryById(id);
      setState(prev => ({ ...prev, loading: 'success', error: null }));
      return category;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load category';
      setState(prev => ({ ...prev, loading: 'error', error: errorMessage }));
      return null;
    }
  }, []);

  const getFeatured = useCallback(async (limit = 10): Promise<Product[]> => {
    try {
      setState(prev => ({ ...prev, loading: 'loading', error: null }));
      const featured = await shopApi.getFeatured(limit);
      setState(prev => ({ ...prev, featured, loading: 'success', error: null }));
      return featured;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load featured products';
      setState(prev => ({ ...prev, loading: 'error', error: errorMessage }));
      return [];
    }
  }, []);

  const getBestsellers = useCallback(async (limit = 10): Promise<Product[]> => {
    try {
      setState(prev => ({ ...prev, loading: 'loading', error: null }));
      const bestsellers = await shopApi.getBestsellers(limit);
      setState(prev => ({ ...prev, bestsellers, loading: 'success', error: null }));
      return bestsellers;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load bestsellers';
      setState(prev => ({ ...prev, loading: 'error', error: errorMessage }));
      return [];
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Load initial data on mount
  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  return {
    ...state,
    getProducts,
    getProductById,
    getCategories,
    getCategoryById,
    getFeatured,
    getBestsellers,
    refreshProducts,
    clearError,
  };
}
