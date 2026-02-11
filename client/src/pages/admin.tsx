import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Booking, Payment } from "@shared/schema";
import {
  ArrowLeft, Lock, CalendarCheck, Wallet, DollarSign,
  Loader2, Trash2, Clock, User, Mail,
} from "lucide-react";

function formatHour(h: number) {
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hr}:00 ${ampm}`;
}

export default function AdminPage() {
  const [, navigate] = useLocation();
  const [pin, setPin] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState(false);
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/login", { pin });
      return res.json();
    },
    onSuccess: () => {
      setAuthed(true);
      setAuthError(false);
    },
    onError: () => {
      setAuthError(true);
    },
  });

  const { data: bookings = [], isLoading: loadingBookings } = useQuery<Booking[]>({
    queryKey: ["/api/admin/bookings"],
    queryFn: getQueryFn<Booking[]>({ on401: "returnNull" }),
    enabled: authed,
  });

  const { data: payments = [], isLoading: loadingPayments } = useQuery<Payment[]>({
    queryKey: ["/api/admin/payments"],
    queryFn: getQueryFn<Payment[]>({ on401: "returnNull" }),
    enabled: authed,
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/bookings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      toast({ title: "Booking cancelled" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  if (!authed) {
    return (
      <div className="relative z-10 max-w-[400px] mx-auto px-5 py-16 text-center">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-6 text-violet-400" data-testid="button-back-admin-login">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-8 bg-card/60 backdrop-blur-xl border-violet-500/10">
            <Lock className="w-10 h-10 text-violet-400 mx-auto mb-4" />
            <h2 className="font-serif text-xl font-bold text-foreground mb-6">Admin Access</h2>
            <div className="mb-4">
              <Label className="text-xs text-violet-400 uppercase tracking-widest mb-2 block">PIN Code</Label>
              <Input
                value={pin}
                onChange={(e) => { setPin(e.target.value); setAuthError(false); }}
                type="password"
                placeholder="Enter PIN"
                className="bg-background/60 border-violet-500/15 text-center text-lg tracking-widest"
                data-testid="input-admin-pin"
                onKeyDown={(e) => e.key === "Enter" && loginMutation.mutate()}
              />
              {authError && <p className="text-destructive text-xs mt-2">Incorrect PIN</p>}
            </div>
            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 border-violet-500/50 text-white"
              onClick={() => loginMutation.mutate()}
              disabled={loginMutation.isPending}
              data-testid="button-admin-login"
            >
              {loginMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Login"}
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative z-10 max-w-[1000px] mx-auto px-5 py-8">
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-6 text-violet-400" data-testid="button-back-admin">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Bookings", value: bookings.length, icon: CalendarCheck, color: "text-violet-400" },
          { label: "Payments", value: payments.length, icon: Wallet, color: "text-cyan-400" },
          { label: "Revenue", value: `$${totalRevenue}`, icon: DollarSign, color: "text-green-400" },
        ].map((s) => (
          <Card key={s.label} className="p-5 bg-card/60 backdrop-blur-xl border-violet-500/10 text-center">
            <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
            <div className={`text-2xl font-serif font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </Card>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="bg-card/60 border border-violet-500/10 mb-4">
            <TabsTrigger value="bookings" className="data-[state=active]:bg-violet-500/15" data-testid="tab-bookings">
              <CalendarCheck className="w-4 h-4 mr-2" /> Bookings
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-violet-500/15" data-testid="tab-payments">
              <Wallet className="w-4 h-4 mr-2" /> Payments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <Card className="p-6 bg-card/60 backdrop-blur-xl border-violet-500/10">
              {loadingBookings ? (
                <div className="text-center py-8"><Loader2 className="w-6 h-6 text-violet-400 animate-spin mx-auto" /></div>
              ) : bookings.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm">No bookings yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        {["Name", "Email", "Instagram", "Phone", "Date", "Time", "Status", ""].map((h) => (
                          <th key={h} className="text-left p-3 text-xs text-violet-400 uppercase tracking-widest border-b border-violet-500/10 font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...bookings].sort((a, b) => a.date.localeCompare(b.date)).map((b) => (
                        <tr key={b.id} className="border-b border-violet-500/5 last:border-0" data-testid={`row-booking-${b.id}`}>
                          <td className="p-3 text-foreground flex items-center gap-2"><User className="w-3.5 h-3.5 text-violet-400" />{b.name}</td>
                          <td className="p-3 text-muted-foreground">{b.email}</td>
                          <td className="p-3 text-muted-foreground">{b.instagram || "\u2014"}</td>
                          <td className="p-3 text-muted-foreground">{b.phone || "\u2014"}</td>
                          <td className="p-3 text-cyan-300 font-mono text-xs">{b.date}</td>
                          <td className="p-3 text-violet-300 font-mono text-xs flex items-center gap-1"><Clock className="w-3 h-3" />{formatHour(b.hour)}</td>
                          <td className="p-3">
                            <Badge variant="outline" className={b.status === "confirmed" ? "border-green-500/30 text-green-400 bg-green-500/5" : "border-red-500/30 text-red-400 bg-red-500/5"}>
                              {b.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => cancelMutation.mutate(b.id)}
                              disabled={cancelMutation.isPending}
                              className="text-red-400"
                              data-testid={`button-cancel-booking-${b.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card className="p-6 bg-card/60 backdrop-blur-xl border-violet-500/10">
              {loadingPayments ? (
                <div className="text-center py-8"><Loader2 className="w-6 h-6 text-violet-400 animate-spin mx-auto" /></div>
              ) : payments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm">No payments yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        {["Tier", "Amount", "TX Hash", "Date", "Status"].map((h) => (
                          <th key={h} className="text-left p-3 text-xs text-violet-400 uppercase tracking-widest border-b border-violet-500/10 font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p.id} className="border-b border-violet-500/5 last:border-0" data-testid={`row-payment-${p.id}`}>
                          <td className="p-3">
                            <Badge variant="outline" className={p.tier === "vip" ? "border-violet-500/30 text-violet-400 bg-violet-500/5" : "border-cyan-500/30 text-cyan-400 bg-cyan-500/5"}>
                              {p.tier === "vip" ? "1-on-1 VIP" : "Self-Setup"}
                            </Badge>
                          </td>
                          <td className="p-3 text-green-400 font-semibold">${p.amount}</td>
                          <td className="p-3 text-muted-foreground font-mono text-xs">
                            {p.txHash.slice(0, 10)}...{p.txHash.length > 10 ? p.txHash.slice(-8) : ""}
                          </td>
                          <td className="p-3 text-card-foreground text-xs">
                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "\u2014"}
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/5">Verified</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
