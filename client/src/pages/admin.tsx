import { useState, useEffect } from "react";
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
import type { Booking, Payment, Signup } from "@shared/schema";
import {
  ArrowLeft, Lock, CalendarCheck, Wallet, DollarSign,
  Loader2, Trash2, Clock, User, Mail, Phone, UserPlus,
  Eye, Globe, MapPin, TrendingUp, BarChart3, Activity,
  ExternalLink, Monitor, RefreshCw, MessageSquare,
} from "lucide-react";

const C = {
  cyan: "#00f0ff",
  purple: "#c026d3",
  green: "#22ff88",
};

interface VisitorStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  locations: { country: string; city: string | null; count: number }[];
  byDay: { date: string; count: number }[];
  topPages: { page: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
}

interface Visitor {
  id: string;
  ip: string;
  country: string | null;
  city: string | null;
  region: string | null;
  userAgent: string | null;
  referrer: string | null;
  page: string;
  createdAt: string;
}

function formatHour(h: number) {
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hr}:00 ${ampm}`;
}

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function MiniBarChart({ data }: { data: { date: string; count: number }[] }) {
  if (data.length === 0) return <div className="text-slate-500 text-xs text-center py-8">No visitor data yet</div>;
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <div className="text-[9px] text-slate-500 font-mono">{d.count}</div>
          <div
            className="w-full rounded-t transition-all duration-300"
            style={{
              height: `${Math.max((d.count / max) * 100, 4)}%`,
              background: `linear-gradient(to top, ${C.cyan}40, ${C.cyan})`,
              minHeight: "2px",
            }}
            title={`${d.date}: ${d.count} visitors`}
          />
          <div className="text-[8px] text-slate-600 font-mono truncate w-full text-center">
            {d.date.slice(5)}
          </div>
        </div>
      ))}
    </div>
  );
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

  const { data: signups = [], isLoading: loadingSignups } = useQuery<Signup[]>({
    queryKey: ["/api/admin/signups"],
    queryFn: getQueryFn<Signup[]>({ on401: "returnNull" }),
    enabled: authed,
  });

  const { data: visitorStats, isLoading: loadingStats } = useQuery<VisitorStats>({
    queryKey: ["/api/admin/visitors/stats"],
    queryFn: getQueryFn<VisitorStats>({ on401: "returnNull" }),
    enabled: authed,
    refetchInterval: 30000,
  });

  const { data: recentVisitors = [], isLoading: loadingVisitors } = useQuery<Visitor[]>({
    queryKey: ["/api/admin/visitors"],
    queryFn: getQueryFn<Visitor[]>({ on401: "returnNull" }),
    enabled: authed,
    refetchInterval: 30000,
  });

  const deleteSignupMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/signups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/signups"] });
      toast({ title: "Signup removed" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
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
  const generalSignups = signups.filter(s => s.type === "general").length;
  const tradingSignups = signups.filter(s => s.type === "trading").length;
  const teamSignups = signups.filter(s => s.type === "team").length;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/admin/visitors/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/admin/visitors"] });
    queryClient.invalidateQueries({ queryKey: ["/api/admin/signups"] });
    queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
    queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
    toast({ title: "Refreshing data..." });
  };

  if (!authed) {
    return (
      <div className="relative z-10 max-w-[400px] mx-auto px-5 py-16 text-center">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-6 text-cyan-400" data-testid="button-back-admin-login">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-8 bg-black/60 backdrop-blur-xl border border-cyan-500/20">
            <Lock className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
            <h2 className="font-mono text-xl font-bold text-white mb-2">ADMIN ACCESS</h2>
            <p className="text-slate-500 text-xs mb-6">Authorized personnel only</p>
            <div className="mb-4">
              <Label className="text-xs text-cyan-400 uppercase tracking-widest mb-2 block font-mono">PIN Code</Label>
              <Input
                value={pin}
                onChange={(e) => { setPin(e.target.value); setAuthError(false); }}
                type="password"
                placeholder="Enter PIN"
                className="bg-black/60 border-cyan-500/20 text-center text-lg tracking-widest font-mono"
                data-testid="input-admin-pin"
                onKeyDown={(e) => e.key === "Enter" && loginMutation.mutate()}
              />
              {authError && <p className="text-red-400 text-xs mt-2 font-mono">ACCESS DENIED</p>}
            </div>
            <Button
              className="w-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 font-mono"
              onClick={() => loginMutation.mutate()}
              disabled={loginMutation.isPending}
              data-testid="button-admin-login"
            >
              {loginMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "AUTHENTICATE"}
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative z-10 max-w-[1200px] mx-auto px-5 py-8">
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-cyan-400" data-testid="button-back-admin">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button variant="ghost" size="sm" onClick={handleRefresh} className="text-slate-400 hover:text-cyan-400" data-testid="button-refresh-admin">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center mb-8">
        <h1 className="font-mono text-3xl md:text-4xl font-black" style={{ color: C.cyan }}>
          COMMAND CENTER
        </h1>
        <p className="text-slate-500 text-sm font-mono mt-2">aibotsetup.com analytics</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {[
          { label: "Total Visitors", value: visitorStats?.total ?? "—", icon: Eye, color: C.cyan },
          { label: "Today", value: visitorStats?.today ?? "—", icon: Activity, color: C.green },
          { label: "This Week", value: visitorStats?.thisWeek ?? "—", icon: TrendingUp, color: C.purple },
          { label: "Signups", value: signups.length, icon: UserPlus, color: C.green },
          { label: "Payments", value: payments.length, icon: Wallet, color: C.cyan },
          { label: "Revenue", value: `$${totalRevenue}`, icon: DollarSign, color: C.green },
        ].map((s) => (
          <Card key={s.label} className="p-4 bg-black/60 backdrop-blur-xl border border-white/5 text-center">
            <s.icon className="w-4 h-4 mx-auto mb-2" style={{ color: s.color }} />
            <div className="text-2xl font-mono font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-mono">{s.label}</div>
          </Card>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-black/60 border border-white/5 mb-4 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-400 font-mono text-xs" data-testid="tab-overview">
              <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="visitors" className="data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-400 font-mono text-xs" data-testid="tab-visitors">
              <Eye className="w-3.5 h-3.5 mr-1.5" /> Visitors
            </TabsTrigger>
            <TabsTrigger value="locations" className="data-[state=active]:bg-purple-500/15 data-[state=active]:text-purple-400 font-mono text-xs" data-testid="tab-locations">
              <Globe className="w-3.5 h-3.5 mr-1.5" /> Locations
            </TabsTrigger>
            <TabsTrigger value="signups" className="data-[state=active]:bg-green-500/15 data-[state=active]:text-green-400 font-mono text-xs" data-testid="tab-signups">
              <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Signups
            </TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-violet-500/15 data-[state=active]:text-violet-400 font-mono text-xs" data-testid="tab-bookings">
              <CalendarCheck className="w-3.5 h-3.5 mr-1.5" /> Bookings
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-400 font-mono text-xs" data-testid="tab-payments">
              <Wallet className="w-3.5 h-3.5 mr-1.5" /> Payments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-6 bg-black/60 backdrop-blur-xl border border-cyan-500/10">
                <h3 className="font-mono text-sm text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Daily Visitors (Last 30 Days)
                </h3>
                {loadingStats ? (
                  <div className="text-center py-8"><Loader2 className="w-5 h-5 text-cyan-400 animate-spin mx-auto" /></div>
                ) : (
                  <MiniBarChart data={visitorStats?.byDay || []} />
                )}
              </Card>

              <Card className="p-6 bg-black/60 backdrop-blur-xl border border-purple-500/10">
                <h3 className="font-mono text-sm text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Top Locations
                </h3>
                {loadingStats ? (
                  <div className="text-center py-8"><Loader2 className="w-5 h-5 text-purple-400 animate-spin mx-auto" /></div>
                ) : (visitorStats?.locations?.length ?? 0) === 0 ? (
                  <p className="text-slate-500 text-xs text-center py-8">No location data yet</p>
                ) : (
                  <div className="space-y-2">
                    {visitorStats?.locations.slice(0, 8).map((loc, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-purple-400" />
                          <span className="text-white">{loc.city ? `${loc.city}, ` : ""}{loc.country}</span>
                        </div>
                        <Badge variant="outline" className="border-purple-500/20 text-purple-400 bg-purple-500/5 text-xs font-mono">
                          {loc.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-6 bg-black/60 backdrop-blur-xl border border-green-500/10">
                <h3 className="font-mono text-sm text-green-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> Signup Breakdown
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
                    <div className="text-2xl font-mono font-bold" style={{ color: C.cyan }}>{generalSignups}</div>
                    <div className="text-[10px] text-slate-500 mt-1 uppercase font-mono">General</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                    <div className="text-2xl font-mono font-bold" style={{ color: C.green }}>{tradingSignups}</div>
                    <div className="text-[10px] text-slate-500 mt-1 uppercase font-mono">Trading</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
                    <div className="text-2xl font-mono font-bold" style={{ color: C.purple }}>{teamSignups}</div>
                    <div className="text-[10px] text-slate-500 mt-1 uppercase font-mono">Team</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-black/60 backdrop-blur-xl border border-cyan-500/10">
                <h3 className="font-mono text-sm text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Monitor className="w-4 h-4" /> Top Pages
                </h3>
                {(visitorStats?.topPages?.length ?? 0) === 0 ? (
                  <p className="text-slate-500 text-xs text-center py-8">No page data yet</p>
                ) : (
                  <div className="space-y-2">
                    {visitorStats?.topPages.map((p, i) => {
                      const maxCount = visitorStats.topPages[0]?.count || 1;
                      return (
                        <div key={i} className="relative">
                          <div
                            className="absolute inset-0 rounded"
                            style={{
                              background: `linear-gradient(to right, ${C.cyan}10, transparent)`,
                              width: `${(p.count / maxCount) * 100}%`,
                            }}
                          />
                          <div className="relative flex items-center justify-between py-1.5 px-2 text-sm">
                            <span className="text-white font-mono text-xs">{p.page}</span>
                            <span className="text-cyan-400 font-mono text-xs font-bold">{p.count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="visitors">
            <Card className="p-6 bg-black/60 backdrop-blur-xl border border-cyan-500/10">
              <h3 className="font-mono text-sm text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4" /> Recent Visitors
                <span className="text-slate-600 text-[10px] ml-auto">auto-refreshes every 30s</span>
              </h3>
              {loadingVisitors ? (
                <div className="text-center py-8"><Loader2 className="w-5 h-5 text-cyan-400 animate-spin mx-auto" /></div>
              ) : recentVisitors.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-8">No visitors tracked yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        {["Location", "Page", "Referrer", "Device", "When"].map((h) => (
                          <th key={h} className="text-left p-2 text-[10px] text-cyan-400 uppercase tracking-widest border-b border-cyan-500/10 font-mono font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentVisitors.map((v) => {
                        const ua = v.userAgent || "";
                        const isMobile = /mobile|android|iphone/i.test(ua);
                        const browser = /chrome/i.test(ua) ? "Chrome" : /firefox/i.test(ua) ? "Firefox" : /safari/i.test(ua) ? "Safari" : /edge/i.test(ua) ? "Edge" : "Other";
                        return (
                          <tr key={v.id} className="border-b border-white/3 last:border-0 hover:bg-cyan-500/5 transition-colors" data-testid={`row-visitor-${v.id}`}>
                            <td className="p-2">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-purple-400 shrink-0" />
                                <span className="text-white text-xs">
                                  {v.city && v.country ? `${v.city}, ${v.country}` : v.country || "Unknown"}
                                </span>
                              </div>
                              {v.region && <div className="text-[10px] text-slate-600 ml-4.5 pl-[18px]">{v.region}</div>}
                            </td>
                            <td className="p-2 text-cyan-300 font-mono text-xs">{v.page}</td>
                            <td className="p-2 text-slate-500 text-xs max-w-[150px] truncate">
                              {v.referrer ? (
                                <span className="flex items-center gap-1">
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                  {v.referrer.replace(/^https?:\/\//, "").split("/")[0]}
                                </span>
                              ) : "Direct"}
                            </td>
                            <td className="p-2">
                              <Badge variant="outline" className="text-[10px] border-white/10 text-slate-400">
                                {isMobile ? "Mobile" : "Desktop"} / {browser}
                              </Badge>
                            </td>
                            <td className="p-2 text-slate-500 font-mono text-[10px] whitespace-nowrap">{timeAgo(v.createdAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="locations">
            <Card className="p-6 bg-black/60 backdrop-blur-xl border border-purple-500/10">
              <h3 className="font-mono text-sm text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Visitor Locations
              </h3>
              {loadingStats ? (
                <div className="text-center py-8"><Loader2 className="w-5 h-5 text-purple-400 animate-spin mx-auto" /></div>
              ) : (visitorStats?.locations?.length ?? 0) === 0 ? (
                <p className="text-slate-500 text-xs text-center py-8">No location data yet</p>
              ) : (
                <div className="space-y-1">
                  {visitorStats?.locations.map((loc, i) => {
                    const maxCount = visitorStats.locations[0]?.count || 1;
                    const pct = (loc.count / maxCount) * 100;
                    return (
                      <div key={i} className="relative rounded overflow-hidden">
                        <div
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(to right, ${C.purple}15, transparent)`,
                            width: `${pct}%`,
                          }}
                        />
                        <div className="relative flex items-center justify-between py-2.5 px-3 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span className="text-white font-medium">{loc.city ? `${loc.city}, ` : ""}{loc.country}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: C.purple }} />
                            </div>
                            <span className="text-purple-400 font-mono text-xs font-bold min-w-[30px] text-right">{loc.count}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {(visitorStats?.topReferrers?.length ?? 0) > 0 && (
                <>
                  <h3 className="font-mono text-sm text-cyan-400 uppercase tracking-widest mt-8 mb-4 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" /> Top Referrers
                  </h3>
                  <div className="space-y-2">
                    {visitorStats?.topReferrers.map((r, i) => (
                      <div key={i} className="flex items-center justify-between text-sm py-1.5">
                        <span className="text-white text-xs">{r.referrer.replace(/^https?:\/\//, "").split("/")[0]}</span>
                        <Badge variant="outline" className="border-cyan-500/20 text-cyan-400 bg-cyan-500/5 text-xs font-mono">
                          {r.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="signups">
            <Card className="p-6 bg-black/60 backdrop-blur-xl border border-green-500/10">
              <h3 className="font-mono text-sm text-green-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> All Signups ({signups.length})
              </h3>
              {loadingSignups ? (
                <div className="text-center py-8"><Loader2 className="w-5 h-5 text-green-400 animate-spin mx-auto" /></div>
              ) : signups.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-8">No signups yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        {["Name", "Email", "Phone", "Type", "Message", "When", ""].map((h) => (
                          <th key={h} className="text-left p-2 text-[10px] text-green-400 uppercase tracking-widest border-b border-green-500/10 font-mono font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {signups.map((s) => (
                        <tr key={s.id} className="border-b border-white/3 last:border-0 hover:bg-green-500/5 transition-colors" data-testid={`row-signup-${s.id}`}>
                          <td className="p-2 text-white text-xs flex items-center gap-1.5">
                            <User className="w-3 h-3 text-green-400 shrink-0" />{s.name}
                          </td>
                          <td className="p-2">
                            <a href={`mailto:${s.email}`} className="text-cyan-300 text-xs hover:underline flex items-center gap-1">
                              <Mail className="w-3 h-3 shrink-0" />{s.email}
                            </a>
                          </td>
                          <td className="p-2">
                            <a href={`tel:${s.phone}`} className="text-slate-400 text-xs hover:underline flex items-center gap-1">
                              <Phone className="w-3 h-3 shrink-0" />{s.phone}
                            </a>
                          </td>
                          <td className="p-2">
                            <Badge variant="outline" className={
                              s.type === "trading" ? "border-green-500/30 text-green-400 bg-green-500/5 text-[10px]" :
                              s.type === "team" ? "border-purple-500/30 text-purple-400 bg-purple-500/5 text-[10px]" :
                              "border-cyan-500/30 text-cyan-400 bg-cyan-500/5 text-[10px]"
                            }>
                              {s.type}
                            </Badge>
                          </td>
                          <td className="p-2 text-slate-500 text-xs max-w-[200px] truncate" title={s.message || ""}>
                            {s.message ? (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3 shrink-0" />
                                {s.message}
                              </span>
                            ) : "—"}
                          </td>
                          <td className="p-2 text-slate-500 font-mono text-[10px] whitespace-nowrap">
                            {s.createdAt ? timeAgo(s.createdAt as unknown as string) : "—"}
                          </td>
                          <td className="p-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteSignupMutation.mutate(s.id)}
                              disabled={deleteSignupMutation.isPending}
                              className="text-red-400 hover:text-red-300 h-7 w-7"
                              data-testid={`button-delete-signup-${s.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

          <TabsContent value="bookings">
            <Card className="p-6 bg-black/60 backdrop-blur-xl border border-violet-500/10">
              <h3 className="font-mono text-sm text-violet-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4" /> All Bookings ({bookings.length})
              </h3>
              {loadingBookings ? (
                <div className="text-center py-8"><Loader2 className="w-5 h-5 text-violet-400 animate-spin mx-auto" /></div>
              ) : bookings.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-8">No bookings yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        {["Name", "Email", "Phone", "Date", "Time", "Status", ""].map((h) => (
                          <th key={h} className="text-left p-2 text-[10px] text-violet-400 uppercase tracking-widest border-b border-violet-500/10 font-mono font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...bookings].sort((a, b) => a.date.localeCompare(b.date)).map((b) => (
                        <tr key={b.id} className="border-b border-white/3 last:border-0 hover:bg-violet-500/5 transition-colors" data-testid={`row-booking-${b.id}`}>
                          <td className="p-2 text-white text-xs flex items-center gap-1.5"><User className="w-3 h-3 text-violet-400 shrink-0" />{b.name}</td>
                          <td className="p-2 text-slate-400 text-xs">{b.email}</td>
                          <td className="p-2 text-slate-400 text-xs">{b.phone || "—"}</td>
                          <td className="p-2 text-cyan-300 font-mono text-xs">{b.date}</td>
                          <td className="p-2 text-violet-300 font-mono text-xs flex items-center gap-1"><Clock className="w-3 h-3" />{formatHour(b.hour)}</td>
                          <td className="p-2">
                            <Badge variant="outline" className={b.status === "confirmed" ? "border-green-500/30 text-green-400 bg-green-500/5 text-[10px]" : "border-red-500/30 text-red-400 bg-red-500/5 text-[10px]"}>
                              {b.status}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => cancelMutation.mutate(b.id)}
                              disabled={cancelMutation.isPending}
                              className="text-red-400 hover:text-red-300 h-7 w-7"
                              data-testid={`button-cancel-booking-${b.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
            <Card className="p-6 bg-black/60 backdrop-blur-xl border border-cyan-500/10">
              <h3 className="font-mono text-sm text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Wallet className="w-4 h-4" /> All Payments ({payments.length})
              </h3>
              {loadingPayments ? (
                <div className="text-center py-8"><Loader2 className="w-5 h-5 text-cyan-400 animate-spin mx-auto" /></div>
              ) : payments.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-8">No payments yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        {["Tier", "Amount", "TX Hash", "Date", "Status"].map((h) => (
                          <th key={h} className="text-left p-2 text-[10px] text-cyan-400 uppercase tracking-widest border-b border-cyan-500/10 font-mono font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p.id} className="border-b border-white/3 last:border-0 hover:bg-cyan-500/5 transition-colors" data-testid={`row-payment-${p.id}`}>
                          <td className="p-2">
                            <Badge variant="outline" className={p.tier === "vip" ? "border-purple-500/30 text-purple-400 bg-purple-500/5 text-[10px]" : "border-cyan-500/30 text-cyan-400 bg-cyan-500/5 text-[10px]"}>
                              {p.tier === "vip" ? "1-on-1 VIP" : "Self-Setup"}
                            </Badge>
                          </td>
                          <td className="p-2 text-green-400 font-mono font-bold text-xs">${p.amount}</td>
                          <td className="p-2 text-slate-500 font-mono text-[10px]">
                            {p.txHash.slice(0, 10)}...{p.txHash.length > 10 ? p.txHash.slice(-8) : ""}
                          </td>
                          <td className="p-2 text-slate-400 text-xs">
                            {p.createdAt ? new Date(p.createdAt as unknown as string).toLocaleDateString() : "—"}
                          </td>
                          <td className="p-2">
                            <Badge variant="outline" className={p.verified ? "border-green-500/30 text-green-400 bg-green-500/5 text-[10px]" : "border-yellow-500/30 text-yellow-400 bg-yellow-500/5 text-[10px]"}>
                              {p.verified ? "Verified" : "Pending"}
                            </Badge>
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
