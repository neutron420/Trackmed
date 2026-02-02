// Centralized auth utilities for session management
// Uses sessionStorage so sessions are cleared when browser closes
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
  const token = sessionStorage.getItem(TOKEN_KEY);
  const expiresAt = sessionStorage.getItem(EXPIRES_KEY);
  
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
  if (!isAuthenticated()) {
    return null;
  }
  return sessionStorage.getItem(TOKEN_KEY);
}

/**
 * Get the stored user data
 */
export function getUser(): AuthUser | null {
  if (!isAuthenticated()) {
    return null;
  }
  
  const storedUser = sessionStorage.getItem(USER_KEY);
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
  const expiresAt = Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000;
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  sessionStorage.setItem(EXPIRES_KEY, expiresAt.toString());
}

/**
 * Clear all auth data (logout)
 */
export function clearAuth(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(EXPIRES_KEY);
}

/**
 * Check if the current user has admin role
 */
export function isAdmin(): boolean {
  const user = getUser();
  return user?.role === "ADMIN";
}

/**
 * Get authorization headers for API requests
 */
export function getAuthHeaders(): { Authorization: string } | {} {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
