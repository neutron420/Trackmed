// Centralized auth utilities for session management
// Uses localStorage for persistence across browser sessions
// Also implements token expiration checking

const TOKEN_KEY = "token";
const USER_KEY = "user";
const EXPIRES_KEY = "tokenExpiresAt";
const TOKEN_EXPIRY_HOURS = 8; // Must match backend JWT expiry

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

/**
 * Check if user is authenticated (token exists and not expired)
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem(TOKEN_KEY);
  const expiresAt = localStorage.getItem(EXPIRES_KEY);
  
  if (!token) return false;
  
  // Check if token has expired
  if (expiresAt && Date.now() > parseInt(expiresAt)) {
    clearAuth();
    return false;
  }
  
  return true;
}

/**
 * Get the stored auth token
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  if (!isAuthenticated()) {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get the stored user data
 */
export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  if (!isAuthenticated()) {
    return null;
  }
  
  const storedUser = localStorage.getItem(USER_KEY);
  if (!storedUser) return null;
  
  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Store auth credentials after login
 */
export function setAuth(token: string, user: AuthUser): void {
  if (typeof window === 'undefined') return;
  const expiresAt = Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(EXPIRES_KEY, expiresAt.toString());
}

/**
 * Clear all auth data (logout)
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(EXPIRES_KEY);
}

/**
 * Check if the current user has manufacturer role
 */
export function isManufacturer(): boolean {
  const user = getUser();
  return user?.role === "MANUFACTURER";
}

/**
 * Get authorization headers for API requests
 */
export function getAuthHeaders(): { Authorization: string } | {} {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
