/**
 * Authentication utility functions for frontend.
 * Handles JWT token storage, retrieval, and authentication checks.
 * Follows security best practices: never exposes sensitive info.
 */

const TOKEN_KEY = 'notification_ui_jwt';

/**
 * Store JWT token securely in localStorage.
 * @param token JWT token string
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * Retrieve JWT token from localStorage.
 * @returns JWT token string or null
 */
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/**
 * Remove JWT token from localStorage (logout).
 */
export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Check if user is authenticated (token exists and is not expired).
 * @returns boolean
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  if (!token) return false;
  try {
    // Decode JWT and check expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload && typeof payload.exp === 'number') {
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    }
    return true; // If no exp, assume valid (backend will enforce)
  } catch (e) {
    return false;
  }
}