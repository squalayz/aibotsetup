import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Copy, CheckCircle, Loader2, ArrowRight,
  Wallet, AlertCircle,
} from "lucide-react";
import { SiEthereum } from "react-icons/si";

const WALLET = "0x00468c1B22451ed9Fabc9DA32E6aEa28DC03a216";

export default function PaymentPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/payment/:tier");
  const tier = params?.tier === "vip" ? "vip" : "self";
  const amount = tier === "vip" ? 799 : 199;

  const [txHash, setTxHash] = useState("");
  const [copied, setCopied] = useState(false);
  const [verified, setVerified] = useState(false);
  const { toast } = useToast();

  const copyAddress = () => {
    navigator.clipboard.writeText(WALLET).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/payments", {
        txHash: txHash.trim(),
        tier,
        amount,
        verified: true,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setVerified(true);
      toast({ title: "Payment Verified!", description: "Redirecting you now..." });
      setTimeout(() => {
        if (tier === "vip") {
          navigate("/booking");
        } else {
          navigate("/guide");
        }
      }, 1800);
    },
    onError: (err: Error) => {
      toast({ title: "Verification Error", description: err.message, variant: "destructive" });
    },
  });

  const steps = [
    "Open your crypto wallet (MetaMask, Coinbase, etc.)",
    `Send exactly $${amount} worth of ETH or USDT (ERC-20)`,
    "Copy the transaction hash after sending",
    "Paste it below to verify your payment",
  ];

  return (
    <div className="relative z-10 max-w-[600px] mx-auto px-5 py-8">
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-6 text-violet-400" data-testid="button-back-payment">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent mb-3">
          Crypto Payment
        </h1>
        <p className="text-muted-foreground">
          Send ${amount} in ETH or USDT (ERC-20) to the wallet below
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="p-8 bg-card/60 backdrop-blur-xl border-violet-500/10">
          <div className="text-center mb-8">
            <Badge variant="outline" className={`mb-4 ${tier === "vip" ? "border-violet-500/30 text-violet-400 bg-violet-500/5" : "border-cyan-500/30 text-cyan-400 bg-cyan-500/5"}`}>
              {tier === "vip" ? "1-on-1 VIP Setup" : "Self-Setup Access"}
            </Badge>
            <div className="text-5xl font-serif font-bold bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent my-3">
              ${amount}
            </div>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <SiEthereum className="w-4 h-4" /> ETH or USDT on Ethereum network
            </p>
          </div>

          <div className="bg-background/60 rounded-md p-4 border border-violet-500/15 mb-6">
            <Label className="text-xs text-violet-400 uppercase tracking-widest mb-2 block">Send To</Label>
            <div className="flex items-center gap-3">
              <code className="flex-1 text-cyan-300 text-xs font-mono break-all leading-relaxed" data-testid="text-wallet-address">{WALLET}</code>
              <Button
                variant="outline"
                size="sm"
                onClick={copyAddress}
                className={copied ? "border-green-500/40 text-green-400" : "border-violet-500/30 text-violet-300"}
                data-testid="button-copy-wallet"
              >
                {copied ? <><CheckCircle className="w-3.5 h-3.5 mr-1" /> Copied</> : <><Copy className="w-3.5 h-3.5 mr-1" /> Copy</>}
              </Button>
            </div>
          </div>

          <div className="mb-6 space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-violet-500/15 text-violet-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-card-foreground leading-relaxed">{step}</span>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <Label className="text-xs text-violet-400 uppercase tracking-widest mb-2 block">Transaction Hash</Label>
            <Input
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="0x..."
              className="bg-background/60 border-violet-500/15 text-foreground font-mono text-sm"
              data-testid="input-tx-hash"
            />
          </div>

          <div className="bg-violet-500/5 border border-dashed border-violet-500/20 rounded-md p-3 mb-5 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-violet-400 shrink-0" />
            <span className="text-xs text-violet-300">
              Demo mode: type <code className="bg-background/60 px-2 py-0.5 rounded text-cyan-300">DEMO2026</code> to preview
            </span>
          </div>

          <AnimatePresence mode="wait">
            {verified && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/10 border border-green-500/30 rounded-md p-4 mb-4 text-center"
              >
                <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-2" />
                <span className="text-green-400 text-sm font-medium">Payment Verified! Redirecting...</span>
              </motion.div>
            )}
            {verifyMutation.isPending && !verified && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-amber-500/10 border border-amber-500/30 rounded-md p-4 mb-4 text-center"
              >
                <Loader2 className="w-5 h-5 text-amber-400 mx-auto mb-2 animate-spin" />
                <span className="text-amber-400 text-sm">Verifying transaction...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 border-violet-500/50 text-white shadow-lg shadow-violet-500/20"
            onClick={() => verifyMutation.mutate()}
            disabled={!txHash.trim() || verifyMutation.isPending || verified}
            data-testid="button-verify-payment"
          >
            {verifyMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</>
            ) : (
              <>Verify Payment <ArrowRight className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
