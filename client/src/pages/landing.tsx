import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight, Check, Bot, ChevronDown, Phone, Mail,
  MessageSquare, Users, CheckCircle, Loader2, Calendar,
  Briefcase, Zap, Globe,
  TrendingUp, DollarSign, BarChart3, Star, Send,
  Terminal, Cpu, Activity,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const GLITCH_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*<>{}[]";

const C = {
  bg: "#F5F5F7",
  bgDark: "#0D0D14",
  orange: "#D35400",
  orangeLight: "#E67E22",
  orangeGlow: "#F39C12",
  dark: "#1A1A2E",
  darkText: "#1C1C1E",
  bodyText: "#4A4A5A",
  muted: "#6B6B7B",
  white: "#ffffff",
  cardBg: "rgba(255, 255, 255, 0.75)",
  cardBorder: "rgba(0, 0, 0, 0.06)",
  green: "#16A34A",
  red: "#DC2626",
};

interface Orb {
  x: number; y: number;
  vx: number; vy: number;
  r: number; baseR: number;
  pulse: number; pulseSpeed: number;
  opacity: number;
}

function FloatingOrbs({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;
    const orbs: Orb[] = [];

    const spawnOrb = (): Orb => {
      const baseR = 4 + Math.random() * 30;
      return {
        x: Math.random() * (w || 800),
        y: Math.random() * (h || 600),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: baseR,
        baseR,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.006 + Math.random() * 0.012,
        opacity: 0.08 + Math.random() * 0.2,
      };
    };

    const isMob = window.matchMedia("(max-width: 767px)").matches;
    const dpr = isMob ? 1 : Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = isMob ? Math.max(5, Math.floor((w * h) / 80000)) : Math.max(12, Math.floor((w * h) / 30000));
      while (orbs.length < count) orbs.push(spawnOrb());
      while (orbs.length > count) orbs.pop();
    };
    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const orb of orbs) {
        orb.x += orb.vx;
        orb.y += orb.vy;
        orb.pulse += orb.pulseSpeed;
        if (orb.x < -orb.r * 2) orb.x = w + orb.r;
        if (orb.x > w + orb.r * 2) orb.x = -orb.r;
        if (orb.y < -orb.r * 2) orb.y = h + orb.r;
        if (orb.y > h + orb.r * 2) orb.y = -orb.r;
        const pulseScale = 0.85 + Math.sin(orb.pulse) * 0.15;
        orb.r = orb.baseR * pulseScale;
        const currentOpacity = orb.opacity * (0.7 + Math.sin(orb.pulse * 0.7) * 0.3);
        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r * 2.5);
        if (dark) {
          grad.addColorStop(0, `rgba(211, 84, 0, ${currentOpacity * 0.8})`);
          grad.addColorStop(0.4, `rgba(230, 126, 34, ${currentOpacity * 0.3})`);
          grad.addColorStop(1, `rgba(211, 84, 0, 0)`);
        } else {
          grad.addColorStop(0, `rgba(211, 84, 0, ${currentOpacity * 0.5})`);
          grad.addColorStop(0.4, `rgba(230, 126, 34, ${currentOpacity * 0.2})`);
          grad.addColorStop(1, `rgba(211, 84, 0, 0)`);
        }
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, [dark]);
  return <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full ${className}`} />;
}

function LiveProfitCounter({ baseValue = 10400.99 }: { baseValue?: number }) {
  const [value, setValue] = useState(baseValue);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const prevValue = useRef(baseValue);

  useEffect(() => {
    const tick = () => {
      const delta = (Math.random() - 0.48) * 120;
      setValue((v) => {
        const next = Math.max(baseValue - 400, Math.min(baseValue + 600, v + delta));
        const direction = next > prevValue.current ? "up" : "down";
        setFlash(direction);
        prevValue.current = next;
        setTimeout(() => setFlash(null), 400);
        return next;
      });
    };
    const id = setInterval(tick, 1800 + Math.random() * 1200);
    return () => clearInterval(id);
  }, [baseValue]);

  const formatted = value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const isUp = value >= baseValue;

  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        <div
          className="text-4xl md:text-5xl font-mono font-black transition-colors duration-300"
          style={{ color: isUp ? C.green : C.red }}
          data-testid="text-live-profit"
        >
          <span className="text-2xl md:text-3xl align-top mr-0.5">$</span>
          {formatted}
        </div>
        {flash && (
          <motion.div
            initial={{ opacity: 0.8, y: 0 }}
            animate={{ opacity: 0, y: flash === "up" ? -18 : 18 }}
            transition={{ duration: 0.5 }}
            className="absolute right-0 top-0 text-xs font-mono font-bold"
            style={{ color: flash === "up" ? C.green : C.red }}
          >
            {flash === "up" ? "▲" : "▼"}
          </motion.div>
        )}
      </div>
      <div>
        <div className="font-semibold flex items-center gap-2" style={{ color: C.white }}>
          Live 24h Profit
          <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: C.green }} />
        </div>
        <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>TRADER-X autonomous portfolio</div>
      </div>
    </div>
  );
}

function MatrixDecode({ text, active }: { text: string; active: boolean }) {
  const [display, setDisplay] = useState(text);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!active || startedRef.current) return;
    startedRef.current = true;
    const chars = text.split("");
    const current = chars.map(() => GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]);
    setDisplay(current.join(""));
    let idx = 0;
    const scrambleId = setInterval(() => {
      for (let i = idx; i < chars.length; i++) {
        current[i] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
      }
      setDisplay(current.join(""));
    }, 30);
    const resolveId = setInterval(() => {
      if (idx < chars.length) {
        current[idx] = chars[idx];
        setDisplay(current.join(""));
        idx++;
      } else {
        clearInterval(resolveId);
        clearInterval(scrambleId);
      }
    }, 15);
    return () => { clearInterval(scrambleId); clearInterval(resolveId); };
  }, [active, text]);

  return <span className="font-mono text-sm leading-relaxed" style={{ color: C.bodyText }}>{display}</span>;
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="glass-card rounded-2xl overflow-hidden cursor-pointer group"
      onClick={() => setOpen(!open)}
      data-testid={`faq-${question.slice(0, 20).toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex items-center justify-between gap-3 p-5">
        <span className="font-semibold text-sm" style={{ color: C.darkText }}>{question}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <ChevronDown className="w-4 h-4 shrink-0" style={{ color: C.orange }} />
        </motion.div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 flex items-start gap-3 relative">
              <Terminal className="w-4 h-4 shrink-0 mt-0.5" style={{ color: C.orange }} />
              <MatrixDecode text={answer} active={open} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InquiryForm({ type, title, subtitle, fields, buttonText, buttonColor, accentColor }: {
  type: string;
  title: string;
  subtitle: string;
  fields: { name: string; label: string; icon: any; type?: string; placeholder: string; required?: boolean; options?: string[] }[];
  buttonText: string;
  buttonColor: string;
  accentColor: string;
}) {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const messageParts = fields
        .filter(f => f.name !== "name" && f.name !== "email" && f.name !== "phone")
        .map(f => values[f.name] ? `${f.label}: ${values[f.name]}` : "")
        .filter(Boolean);
      const res = await apiRequest("POST", "/api/signups", {
        name: values.name || "",
        email: values.email || "",
        phone: values.phone || "",
        message: messageParts.join("\n") || undefined,
        type,
      });
      return res.json();
    },
    onSuccess: () => setSuccess(true),
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.name?.trim() || !values.email?.trim() || !values.phone?.trim()) {
      toast({ title: "Missing Info", description: "Please fill in name, email, and phone.", variant: "destructive" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    mutation.mutate();
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15 }}>
          <CheckCircle className="w-14 h-14 mx-auto mb-4" style={{ color: C.orange }} />
        </motion.div>
        <h3 className="text-2xl font-bold mb-3" style={{ color: C.darkText }} data-testid={`text-${type}-success`}>Request Received!</h3>
        <p className="text-sm leading-relaxed mb-4" style={{ color: C.muted }}>
          We'll reach out to <strong style={{ color: C.darkText }}>{values.email}</strong> or <strong style={{ color: C.darkText }}>{values.phone}</strong> shortly.
        </p>
        <Button variant="outline" onClick={() => { setSuccess(false); setValues({}); }} style={{ color: C.bodyText }} data-testid={`button-${type}-reset`}>
          Submit Another
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid={`form-${type}`}>
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2 title-font" style={{ color: accentColor }}>{title}</h3>
        <p className="text-sm" style={{ color: C.muted }}>{subtitle}</p>
      </div>
      {fields.map(field => (
        <div key={field.name}>
          <Label className="text-xs uppercase tracking-widest mb-1.5 flex items-center gap-2" style={{ color: accentColor }}>
            <field.icon className="w-3 h-3" /> {field.label}
          </Label>
          {field.options ? (
            <select
              value={values[field.name] || ""}
              onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
              className="w-full rounded-lg px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.1)", color: C.darkText }}
              required={field.required}
              data-testid={`select-${type}-${field.name}`}
            >
              <option value="">{field.placeholder}</option>
              {field.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : field.type === "textarea" ? (
            <Textarea
              value={values[field.name] || ""}
              onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
              placeholder={field.placeholder}
              className="resize-none text-sm"
              style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.1)", color: C.darkText }}
              rows={3}
              required={field.required}
              data-testid={`input-${type}-${field.name}`}
            />
          ) : (
            <Input
              value={values[field.name] || ""}
              onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
              type={field.type || "text"}
              placeholder={field.placeholder}
              className="text-sm"
              style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.1)", color: C.darkText }}
              required={field.required}
              data-testid={`input-${type}-${field.name}`}
            />
          )}
        </div>
      ))}
      <Button
        type="submit"
        className="w-full font-bold py-5 text-sm md:text-base rounded-xl"
        style={{ background: buttonColor, color: C.white }}
        disabled={!values.name || !values.email || !values.phone || mutation.isPending}
        data-testid={`button-submit-${type}`}
      >
        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
        {mutation.isPending ? "Submitting..." : buttonText}
      </Button>
    </form>
  );
}

function LiveChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.setTransform(2, 0, 0, 2, 0, 0);
    };
    resize();
    const points: number[] = [];
    const maxPoints = 120;
    let value = 25;
    for (let i = 0; i < maxPoints; i++) {
      const progress = i / maxPoints;
      const trend = 0.35 + progress * 0.15;
      value += (Math.random() - trend) * 1.8;
      value = Math.max(5, Math.min(92, value));
      points.push(value);
    }
    let frame = 0;
    let tick = 0;
    const draw = () => {
      tick++;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) { frame = requestAnimationFrame(draw); return; }
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);
      if (tick % 4 === 0) {
        value += (Math.random() - 0.42) * 1.2;
        value = Math.max(5, Math.min(95, value));
        points.push(value);
        if (points.length > maxPoints) points.shift();
      }
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "rgba(22, 163, 74, 0.15)");
      grad.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.moveTo(0, h);
      points.forEach((p, i) => {
        const x = (i / (maxPoints - 1)) * w;
        const y = h - (p / 100) * h;
        ctx.lineTo(x, y);
      });
      ctx.lineTo(w, h);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.beginPath();
      points.forEach((p, i) => {
        const x = (i / (maxPoints - 1)) * w;
        const y = h - (p / 100) * h;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = C.green;
      ctx.lineWidth = 2;
      ctx.shadowColor = C.green;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
      const lastX = w;
      const lastY = h - (points[points.length - 1] / 100) * h;
      ctx.fillStyle = C.green;
      ctx.beginPath();
      ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
      ctx.fill();
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

function CountUpOnScroll({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const countedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      onEnter: () => {
        if (countedRef.current) return;
        countedRef.current = true;
        const startTime = Date.now();
        const duration = 2000;
        const tick = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        tick();
      },
    });
    return () => trigger.kill();
  }, [target]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

function OrangeCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (isMobile) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w * 2;
    canvas.height = h * 2;
    ctx.setTransform(2, 0, 0, 2, 0, 0);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * 2;
      canvas.height = h * 2;
      ctx.setTransform(2, 0, 0, 2, 0, 0);
    };
    window.addEventListener("resize", resize);

    interface Trail { x: number; y: number; age: number; vx: number; vy: number; size: number; }
    const trails: Trail[] = [];
    let mouseX = -100, mouseY = -100;
    let prevX = -100, prevY = -100;
    let frame = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("mousemove", onMove);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      const dx = mouseX - prevX;
      const dy = mouseY - prevY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      if (speed > 2 && mouseX > 0) {
        const count = Math.min(Math.floor(speed / 6), 4);
        for (let i = 0; i < count; i++) {
          const t = i / count;
          trails.push({
            x: prevX + dx * t + (Math.random() - 0.5) * 8,
            y: prevY + dy * t + (Math.random() - 0.5) * 8,
            age: 0,
            vx: dx * 0.05 + (Math.random() - 0.5) * 1.5,
            vy: dy * 0.05 + (Math.random() - 0.5) * 1.5,
            size: 2 + Math.random() * 4,
          });
        }
      }
      prevX = mouseX;
      prevY = mouseY;

      for (let i = trails.length - 1; i >= 0; i--) {
        const p = trails[i];
        p.age++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        const life = 1 - p.age / 35;
        if (life <= 0) { trails.splice(i, 1); continue; }
        const alpha = life * 0.6;
        const r = p.size * life;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
        grad.addColorStop(0, `rgba(211, 84, 0, ${alpha})`);
        grad.addColorStop(0.4, `rgba(230, 126, 34, ${alpha * 0.5})`);
        grad.addColorStop(1, `rgba(243, 156, 18, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 200, 100, ${alpha * 0.8})`;
        ctx.fill();
      }

      frame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  );
}

