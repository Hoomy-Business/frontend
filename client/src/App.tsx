import { lazy, Suspense } from "react";
import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";

// Base path for routing
const basePath = import.meta.env.BASE_URL || '/';

// Lazy load all page components for code splitting
const Landing = lazy(() => import("@/pages/Landing"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
const Properties = lazy(() => import("@/pages/Properties"));
const PropertyDetail = lazy(() => import("@/pages/PropertyDetail"));
const StudentDashboard = lazy(() => import("@/pages/StudentDashboard"));
const OwnerDashboard = lazy(() => import("@/pages/OwnerDashboard"));
const CreateProperty = lazy(() => import("@/pages/CreateProperty"));
const EditProperty = lazy(() => import("@/pages/EditProperty"));
const Messages = lazy(() => import("@/pages/Messages"));
const CreateContract = lazy(() => import("@/pages/CreateContract"));
const ContractDetail = lazy(() => import("@/pages/ContractDetail"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md p-8">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  </div>
);

function AppRouter() {
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
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <AppRouter />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
