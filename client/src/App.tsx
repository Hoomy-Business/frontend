import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import VerifyEmail from "@/pages/VerifyEmail";
import Properties from "@/pages/Properties";
import PropertyDetail from "@/pages/PropertyDetail";
import StudentDashboard from "@/pages/StudentDashboard";
import OwnerDashboard from "@/pages/OwnerDashboard";
import CreateProperty from "@/pages/CreateProperty";
import Messages from "@/pages/Messages";
import CreateContract from "@/pages/CreateContract";
import ContractDetail from "@/pages/ContractDetail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/properties" component={Properties} />
      <Route path="/properties/:id" component={PropertyDetail} />
      <Route path="/properties/create" component={CreateProperty} />
      <Route path="/dashboard/student" component={StudentDashboard} />
      <Route path="/dashboard/owner" component={OwnerDashboard} />
      <Route path="/messages" component={Messages} />
      <Route path="/contracts/create/:propertyId" component={CreateContract} />
      <Route path="/contracts/:id" component={ContractDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
