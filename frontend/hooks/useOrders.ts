import { useState, useEffect, useCallback } from 'react';
import { userApi } from '@/lib/api';
import type { Order, OrderSummaryResponse } from '@/types/api';
import type { LoadingState } from '@/types/common';

interface OrdersState {
  orders: Order[];
  loading: LoadingState;
  error: string | null;
}

interface OrdersActions {
  getOrders: () => Promise<Order[]>;
  getOrderById: (id: number) => Promise<Order | null>;
  getOrderSummary: (id: number) => Promise<OrderSummaryResponse | null>;
  refreshOrders: () => Promise<void>;
  clearError: () => void;
}

export function useOrders(): OrdersState & OrdersActions {
  const [state, setState] = useState<OrdersState>({
    orders: [],
    loading: 'idle',
    error: null,
  });

  const refreshOrders = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: 'loading', error: null }));
      const orders = await userApi.getOrders();
      setState({ orders, loading: 'success', error: null });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load orders';
      setState(prev => ({ ...prev, loading: 'error', error: errorMessage }));
    }
  }, []);

  const getOrders = useCallback(async (): Promise<Order[]> => {
    try {
      setState(prev => ({ ...prev, loading: 'loading', error: null }));
      const orders = await userApi.getOrders();
      setState({ orders, loading: 'success', error: null });
      return orders;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load orders';
      setState(prev => ({ ...prev, loading: 'error', error: errorMessage }));
      return [];
    }
  }, []);

  const getOrderById = useCallback(async (id: number): Promise<Order | null> => {
    try {
      setState(prev => ({ ...prev, loading: 'loading', error: null }));
      const order = await userApi.getOrderById(id);
      setState(prev => ({ ...prev, loading: 'success', error: null }));
      return order;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load order';
      setState(prev => ({ ...prev, loading: 'error', error: errorMessage }));
      return null;
    }
  }, []);

  const getOrderSummary = useCallback(async (id: number): Promise<OrderSummaryResponse | null> => {
    try {
      setState(prev => ({ ...prev, loading: 'loading', error: null }));
      const summary = await userApi.getOrderSummary(id);
      setState(prev => ({ ...prev, loading: 'success', error: null }));
      return summary;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load order summary';
      setState(prev => ({ ...prev, loading: 'error', error: errorMessage }));
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Load orders on mount
  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  return {
    ...state,
    getOrders,
    getOrderById,
    getOrderSummary,
    refreshOrders,
    clearError,
  };
}
