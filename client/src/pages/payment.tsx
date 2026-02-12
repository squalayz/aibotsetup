import { useState, useCallback, useEffect, useRef } from "react";
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
  Wallet, AlertCircle, Shield, Zap, Clock, CreditCard, MessageCircle,
} from "lucide-react";

const WALLET = "0x00468c1B22451ed9Fabc9DA32E6aEa28DC03a216";

type PaymentMethod = "choose" | "wallet" | "manual";
type PaymentStatus = "idle" | "connecting" | "sending" | "confirming" | "polling" | "success" | "error";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      isMetaMask?: boolean;
    };
  }
}

export default function PaymentPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/payment/:tier");
  const tier = params?.tier === "vip" ? "vip" : "self";
  const amount = tier === "vip" ? 799 : 199;

  const [method, setMethod] = useState<PaymentMethod>("choose");
  const [txHash, setTxHash] = useState("");
  const [copied, setCopied] = useState(false);
  const [walletStatus, setWalletStatus] = useState<PaymentStatus>("idle");
  const [walletAddress, setWalletAddress] = useState("");
  const [capturedTxHash, setCapturedTxHash] = useState("");
  const [verified, setVerified] = useState(false);
  const [pollMessage, setPollMessage] = useState("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const copyAddress = () => {
    navigator.clipboard.writeText(WALLET).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const startPolling = useCallback((paymentId: string, savedTxHash: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    let attempts = 0;
    const maxAttempts = 60;

    pollingRef.current = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setPollMessage("Verification timed out. Your payment may still be processing on-chain. Please check back later or contact support.");
        return;
      }

      try {
        const res = await fetch(`/api/payments/${paymentId}/status`, { credentials: "include" });
        const data = await res.json();

        if (data.verified) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setVerified(true);
          setCapturedTxHash(savedTxHash);
          toast({ title: "Payment Confirmed!", description: "Transaction verified on the Ethereum blockchain." });
          setTimeout(() => {
            navigate(tier === "vip" ? "/booking" : "/guide");
          }, 2500);
        } else if (data.chainStatus === "pending") {
          setPollMessage("Transaction found on chain, waiting for confirmation...");
        } else if (data.chainStatus === "not_found") {
          setPollMessage("Searching for transaction on the Ethereum network...");
        } else if (data.chainStatus === "failed") {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setPollMessage(data.chainDetails || "Transaction failed on chain.");
          setWalletStatus("error");
        }
      } catch {
        setPollMessage("Checking blockchain status...");
      }
    }, 5000);
  }, [tier, navigate, toast]);

  const recordPayment = useMutation({
    mutationFn: async (data: { txHash: string }) => {
      const res = await apiRequest("POST", "/api/payments", {
        txHash: data.txHash,
        tier,
        amount,
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.verified) {
        setVerified(true);
        setCapturedTxHash(data.txHash);
        toast({ title: "Payment Verified!", description: "Redirecting you now..." });
        setTimeout(() => {
          navigate(tier === "vip" ? "/booking" : "/guide");
        }, 2500);
      } else {
        setWalletStatus("polling");
        setPollMessage("Payment recorded. Verifying on the Ethereum blockchain...");
        startPolling(data.id, data.txHash);
      }
    },
    onError: (err: Error) => {
      setWalletStatus("error");
      toast({ title: "Payment Error", description: err.message, variant: "destructive" });
    },
  });

  const connectAndPay = useCallback(async () => {
    if (!window.ethereum) {
      toast({
        title: "Wallet Not Found",
        description: "Please install MetaMask or another Web3 wallet to pay directly.",
        variant: "destructive",
      });
      return;
    }

    try {
      setWalletStatus("connecting");

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      setWalletAddress(accounts[0]);
      setWalletStatus("sending");

      let ethPrice = 2500;
      try {
        const ethPriceRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
        const ethPriceData = await ethPriceRes.json();
        if (ethPriceData?.ethereum?.usd) {
          ethPrice = ethPriceData.ethereum.usd;
        }
      } catch {
        // fallback price used
      }

      const ethAmount = amount / ethPrice;
      const weiAmount = BigInt(Math.floor(ethAmount * 1e18));
      const valueInWei = "0x" + weiAmount.toString(16);

      const txHashResult = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: accounts[0],
            to: WALLET,
            value: valueInWei,
          },
        ],
      }) as string;

      setCapturedTxHash(txHashResult);
      setWalletStatus("confirming");

      recordPayment.mutate({ txHash: txHashResult });
    } catch (err: unknown) {
      setWalletStatus("error");
      const error = err as { code?: number; message?: string };
      if (error.code === 4001) {
        toast({ title: "Transaction Cancelled", description: "You rejected the transaction.", variant: "destructive" });
      } else {
        toast({ title: "Transaction Failed", description: error.message || "Something went wrong.", variant: "destructive" });
      }
    }
  }, [amount, toast, recordPayment]);

  const hasWallet = typeof window !== "undefined" && !!window.ethereum;

  return (
    <div className="relative z-10 max-w-[640px] mx-auto px-5 py-8">
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => method === "choose" ? navigate("/") : setMethod("choose")}
          className="mb-6 text-violet-400"
          data-testid="button-back-payment"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent mb-3">
          Crypto Payment
        </h1>
        <p className="text-muted-foreground">
          {tier === "vip" ? "1-on-1 VIP Setup" : "Self-Setup Access"} &mdash; ${amount}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {verified ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <Card className="p-10 bg-card/60 backdrop-blur-xl border-green-500/20">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 12 }}
              >
                <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
              </motion.div>
              <h2 className="text-2xl font-bold text-green-400 mb-3">Payment Confirmed!</h2>
              <p className="text-muted-foreground mb-4">Your transaction has been verified on the Ethereum blockchain.</p>
              {capturedTxHash && (
                <div className="bg-background/60 rounded-md p-3 border border-green-500/15 mb-6">
                  <Label className="text-xs text-green-400 uppercase tracking-widest mb-1 block">Transaction Hash</Label>
                  <code className="text-xs font-mono text-green-300/80 break-all" data-testid="text-confirmed-tx">{capturedTxHash}</code>
                </div>
              )}
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Redirecting to {tier === "vip" ? "booking" : "setup guide"}...
              </p>
            </Card>
          </motion.div>
        ) : method === "choose" ? (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <Card className="p-8 bg-card/60 backdrop-blur-xl border-violet-500/10 text-center mb-6">
              <Badge variant="outline" className={`mb-4 ${tier === "vip" ? "border-violet-500/30 text-violet-400 bg-violet-500/5" : "border-cyan-500/30 text-cyan-400 bg-cyan-500/5"}`}>
                {tier === "vip" ? "1-on-1 VIP Setup" : "Self-Setup Access"}
              </Badge>
              <div className="text-5xl font-serif font-bold bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent my-3">
                ${amount}
              </div>
              <p className="text-sm text-muted-foreground">
                Choose your preferred payment method below
              </p>
            </Card>

            <Card
              className="p-5 bg-card/60 backdrop-blur-xl border-green-500/10 mb-2"
              data-testid="card-moonpay-tip"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-green-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-card-foreground">
                    Don't have ETH?{" "}
                    <a
                      href="https://www.moonpay.com/buy/eth"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 underline underline-offset-2"
                      data-testid="link-moonpay"
                    >
                      Buy ETH with a card on MoonPay
                    </a>
                    , then come back and pay below.
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className="p-6 bg-card/60 backdrop-blur-xl border-cyan-500/10 hover-elevate cursor-pointer"
              onClick={() => setMethod("manual")}
              data-testid="card-manual-pay"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <Copy className="w-7 h-7 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-card-foreground">Send ETH & Paste TX Hash</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Works from any wallet or exchange (Coinbase, Trust Wallet, etc). Send ETH, then paste your transaction hash.
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-cyan-400 shrink-0" />
              </div>
            </Card>

            {hasWallet ? (
              <Card
                className="p-6 bg-card/60 backdrop-blur-xl border-violet-500/10 hover-elevate cursor-pointer"
                onClick={() => setMethod("wallet")}
                data-testid="card-wallet-pay"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-md bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                    <Zap className="w-7 h-7 text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-card-foreground mb-1">Pay with MetaMask</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect your wallet and pay with ETH directly. Automatic on-chain tracking.
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-violet-400 shrink-0" />
                </div>
              </Card>
            ) : (
              <Card
                className="p-5 bg-card/40 backdrop-blur-xl border-violet-500/5 opacity-60"
                data-testid="card-wallet-unavailable"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-md bg-violet-500/5 border border-violet-500/10 flex items-center justify-center shrink-0">
                    <Wallet className="w-7 h-7 text-violet-400/50" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-card-foreground/60 mb-1">Direct Wallet Pay</h3>
                    <p className="text-xs text-muted-foreground">
                      Requires MetaMask browser extension (desktop) or MetaMask in-app browser (mobile). Use the option above instead.
                    </p>
                  </div>
                </div>
              </Card>
            )}


          </motion.div>
        ) : method === "wallet" ? (
          <motion.div
            key="wallet"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="p-8 bg-card/60 backdrop-blur-xl border-violet-500/10">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-md bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-8 h-8 text-violet-400" />
                </div>
                <h2 className="text-xl font-bold text-card-foreground mb-2">Direct Wallet Payment</h2>
                <p className="text-sm text-muted-foreground">
                  Click below to connect your wallet and send ${amount} in ETH automatically.
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-7 h-7 rounded-full bg-violet-500/15 text-violet-400 text-xs font-bold flex items-center justify-center shrink-0">1</div>
                  <span className="text-card-foreground">MetaMask will ask to connect your wallet</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-7 h-7 rounded-full bg-violet-500/15 text-violet-400 text-xs font-bold flex items-center justify-center shrink-0">2</div>
                  <span className="text-card-foreground">Confirm the ${amount} ETH transaction</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-7 h-7 rounded-full bg-violet-500/15 text-violet-400 text-xs font-bold flex items-center justify-center shrink-0">3</div>
                  <span className="text-card-foreground">Payment is verified automatically on-chain</span>
                </div>
              </div>

              {(walletStatus !== "idle") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-6"
                >
                  <div className={`rounded-md p-4 border ${
                    walletStatus === "success" ? "bg-green-500/10 border-green-500/20" :
                    walletStatus === "error" ? "bg-red-500/10 border-red-500/20" :
                    walletStatus === "polling" ? "bg-cyan-500/10 border-cyan-500/20" :
                    "bg-violet-500/5 border-violet-500/15"
                  }`}>
                    <div className="flex items-center gap-3">
                      {walletStatus === "error" ? (
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                      ) : walletStatus === "polling" ? (
                        <Clock className="w-5 h-5 text-cyan-400 shrink-0 animate-pulse" />
                      ) : (
                        <Loader2 className="w-5 h-5 animate-spin text-violet-400 shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          walletStatus === "connecting" ? "text-amber-400" :
                          walletStatus === "sending" ? "text-amber-400" :
                          walletStatus === "confirming" ? "text-cyan-400" :
                          walletStatus === "polling" ? "text-cyan-400" :
                          walletStatus === "error" ? "text-red-400" :
                          "text-violet-400"
                        }`}>
                          {walletStatus === "connecting" && "Connecting to your wallet..."}
                          {walletStatus === "sending" && "Waiting for you to confirm in wallet..."}
                          {walletStatus === "confirming" && "Transaction sent! Recording payment..."}
                          {walletStatus === "polling" && (pollMessage || "Verifying on-chain...")}
                          {walletStatus === "error" && (pollMessage || "Transaction failed. Try again.")}
                        </p>
                        {walletAddress && (
                          <p className="text-xs text-muted-foreground mt-1 font-mono">
                            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                          </p>
                        )}
                      </div>
                    </div>
                    {capturedTxHash && (
                      <div className="mt-3 pt-3 border-t border-violet-500/10">
                        <Label className="text-xs text-violet-400 uppercase tracking-widest mb-1 block">Transaction Hash</Label>
                        <code className="text-xs font-mono text-cyan-300/80 break-all" data-testid="text-auto-tx-hash">{capturedTxHash}</code>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              <div className="flex items-center gap-3 bg-background/40 rounded-md p-3 mb-6 border border-violet-500/10">
                <Shield className="w-4 h-4 text-green-400 shrink-0" />
                <span className="text-xs text-muted-foreground">
                  Secure &mdash; we never access your private keys. The transaction is signed locally in your wallet.
                </span>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 border-violet-500/50 text-white shadow-lg shadow-violet-500/20"
                onClick={connectAndPay}
                disabled={walletStatus === "connecting" || walletStatus === "sending" || walletStatus === "confirming" || walletStatus === "polling"}
                data-testid="button-connect-wallet"
              >
                {walletStatus === "idle" || walletStatus === "error" ? (
                  <><Wallet className="w-4 h-4 mr-2" /> Connect Wallet & Pay ${amount}</>
                ) : (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                )}
              </Button>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="manual"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="p-8 bg-card/60 backdrop-blur-xl border-violet-500/10">
              <div className="text-center mb-6">
                <Badge variant="outline" className={`mb-4 ${tier === "vip" ? "border-violet-500/30 text-violet-400 bg-violet-500/5" : "border-cyan-500/30 text-cyan-400 bg-cyan-500/5"}`}>
                  {tier === "vip" ? "1-on-1 VIP Setup" : "Self-Setup Access"}
                </Badge>
                <div className="text-4xl font-serif font-bold bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent my-3">
                  ${amount}
                </div>
              </div>

              <div className="bg-background/60 rounded-md p-4 border border-violet-500/15 mb-6">
                <Label className="text-xs text-violet-400 uppercase tracking-widest mb-2 block">Send ETH To</Label>
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
                {[
                  "Open your crypto wallet or exchange",
                  `Send exactly $${amount} worth of ETH (ERC-20)`,
                  "Wait for the transaction to confirm on Ethereum",
                  "Copy and paste the transaction hash below",
                ].map((step, i) => (
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

              <AnimatePresence mode="wait">
                {walletStatus === "polling" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-cyan-500/10 border border-cyan-500/20 rounded-md p-4 mb-4 text-center"
                  >
                    <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-2 animate-pulse" />
                    <span className="text-cyan-400 text-sm">{pollMessage || "Verifying on the Ethereum blockchain..."}</span>
                  </motion.div>
                )}
                {recordPayment.isPending && walletStatus !== "polling" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-amber-500/10 border border-amber-500/30 rounded-md p-4 mb-4 text-center"
                  >
                    <Loader2 className="w-5 h-5 text-amber-400 mx-auto mb-2 animate-spin" />
                    <span className="text-amber-400 text-sm">Submitting for on-chain verification...</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 border-violet-500/50 text-white shadow-lg shadow-violet-500/20"
                onClick={() => recordPayment.mutate({ txHash: txHash.trim() })}
                disabled={!txHash.trim() || recordPayment.isPending || verified || walletStatus === "polling"}
                data-testid="button-verify-payment"
              >
                {recordPayment.isPending || walletStatus === "polling" ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</>
                ) : (
                  <>Verify Payment <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
