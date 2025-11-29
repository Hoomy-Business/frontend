import { Suspense, memo, StrictMode, useEffect } from "react";
import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { 
  routes, 
  NotFoundRoute, 
  preloadCriticalRoutes, 
  preloadHighPriorityRoutes,
  RoutePriority 
} from "@/lib/router";

// ============================================
// BASE PATH
// ============================================
const basePath = import.meta.env.BASE_URL || '/';

// ============================================
// LOADING COMPONENTS - Memoized for stability
// ============================================

const PageLoader = memo(function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4 w-full max-w-md p-8">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
});

// ============================================
// ERROR FALLBACK
// ============================================

function ErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-destructive mb-4">
          Une erreur est survenue
        </h1>
        <p className="text-muted-foreground mb-6">
          {error.message || "Veuillez réessayer plus tard."}
        </p>
        <button
          onClick={resetError}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}

// ============================================
// ROUTER COMPONENT - Priority-based rendering
// ============================================

const AppRouter = memo(function AppRouter() {
  // Preload routes based on priority
  useEffect(() => {
    // Immediate: preload critical routes
    preloadCriticalRoutes();
    
    // After idle: preload high priority routes
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => preloadHighPriorityRoutes(), { timeout: 2000 });
    } else {
      setTimeout(preloadHighPriorityRoutes, 1000);
    }
  }, []);

  return (
    <Router base={basePath}>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          {/* Render routes in priority order for better code organization */}
          {routes
            .sort((a, b) => a.priority - b.priority)
            .map((route) => (
              <Route 
                key={route.path} 
                path={route.path} 
                component={route.component}
              />
            ))}
          
          {/* 404 fallback */}
          <Route component={NotFoundRoute} />
        </Switch>
      </Suspense>
    </Router>
  );
});

// ============================================
// PROVIDERS WRAPPER - Stable structure
// ============================================

const Providers = memo(function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <AuthProvider>
          <Toaster />
          {children}
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
});

// ============================================
// MAIN APP COMPONENT
// ============================================

function App() {
  return (
    <StrictMode>
      <ErrorBoundary fallback={ErrorFallback}>
        <Providers>
          <AppRouter />
        </Providers>
      </ErrorBoundary>
    </StrictMode>
  );
}

export default App;

// ============================================
// PERFORMANCE MONITORING (Dev only)
// ============================================

if (import.meta.env.DEV) {
  // Report slow renders to console
  const reportSlowRenders = () => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 16) { // Longer than 1 frame (60fps)
          console.warn(`🐌 Slow render: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
        }
      }
    });
    
    try {
      observer.observe({ entryTypes: ['measure', 'longtask'] });
    } catch {
      // LongTask API not supported
    }
  };
  
  reportSlowRenders();
}
