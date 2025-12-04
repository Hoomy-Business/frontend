/**
 * Cache utilities for clearing application cache while preserving authentication
 */

import { queryClient } from './queryClient';

// Keys that should be preserved when clearing cache
const PRESERVED_KEYS = {
  // Authentication
  TOKEN: 'auth_token',
  USER: 'auth_user',
  SESSION: 'auth_session',
  // User preferences
  LANGUAGE: 'hoomy_lang',
  // Secure storage keys (starting with _s_)
  SECURE_PREFIX: '_s_',
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

  // 2. Clear localStorage (except preserved keys)
  try {
    // Save all preserved data before clearing
    const preservedData: Record<string, string | null> = {
      [PRESERVED_KEYS.TOKEN]: localStorage.getItem(PRESERVED_KEYS.TOKEN),
      [PRESERVED_KEYS.USER]: localStorage.getItem(PRESERVED_KEYS.USER),
      [PRESERVED_KEYS.LANGUAGE]: localStorage.getItem(PRESERVED_KEYS.LANGUAGE),
    };
    
    // Save secure storage keys (they start with _s_)
    const secureStorageData: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(PRESERVED_KEYS.SECURE_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          secureStorageData[key] = value;
        }
      }
    }
    
    // Clear all localStorage
    localStorage.clear();
    
    // Restore preserved data
    Object.entries(preservedData).forEach(([key, value]) => {
      if (value) {
        localStorage.setItem(key, value);
      }
    });
    
    // Restore secure storage
    Object.entries(secureStorageData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    
    const preservedCount = Object.values(preservedData).filter(v => v !== null).length + Object.keys(secureStorageData).length;
    console.log(`✅ localStorage cleared (${preservedCount} items preserved: auth, language, secure storage)`);
  } catch (error) {
    console.error('❌ Error clearing localStorage:', error);
  }

  // 3. Clear sessionStorage (except auth session)
  try {
    const authSession = sessionStorage.getItem(PRESERVED_KEYS.SESSION);
    
    // Clear all sessionStorage
    sessionStorage.clear();
    
    // Restore auth session
    if (authSession) {
      sessionStorage.setItem(PRESERVED_KEYS.SESSION, authSession);
    }
    
    console.log('✅ sessionStorage cleared (auth session preserved)');
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
  console.log('💡 Preserved: Authentication, Language preference, Secure storage');
  console.log('💡 Tip: The page will refresh automatically in 2 seconds to apply changes...');
  
  // Auto-refresh after a short delay to ensure clean state
  setTimeout(() => {
    try {
      window.location.reload();
    } catch (error) {
      console.error('❌ Error reloading page:', error);
      console.log('💡 Please manually refresh the page to see the changes');
    }
  }, 2000);
}

/**
 * Expose clearCache globally for console access
 * Make sure it's always available, even after page reloads on GitHub Pages
 */
if (typeof window !== 'undefined') {
  // Expose with multiple variations for easier access
  (window as any).clearcache = clearCache;
  (window as any).clearCache = clearCache; // camelCase
  (window as any).HoomyClearCache = clearCache; // Namespaced
  
  // Ensure the function is always available, even if module reloads
  const ensureGlobals = () => {
    if (typeof window !== 'undefined') {
      if (!(window as any).clearcache) {
        (window as any).clearcache = clearCache;
      }
      if (!(window as any).clearCache) {
        (window as any).clearCache = clearCache;
      }
      if (!(window as any).HoomyClearCache) {
        (window as any).HoomyClearCache = clearCache;
      }
    }
  };
  
  // Ensure on load
  ensureGlobals();
  
  // Also ensure after a short delay (for GitHub Pages timing issues)
  setTimeout(ensureGlobals, 100);
  setTimeout(ensureGlobals, 1000);
  
  // Add to console help (only once to avoid spam)
  if (!(window as any).__hoomy_cache_utils_loaded) {
    (window as any).__hoomy_cache_utils_loaded = true;
    console.log('%c🧹 Cache utilities loaded!', 'color: #4CAF50; font-weight: bold;');
    console.log('%cUse clearcache() or clearCache() in the console to clear all cache while preserving your login and preferences', 'color: #2196F3;');
    console.log('%cPreserved: authentication, language preference, secure storage', 'color: #666; font-style: italic;');
  }
}

