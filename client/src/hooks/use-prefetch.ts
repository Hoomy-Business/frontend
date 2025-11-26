import { useCallback, useEffect, useRef } from 'react';
import { queryClient } from '@/lib/queryClient';
import { getQueryFn } from '@/lib/queryClient';

// Idle callback polyfill
const requestIdleCallback = 
  typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? window.requestIdleCallback
    : (cb: () => void) => setTimeout(cb, 1);

const cancelIdleCallback = 
  typeof window !== 'undefined' && 'cancelIdleCallback' in window
    ? window.cancelIdleCallback
    : clearTimeout;

/**
 * Hook pour précharger les données d'une propriété quand l'utilisateur survole une PropertyCard
 */
export function usePrefetchProperty() {
  const pendingPrefetch = useRef<Set<string | number>>(new Set());

  const prefetchProperty = useCallback((propertyId: string | number) => {
    // Éviter les préchargements en double
    if (pendingPrefetch.current.has(propertyId)) return;
    pendingPrefetch.current.add(propertyId);

    requestIdleCallback(() => {
      queryClient.prefetchQuery({
        queryKey: [`/properties/${propertyId}`],
        queryFn: getQueryFn({ on401: "throw" }),
        staleTime: 1000 * 60 * 5, // 5 minutes
      });
    });
  }, []);

  return { prefetchProperty };
}

/**
 * Hook pour précharger les données des cantons (souvent utilisées)
 */
export function usePrefetchLocations() {
  const prefetchLocations = useCallback(() => {
    requestIdleCallback(() => {
      queryClient.prefetchQuery({
        queryKey: ['/locations/cantons'],
        queryFn: getQueryFn({ on401: "throw" }),
        staleTime: 1000 * 60 * 30, // 30 minutes - les cantons changent rarement
      });
    });
  }, []);

  return { prefetchLocations };
}

/**
 * Route prefetch map - maps routes to their lazy import functions
 */
const routeModules: Record<string, () => Promise<unknown>> = {
  '/properties': () => import('@/pages/Properties'),
  '/login': () => import('@/pages/Login'),
  '/register': () => import('@/pages/Register'),
  '/dashboard/student': () => import('@/pages/StudentDashboard'),
  '/dashboard/owner': () => import('@/pages/OwnerDashboard'),
  '/messages': () => import('@/pages/Messages'),
};

// Track prefetched routes to avoid duplicate work
const prefetchedRoutes = new Set<string>();

/**
 * Prefetch a route's JavaScript chunk
 */
export function prefetchRoute(route: string) {
  if (prefetchedRoutes.has(route)) return;
  
  const loader = routeModules[route];
  if (loader) {
    prefetchedRoutes.add(route);
    requestIdleCallback(() => loader());
  }
}

/**
 * Hook pour précharger les routes critiques après le chargement initial
 */
export function usePrefetchCriticalRoutes() {
  const hasPrefetched = useRef(false);

  useEffect(() => {
    if (hasPrefetched.current) return;
    hasPrefetched.current = true;

    // Use Connection API to check network
    const connection = (navigator as any).connection;
    const isSaveData = connection?.saveData;
    const isSlowConnection = connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g';
    
    // Don't prefetch on slow connections or save-data mode
    if (isSaveData || isSlowConnection) return;

    // Prefetch critical routes after initial load
    const prefetchAfterLoad = () => {
      // Wait for main content to be interactive
      requestIdleCallback(() => {
        prefetchRoute('/properties');
        prefetchRoute('/login');
      });

      // Prefetch secondary routes later
      setTimeout(() => {
        requestIdleCallback(() => {
          prefetchRoute('/register');
        });
      }, 3000);

      // Dashboard routes even later
      setTimeout(() => {
        requestIdleCallback(() => {
          prefetchRoute('/dashboard/student');
          prefetchRoute('/dashboard/owner');
        });
      }, 5000);
    };

    if (document.readyState === 'complete') {
      prefetchAfterLoad();
    } else {
      window.addEventListener('load', prefetchAfterLoad);
      return () => window.removeEventListener('load', prefetchAfterLoad);
    }
  }, []);
}

/**
 * Hook pour précharger une route au survol d'un lien
 */
export function useLinkPrefetch(route: string) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onMouseEnter = useCallback(() => {
    // Debounce to avoid prefetching on quick mouse movements
    timeoutRef.current = setTimeout(() => {
      prefetchRoute(route);
    }, 100);
  }, [route]);

  const onMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { onMouseEnter, onMouseLeave };
}

/**
 * Prefetch image for better perceived performance
 */
export function prefetchImage(src: string) {
  if (!src) return;
  
  requestIdleCallback(() => {
    const img = new Image();
    img.src = src;
  });
}

/**
 * Batch prefetch multiple images
 */
export function prefetchImages(srcs: string[]) {
  requestIdleCallback(() => {
    srcs.forEach((src) => {
      if (src) {
        const img = new Image();
        img.src = src;
      }
    });
  });
}
