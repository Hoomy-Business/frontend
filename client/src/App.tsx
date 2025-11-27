import { lazy, Suspense, memo } from "react";
import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrefetchCriticalRoutes } from "@/hooks/use-prefetch";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Base path for routing
const basePath = import.meta.env.BASE_URL || '/';

// Fallback component for lazy loading errors
const LazyLoadError = memo(() => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="text-center max-w-md">
      <h1 className="text-xl font-semibold text-destructive mb-4">Erreur de chargement</h1>
      <p className="text-muted-foreground mb-6">Une erreur s'est produite lors du chargement de la page.</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
      >
        Recharger la page
      </button>
    </div>
  </div>
));
LazyLoadError.displayName = 'LazyLoadError';

// Lazy load all page components for code splitting with error handling
const lazyWithErrorBoundary = (importFn: () => Promise<any>) => {
  return lazy(() =>
    importFn().catch((error) => {
      console.error('Failed to load component:', error);
      // Return a fallback component
      return { default: LazyLoadError };
    })
  );
};

const Landing = lazyWithErrorBoundary(() => import("@/pages/Landing"));
const Login = lazyWithErrorBoundary(() => import("@/pages/Login"));
const Register = lazyWithErrorBoundary(() => import("@/pages/Register"));
const VerifyEmail = lazyWithErrorBoundary(() => import("@/pages/VerifyEmail"));
const Properties = lazyWithErrorBoundary(() => import("@/pages/Properties"));
const PropertyDetail = lazyWithErrorBoundary(() => import("@/pages/PropertyDetail"));
const StudentDashboard = lazyWithErrorBoundary(() => import("@/pages/StudentDashboard"));
const OwnerDashboard = lazyWithErrorBoundary(() => import("@/pages/OwnerDashboard"));
const CreateProperty = lazyWithErrorBoundary(() => import("@/pages/CreateProperty"));
const EditProperty = lazyWithErrorBoundary(() => import("@/pages/EditProperty"));
const Messages = lazyWithErrorBoundary(() => import("@/pages/Messages"));
const CreateContract = lazyWithErrorBoundary(() => import("@/pages/CreateContract"));
const ContractDetail = lazyWithErrorBoundary(() => import("@/pages/ContractDetail"));
const AdminDashboard = lazyWithErrorBoundary(() => import("@/pages/AdminDashboard"));
const CGU = lazyWithErrorBoundary(() => import("@/pages/CGU"));
const PrivacyPolicy = lazyWithErrorBoundary(() => import("@/pages/PrivacyPolicy"));
const About = lazyWithErrorBoundary(() => import("@/pages/About"));
const NotFound = lazyWithErrorBoundary(() => import("@/pages/not-found"));

// Loading fallback component - memoized to prevent re-renders
const PageLoader = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="space-y-4 w-full max-w-md p-8" role="status" aria-label="Loading page">
      <Skeleton className="h-10 w-3/4 skeleton-animated" />
      <Skeleton className="h-64 w-full skeleton-animated" />
      <Skeleton className="h-24 w-full skeleton-animated" />
    </div>
  </div>
));
PageLoader.displayName = 'PageLoader';

// Error boundary wrapper for routes
const RouteErrorBoundary = memo(({ children }: { children: React.ReactNode }) => {
  return <ErrorBoundary>{children}</ErrorBoundary>;
});
RouteErrorBoundary.displayName = 'RouteErrorBoundary';

function AppRouter() {
  // Prefetch critical routes after initial load
  usePrefetchCriticalRoutes();

  return (
    <Router base={basePath}>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/verify-email" component={VerifyEmail} />
          <Route path="/properties" component={Properties} />
          <Route path="/properties/create" component={CreateProperty} />
          <Route path="/properties/:id/edit" component={EditProperty} />
          <Route path="/properties/:id" component={PropertyDetail} />
          <Route path="/dashboard/student" component={StudentDashboard} />
          <Route path="/dashboard/owner" component={OwnerDashboard} />
          <Route path="/messages" component={Messages} />
          <Route path="/contracts/create/:propertyId" component={CreateContract} />
          <Route path="/contracts/:id" component={ContractDetail} />
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/cgu" component={CGU} />
          <Route path="/privacy" component={PrivacyPolicy} />
          <Route path="/about" component={About} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <AppRouter />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