const CAPABILITIES = [
  { icon: Phone, title: "ANSWER CALLS 24/7", desc: "Qualifies leads, books appointments, handles objections. Voice + SMS + WhatsApp. Never misses a call.", stat: "99.8% pickup rate" },
  { icon: Calendar, title: "BOOK APPOINTMENTS", desc: "Syncs with Google/Outlook calendar. Auto reminders, reschedules, and no-show follow ups.", stat: "Infinite scheduling" },
  { icon: MessageSquare, title: "FOLLOW UP LEADS", desc: "Persistent, intelligent follow-ups that convert cold leads into paying customers on autopilot.", stat: "3x conversion rate" },
  { icon: TrendingUp, title: "POST CONTENT", desc: "Creates and publishes across all your social platforms. Consistent brand voice, zero effort.", stat: "Multi-platform" },
  { icon: DollarSign, title: "CLOSE SALES", desc: "AI sales agents that follow up, send proposals, negotiate, and close deals while you sleep.", stat: "24/7 selling" },
  { icon: Globe, title: "INTEGRATE EVERYTHING", desc: "Connects to your CRM, email, phone, calendar, and 100+ tools. One unified AI workforce.", stat: "100+ integrations" },
];

const JOURNEY_STEPS = [
  { title: "BOOK A CALL", desc: "See AI agents in action during a free Zoom session" },
  { title: "MAP YOUR WORKFLOWS", desc: "We learn every process, tool, and bottleneck in your business" },
  { title: "WE BUILD YOUR AGENT", desc: "Custom-trained on your data, integrated with your stack" },
  { title: "LAUNCH & SCALE", desc: "Your agent goes live and starts producing results day one" },
];

