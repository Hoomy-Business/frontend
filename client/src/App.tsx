import { lazy, Suspense, memo, StrictMode } from "react";
import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// ============================================
// BASE PATH
// ============================================
const basePath = import.meta.env.BASE_URL || '/';

// ============================================
// LAZY LOADED PAGES - Grouped by priority
// ============================================

// Critical path pages (preloaded)
const Landing = lazy(() => import("@/pages/Landing"));
const Login = lazy(() => import("@/pages/Login"));
const Properties = lazy(() => import("@/pages/Properties"));

// Secondary pages
const Register = lazy(() => import("@/pages/Register"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
const PropertyDetail = lazy(() => import("@/pages/PropertyDetail"));

// Dashboard pages
const StudentDashboard = lazy(() => import("@/pages/StudentDashboard"));
const OwnerDashboard = lazy(() => import("@/pages/OwnerDashboard"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));

// Property management
const CreateProperty = lazy(() => import("@/pages/CreateProperty"));
const EditProperty = lazy(() => import("@/pages/EditProperty"));

// Communication & Contracts
const Messages = lazy(() => import("@/pages/Messages"));
const CreateContract = lazy(() => import("@/pages/CreateContract"));
const ContractDetail = lazy(() => import("@/pages/ContractDetail"));

// Static pages
const CGU = lazy(() => import("@/pages/CGU"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const About = lazy(() => import("@/pages/About"));
const NotFound = lazy(() => import("@/pages/not-found"));

// ============================================
// LOADING COMPONENTS
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

// Minimal loader for small sections
const InlineLoader = memo(function InlineLoader() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
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
// ROUTER COMPONENT
// ============================================

const AppRouter = memo(function AppRouter() {
  return (
    <Router base={basePath}>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          {/* Public routes */}
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/verify-email" component={VerifyEmail} />
          
          {/* Properties */}
          <Route path="/properties" component={Properties} />
          <Route path="/properties/create" component={CreateProperty} />
          <Route path="/properties/:id/edit" component={EditProperty} />
          <Route path="/properties/:id" component={PropertyDetail} />
          
          {/* Dashboards */}
          <Route path="/dashboard/student" component={StudentDashboard} />
          <Route path="/dashboard/owner" component={OwnerDashboard} />
          <Route path="/admin/dashboard" component={AdminDashboard} />
          
          {/* Communication */}
          <Route path="/messages" component={Messages} />
          
          {/* Contracts */}
          <Route path="/contracts/create/:propertyId" component={CreateContract} />
          <Route path="/contracts/:id" component={ContractDetail} />
          
          {/* Static pages */}
          <Route path="/cgu" component={CGU} />
          <Route path="/privacy" component={PrivacyPolicy} />
          <Route path="/about" component={About} />
          
          {/* 404 */}
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Router>
  );
});

// ============================================
// MAIN APP COMPONENT
// ============================================

function App() {
  return (
    <StrictMode>
      <ErrorBoundary fallback={ErrorFallback}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider delayDuration={300}>
            <AuthProvider>
              <Toaster />
              <AppRouter />
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>
  );
}

export default App;

// ============================================
// PRELOAD CRITICAL ROUTES
// ============================================

// Preload critical pages after initial render
if (typeof window !== 'undefined') {
  // Use requestIdleCallback for non-blocking preload
  const preloadCriticalRoutes = () => {
    // Preload pages that users are likely to visit
    import("@/pages/Landing");
    import("@/pages/Properties");
  };
  
  if ('requestIdleCallback' in window) {
    requestIdleCallback(preloadCriticalRoutes, { timeout: 2000 });
  } else {
    setTimeout(preloadCriticalRoutes, 1000);
  }
}
