import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

// ============================================
// ROUTE PRIORITY SYSTEM
// ============================================
// Based on user journey analytics and page importance

export enum RoutePriority {
  CRITICAL = 0,  // Load immediately (Landing, Login)
  HIGH = 1,      // Preload on idle (Dashboard, Properties)
  MEDIUM = 2,    // Lazy load on navigation
  LOW = 3,       // Lazy load on demand (Admin, Legal)
}

// ============================================
// ROUTE DEFINITIONS
// ============================================

interface RouteConfig {
  path: string;
  priority: RoutePriority;
  component: LazyExoticComponent<ComponentType<unknown>>;
  preloadOn?: 'hover' | 'focus' | 'visible' | 'idle';
  prefetchData?: string[]; // Query keys to prefetch
}

// Lazy loaders with retry mechanism for better reliability
const createLazyComponent = (
  importFn: () => Promise<{ default: ComponentType<unknown> }>,
  chunkName: string
) => {
  return lazy(async () => {
    let lastError: Error | null = null;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const module = await importFn();
        return module;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Log error with attempt number
        if (import.meta.env.DEV) {
          console.warn(`Failed to load chunk: ${chunkName} (attempt ${attempt}/${maxRetries})`, error);
        }
        
        // If it's the last attempt, throw the error
        if (attempt === maxRetries) {
          // Try to reload the page if it's a network error
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            console.error(`Failed to load chunk after ${maxRetries} attempts. This might be a network issue.`, error);
          }
          throw lastError;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    // This should never be reached, but TypeScript needs it
    throw lastError || new Error(`Failed to load chunk: ${chunkName}`);
  });
};

// ============================================
// ROUTE REGISTRY
// ============================================

export const routes: RouteConfig[] = [
  // === CRITICAL (Tier 0) - Loaded immediately ===
  {
    path: '/',
    priority: RoutePriority.CRITICAL,
    component: createLazyComponent(() => import('@/pages/Landing'), 'Landing'),
    preloadOn: 'idle',
  },
  {
    path: '/login',
    priority: RoutePriority.CRITICAL,
    component: createLazyComponent(() => import('@/pages/Login'), 'Login'),
    preloadOn: 'idle',
  },
  {
    path: '/properties',
    priority: RoutePriority.CRITICAL,
    component: createLazyComponent(() => import('@/pages/Properties'), 'Properties'),
    preloadOn: 'idle',
    prefetchData: ['/properties', '/locations/cantons'],
  },
  
  // === HIGH PRIORITY (Tier 1) - Preloaded on idle ===
  {
    path: '/register',
    priority: RoutePriority.HIGH,
    component: createLazyComponent(() => import('@/pages/Register'), 'Register'),
    preloadOn: 'hover',
  },
  {
    path: '/verify-email',
    priority: RoutePriority.HIGH,
    component: createLazyComponent(() => import('@/pages/VerifyEmail'), 'VerifyEmail'),
  },
  {
    path: '/properties/create',
    priority: RoutePriority.HIGH,
    component: createLazyComponent(() => import('@/pages/CreateProperty'), 'CreateProperty'),
    preloadOn: 'hover',
  },
  {
    path: '/properties/:id',
    priority: RoutePriority.HIGH,
    component: createLazyComponent(() => import('@/pages/PropertyDetail'), 'PropertyDetail'),
    preloadOn: 'hover',
  },
  {
    path: '/dashboard/student',
    priority: RoutePriority.HIGH,
    component: createLazyComponent(() => import('@/pages/StudentDashboard'), 'StudentDashboard'),
    preloadOn: 'idle',
    prefetchData: ['/requests/sent', '/contracts/my-contracts'],
  },
  {
    path: '/dashboard/owner',
    priority: RoutePriority.HIGH,
    component: createLazyComponent(() => import('@/pages/OwnerDashboard'), 'OwnerDashboard'),
    preloadOn: 'idle',
    prefetchData: ['/properties/my-properties', '/requests/received'],
  },
  
  // === MEDIUM PRIORITY (Tier 2) - Lazy loaded ===
  {
    path: '/properties/:id/edit',
    priority: RoutePriority.MEDIUM,
    component: createLazyComponent(() => import('@/pages/EditProperty'), 'EditProperty'),
    preloadOn: 'hover',
  },
  {
    path: '/messages',
    priority: RoutePriority.HIGH, // Augmenté à HIGH pour précharger plus tôt
    component: createLazyComponent(() => import('@/pages/Messages'), 'Messages'),
    preloadOn: 'idle', // Précharger dès que possible
    prefetchData: ['/conversations'],
  },
  {
    path: '/contracts/create/:propertyId',
    priority: RoutePriority.MEDIUM,
    component: createLazyComponent(() => import('@/pages/CreateContract'), 'CreateContract'),
  },
  {
    path: '/contracts/:id',
    priority: RoutePriority.MEDIUM,
    component: createLazyComponent(() => import('@/pages/ContractDetail'), 'ContractDetail'),
  },
  
  // === LOW PRIORITY (Tier 3) - Loaded on demand only ===
  {
    path: '/admin/dashboard',
    priority: RoutePriority.LOW,
    component: createLazyComponent(() => import('@/pages/AdminDashboard'), 'AdminDashboard'),
  },
  {
    path: '/cgu',
    priority: RoutePriority.LOW,
    component: createLazyComponent(() => import('@/pages/CGU'), 'CGU'),
  },
  {
    path: '/privacy',
    priority: RoutePriority.LOW,
    component: createLazyComponent(() => import('@/pages/PrivacyPolicy'), 'PrivacyPolicy'),
  },
  {
    path: '/about',
    priority: RoutePriority.LOW,
    component: createLazyComponent(() => import('@/pages/About'), 'About'),
  },
];

