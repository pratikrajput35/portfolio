/**
 * Centralized API helper for calling the Express server
 * Environment variables:
 * NEXT_PUBLIC_API_URL: The base URL of the Express server (e.g., http://localhost:4000)
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://portfolio-6kg3.onrender.com';

interface ApiOptions extends RequestInit {
  json?: any;
}

export async function api(endpoint: string, options: ApiOptions = {}) {
  // Ensure endpoint starts with /
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${path}`;

  const headers = new Headers(options.headers || {});

  // Add JSON content type if sending body
  if (options.json) {
    headers.set('Content-Type', 'application/json');
    options.body = JSON.stringify(options.json);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Send cookies
  });

  // Handle unauthorized responses by clear cache/redirect (caller handles this mostly)
  if (res.status === 401 && typeof window !== 'undefined') {
    // Session expired
    if (!window.location.pathname.startsWith('/admin/login')) {
       // Optional: Redirect to login
    }
  }

  return res;
}

export default api;
