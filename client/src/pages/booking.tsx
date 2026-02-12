import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Booking } from "@shared/schema";
import {
  ArrowLeft, CalendarCheck, Clock, User, Mail, Phone,
  CheckCircle, Loader2, ArrowRight,
} from "lucide-react";

function formatHour(h: number) {
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hr}:00 ${ampm}`;
}

function getAvailableSlots(date: Date, bookings: Booking[]) {
  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];
  const dateStr = date.toISOString().split("T")[0];
  const booked = bookings.filter((b) => b.date === dateStr && b.status === "confirmed").map((b) => b.hour);
  return hours.filter((h) => !booked.includes(h));
}

export default function BookingPage() {
  const [, navigate] = useLocation();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const { toast } = useToast();

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const next7Days = useMemo(() => {
    const days: Date[] = [];
    let count = 0;
    let offset = 1;
    while (count < 7) {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      offset++;
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        days.push(d);
        count++;
      }
    }
    return days;
  }, []);

  const availableSlots = selectedDate ? getAvailableSlots(selectedDate, bookings) : [];

  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDate || selectedHour === null) return;
      const res = await apiRequest("POST", "/api/bookings", {
        name,
        email,
        instagram: null,
        phone: phone || null,
        date: selectedDate.toISOString().split("T")[0],
        hour: selectedHour,
        status: "confirmed",
      });
      return res.json();
    },
    onSuccess: () => {
      setConfirmed(true);
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (err: Error) => {
      toast({ title: "Booking Error", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="relative z-10 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="relative z-10 max-w-[600px] mx-auto px-5 py-16 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", duration: 0.8 }}>
          <Card className="p-10 bg-card/60 backdrop-blur-xl border-violet-500/10">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
              <CheckCircle className="w-16 h-16 text-cyan-400 mx-auto mb-5" />
            </motion.div>
            <h2 className="font-serif text-2xl font-bold text-cyan-300 mb-3">Booking Confirmed!</h2>
            <p className="text-card-foreground leading-relaxed mb-2">
              Your 1-on-1 session is booked for{" "}
              <strong className="text-violet-300">
                {selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </strong>{" "}
              at <strong className="text-violet-300">{selectedHour !== null ? formatHour(selectedHour) : ""}</strong>.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              I'll reach out via email before our session.
            </p>
            <Button variant="outline" onClick={() => navigate("/")} className="mt-6 border-violet-500/30 text-violet-300" data-testid="button-back-home-confirmed">
              Back to Home
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative z-10 max-w-[700px] mx-auto px-5 py-8">
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-6 text-violet-400" data-testid="button-back-booking">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent mb-3">
          Book 1-on-1 Session
        </h1>
        <p className="text-muted-foreground">Book your 1-hour personal setup session. I'll walk you through everything.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="p-8 bg-card/60 backdrop-blur-xl border-violet-500/10">
          <div className="space-y-4 mb-6">
            <div>
              <Label className="text-xs text-violet-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Your Name
              </Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="bg-background/60 border-violet-500/15" data-testid="input-booking-name" />
            </div>
            <div>
              <Label className="text-xs text-violet-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Email
              </Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@email.com" className="bg-background/60 border-violet-500/15" data-testid="input-booking-email" />
            </div>
            <div>
              <Label className="text-xs text-violet-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" /> Phone Number
              </Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="+1 (555) 123-4567" className="bg-background/60 border-violet-500/15" data-testid="input-booking-phone" />
            </div>
          </div>

          <div className="mb-5">
            <Label className="text-xs text-violet-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <CalendarCheck className="w-3.5 h-3.5" /> Select a Date
            </Label>
            <div className="flex gap-2 flex-wrap">
              {next7Days.map((d) => {
                const isSelected = selectedDate && d.toDateString() === selectedDate.toDateString();
                const slotsLeft = getAvailableSlots(d, bookings).length;
                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => { setSelectedDate(d); setSelectedHour(null); }}
                    disabled={slotsLeft === 0}
                    className={`min-w-[75px] p-3 rounded-md text-center transition-all duration-300 border ${
                      isSelected
                        ? "bg-violet-500/20 border-violet-500 text-foreground"
                        : slotsLeft > 0
                          ? "bg-background/60 border-violet-500/15 text-card-foreground hover-elevate"
                          : "bg-background/30 border-violet-500/5 text-muted-foreground opacity-50 cursor-not-allowed"
                    }`}
                    data-testid={`button-date-${d.toISOString().split("T")[0]}`}
                  >
                    <div className="text-xs font-semibold">{d.toLocaleDateString("en-US", { weekday: "short" })}</div>
                    <div className="text-lg font-serif font-bold my-0.5">{d.getDate()}</div>
                    <div className={`text-[11px] ${slotsLeft > 0 ? "text-cyan-400" : "text-muted-foreground"}`}>{slotsLeft} slots</div>
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence>
            {selectedDate && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6">
                <Label className="text-xs text-violet-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> Select a Time
                </Label>
                <div className="flex gap-2 flex-wrap">
                  {availableSlots.map((h) => (
                    <button
                      key={h}
                      onClick={() => setSelectedHour(h)}
                      className={`px-4 py-2.5 rounded-md transition-all duration-300 border text-sm font-medium ${
                        selectedHour === h
                          ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                          : "bg-background/60 border-cyan-500/15 text-card-foreground hover-elevate"
                      }`}
                      data-testid={`button-time-${h}`}
                    >
                      {formatHour(h)}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 border-violet-500/50 text-white shadow-lg shadow-violet-500/20"
            onClick={() => bookMutation.mutate()}
            disabled={!name || !email || !selectedDate || selectedHour === null || bookMutation.isPending}
            data-testid="button-confirm-booking"
          >
            {bookMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Booking...</>
            ) : (
              <>Confirm Booking <ArrowRight className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