export default function Landing() {
  const mainRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [capIndex, setCapIndex] = useState(0);
  const [capProgress, setCapProgress] = useState(0);

  useEffect(() => {
    const dot = document.querySelector(".scroll-progress-dot") as HTMLElement;
    const handler = () => {
      setScrolled(window.scrollY > 50);
      if (dot) {
        const scrollFraction = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        dot.style.top = `${scrollFraction * (window.innerHeight - 8)}px`;
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      ScrollTrigger.defaults({ fastScrollEnd: true });

      const introTl = gsap.timeline({ delay: 0.1 });
      introTl
        .fromTo(".hero-pill", { opacity: 0, y: -15 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.2)
        .fromTo(".hero-line-1", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0.3)
        .fromTo(".hero-line-2", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0.5)
        .fromTo(".hero-line-3", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0.7)
        .fromTo(".hero-line-4", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0.9)
        .fromTo(".hero-body-text", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 1.1)
        .fromTo(".hero-cta-buttons", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 1.3)
        .fromTo(".hero-badges", { opacity: 0 }, { opacity: 1, duration: 0.5 }, 1.5);

      mm.add("(min-width: 768px)", () => {
        const heroTl = gsap.timeline({
          scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "+=150%",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });
        heroTl.to(".hero-content-wrapper", { opacity: 0, scale: 0.95, duration: 15 }, 0);

        const capTl = gsap.timeline({
          scrollTrigger: {
            trigger: "#capabilities",
            start: "top top",
            end: `+=${CAPABILITIES.length * 100}%`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            onUpdate: (self) => {
              const idx = Math.min(Math.floor(self.progress * CAPABILITIES.length), CAPABILITIES.length - 1);
              setCapIndex(idx);
              setCapProgress(self.progress);
            },
          },
        });
        CAPABILITIES.forEach((_, i) => {
          if (i > 0) {
            capTl
              .to(`.cap-slide-${i - 1}`, { opacity: 0, y: -60, duration: 8 }, `cap${i}`)
              .fromTo(`.cap-slide-${i}`, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 8 }, `cap${i}`);
          }
        });

        const termTl = gsap.timeline({
          scrollTrigger: {
            trigger: "#terminal-section",
            start: "top top",
            end: "+=300%",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });
        termTl
          .fromTo(".term-header", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 10 })
          .fromTo(".term-line-0", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 6 }, 10)
          .fromTo(".term-line-1", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 6 }, 18)
          .fromTo(".term-line-2", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 6 }, 26)
          .fromTo(".term-line-3", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 6 }, 34)
          .fromTo(".term-line-4", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 6 }, 42)
          .fromTo(".term-line-5", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 6 }, 50)
          .fromTo(".term-status", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 10, ease: "back.out(2)" }, 60)
          .to("#terminal-section .term-content", { opacity: 0, duration: 10 }, 80);

        const journeyTl = gsap.timeline({
          scrollTrigger: {
            trigger: "#journey",
            start: "top top",
            end: "+=350%",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });
        journeyTl.fromTo(".journey-line-progress", { width: "0%" }, { width: "100%", duration: 100 });
        JOURNEY_STEPS.forEach((_, i) => {
          const pos = (i / JOURNEY_STEPS.length) * 80 + 10;
          journeyTl
            .fromTo(`.journey-node-${i}`, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 6, ease: "back.out(2)" }, pos)
            .fromTo(`.journey-card-${i}`, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 8 }, pos + 3);
        });
      });

      mm.add("(max-width: 767px)", () => {
        const termEls = [".term-header", ".term-line-0", ".term-line-1", ".term-line-2", ".term-line-3", ".term-line-4", ".term-line-5", ".term-status"];
        termEls.forEach((sel, i) => {
          gsap.fromTo(sel, { opacity: 0, y: 20 }, {
            opacity: 1, y: 0, duration: 0.5, ease: "power2.out",
            scrollTrigger: { trigger: "#terminal-section", start: "top 80%", toggleActions: "play none none none" },
            delay: i * 0.1,
          });
        });
      });

      const isMobile = window.innerWidth < 768;
      gsap.utils.toArray<HTMLElement>(".reveal-on-scroll").forEach(el => {
        gsap.fromTo(el, { opacity: 0, y: isMobile ? 30 : 50 }, {
          opacity: 1, y: 0, duration: isMobile ? 0.5 : 0.8, ease: "power2.out",
          scrollTrigger: { trigger: el, start: isMobile ? "top 92%" : "top 85%", toggleActions: "play none none none" },
        });
      });

      gsap.utils.toArray<HTMLElement>(".stat-slam").forEach((el, i) => {
        gsap.fromTo(el, { y: isMobile ? -30 : -80, opacity: 0, scale: isMobile ? 1.05 : 1.2 }, {
          y: 0, opacity: 1, scale: 1, duration: isMobile ? 0.5 : 0.8, ease: isMobile ? "power2.out" : "bounce.out", delay: i * 0.1,
          scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
        });
      });

      const ctaTl = gsap.timeline({
        scrollTrigger: { trigger: "#final-cta", start: "top 70%", toggleActions: "play none none none" },
      });
      ctaTl
        .fromTo(".cta-main-text", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6 }, 0.2)
        .fromTo(".cta-button-area", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, 0.5);

    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainRef} className="relative min-h-screen overflow-x-hidden" style={{ backgroundColor: C.bg }}>

      <OrangeCursorTrail />
      <div className="scroll-progress-track" />
      <div className="scroll-progress-dot" />

      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? "rgba(245,245,247,0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "none",
        }}
        data-testid="nav-main"
      >
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between gap-4 h-16 md:h-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})` }}>
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-base md:text-xl font-black tracking-tight title-font" style={{ color: C.darkText }} data-testid="text-logo">
              AI BOT SETUP
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-[2px]">
            {[
              { id: "capabilities", label: "Capabilities" },
              { id: "agents", label: "AI Team" },
              { id: "trading", label: "AI Trading" },
              { id: "journey", label: "How It Works" },
              { id: "forms", label: "Get Started" },
            ].map(n => (
              <button
                key={n.id}
                onClick={() => scrollTo(n.id)}
                className="transition-all duration-300 relative px-2 py-1 rounded-lg"
                style={{ color: C.muted }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.color = C.orange;
                  el.style.textShadow = `0 0 20px rgba(211, 84, 0, 0.5), 0 0 40px rgba(211, 84, 0, 0.2)`;
                  el.style.background = `rgba(211, 84, 0, 0.06)`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.color = C.muted;
                  el.style.textShadow = "none";
                  el.style.background = "transparent";
                }}
                data-testid={`nav-${n.id}`}
              >
                {n.label}
              </button>
            ))}
          </div>
          <Button
            onClick={() => scrollTo("forms")}
            className="hidden lg:flex px-4 py-2 md:px-6 rounded-xl font-semibold hover:scale-105 transition-all text-xs md:text-sm whitespace-nowrap text-white"
            style={{ background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, boxShadow: `0 4px 20px rgba(211, 84, 0, 0.3)` }}
            data-testid="button-nav-cta"
          >
            <Zap className="w-4 h-4 mr-1" /> GET YOUR AGENT
          </Button>
          <Button
            onClick={() => scrollTo("forms")}
            className="lg:hidden px-4 py-2 rounded-xl font-semibold text-xs whitespace-nowrap text-white"
            style={{ background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})` }}
            data-testid="button-nav-cta-mobile"
          >
            <Zap className="w-3.5 h-3.5 mr-1" /> GET STARTED
          </Button>
        </div>
      </nav>

      <section id="hero" className="relative min-h-screen md:h-screen overflow-hidden" data-testid="section-hero">
        <div className="absolute inset-0 z-0 opacity-30">
          <FloatingOrbs />
        </div>

        <div className="hero-content-wrapper md:absolute md:inset-0 flex items-center z-10 pt-24 pb-12 md:pb-0 md:pt-24 relative">
          <div className="max-w-7xl mx-auto w-full px-5 relative">
            <div className="max-w-3xl mx-auto lg:mx-0 text-center lg:text-left">
              <div className="hero-pill inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ opacity: 0, background: "rgba(211, 84, 0, 0.06)", border: "1px solid rgba(211, 84, 0, 0.15)" }}>
                <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: C.orange }} />
                <span className="uppercase text-[10px] tracking-[3px] font-mono" style={{ color: C.orange }}>LIVE AI AGENTS • 24/7 • ZERO BURNOUT</span>
              </div>

              <div className="title-font mb-6" style={{ fontSize: "clamp(2.2rem, 5.5vw, 4.5rem)", lineHeight: 1.05, fontWeight: 900 }}>
                <span className="hero-line-1 block" style={{ opacity: 0, color: C.darkText }}>WE BUILD</span>
                <span className="hero-line-2 block gradient-text-orange" style={{ opacity: 0 }}>AI AGENTS</span>
                <span className="hero-line-3 block" style={{ opacity: 0, color: C.darkText }}>THAT RUN YOUR</span>
                <span className="hero-line-4 block" style={{ opacity: 0, color: C.orange }}>EMPIRE</span>
              </div>

              <div className="hero-body-text max-w-[520px] mb-10 leading-relaxed mx-auto lg:mx-0" style={{ fontSize: "clamp(0.95rem, 2vw, 1.15rem)", opacity: 0, color: C.bodyText }}>
                Custom AI that answers calls, books appointments, closes sales, trades crypto & stocks, posts content, and scales your business — built in under 30 minutes.
              </div>

              <div className="hero-cta-buttons flex flex-col sm:flex-row items-center lg:items-start gap-4" style={{ opacity: 0 }}>
                <Button
                  size="lg"
                  onClick={() => scrollTo("forms")}
                  className="px-10 py-6 text-lg font-bold rounded-2xl transition-all group text-white"
                  style={{ background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, boxShadow: `0 8px 30px rgba(211, 84, 0, 0.3)` }}
                  data-testid="button-hero-cta"
                >
                  BUILD MY AGENT IN 30 MIN
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollTo("trading")}
                  className="px-8 py-6 text-lg font-semibold border-2 rounded-2xl transition-all"
                  style={{ borderColor: `rgba(211, 84, 0, 0.3)`, color: C.orange }}
                  data-testid="button-hero-trading"
                >
                  SEE AI TRADING <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollTo("form-card-team")}
                  className="px-8 py-6 text-lg font-semibold border-2 rounded-2xl transition-all"
                  style={{ borderColor: "rgba(0,0,0,0.1)", color: C.bodyText }}
                  data-testid="button-hero-team"
                >
                  <Users className="w-4 h-4 mr-2" /> JOIN THE TEAM
                </Button>
              </div>

              <div className="hero-badges mt-10 flex items-center gap-6 text-xs uppercase tracking-widest flex-wrap justify-center lg:justify-start" style={{ opacity: 0, color: C.muted }}>
                {["Instant Deploy", "Zero Coding", "100% Custom"].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5" style={{ color: C.orange }} />
                    {item}
                  </span>
                ))}
                <a href="https://openclaw.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all hover:scale-105" style={{ background: `rgba(255, 77, 77, 0.06)`, border: `1px solid rgba(255, 77, 77, 0.15)` }} data-testid="link-openclaw-hero">
                  <img src="/openclaw-logo.svg" alt="OpenClaw" className="w-4 h-4" />
                  <span className="text-[10px] tracking-wider normal-case" style={{ color: "#D35400" }}>Powered by OpenClaw</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="capabilities" className="relative" style={{ backgroundColor: C.bg }} data-testid="section-capabilities">
        <div className="hidden md:block absolute top-0 left-0 right-0 z-10 px-8 pt-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-[4px] font-mono" style={{ color: C.muted }}>WHAT YOUR AI AGENT DOES</span>
            <span className="text-xs font-mono" style={{ color: C.orange }}>{String(capIndex + 1).padStart(2, "0")} / {String(CAPABILITIES.length).padStart(2, "0")}</span>
          </div>
          <div className="max-w-7xl mx-auto h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.05)" }}>
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${capProgress * 100}%`, background: `linear-gradient(90deg, ${C.orange}, ${C.orangeLight})` }} />
          </div>
        </div>

        <div className="hidden md:flex relative h-screen items-center justify-center overflow-hidden">
          {CAPABILITIES.map((cap, i) => (
            <div
              key={cap.title}
              className={`cap-slide-${i} absolute inset-0 flex items-center px-8`}
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              <div className="max-w-7xl mx-auto w-full flex items-center gap-12">
                <div className="hidden lg:block absolute left-8 select-none pointer-events-none" style={{ fontSize: "clamp(120px, 25vw, 300px)", fontWeight: 900, opacity: 0.04, lineHeight: 1, fontFamily: "'Inter', sans-serif", color: C.orange }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="relative z-10 max-w-2xl lg:ml-[15%]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `rgba(211, 84, 0, 0.06)`, border: `1px solid rgba(211, 84, 0, 0.15)` }}>
                      <cap.icon className="w-8 h-8" style={{ color: C.orange }} />
                    </div>
                    <div className="text-xs font-mono uppercase tracking-widest" style={{ color: C.muted }}>{cap.stat}</div>
                  </div>
                  <h3 className="title-font text-4xl md:text-5xl lg:text-6xl font-black mb-6" style={{ color: C.darkText }}>{cap.title}</h3>
                  <p className="text-lg md:text-xl leading-relaxed max-w-lg" style={{ color: C.bodyText }}>{cap.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="md:hidden py-16 px-5">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-[4px] font-mono" style={{ color: C.muted }}>WHAT YOUR AI AGENT DOES</span>
          </div>
          <div className="space-y-4">
            {CAPABILITIES.map((cap, i) => (
              <div key={cap.title} className="glass-card rounded-2xl p-6 reveal-on-scroll">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `rgba(211, 84, 0, 0.06)`, border: `1px solid rgba(211, 84, 0, 0.15)` }}>
                    <cap.icon className="w-6 h-6" style={{ color: C.orange }} />
                  </div>
                  <div>
                    <h3 className="title-font text-lg font-black" style={{ color: C.darkText }}>{cap.title}</h3>
                    <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: C.orange }}>{cap.stat}</span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: C.bodyText }}>{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 relative reveal-on-scroll" data-testid="section-openclaw">
        <div className="max-w-5xl mx-auto px-6">
          <div className="glass-card rounded-2xl p-8 md:p-12 relative overflow-hidden" style={{ border: `1px solid rgba(255, 77, 77, 0.12)` }}>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center" style={{ background: `rgba(255, 77, 77, 0.06)`, border: `1px solid rgba(255, 77, 77, 0.15)` }}>
                  <img src="/openclaw-logo.svg" alt="OpenClaw" className="w-14 h-14 md:w-16 md:h-16" />
                </div>
              </div>
              <div className="text-center md:text-left flex-1">
                <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                  <h3 className="title-font text-2xl md:text-3xl font-black" style={{ color: C.darkText }}>Built with OpenClaw</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider" style={{ background: `rgba(211, 84, 0, 0.1)`, color: C.orange }}>Core Engine</span>
                </div>
                <p className="text-sm md:text-base leading-relaxed mb-5" style={{ color: C.bodyText }}>
                  Our agents run on <a href="https://openclaw.ai" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline" style={{ color: C.orange }}>OpenClaw</a> — the open-source AI agent framework with persistent memory, full system access, browser control, and 50+ integrations. Your AI runs locally on your machine, private and powerful.
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {["Persistent Memory", "Browser Control", "Full System Access", "Skills & Plugins", "50+ Integrations"].map((feat) => (
                    <span key={feat} className="px-3 py-1.5 rounded-lg text-xs font-mono" style={{ background: `rgba(211, 84, 0, 0.05)`, border: `1px solid rgba(211, 84, 0, 0.1)`, color: C.bodyText }}>
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="terminal-section" className="relative" style={{ backgroundColor: C.bgDark }} data-testid="section-terminal">
        <div className="term-content py-16 md:py-0 md:h-screen flex items-center justify-center overflow-hidden relative px-4 md:px-8">
          <div className="absolute inset-0 opacity-20">
            <FloatingOrbs dark />
          </div>
          <div className="relative z-10 w-full max-w-3xl">
            <div className="term-header text-center mb-10" style={{ opacity: 0 }}>
              <Cpu className="w-12 h-12 mx-auto mb-4" style={{ color: C.orange }} />
              <h2 className="title-font text-3xl md:text-4xl font-black text-white">SYSTEM ARCHITECTURE</h2>
            </div>
            <div className="glass-card-dark rounded-2xl p-8 font-mono text-sm space-y-3 relative overflow-hidden" style={{ border: `1px solid rgba(211, 84, 0, 0.15)` }}>
              <div className="absolute top-0 left-0 right-0 h-8 flex items-center gap-2 px-4" style={{ background: `rgba(211, 84, 0, 0.05)`, borderBottom: `1px solid rgba(211, 84, 0, 0.1)` }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f56" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ffbd2e" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#27c93f" }} />
                <span className="text-[10px] ml-2" style={{ color: "rgba(255,255,255,0.4)" }}>ai-agent-core.sys</span>
              </div>
              <div className="pt-8 space-y-2">
                <div className="term-line-0" style={{ opacity: 0 }}>
                  <span style={{ color: C.orange }}>$</span> <span style={{ color: "rgba(255,255,255,0.5)" }}>init --model</span> <span style={{ color: "rgba(255,255,255,0.85)" }}>grok-3 claude-4 gpt-4o llama-3.3</span>
                </div>
                <div className="term-line-1" style={{ opacity: 0 }}>
                  <span style={{ color: C.orange }}>$</span> <span style={{ color: "rgba(255,255,255,0.5)" }}>connect --voice</span> <span style={{ color: "rgba(255,255,255,0.85)" }}>twilio vapi bland</span>
                </div>
                <div className="term-line-2" style={{ opacity: 0 }}>
                  <span style={{ color: C.orange }}>$</span> <span style={{ color: "rgba(255,255,255,0.5)" }}>connect --crm</span> <span style={{ color: "rgba(255,255,255,0.85)" }}>salesforce hubspot gohighlevel</span>
                </div>
                <div className="term-line-3" style={{ opacity: 0 }}>
                  <span style={{ color: C.orange }}>$</span> <span style={{ color: "rgba(255,255,255,0.5)" }}>connect --exchange</span> <span style={{ color: "rgba(255,255,255,0.85)" }}>binance bybit coinbase</span>
                </div>
                <div className="term-line-4" style={{ opacity: 0 }}>
                  <span style={{ color: C.orange }}>$</span> <span style={{ color: "rgba(255,255,255,0.5)" }}>deploy --mode</span> <span style={{ color: "rgba(255,255,255,0.85)" }}>autonomous --uptime 24/7</span>
                </div>
                <div className="term-line-5" style={{ opacity: 0 }}>
                  <span style={{ color: C.orange }}>[OK]</span> <span style={{ color: "rgba(255,255,255,0.85)" }}>Agent deployed successfully. All systems operational.</span>
                </div>
              </div>
            </div>
            <div className="term-status text-center mt-8" style={{ opacity: 0 }}>
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-card-dark" style={{ border: `1px solid rgba(211, 84, 0, 0.15)` }}>
                <Activity className="w-5 h-5" style={{ color: C.orange }} />
                <span className="font-mono text-sm text-white">ALL SYSTEMS OPERATIONAL</span>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.orange }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="agents" className="py-24 relative reveal-on-scroll" style={{ backgroundColor: C.bg }} data-testid="section-agents">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="title-font text-4xl md:text-5xl lg:text-6xl font-black" style={{ color: C.darkText }}>Your 24/7 AI Dream Team</h2>
            <p className="text-lg mt-4" style={{ color: C.bodyText }}>Each specialist is custom-trained for your exact business</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "LUNA", role: "Receptionist • Voice AI", accent: C.orange, message: "Hi! I just booked a consultation for your 2pm slot with Mr. Ramirez. He's pre-qualified and excited.", emoji: "👩‍💼" },
              { name: "ATLAS", role: "Sales Closer • Deal Maker", accent: C.orangeLight, message: "Proposal sent and signed! $14,700 closed in 11 minutes. Next up is the $47k enterprise deal.", emoji: "🧔" },
              { name: "TRADER-X", role: "Crypto & Stocks Leverage Trader", accent: C.green, message: "14 new posts scheduled. Just opened 3x long on SOL at 142.87 — +4.2% in 47 seconds.", emoji: "📈" },
            ].map((agent) => (
              <div key={agent.name} className="glass-card rounded-2xl overflow-hidden reveal-on-scroll" data-testid={`card-agent-${agent.name.toLowerCase()}`}>
                <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${agent.accent}, transparent)` }} />
                <div className="p-7">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-3xl" style={{ backgroundColor: `rgba(211, 84, 0, 0.04)` }}>
                      {agent.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg title-font" style={{ color: C.darkText }}>{agent.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-mono" style={{ background: `rgba(22, 163, 74, 0.1)`, color: C.green }}>
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.green }} /> ONLINE
                        </span>
                      </div>
                      <div className="text-xs" style={{ color: C.muted }}>{agent.role}</div>
                    </div>
                  </div>
                  <div className="rounded-xl p-4 text-sm leading-relaxed" style={{ background: "rgba(0,0,0,0.03)" }}>
                    <span style={{ color: agent.accent }} className="font-mono font-bold">{agent.name}:</span>{" "}
                    <span style={{ color: C.bodyText }}>{agent.message}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="trading" className="py-14 md:py-24 relative" style={{ backgroundColor: C.bgDark }} data-testid="section-trading">
        <div className="absolute inset-0 opacity-15">
          <FloatingOrbs dark />
        </div>
        <div className="max-w-7xl mx-auto px-5 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="reveal-on-scroll">
              <div className="uppercase tracking-[3px] text-xs mb-4 font-mono flex items-center gap-2" style={{ color: C.orange }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.orange }} />
                NEW • LIVE MARKET AGENTS
              </div>
              <h2 className="title-font text-4xl md:text-5xl lg:text-6xl font-black leading-none mb-6 text-white">
                AI Trading Agents That
                <br />
                <span style={{ color: C.orange }}>Actually Make Money</span>
              </h2>
              <p className="text-lg mb-10" style={{ color: "rgba(255,255,255,0.6)" }}>
                Stocks • Crypto • Futures • Options • 100x Leverage. 24/7 autonomous execution with risk management, backtesting, and real-time sentiment analysis.
              </p>

              <div className="space-y-6 mb-10">
                <LiveProfitCounter />
                <div className="flex items-center gap-5">
                  <div className="text-4xl md:text-5xl font-mono font-black" style={{ color: C.green }}>+318%</div>
                  <div>
                    <div className="font-semibold text-white">30-day avg return (backtested)</div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>BTC/ETH/SOL portfolios</div>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="text-4xl md:text-5xl font-mono font-black text-white">0.8s</div>
                  <div>
                    <div className="font-semibold text-white">Execution speed</div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Binance, Bybit, Coinbase Advanced</div>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => scrollTo("forms")}
                className="px-5 py-3 md:px-8 md:py-5 font-bold text-sm md:text-lg rounded-xl md:rounded-2xl hover:scale-105 transition-all w-full md:w-auto text-white"
                style={{ background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, boxShadow: `0 8px 30px rgba(211, 84, 0, 0.4)` }}
                data-testid="button-trading-cta"
              >
                <Bot className="w-4 h-4 md:w-5 md:h-5 mr-2 shrink-0" /> DEPLOY YOUR TRADING AGENT
              </Button>
            </div>

            <div className="reveal-on-scroll">
              <div className="glass-card-dark rounded-2xl p-6 relative" style={{ border: `1px solid rgba(211, 84, 0, 0.12)` }}>
                <div className="rounded-xl p-5 font-mono text-sm mb-6" style={{ background: "rgba(0,0,0,0.3)" }}>
                  <div className="flex justify-between mb-2 items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.green }} />
                      <span className="font-bold text-white">TRADER-X LIVE</span>
                    </div>
                    <div className="font-bold" style={{ color: C.green }}>+6.42% today</div>
                  </div>
                  <div className="flex justify-between items-baseline mb-4 pt-1 pb-3" style={{ borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Total Realized P&L</span>
                    <span className="font-black text-lg" style={{ color: C.green }}>+$9,847.31</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    {[
                      { trade: "Long SOL 3x @ 142.87", profit: "+$3,218" },
                      { trade: "Short ETH 5x @ 2,874", profit: "+$2,941" },
                      { trade: "Closed NVDA call @ 138", profit: "+$2,486" },
                      { trade: "BTC swing 2x long", profit: "+$1,202" },
                    ].map((t, i) => (
                      <div key={i} className="flex justify-between py-2" style={{ borderBottom: i < 3 ? `1px solid rgba(255,255,255,0.03)` : "none" }}>
                        <span style={{ color: "rgba(255,255,255,0.4)" }}>{t.trade}</span>
                        <span className="font-bold" style={{ color: C.green }}>{t.profit} profit</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-48 rounded-xl flex items-center justify-center relative overflow-hidden" style={{ background: `rgba(0,0,0,0.2)`, border: `1px solid rgba(22, 163, 74, 0.15)` }}>
                  <LiveChart />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="journey" className="relative" style={{ backgroundColor: C.bg }} data-testid="section-journey">
        <div className="hidden md:flex h-screen flex-col justify-center px-8">
          <div className="max-w-5xl mx-auto w-full">
            <div className="text-center mb-16">
              <span className="text-xs uppercase tracking-[4px] font-mono" style={{ color: C.muted }}>HOW IT WORKS</span>
              <h2 className="title-font text-4xl md:text-5xl font-black mt-4" style={{ color: C.darkText }}>
                From idea to live AI agent in <span style={{ color: C.orange }}>30 minutes</span>
              </h2>
            </div>

            <div className="relative">
              <div className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2" style={{ background: "rgba(0,0,0,0.06)" }} />
              <div className="journey-line-progress absolute top-1/2 left-0 h-[2px] -translate-y-1/2" style={{ background: `linear-gradient(90deg, ${C.orange}, ${C.orangeLight}, ${C.orange})`, width: "0%", boxShadow: `0 0 15px rgba(211, 84, 0, 0.3)` }} />

              <div className="relative flex justify-between items-start pt-2">
                {JOURNEY_STEPS.map((step, i) => {
                  const nodeColor = C.orange;
                  return (
                    <div key={i} className="flex flex-col items-center" style={{ width: `${100 / JOURNEY_STEPS.length}%` }}>
                      <div className={`journey-node-${i} w-5 h-5 rounded-full border-2 mb-6`} style={{ borderColor: nodeColor, background: `rgba(211, 84, 0, 0.15)`, boxShadow: `0 0 15px rgba(211, 84, 0, 0.3)`, opacity: 0 }} />
                      <div className={`journey-card-${i} text-center px-2`} style={{ opacity: 0 }}>
                        <div className="text-sm font-bold title-font mb-2" style={{ color: C.orange }}>{step.title}</div>
                        <p className="text-xs leading-relaxed max-w-[180px] mx-auto" style={{ color: C.muted }}>{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden py-16 px-5">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-[4px] font-mono" style={{ color: C.muted }}>HOW IT WORKS</span>
            <h2 className="title-font text-2xl font-black mt-4" style={{ color: C.darkText }}>
              From idea to live AI agent in <span style={{ color: C.orange }}>30 minutes</span>
            </h2>
          </div>

          <div className="relative pl-8">
            <div className="absolute left-3 top-0 bottom-0 w-[2px]" style={{ background: `linear-gradient(180deg, ${C.orange}, ${C.orangeLight}, transparent)` }} />
            <div className="space-y-8">
              {JOURNEY_STEPS.map((step, i) => (
                <div key={i} className="relative reveal-on-scroll">
                  <div className="absolute -left-[23px] top-1 w-4 h-4 rounded-full border-2" style={{ borderColor: C.orange, background: `rgba(211, 84, 0, 0.15)`, boxShadow: `0 0 10px rgba(211, 84, 0, 0.3)` }} />
                  <div className="glass-card rounded-xl p-5">
                    <div className="text-sm font-bold title-font mb-1" style={{ color: C.orange }}>{step.title}</div>
                    <p className="text-xs leading-relaxed" style={{ color: C.bodyText }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="forms" className="py-14 md:py-24 relative" style={{ backgroundColor: C.bg }} data-testid="section-forms">
        <div className="max-w-7xl mx-auto px-5 md:px-6">
          <div className="text-center mb-10 md:mb-16 reveal-on-scroll">
            <h2 className="title-font text-3xl md:text-5xl font-black mb-3 md:mb-4" style={{ color: C.darkText }}>Ready to 10x Your Business?</h2>
            <p className="text-base md:text-lg" style={{ color: C.bodyText }}>Choose your path and let's build something incredible</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-5 md:p-8 h-full reveal-on-scroll" data-testid="form-card-general">
              <InquiryForm
                type="general"
                title="Custom AI Agent"
                subtitle="Tell us what you need and we'll build it"
                accentColor={C.darkText}
                buttonColor={`linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`}
                buttonText="BUILD MY AGENT"
                fields={[
                  { name: "name", label: "Your Name", icon: Users, placeholder: "John Smith", required: true },
                  { name: "email", label: "Email", icon: Mail, type: "email", placeholder: "you@email.com", required: true },
                  { name: "phone", label: "Phone", icon: Phone, type: "tel", placeholder: "+1 (555) 123-4567", required: true },
                  { name: "business", label: "Business Type", icon: Briefcase, placeholder: "Select your industry", options: ["Real Estate", "Coaching / Consulting", "E-commerce", "Healthcare", "Home Services", "Legal", "Other"] },
                  { name: "needs", label: "What should your AI do?", icon: Bot, type: "textarea", placeholder: "Answer calls, book appointments, follow up leads..." },
                ]}
              />
            </div>

            <div className="glass-card rounded-2xl p-5 md:p-8 h-full relative overflow-hidden reveal-on-scroll" style={{ border: `1px solid rgba(211, 84, 0, 0.2)` }} data-testid="form-card-trading">
              <div className="absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-bl-lg text-white" style={{ background: C.orange }}>New</div>
              <InquiryForm
                type="trading"
                title="AI Trading Agent"
                subtitle="Autonomous trading for stocks, crypto & leverage"
                accentColor={C.orange}
                buttonColor={`linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`}
                buttonText="DEPLOY TRADING AGENT"
                fields={[
                  { name: "name", label: "Your Name", icon: Users, placeholder: "John Smith", required: true },
                  { name: "email", label: "Email", icon: Mail, type: "email", placeholder: "you@email.com", required: true },
                  { name: "phone", label: "Phone", icon: Phone, type: "tel", placeholder: "+1 (555) 123-4567", required: true },
                  { name: "markets", label: "Markets", icon: BarChart3, placeholder: "Select markets", options: ["Crypto (Spot)", "Crypto (Leverage/Futures)", "Stocks", "Options", "Forex", "All Markets"] },
                  { name: "budget", label: "Trading Budget", icon: DollarSign, placeholder: "e.g., $5,000 - $50,000" },
                  { name: "experience", label: "Trading Experience", icon: TrendingUp, placeholder: "Select level", options: ["Beginner", "Intermediate", "Advanced", "Professional"] },
                ]}
              />
            </div>

            <div id="form-card-team" className="glass-card rounded-2xl p-5 md:p-8 h-full reveal-on-scroll" data-testid="form-card-team">
              <InquiryForm
                type="team"
                title="Join Our Team"
                subtitle="Earn 30% lifetime commission on every referral"
                accentColor={C.bodyText}
                buttonColor={`linear-gradient(135deg, ${C.darkText}, ${C.bodyText})`}
                buttonText="APPLY TO JOIN TEAM"
                fields={[
                  { name: "name", label: "Your Name", icon: Users, placeholder: "John Smith", required: true },
                  { name: "email", label: "Email", icon: Mail, type: "email", placeholder: "you@email.com", required: true },
                  { name: "phone", label: "Phone", icon: Phone, type: "tel", placeholder: "+1 (555) 123-4567", required: true },
                  { name: "social", label: "Social Media / Website", icon: Globe, placeholder: "instagram.com/yourhandle" },
                  { name: "experience", label: "Relevant Experience", icon: Star, placeholder: "Select experience", options: ["Sales / Marketing", "Tech / AI", "Social Media Influencer", "Business Owner", "Other"] },
                  { name: "pitch", label: "Why join us?", icon: MessageSquare, type: "textarea", placeholder: "Tell us about yourself and how you'd bring clients..." },
                ]}
              />
            </div>
          </div>

          <div className="text-center mt-10 reveal-on-scroll">
            <a href="sms:+17542504912" data-testid="link-contact-text">
              <Button variant="outline" size="lg" style={{ color: C.bodyText, borderColor: "rgba(0,0,0,0.1)" }}>
                <MessageSquare className="w-4 h-4 mr-2" style={{ color: C.orange }} /> Questions? Text (754) 250-4912
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="py-20 px-5" style={{ backgroundColor: C.bg }} data-testid="section-stats">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { target: 500, suffix: "+", label: "Agents Deployed", color: C.orange },
              { target: 50, suffix: "+", label: "Industries", color: C.darkText },
              { target: 24, suffix: "/7/365", label: "Uptime", color: C.orange },
              { target: 30, suffix: " min", label: "Setup Time", color: C.darkText },
            ].map((s, i) => (
              <div key={s.label} className="stat-slam glass-card rounded-2xl p-6 text-center will-change-transform" data-testid={`card-stat-${i}`}>
                <div className="title-font text-3xl md:text-4xl font-black mb-2" style={{ color: s.color }}>
                  <CountUpOnScroll target={s.target} suffix={s.suffix} />
                </div>
                <p className="text-xs uppercase tracking-widest" style={{ color: C.muted }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-5" style={{ backgroundColor: C.bg }} data-testid="section-faq">
        <div className="max-w-[700px] mx-auto">
          <div className="text-center mb-14 reveal-on-scroll">
            <h2 className="title-font text-3xl md:text-4xl font-black mb-4" style={{ color: C.darkText }}>Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {[
              { q: "What industries do your AI agents work for?", a: "Our agents are industry-agnostic. We've built them for real estate, healthcare, e-commerce, coaching, legal, home services, and dozens more. If your business has repetitive workflows, we can automate them." },
              { q: "How long does setup take?", a: "Most agents are live within 30 minutes. We handle everything — training, integration, testing — so you don't have to lift a finger." },
              { q: "Do I need technical skills?", a: "Not at all. We build and manage everything for you. You just tell us what you need in plain English, and we make it happen." },
              { q: "Can the AI handle complex conversations?", a: "Yes. Our agents use advanced language models trained on your specific business data. They handle objections, answer detailed questions, and know when to escalate to a human." },
              { q: "How does AI trading work?", a: "Our trading agents use real-time market analysis, sentiment data, and proven strategies to execute trades autonomously. They support crypto, stocks, futures, and leverage trading on major exchanges." },
              { q: "What about the team commission program?", a: "Refer businesses to us, we build their AI agents, and you earn 30% lifetime commission for every month they stay. No cap on earnings." },
            ].map(faq => (
              <div key={faq.q} className="reveal-on-scroll">
                <FAQItem question={faq.q} answer={faq.a} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="final-cta" className="py-24 px-5 relative overflow-hidden" style={{ backgroundColor: C.bgDark }} data-testid="section-cta">
        <div className="absolute inset-0 opacity-15">
          <FloatingOrbs dark />
        </div>

        <div className="relative z-10 max-w-[700px] mx-auto text-center">
          <div className="cta-main-text" style={{ opacity: 0 }}>
            <h2 className="title-font text-3xl md:text-5xl font-black mb-6 text-white">
              Stop Losing Leads.
              <br />
              <span className="gradient-text-orange">Put AI to Work Today.</span>
            </h2>
            <p className="mb-10 max-w-[500px] mx-auto leading-relaxed text-lg" style={{ color: "rgba(255,255,255,0.5)" }}>
              Custom AI agent, built and deployed in 30 minutes. No code. No waiting. No burnout.
            </p>
          </div>
          <div className="cta-button-area flex flex-col items-center gap-5" style={{ opacity: 0 }}>
            <Button
              size="lg"
              onClick={() => scrollTo("forms")}
              className="px-8 md:px-12 py-5 md:py-6 text-base md:text-lg font-bold rounded-2xl hover:scale-105 transition-all text-white"
              style={{ background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, boxShadow: `0 8px 40px rgba(211, 84, 0, 0.4)` }}
              data-testid="button-cta-final"
            >
              <Bot className="w-5 h-5 mr-2 shrink-0" /> BUILD MY AI AGENT NOW
            </Button>
            <a href="sms:+17542504912" data-testid="link-cta-text">
              <Button variant="outline" className="border-white/10 bg-white/[0.03] text-white/50">
                <MessageSquare className="w-4 h-4 mr-2" style={{ color: C.orange }} /> Questions? Text (754) 250-4912
              </Button>
            </a>
            <a
              href="https://instagram.com/squalayyy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 mt-2 transition-opacity hover:opacity-70"
              style={{ opacity: 0.35, color: "rgba(255,255,255,0.5)" }}
              data-testid="link-instagram"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              <span className="text-xs font-mono tracking-wide">@squalayyy</span>
            </a>
          </div>
        </div>
      </section>

      <footer className="py-8 px-5" style={{ backgroundColor: C.bgDark, borderTop: `1px solid rgba(255,255,255,0.06)`, paddingBottom: `calc(2rem + env(safe-area-inset-bottom, 0px))` }} data-testid="footer">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})` }}>
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm title-font text-white">AI BOT SETUP</span>
            </div>
            <div className="flex gap-6 text-xs flex-wrap justify-center" style={{ color: "rgba(255,255,255,0.4)" }}>
              {[
                { label: "Home", action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
                { label: "Capabilities", action: () => scrollTo("capabilities") },
                { label: "AI Trading", action: () => scrollTo("trading") },
                { label: "Get Started", action: () => scrollTo("forms") },
              ].map(l => (
                <button key={l.label} onClick={l.action} className="hover:text-white transition-colors" data-testid={`link-footer-${l.label.toLowerCase()}`}>
                  {l.label}
                </button>
              ))}
              <a href="sms:+17542504912" className="hover:text-white transition-colors" data-testid="link-footer-contact">Contact</a>
            </div>
            <p className="text-xs title-font" style={{ color: "rgba(255,255,255,0.3)" }}>aibotsetup.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
