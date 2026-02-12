import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatedBackground, ParticleField } from "@/components/animated-background";
import Landing from "@/pages/landing";
import PaymentPage from "@/pages/payment";
import BookingPage from "@/pages/booking";
import GuidePage from "@/pages/guide";
import AdminPage from "@/pages/admin";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import RefundPage from "@/pages/refund";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/payment/:tier" component={PaymentPage} />
      <Route path="/booking" component={BookingPage} />
      <Route path="/guide" component={GuidePage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/terms-and-conditions" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/refund" component={RefundPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="relative min-h-screen bg-background text-foreground">
          <AnimatedBackground />
          <ParticleField />
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
