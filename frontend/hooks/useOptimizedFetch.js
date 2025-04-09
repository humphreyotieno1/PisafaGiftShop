import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * A custom hook for optimized data fetching with caching, debouncing, and error handling
 * @param {string} url - The URL to fetch data from
 * @param {Object} options - Fetch options
 * @param {boolean} immediate - Whether to fetch immediately
 * @param {number} cacheTime - Cache time in milliseconds (default: 5 minutes)
 * @returns {Object} - { data, error, loading, refetch, setData }
 */
export function useOptimizedFetch(url, options = {}, immediate = true, cacheTime = 5 * 60 * 1000) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const cache = useRef({});
  const timeoutRef = useRef(null);
  const isMounted = useRef(true);
  const activeRequestRef = useRef(false);

  // Set isMounted to false on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const fetchData = useCallback(async (fetchUrl = url, fetchOptions = options) => {
    // Check cache first
    const cacheKey = `${fetchUrl}-${JSON.stringify(fetchOptions)}`;
    const cachedData = cache.current[cacheKey];
    
    if (cachedData && Date.now() - cachedData.timestamp < cacheTime) {
      setData(cachedData.data);
      return cachedData.data;
    }
    
    // If there's already an active request, don't start another one
    if (activeRequestRef.current) {
      return null;
    }
    
    activeRequestRef.current = true;
    
    try {
      if (isMounted.current) {
        setLoading(true);
        setError(null);
      }
      
      const response = await fetch(fetchUrl, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });
      
      // Check if component is still mounted
      if (!isMounted.current) return null;
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Check if component is still mounted
      if (!isMounted.current) return null;
      
      // Cache the result
      cache.current[cacheKey] = {
        data: result,
        timestamp: Date.now(),
      };
      
      setData(result);
      return result;
    } catch (err) {
      // Only set error if component is still mounted
      if (isMounted.current) {
        setError(err.message || 'An error occurred while fetching data');
      }
      throw err;
    } finally {
      activeRequestRef.current = false;
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [url, options, cacheTime]);

  // Debounced refetch to prevent multiple rapid requests
  const refetch = useCallback((fetchUrl = url, fetchOptions = options) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    return new Promise((resolve, reject) => {
      timeoutRef.current = setTimeout(() => {
        fetchData(fetchUrl, fetchOptions)
          .then(resolve)
          .catch(reject);
      }, 100); // 100ms debounce
    });
  }, [fetchData, url, options]);

  // Fetch data on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return { data, error, loading, refetch, setData };
}

/**
 * A custom hook for optimized mutation operations (POST, PUT, DELETE)
 * @param {string} url - The base URL for the mutation
 * @param {string} method - The HTTP method (POST, PUT, DELETE)
 * @returns {Object} - { mutate, loading, error, data }
 */
export function useOptimizedMutation(url, method = 'POST') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const isMounted = useRef(true);
  const activeRequestRef = useRef(false);

  // Set isMounted to false on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const mutate = useCallback(async (payload, customUrl = url) => {
    // If there's already an active request, don't start another one
    if (activeRequestRef.current) {
      return null;
    }
    
    activeRequestRef.current = true;
    
    try {
      if (isMounted.current) {
        setLoading(true);
        setError(null);
      }
      
      const response = await fetch(customUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload ? JSON.stringify(payload) : undefined,
      });
      
      // Check if component is still mounted
      if (!isMounted.current) return null;
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Check if component is still mounted
      if (!isMounted.current) return null;
      
      setData(result);
      return result;
    } catch (err) {
      // Only set error if component is still mounted
      if (isMounted.current) {
        setError(err.message || `An error occurred during ${method}`);
      }
      throw err;
    } finally {
      activeRequestRef.current = false;
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [url, method]);

  return { mutate, loading, error, data };
}
