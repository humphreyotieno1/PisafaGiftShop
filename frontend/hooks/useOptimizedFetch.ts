import { useState, useEffect, useRef, useCallback } from 'react';
import type { LoadingState } from '@/types/common';

interface FetchState<T> {
  data: T | null;
  loading: LoadingState;
  error: string | null;
}

interface FetchOptions {
  immediate?: boolean;
  dependencies?: any[];
  cacheKey?: string;
  cacheTime?: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<any>>();

export function useOptimizedFetch<T>(
  fetchFn: () => Promise<T>,
  options: FetchOptions = {}
): FetchState<T> & {
  execute: () => Promise<T | null>;
  refresh: () => Promise<T | null>;
  clearCache: () => void;
} {
  const { immediate = true, dependencies = [], cacheKey, cacheTime = 5 * 60 * 1000 } = options;
  
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: 'idle',
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const execute = useCallback(async (): Promise<T | null> => {
    // Check cache first
    if (cacheKey && cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!;
      if (Date.now() < cached.expiresAt) {
        setState(prev => ({ ...prev, data: cached.data, loading: 'success', error: null }));
        return cached.data;
      } else {
        cache.delete(cacheKey);
      }
    }

    // Abort previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setState(prev => ({ ...prev, loading: 'loading', error: null }));
      
      const data = await fetchFn();
      
      // Check if component is still mounted
      if (!isMountedRef.current) return null;
      
      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) return null;

      // Cache the result if cacheKey is provided
      if (cacheKey) {
        cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          expiresAt: Date.now() + cacheTime,
        });
      }

      setState({ data, loading: 'success', error: null });
      return data;
    } catch (err) {
      if (!isMountedRef.current) return null;
      if (abortControllerRef.current.signal.aborted) return null;

      const errorMessage = err instanceof Error ? err.message : 'Fetch failed';
      setState(prev => ({ ...prev, loading: 'error', error: errorMessage }));
      return null;
    }
  }, [fetchFn, cacheKey, cacheTime]);

  const refresh = useCallback(async (): Promise<T | null> => {
    // Clear cache if cacheKey is provided
    if (cacheKey) {
      cache.delete(cacheKey);
    }
    return execute();
  }, [execute, cacheKey]);

  const clearCache = useCallback(() => {
    if (cacheKey) {
      cache.delete(cacheKey);
    }
  }, [cacheKey]);

  // Cleanup function
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Execute on mount and when dependencies change
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute, ...dependencies]);

  return {
    ...state,
    execute,
    refresh,
    clearCache,
  };
}

// Utility function to clear all cache
export const clearAllCache = (): void => {
  cache.clear();
};

// Utility function to get cache statistics
export const getCacheStats = (): { size: number; entries: string[] } => {
  return {
    size: cache.size,
    entries: Array.from(cache.keys()),
  };
};
