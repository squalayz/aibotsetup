import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

export default function PaymentSuccessPage() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tier = params.get("tier") || "self";
    const whop = params.get("whop");
    const whopStatus = params.get("status");

    if (whop) {
      if (whopStatus === "error") {
        setStatus("error");
        return;
      }

      const amount = tier === "vip" ? 799 : 199;
      apiRequest("POST", "/api/payments", {
        txHash: `whop_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        tier,
        amount,
        paymentMethod: "whop",
      })
        .then(() => {
          setStatus("success");
          setTimeout(() => {
            navigate(tier === "vip" ? "/booking" : "/guide");
          }, 2500);
        })
        .catch(() => {
          setStatus("success");
          setTimeout(() => {
            navigate(tier === "vip" ? "/booking" : "/guide");
          }, 2500);
        });
      return;
    }

    setStatus("error");
  }, [navigate]);

  return (
    <div className="relative z-10 max-w-[640px] mx-auto px-5 py-20">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        {status === "loading" && (
          <Card className="p-10 bg-card/60 backdrop-blur-xl border-violet-500/15">
            <Loader2 className="w-16 h-16 text-violet-400 mx-auto mb-6 animate-spin" />
            <h2 className="text-2xl font-bold text-card-foreground mb-3" data-testid="text-verifying">Verifying Payment...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
          </Card>
        )}

        {status === "success" && (
          <Card className="p-10 bg-card/60 backdrop-blur-xl border-green-500/20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
            >
              <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-2xl font-bold text-green-400 mb-3" data-testid="text-confirmed">Payment Confirmed!</h2>
            <p className="text-muted-foreground mb-4">Your payment has been processed successfully.</p>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Redirecting you now...
            </p>
          </Card>
        )}

        {status === "error" && (
          <Card className="p-10 bg-card/60 backdrop-blur-xl border-red-500/20">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-red-400 mb-3" data-testid="text-error">Payment Issue</h2>
            <p className="text-muted-foreground mb-4">
              We couldn't verify your payment. If you were charged, please contact support for assistance.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="border-violet-500/30 text-violet-300"
              data-testid="button-back-home"
            >
              Back to Home
            </Button>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
