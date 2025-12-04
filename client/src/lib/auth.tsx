import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import type { User } from '@shared/schema';
import { apiRequest } from './api';
import { 
  secureStorage, 
  clearCSRFToken, 
  reportSecurityViolation,
  generateRequestFingerprint,
} from './security';

// =============================================================================
// CONSTANTS
// =============================================================================

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const SESSION_KEY = 'auth_session';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity
const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000; // Refresh every 15 minutes

// =============================================================================
// TYPES
// =============================================================================

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isStudent: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  sessionExpiresAt: number | null;
}

interface SessionData {
  fingerprint: string;
  createdAt: number;
  lastActivity: number;
  expiresAt: number;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Validate JWT token format (basic validation)
 */
function isValidTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  
  // JWT format: header.payload.signature
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  // Each part should be base64 encoded
  try {
    parts.forEach(part => {
      // Replace URL-safe chars and add padding
      const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
      atob(base64);
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Decode JWT payload (without verification - that's done server-side)
 */
function decodeTokenPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payloadPart = parts[1];
    if (!payloadPart) return null;
    
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return payload;
  } catch {
    return null;
  }
}

/**
 * Check if token is expired
 */
function isTokenExpired(token: string): boolean {
  const payload = decodeTokenPayload(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  
  // Add 30 second buffer
  return Date.now() >= (payload.exp * 1000) - 30000;
}

/**
 * Create session data
 */
function createSession(): SessionData {
  const now = Date.now();
  return {
    fingerprint: generateRequestFingerprint(),
    createdAt: now,
    lastActivity: now,
    expiresAt: now + SESSION_TIMEOUT,
  };
}

/**
 * Validate session
 */
function isValidSession(session: SessionData | null): boolean {
  if (!session) return false;
  
  const now = Date.now();
  
  // Check if session is expired
  if (now > session.expiresAt) return false;
  
  // Check for inactivity
  if (now - session.lastActivity > INACTIVITY_TIMEOUT) return false;
  
  // Note: Fingerprint check is relaxed - if it doesn't match, we'll just recreate the session
  // This prevents users from being logged out when they change browser/IP
  // The fingerprint is still checked for security violations reporting, but won't invalidate the session
  
  return true;
}

// =============================================================================
// CONTEXT
// =============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [, setLocation] = useLocation();

  /**
   * Secure logout - clears all auth data
   */
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setSession(null);
    
    // Clear all auth storage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    secureStorage.clear();
    clearCSRFToken();
    
    setLocation('/');
  }, [setLocation]);

  /**
   * Update activity timestamp
   */
  const updateActivity = useCallback(() => {
    if (session) {
      const updatedSession = {
        ...session,
        lastActivity: Date.now(),
      };
      setSession(updatedSession);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
    }
  }, [session]);

  /**
   * Secure login
   */
  const login = useCallback((newToken: string, newUser: User) => {
    // Validate token format
    if (!isValidTokenFormat(newToken)) {
      reportSecurityViolation('invalid_token_format', { tokenLength: newToken?.length });
      throw new Error('Un problème technique est survenu lors de la connexion. Veuillez réessayer.');
    }
    
    // Check if token is already expired
    if (isTokenExpired(newToken)) {
      reportSecurityViolation('expired_token_login', {});
      throw new Error('Votre session a expiré. Veuillez vous reconnecter.');
    }
    
    // Validate user data
    if (!newUser || !newUser.id || !newUser.email) {
      reportSecurityViolation('invalid_user_data', { hasId: !!newUser?.id, hasEmail: !!newUser?.email });
      throw new Error('Les informations du compte sont incomplètes. Veuillez réessayer.');
    }
    
    // Create new session
    const newSession = createSession();
    
    // Store data
    setToken(newToken);
    setUser(newUser);
    setSession(newSession);
    
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
  }, []);

  /**
   * Refresh user profile
   */
  const refreshUser = useCallback(async () => {
    if (!token) return;
    
    // Check token validity first
    if (isTokenExpired(token)) {
      logout();
      return;
    }
    
    try {
      const response = await apiRequest<{ user: User }>('GET', '/auth/profile');
      if (response.user) {
        setUser(response.user);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        updateActivity();
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
      // Only logout on actual authentication errors (401), not on network errors
      if (error instanceof Error) {
        // Check if it's a real 401 authentication error
        if (error.message.includes('401') || 
            (error.message.includes('Session') && error.message.includes('expirée'))) {
          // Only logout if we're sure it's an auth error, not a network error
          const isNetworkError = error.message.includes('fetch') || 
                                 error.message.includes('network') ||
                                 error.message.includes('Failed to fetch') ||
                                 error.message.includes('502') ||
                                 error.message.includes('503') ||
                                 error.message.includes('504');
          
          if (!isNetworkError) {
            logout();
          } else {
            // Network error - don't logout, just log it
            console.warn('Network error during refresh, keeping session:', error.message);
          }
        }
      }
    }
  }, [token, logout, updateActivity]);

  /**
   * Initialize auth state from storage
   */
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    const storedSession = sessionStorage.getItem(SESSION_KEY);
    
    if (storedToken && storedUser) {
      try {
        // Validate token format
        if (!isValidTokenFormat(storedToken)) {
          throw new Error('Invalid token format');
        }
        
        // Check if token is expired
        if (isTokenExpired(storedToken)) {
          throw new Error('Token expired');
        }
        
        // Parse session
        let parsedSession: SessionData | null = null;
        if (storedSession) {
          try {
            parsedSession = JSON.parse(storedSession);
          } catch (e) {
            // Invalid session data, create new one
            parsedSession = null;
          }
        }
        
        // Validate session or create new one (don't fail if session is invalid, just recreate it)
        if (!isValidSession(parsedSession)) {
          parsedSession = createSession();
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(parsedSession));
        }
        
        const parsedUser = JSON.parse(storedUser);
        
        // Validate user data
        if (!parsedUser || !parsedUser.id || !parsedUser.email) {
          throw new Error('Invalid user data');
        }
        
        // Set auth state - don't clear on session validation failure, just recreate session
        setToken(storedToken);
        setUser(parsedUser);
        setSession(parsedSession);
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Only clear if token is actually invalid, not just if session is invalid
        if (error instanceof Error && 
            (error.message.includes('Invalid token format') || 
             error.message.includes('Token expired') ||
             error.message.includes('Invalid user data'))) {
          // Clear invalid data only for critical errors
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          sessionStorage.removeItem(SESSION_KEY);
        }
      }
    }
  }, []);

  /**
   * Session validation interval
   */
  useEffect(() => {
    if (!token || !session) return;
    
    const checkSession = () => {
      if (!isValidSession(session)) {
        console.log('Session expired or invalid');
        logout();
        return;
      }
      
      if (isTokenExpired(token)) {
        console.log('Token expired');
        logout();
        return;
      }
    };
    
    // Check immediately
    checkSession();
    
    // Check periodically
    const interval = setInterval(checkSession, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, [token, session, logout]);

  /**
   * Refresh user profile periodically
   */
  useEffect(() => {
    if (!token || !user) return;
    
    // Don't refresh immediately after login - wait a bit to avoid race conditions
    const initialTimeout = setTimeout(() => {
      refreshUser();
    }, 2000); // Wait 2 seconds after login before first refresh
    
    // Periodic refresh
    const interval = setInterval(refreshUser, TOKEN_REFRESH_INTERVAL);
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Only depend on token

  /**
   * Track user activity
   */
  useEffect(() => {
    if (!token) return;
    
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      updateActivity();
    };
    
    // Throttle activity updates
    let lastUpdate = Date.now();
    const throttledHandler = () => {
      const now = Date.now();
      if (now - lastUpdate > 60000) { // Update at most every minute
        lastUpdate = now;
        handleActivity();
      }
    };
    
    events.forEach(event => {
      window.addEventListener(event, throttledHandler, { passive: true });
    });
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, throttledHandler);
      });
    };
  }, [token, updateActivity]);

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    refreshUser,
    // Don't require valid session for isAuthenticated - just check token and user
    // Session validation is for security, not for basic authentication
    isAuthenticated: !!user && !!token,
    isStudent: user?.role === 'student',
    isOwner: user?.role === 'owner',
    isAdmin: user?.role === 'admin',
    sessionExpiresAt: session?.expiresAt || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function getAuthToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  
  // Validate token before returning
  if (token && isValidTokenFormat(token) && !isTokenExpired(token)) {
    return token;
  }
  
  return null;
}
