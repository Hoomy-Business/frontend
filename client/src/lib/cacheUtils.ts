/**
 * Cache utilities for clearing application cache while preserving authentication
 */

import { queryClient } from './queryClient';

// Auth keys that should be preserved
const AUTH_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
  SESSION: 'auth_session',
};

/**
 * Clear all cache except authentication data
 * This function is exposed globally as clearcache() for use in browser console
 */
export function clearCache(): void {
  console.log('🧹 Clearing cache (preserving authentication)...');

  // 1. Clear React Query cache
  try {
    queryClient.clear();
    console.log('✅ React Query cache cleared');
  } catch (error) {
    console.error('❌ Error clearing React Query cache:', error);
  }

  // 2. Clear localStorage (except auth keys)
  try {
    const authToken = localStorage.getItem(AUTH_KEYS.TOKEN);
    const authUser = localStorage.getItem(AUTH_KEYS.USER);
    
    // Save secure storage keys (they start with _s_)
    const secureStorageKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('_s_')) {
        const value = localStorage.getItem(key);
        if (value) {
          secureStorageKeys.push(key);
        }
      }
    }
    const secureStorageData: Record<string, string> = {};
    secureStorageKeys.forEach(key => {
      secureStorageData[key] = localStorage.getItem(key) || '';
    });
    
    // Clear all localStorage
    localStorage.clear();
    
    // Restore auth keys
    if (authToken) {
      localStorage.setItem(AUTH_KEYS.TOKEN, authToken);
    }
    if (authUser) {
      localStorage.setItem(AUTH_KEYS.USER, authUser);
    }
    
    // Restore secure storage
    Object.entries(secureStorageData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    
    console.log('✅ localStorage cleared (auth preserved)');
  } catch (error) {
    console.error('❌ Error clearing localStorage:', error);
  }

  // 3. Clear sessionStorage (except auth session)
  try {
    const authSession = sessionStorage.getItem(AUTH_KEYS.SESSION);
    
    // Clear all sessionStorage
    sessionStorage.clear();
    
    // Restore auth session
    if (authSession) {
      sessionStorage.setItem(AUTH_KEYS.SESSION, authSession);
    }
    
    console.log('✅ sessionStorage cleared (auth preserved)');
  } catch (error) {
    console.error('❌ Error clearing sessionStorage:', error);
  }

  // 4. Clear IndexedDB cache (if any)
  try {
    if ('indexedDB' in window) {
      // Note: IndexedDB clearing would require specific database names
      // This is a placeholder for future implementation if needed
      console.log('ℹ️ IndexedDB cache check skipped (no specific DBs to clear)');
    }
  } catch (error) {
    console.error('❌ Error checking IndexedDB:', error);
  }

  // 5. Force garbage collection hint (if available)
  try {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
      console.log('✅ Garbage collection triggered');
    }
  } catch (error) {
    // Ignore - gc() is not available in all browsers
  }

  console.log('✨ Cache cleared successfully!');
  console.log('💡 Tip: Refresh the page to see the changes take effect');
}

/**
 * Expose clearCache globally for console access
 */
if (typeof window !== 'undefined') {
  (window as any).clearcache = clearCache;
  (window as any).clearCache = clearCache; // Also expose with camelCase
  
  // Add to console help
  console.log('%c🧹 Cache utilities loaded!', 'color: #4CAF50; font-weight: bold;');
  console.log('%cUse clearcache() or clearCache() in the console to clear all cache while preserving your login', 'color: #2196F3;');
}

