// utils/auth.ts
import { cookies } from 'next/headers';
import { TOKEN_COOKIE_NAME } from '../config';

// Fetch wrapper with authentication
export async function authFetch(url: string, options: RequestInit = {}) {
  // Create request options with auth header
  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Make the authenticated request
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  // Handle authentication errors
  if (response.status === 401) {
    // Clear auth cookie on unauthorized
    cookieStore.delete(TOKEN_COOKIE_NAME);
  }
  
  return response;
}

// Check if user is authenticated based on cookie existence
export async function isAuthenticated() {
  return !!(await cookies()).get(TOKEN_COOKIE_NAME);
}