// 404 route (always lazy)
export const NotFoundRoute = createLazyComponent(
  () => import('@/pages/not-found'),
  'NotFound'
);

// ============================================
// PRELOADING SYSTEM
// ============================================

const preloadedRoutes = new Set<string>();

export function preloadRoute(path: string): void {
  if (preloadedRoutes.has(path)) return;
  
  const route = routes.find(r => r.path === path);
  if (route) {
    // Trigger lazy load by accessing the component
    // This works because lazy() returns a thenable that loads on first access
    void Promise.resolve(route.component).catch(() => {});
    preloadedRoutes.add(path);
  }
}

export function preloadCriticalRoutes(): void {
  routes
    .filter(r => r.priority === RoutePriority.CRITICAL)
    .forEach(r => preloadRoute(r.path));
}

export function preloadHighPriorityRoutes(): void {
  routes
    .filter(r => r.priority <= RoutePriority.HIGH)
    .forEach(r => preloadRoute(r.path));
}

// ============================================
// ROUTE MATCHING UTILITIES
// ============================================

export function matchRoute(pathname: string): RouteConfig | undefined {
  return routes.find(route => {
    // Exact match
    if (route.path === pathname) return true;
    
    // Dynamic segments (e.g., /properties/:id)
    const routeParts = route.path.split('/');
    const pathParts = pathname.split('/');
    
    if (routeParts.length !== pathParts.length) return false;
    
    return routeParts.every((part, i) => 
      part.startsWith(':') || part === pathParts[i]
    );
  });
}

export function getRoutesByPriority(priority: RoutePriority): RouteConfig[] {
  return routes.filter(r => r.priority === priority);
}

// ============================================
// LINK PRELOADING HOOK
// ============================================

export function createPreloadHandlers(path: string) {
  const route = matchRoute(path);
  if (!route || route.preloadOn !== 'hover') {
    return {};
  }
  
  return {
    onMouseEnter: () => preloadRoute(path),
    onFocus: () => preloadRoute(path),
  };
}

