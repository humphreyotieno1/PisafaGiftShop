/**
 * Utility functions for making authenticated API requests
 */

/**
 * Get the authentication token from localStorage or cookies
 */
export function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

/**
 * Make an authenticated fetch request
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Fetch options
 */
export async function fetchWithAuth(url, options = {}) {
  const token = getAuthToken();
  
  // Set up headers with authentication
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Handle 401 Unauthorized errors
  if (response.status === 401) {
    // Clear auth data if unauthorized
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
      // Optional: Redirect to login page
      // window.location.href = '/auth/login';
    }
  }
  
  return response;
}

/**
 * Make a GET request with authentication
 */
export async function getWithAuth(url) {
  return fetchWithAuth(url, { method: 'GET' });
}

/**
 * Make a POST request with authentication
 */
export async function postWithAuth(url, data) {
  return fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Make a PUT request with authentication
 */
export async function putWithAuth(url, data) {
  return fetchWithAuth(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Make a DELETE request with authentication
 */
export async function deleteWithAuth(url) {
  return fetchWithAuth(url, { method: 'DELETE' });
}
