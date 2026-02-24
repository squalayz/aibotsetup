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

const MATRIX_CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF";
const GLITCH_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*<>{}[]";

const C = {
  bg: "#08080f",
  matrix: "#00ff41",
  matrixDim: "#00cc33",
  matrixDark: "#003300",
  silver: "#c8d0dc",
  silverBright: "#e8edf5",
  white: "#ffffff",
  muted: "#6b7a90",
  cardBg: "rgba(12, 14, 22, 0.7)",
  cardBorder: "rgba(200, 208, 220, 0.08)",
};

function MatrixRain({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;
    const cols: number[] = [];
    const fontSize = 14;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      w = rect.width;
      h = rect.height;
      canvas.width = w * 2;
      canvas.height = h * 2;
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      const colCount = Math.ceil(w / fontSize);
      while (cols.length < colCount) cols.push(Math.random() * h / fontSize * -1);
    };
    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(8, 8, 15, 0.06)";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < cols.length; i++) {
        const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        const x = i * fontSize;
        const y = cols[i] * fontSize;
        const brightness = Math.random();
        if (brightness > 0.95) {
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "#ffffff";
          ctx.shadowBlur = 8;
        } else if (brightness > 0.7) {
          ctx.fillStyle = "#00ff41";
          ctx.shadowColor = "#00ff41";
          ctx.shadowBlur = 4;
        } else {
          ctx.fillStyle = `rgba(0, 255, 65, ${0.15 + brightness * 0.35})`;
          ctx.shadowBlur = 0;
        }
        ctx.font = `${fontSize}px monospace`;
        ctx.fillText(char, x, y);
        ctx.shadowBlur = 0;
        if (y > h && Math.random() > 0.975) {
          cols[i] = 0;
        }
        cols[i] += 0.4 + Math.random() * 0.3;
      }
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, []);
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
          style={{ color: isUp ? C.matrix : "#ff4466" }}
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
            style={{ color: flash === "up" ? C.matrix : "#ff4466" }}
          >
            {flash === "up" ? "▲" : "▼"}
          </motion.div>
        )}
      </div>
      <div>
        <div className="font-semibold flex items-center gap-2" style={{ color: C.silverBright }}>
          Live 24h Profit
          <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: C.matrix }} />
        </div>
        <div className="text-xs" style={{ color: C.muted }}>TRADER-X autonomous portfolio</div>
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

  return <span className="font-mono text-sm leading-relaxed" style={{ color: C.silver }}>{display}</span>;
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="matrix-card rounded-2xl overflow-hidden cursor-pointer group"
      onClick={() => setOpen(!open)}
      data-testid={`faq-${question.slice(0, 20).toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex items-center justify-between gap-3 p-5">
        <span className="font-semibold text-sm" style={{ color: C.silverBright }}>{question}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <ChevronDown className="w-4 h-4 shrink-0" style={{ color: C.matrix }} />
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
              <Terminal className="w-4 h-4 shrink-0 mt-0.5" style={{ color: C.matrix }} />
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
          <CheckCircle className="w-14 h-14 mx-auto mb-4" style={{ color: accentColor }} />
        </motion.div>
        <h3 className="text-2xl font-bold mb-3" style={{ color: accentColor }} data-testid={`text-${type}-success`}>Request Received!</h3>
        <p className="text-sm leading-relaxed mb-4" style={{ color: C.muted }}>
          We'll reach out to <strong style={{ color: C.silverBright }}>{values.email}</strong> or <strong style={{ color: C.silverBright }}>{values.phone}</strong> shortly.
        </p>
        <Button variant="outline" onClick={() => { setSuccess(false); setValues({}); }} className="border-white/10" style={{ color: C.silver }} data-testid={`button-${type}-reset`}>
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
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: C.silverBright }}
              required={field.required}
              data-testid={`select-${type}-${field.name}`}
            >
              <option value="" style={{ background: "#0c0e16" }}>{field.placeholder}</option>
              {field.options.map(opt => (
                <option key={opt} value={opt} style={{ background: "#0c0e16" }}>{opt}</option>
              ))}
            </select>
          ) : field.type === "textarea" ? (
            <Textarea
              value={values[field.name] || ""}
              onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
              placeholder={field.placeholder}
              className="bg-white/[0.03] border-white/[0.08] resize-none text-sm"
              style={{ color: C.silverBright }}
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
              className="bg-white/[0.03] border-white/[0.08] text-sm"
              style={{ color: C.silverBright }}
              required={field.required}
              data-testid={`input-${type}-${field.name}`}
            />
          )}
        </div>
      ))}
      <Button
        type="submit"
        className="w-full font-bold py-5"
        style={{ background: buttonColor, color: "#000" }}
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
    const maxPoints = 100;
    let value = 50;
    for (let i = 0; i < maxPoints; i++) {
      value += (Math.random() - 0.45) * 3;
      value = Math.max(10, Math.min(90, value));
      points.push(value);
    }
    let frame = 0;
    const draw = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) { frame = requestAnimationFrame(draw); return; }
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);
      value += (Math.random() - 0.45) * 2;
      value = Math.max(10, Math.min(90, value));
      points.push(value);
      if (points.length > maxPoints) points.shift();
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "rgba(0, 255, 65, 0.12)");
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
      ctx.strokeStyle = C.matrix;
      ctx.lineWidth = 2;
      ctx.shadowColor = C.matrix;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
      const lastX = w;
      const lastY = h - (points[points.length - 1] / 100) * h;
      ctx.fillStyle = C.matrix;
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

      mm.add("(min-width: 768px)", () => {
        const heroTl = gsap.timeline({
          scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "+=250%",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });

        heroTl
          .fromTo(".scan-line", { y: "-100vh", opacity: 1 }, { y: "100vh", opacity: 0.5, duration: 15 }, 0)
          .fromTo(".noise-overlay", { opacity: 0.6 }, { opacity: 0, duration: 15 }, 2)
          .fromTo(".boot-text", { opacity: 0 }, { opacity: 1, duration: 8 }, 8)
          .to(".boot-text", { opacity: 0, duration: 5 }, 20)
          .fromTo(".hero-pill", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 8 }, "reveal")
          .fromTo(".hero-line-1", { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 10 }, "reveal+=2")
          .fromTo(".hero-line-2", { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 10 }, "reveal+=5")
          .fromTo(".hero-line-3", { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 10 }, "reveal+=8")
          .fromTo(".hero-line-4", { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 10 }, "reveal+=11")
          .fromTo(".hero-body-text", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 12 }, "reveal+=14")
          .fromTo(".hero-cta-buttons", { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 10 }, "reveal+=18")
          .fromTo(".hero-badges", { opacity: 0 }, { opacity: 1, duration: 8 }, "reveal+=22")
          .to(".hero-content-wrapper", { opacity: 0, scale: 0.95, duration: 15 }, "+=5")
          .fromTo(".scene-wipe", { x: "-100%" }, { x: "100%", duration: 10 }, "<");

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
        gsap.fromTo(".hero-line-1", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.4 });
        gsap.fromTo(".hero-line-2", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.6 });
        gsap.fromTo(".hero-line-3", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.8 });
        gsap.fromTo(".hero-line-4", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 1.0 });
        gsap.fromTo(".hero-body-text", { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 1.2 });
        gsap.fromTo(".hero-cta-buttons", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 1.4 });
        gsap.fromTo(".hero-pill", { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.2 });
      });

      gsap.utils.toArray<HTMLElement>(".reveal-on-scroll").forEach(el => {
        gsap.fromTo(el, { opacity: 0, y: 50 }, {
          opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
        });
      });

      gsap.utils.toArray<HTMLElement>(".stat-slam").forEach((el, i) => {
        gsap.fromTo(el, { y: -80, opacity: 0, scale: 1.2 }, {
          y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "bounce.out", delay: i * 0.15,
          scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
        });
      });

      const ctaTl = gsap.timeline({
        scrollTrigger: { trigger: "#final-cta", start: "top 70%", toggleActions: "play none none none" },
      });
      ctaTl
        .fromTo(".cta-line-tl", { width: 0 }, { width: "35%", duration: 0.8 })
        .fromTo(".cta-line-tr", { width: 0 }, { width: "35%", duration: 0.8 }, "<")
        .fromTo(".cta-line-bl", { width: 0 }, { width: "35%", duration: 0.8 }, "<")
        .fromTo(".cta-line-br", { width: 0 }, { width: "35%", duration: 0.8 }, "<")
        .fromTo(".cta-main-text", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6 }, 0.4)
        .fromTo(".cta-button-area", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, 0.7);

    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainRef} className="relative min-h-screen overflow-x-hidden" style={{ backgroundColor: C.bg }}>

      <div className="scroll-progress-track" />
      <div className="scroll-progress-dot" />

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300`}
        style={{ backgroundColor: scrolled ? "rgba(8,8,15,0.92)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", borderBottom: scrolled ? `1px solid ${C.cardBorder}` : "none" }}
        data-testid="nav-main"
      >
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between gap-4 h-16 md:h-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.matrix}, ${C.silverBright})` }}>
              <Bot className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-black tracking-tight title-font" style={{ color: C.silverBright, textShadow: `0 0 20px rgba(0,255,65,0.3)` }} data-testid="text-logo">
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
              <button key={n.id} onClick={() => scrollTo(n.id)} className="transition-colors hover:text-white" style={{ color: C.muted }} data-testid={`nav-${n.id}`}>
                {n.label}
              </button>
            ))}
          </div>
          <Button
            onClick={() => scrollTo("forms")}
            className="px-6 py-2 rounded-xl font-semibold hover:scale-105 transition-all text-sm"
            style={{ background: `linear-gradient(135deg, ${C.matrix}, ${C.silverBright})`, color: "#000" }}
            data-testid="button-nav-cta"
          >
            <Zap className="w-4 h-4 mr-1" /> GET YOUR AGENT
          </Button>
        </div>
      </nav>

      <section id="hero" className="relative h-screen overflow-hidden" data-testid="section-hero">
        <div className="absolute inset-0 z-0 opacity-40">
          <MatrixRain />
        </div>

        <div className="scan-line absolute left-0 right-0 h-[2px] z-30" style={{ background: `linear-gradient(90deg, transparent, ${C.matrix}, ${C.silverBright}, transparent)`, boxShadow: `0 0 30px ${C.matrix}` }} />

        <div className="noise-overlay absolute inset-0 z-20 pointer-events-none" style={{ background: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC44IiBudW1PY3RhdmVzPSI0IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI24pIiBvcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')", mixBlendMode: "overlay" }} />

        <div className="hero-content-wrapper absolute inset-0 flex items-center z-10">
          <div className="max-w-7xl mx-auto w-full px-5 relative">

            <div className="max-w-3xl mx-auto lg:mx-0 text-center lg:text-left">
              <div className="hero-pill inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 matrix-card" style={{ opacity: 0 }}>
                <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: C.matrix }} />
                <span className="uppercase text-[10px] tracking-[3px] font-mono" style={{ color: C.silver }}>LIVE AI AGENTS • 24/7 • ZERO BURNOUT</span>
              </div>

              <div className="title-font mb-6" style={{ fontSize: "clamp(2.2rem, 5.5vw, 4.5rem)", lineHeight: 1.05, fontWeight: 900 }}>
                <span className="hero-line-1 block" style={{ opacity: 0, color: C.silverBright }}>WE BUILD</span>
                <span className="hero-line-2 block matrix-gradient-text" style={{ opacity: 0 }}>AI AGENTS</span>
                <span className="hero-line-3 block" style={{ opacity: 0, color: C.silverBright }}>THAT RUN YOUR</span>
                <span className="hero-line-4 block" style={{ opacity: 0, color: C.white }}>EMPIRE</span>
              </div>

              <div className="hero-body-text max-w-[520px] mb-10 leading-relaxed mx-auto lg:mx-0" style={{ fontSize: "clamp(0.95rem, 2vw, 1.15rem)", opacity: 0, color: C.muted }}>
                Custom AI that answers calls, books appointments, closes sales, trades crypto & stocks, posts content, and scales your business — built in under 30 minutes.
              </div>

              <div className="hero-cta-buttons flex flex-col sm:flex-row items-center lg:items-start gap-4" style={{ opacity: 0 }}>
                <Button
                  size="lg"
                  onClick={() => scrollTo("forms")}
                  className="px-10 py-6 text-lg font-bold rounded-2xl transition-all group"
                  style={{ background: `linear-gradient(135deg, ${C.silverBright}, ${C.white})`, color: "#000" }}
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
                  style={{ borderColor: `${C.matrix}50`, color: C.matrix }}
                  data-testid="button-hero-trading"
                >
                  SEE AI TRADING <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollTo("form-card-team")}
                  className="px-8 py-6 text-lg font-semibold border-2 rounded-2xl transition-all"
                  style={{ borderColor: `${C.silver}30`, color: C.silver }}
                  data-testid="button-hero-team"
                >
                  <Users className="w-4 h-4 mr-2" /> JOIN THE TEAM
                </Button>
              </div>

              <div className="hero-badges mt-10 flex gap-6 text-xs uppercase tracking-widest flex-wrap justify-center lg:justify-start" style={{ opacity: 0, color: C.muted }}>
                {["Instant Deploy", "Zero Coding", "100% Custom"].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5" style={{ color: C.matrix }} />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="boot-text absolute bottom-12 left-8 font-mono text-xs z-20" style={{ opacity: 0, color: C.matrixDim }}>
            <div>&gt; SYSTEM ONLINE</div>
            <div>&gt; AI BOT SETUP v4.2 INITIALIZED</div>
            <div>&gt; MATRIX PROTOCOL ACTIVE</div>
          </div>
        </div>

        <div className="scene-wipe absolute inset-0 z-40 pointer-events-none" style={{ background: `linear-gradient(90deg, transparent 0%, rgba(200,208,220,0.04) 45%, rgba(200,208,220,0.1) 50%, rgba(200,208,220,0.04) 55%, transparent 100%)` }} />
      </section>

      <section id="capabilities" className="relative" style={{ minHeight: "100vh" }} data-testid="section-capabilities">
        <div className="absolute top-0 left-0 right-0 z-10 px-8 pt-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-[4px] font-mono" style={{ color: C.muted }}>WHAT YOUR AI AGENT DOES</span>
            <span className="text-xs font-mono" style={{ color: C.matrix }}>{String(capIndex + 1).padStart(2, "0")} / {String(CAPABILITIES.length).padStart(2, "0")}</span>
          </div>
          <div className="max-w-7xl mx-auto h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${capProgress * 100}%`, background: `linear-gradient(90deg, ${C.matrix}, ${C.silverBright})` }} />
          </div>
        </div>

        <div className="relative h-screen flex items-center justify-center overflow-hidden">
          {CAPABILITIES.map((cap, i) => (
            <div
              key={cap.title}
              className={`cap-slide-${i} absolute inset-0 flex items-center px-8`}
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              <div className="max-w-7xl mx-auto w-full flex items-center gap-12">
                <div className="hidden lg:block absolute left-8 select-none pointer-events-none" style={{ fontSize: "clamp(120px, 25vw, 300px)", fontWeight: 900, opacity: 0.03, lineHeight: 1, fontFamily: "'Orbitron', sans-serif", color: C.silverBright }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="relative z-10 max-w-2xl lg:ml-[15%]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${C.matrix}10`, border: `1px solid ${C.matrix}25` }}>
                      <cap.icon className="w-8 h-8" style={{ color: C.matrix }} />
                    </div>
                    <div className="text-xs font-mono uppercase tracking-widest" style={{ color: C.silver }}>{cap.stat}</div>
                  </div>
                  <h3 className="title-font text-4xl md:text-5xl lg:text-6xl font-black mb-6" style={{ color: C.silverBright }}>{cap.title}</h3>
                  <p className="text-lg md:text-xl leading-relaxed max-w-lg" style={{ color: C.muted }}>{cap.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="terminal-section" className="relative" style={{ minHeight: "100vh" }} data-testid="section-terminal">
        <div className="term-content h-screen flex items-center justify-center overflow-hidden relative px-8">
          <div className="absolute inset-0 opacity-15">
            <MatrixRain />
          </div>
          <div className="relative z-10 w-full max-w-3xl">
            <div className="term-header text-center mb-10" style={{ opacity: 0 }}>
              <Cpu className="w-12 h-12 mx-auto mb-4" style={{ color: C.matrix }} />
              <h2 className="title-font text-3xl md:text-4xl font-black" style={{ color: C.silverBright }}>SYSTEM ARCHITECTURE</h2>
            </div>
            <div className="matrix-card rounded-2xl p-8 font-mono text-sm space-y-3 relative overflow-hidden" style={{ border: `1px solid ${C.matrix}20` }}>
              <div className="absolute top-0 left-0 right-0 h-8 flex items-center gap-2 px-4" style={{ background: `${C.matrix}08`, borderBottom: `1px solid ${C.matrix}15` }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f56" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ffbd2e" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: C.matrix }} />
                <span className="text-[10px] ml-2" style={{ color: C.muted }}>ai-agent-core.sys</span>
              </div>
              <div className="pt-8 space-y-2">
                <div className="term-line-0" style={{ opacity: 0 }}>
                  <span style={{ color: C.matrix }}>$</span> <span style={{ color: C.silver }}>init --model</span> <span style={{ color: C.silverBright }}>grok-3 claude-4 gpt-4o llama-3.3</span>
                </div>
                <div className="term-line-1" style={{ opacity: 0 }}>
                  <span style={{ color: C.matrix }}>$</span> <span style={{ color: C.silver }}>connect --voice</span> <span style={{ color: C.silverBright }}>twilio vapi bland</span>
                </div>
                <div className="term-line-2" style={{ opacity: 0 }}>
                  <span style={{ color: C.matrix }}>$</span> <span style={{ color: C.silver }}>connect --crm</span> <span style={{ color: C.silverBright }}>salesforce hubspot gohighlevel</span>
                </div>
                <div className="term-line-3" style={{ opacity: 0 }}>
                  <span style={{ color: C.matrix }}>$</span> <span style={{ color: C.silver }}>connect --exchange</span> <span style={{ color: C.silverBright }}>binance bybit coinbase</span>
                </div>
                <div className="term-line-4" style={{ opacity: 0 }}>
                  <span style={{ color: C.matrix }}>$</span> <span style={{ color: C.silver }}>deploy --mode</span> <span style={{ color: C.silverBright }}>autonomous --uptime 24/7</span>
                </div>
                <div className="term-line-5" style={{ opacity: 0 }}>
                  <span style={{ color: C.matrix }}>[OK]</span> <span style={{ color: C.silverBright }}>Agent deployed successfully. All systems operational.</span>
                </div>
              </div>
            </div>
            <div className="term-status text-center mt-8" style={{ opacity: 0 }}>
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full matrix-card">
                <Activity className="w-5 h-5" style={{ color: C.matrix }} />
                <span className="font-mono text-sm" style={{ color: C.silverBright }}>ALL SYSTEMS OPERATIONAL</span>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.matrix }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="agents" className="py-24 relative reveal-on-scroll" style={{ background: `linear-gradient(to bottom, ${C.bg}, rgba(10,12,20,1))` }} data-testid="section-agents">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="title-font text-4xl md:text-5xl lg:text-6xl font-black" style={{ color: C.silverBright }}>Your 24/7 AI Dream Team</h2>
            <p className="text-lg mt-4" style={{ color: C.muted }}>Each specialist is custom-trained for your exact business</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "LUNA", role: "Receptionist • Voice AI", accent: C.silverBright, message: "Hi! I just booked a consultation for your 2pm slot with Mr. Ramirez. He's pre-qualified and excited.", emoji: "👩‍💼" },
              { name: "ATLAS", role: "Sales Closer • Deal Maker", accent: C.silver, message: "Proposal sent and signed! $14,700 closed in 11 minutes. Next up is the $47k enterprise deal.", emoji: "🧔" },
              { name: "TRADER-X", role: "Crypto & Stocks Leverage Trader", accent: C.matrix, message: "14 new posts scheduled. Just opened 3x long on SOL at 142.87 — +4.2% in 47 seconds.", emoji: "📈" },
            ].map((agent) => (
              <div key={agent.name} className="matrix-card rounded-2xl overflow-hidden reveal-on-scroll" data-testid={`card-agent-${agent.name.toLowerCase()}`}>
                <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${agent.accent}, transparent)` }} />
                <div className="p-7">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-3xl" style={{ backgroundColor: `${agent.accent}08` }}>
                      {agent.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg title-font" style={{ color: agent.accent }}>{agent.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-mono" style={{ background: `${C.matrix}15`, color: C.matrix }}>
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.matrix }} /> ONLINE
                        </span>
                      </div>
                      <div className="text-xs" style={{ color: C.muted }}>{agent.role}</div>
                    </div>
                  </div>
                  <div className="rounded-xl p-4 text-sm leading-relaxed" style={{ background: "rgba(0,0,0,0.3)" }}>
                    <span style={{ color: agent.accent }} className="font-mono font-bold">{agent.name}:</span>{" "}
                    <span style={{ color: C.silver }}>{agent.message}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="trading" className="py-24 relative" data-testid="section-trading">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="reveal-on-scroll">
              <div className="uppercase tracking-[3px] text-xs mb-4 font-mono flex items-center gap-2" style={{ color: C.matrix }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.matrix }} />
                NEW • LIVE MARKET AGENTS
              </div>
              <h2 className="title-font text-4xl md:text-5xl lg:text-6xl font-black leading-none mb-6" style={{ color: C.silverBright }}>
                AI Trading Agents That
                <br />
                <span style={{ color: C.matrix }}>Actually Make Money</span>
              </h2>
              <p className="text-lg mb-10" style={{ color: C.silver }}>
                Stocks • Crypto • Futures • Options • 100x Leverage. 24/7 autonomous execution with risk management, backtesting, and real-time sentiment analysis.
              </p>

              <div className="space-y-6 mb-10">
                <LiveProfitCounter />
                <div className="flex items-center gap-5">
                  <div className="text-4xl md:text-5xl font-mono font-black" style={{ color: C.matrix }}>+318%</div>
                  <div>
                    <div className="font-semibold" style={{ color: C.silverBright }}>30-day avg return (backtested)</div>
                    <div className="text-xs" style={{ color: C.muted }}>BTC/ETH/SOL portfolios</div>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="text-4xl md:text-5xl font-mono font-black" style={{ color: C.silverBright }}>0.8s</div>
                  <div>
                    <div className="font-semibold" style={{ color: C.silverBright }}>Execution speed</div>
                    <div className="text-xs" style={{ color: C.muted }}>Binance, Bybit, Coinbase Advanced</div>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => scrollTo("forms")}
                className="px-8 py-5 font-bold text-lg rounded-2xl hover:scale-105 transition-all"
                style={{ background: `linear-gradient(135deg, ${C.matrix}, ${C.silverBright})`, color: "#000" }}
                data-testid="button-trading-cta"
              >
                <Bot className="w-5 h-5 mr-2" /> DEPLOY YOUR TRADING AGENT NOW
              </Button>
            </div>

            <div className="reveal-on-scroll">
              <div className="matrix-card rounded-2xl p-6 relative" style={{ border: `1px solid ${C.matrix}15` }}>
                <div className="rounded-xl p-5 font-mono text-sm mb-6" style={{ background: "rgba(0,0,0,0.4)" }}>
                  <div className="flex justify-between mb-2 items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.matrix }} />
                      <span className="font-bold" style={{ color: C.silverBright }}>TRADER-X LIVE</span>
                    </div>
                    <div className="font-bold" style={{ color: C.matrix }}>+6.42% today</div>
                  </div>
                  <div className="flex justify-between items-baseline mb-4 pt-1 pb-3" style={{ borderBottom: `1px solid ${C.matrix}15` }}>
                    <span className="text-xs" style={{ color: C.muted }}>Total Realized P&L</span>
                    <span className="font-black text-lg" style={{ color: C.matrix }}>+$9,847.31</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    {[
                      { trade: "Long SOL 3x @ 142.87", profit: "+$3,218" },
                      { trade: "Short ETH 5x @ 2,874", profit: "+$2,941" },
                      { trade: "Closed NVDA call @ 138", profit: "+$2,486" },
                      { trade: "BTC swing 2x long", profit: "+$1,202" },
                    ].map((t, i) => (
                      <div key={i} className="flex justify-between py-2" style={{ borderBottom: i < 3 ? `1px solid rgba(255,255,255,0.03)` : "none" }}>
                        <span style={{ color: C.muted }}>{t.trade}</span>
                        <span className="font-bold" style={{ color: C.matrix }}>{t.profit} profit</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-48 rounded-xl flex items-center justify-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${C.matrixDark}30, transparent)`, border: `1px solid ${C.matrix}15` }}>
                  <LiveChart />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="journey" className="relative" style={{ minHeight: "100vh" }} data-testid="section-journey">
        <div className="h-screen flex flex-col justify-center px-8">
          <div className="max-w-5xl mx-auto w-full">
            <div className="text-center mb-16">
              <span className="text-xs uppercase tracking-[4px] font-mono" style={{ color: C.muted }}>HOW IT WORKS</span>
              <h2 className="title-font text-4xl md:text-5xl font-black mt-4" style={{ color: C.silverBright }}>
                From idea to live AI agent in <span style={{ color: C.matrix }}>30 minutes</span>
              </h2>
            </div>

            <div className="relative">
              <div className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2" style={{ background: "rgba(255,255,255,0.03)" }} />
              <div className="journey-line-progress absolute top-1/2 left-0 h-[2px] -translate-y-1/2" style={{ background: `linear-gradient(90deg, ${C.matrix}, ${C.silverBright}, ${C.matrix})`, width: "0%", boxShadow: `0 0 15px ${C.matrix}30` }} />

              <div className="relative flex justify-between items-start pt-2">
                {JOURNEY_STEPS.map((step, i) => {
                  const nodeColor = i % 2 === 0 ? C.matrix : C.silverBright;
                  return (
                    <div key={i} className="flex flex-col items-center" style={{ width: `${100 / JOURNEY_STEPS.length}%` }}>
                      <div className={`journey-node-${i} w-5 h-5 rounded-full border-2 mb-6`} style={{ borderColor: nodeColor, background: `${nodeColor}20`, boxShadow: `0 0 15px ${nodeColor}40`, opacity: 0 }} />
                      <div className={`journey-card-${i} text-center px-2`} style={{ opacity: 0 }}>
                        <div className="text-sm font-bold title-font mb-2" style={{ color: nodeColor }}>{step.title}</div>
                        <p className="text-xs leading-relaxed max-w-[180px] mx-auto" style={{ color: C.muted }}>{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="forms" className="py-24 relative" data-testid="section-forms">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 reveal-on-scroll">
            <h2 className="title-font text-4xl md:text-5xl font-black mb-4" style={{ color: C.silverBright }}>Ready to 10x Your Business?</h2>
            <p className="text-lg" style={{ color: C.muted }}>Choose your path and let's build something incredible</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="matrix-card rounded-2xl p-8 h-full reveal-on-scroll" style={{ borderColor: `${C.silverBright}15` }} data-testid="form-card-general">
              <InquiryForm
                type="general"
                title="Custom AI Agent"
                subtitle="Tell us what you need and we'll build it"
                accentColor={C.silverBright}
                buttonColor={`linear-gradient(135deg, ${C.silverBright}, ${C.white})`}
                buttonText="BUILD MY AGENT — FREE 30-MIN SETUP"
                fields={[
                  { name: "name", label: "Your Name", icon: Users, placeholder: "John Smith", required: true },
                  { name: "email", label: "Email", icon: Mail, type: "email", placeholder: "you@email.com", required: true },
                  { name: "phone", label: "Phone", icon: Phone, type: "tel", placeholder: "+1 (555) 123-4567", required: true },
                  { name: "business", label: "Business Type", icon: Briefcase, placeholder: "Select your industry", options: ["Real Estate", "Coaching / Consulting", "E-commerce", "Healthcare", "Home Services", "Legal", "Other"] },
                  { name: "needs", label: "What should your AI do?", icon: Bot, type: "textarea", placeholder: "Answer calls, book appointments, follow up leads..." },
                ]}
              />
            </div>

            <div className="matrix-card rounded-2xl p-8 h-full relative overflow-hidden reveal-on-scroll" style={{ borderColor: `${C.matrix}15` }} data-testid="form-card-trading">
              <div className="absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-bl-lg" style={{ background: C.matrix, color: "#000" }}>New</div>
              <InquiryForm
                type="trading"
                title="AI Trading Agent"
                subtitle="Autonomous trading for stocks, crypto & leverage"
                accentColor={C.matrix}
                buttonColor={`linear-gradient(135deg, ${C.matrix}, ${C.matrixDim})`}
                buttonText="DEPLOY TRADING AGENT NOW"
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

            <div id="form-card-team" className="matrix-card rounded-2xl p-8 h-full reveal-on-scroll" style={{ borderColor: `${C.silver}15` }} data-testid="form-card-team">
              <InquiryForm
                type="team"
                title="Join Our Team"
                subtitle="Earn 30% lifetime commission on every referral"
                accentColor={C.silver}
                buttonColor={`linear-gradient(135deg, ${C.silver}, ${C.silverBright})`}
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
              <Button variant="outline" size="lg" className="border-white/10 bg-white/[0.02]" style={{ color: C.muted }}>
                <MessageSquare className="w-4 h-4 mr-2" style={{ color: C.silver }} /> Questions? Text (754) 250-4912
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="py-20 px-5" data-testid="section-stats">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { target: 500, suffix: "+", label: "Agents Deployed", color: C.matrix },
              { target: 50, suffix: "+", label: "Industries", color: C.silverBright },
              { target: 24, suffix: "/7/365", label: "Uptime", color: C.matrix },
              { target: 30, suffix: " min", label: "Setup Time", color: C.silverBright },
            ].map((s, i) => (
              <div key={s.label} className="stat-slam matrix-card rounded-2xl p-6 text-center will-change-transform" data-testid={`card-stat-${i}`}>
                <div className="title-font text-3xl md:text-4xl font-black mb-2" style={{ color: s.color }}>
                  <CountUpOnScroll target={s.target} suffix={s.suffix} />
                </div>
                <p className="text-xs uppercase tracking-widest" style={{ color: C.muted }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-5" data-testid="section-faq">
        <div className="max-w-[700px] mx-auto">
          <div className="text-center mb-14 reveal-on-scroll">
            <h2 className="title-font text-3xl md:text-4xl font-black mb-4" style={{ color: C.silverBright }}>Frequently Asked Questions</h2>
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

      <section id="final-cta" className="py-24 px-5 relative overflow-hidden" data-testid="section-cta">
        <div className="absolute inset-0 opacity-10">
          <MatrixRain />
        </div>

        <div className="cta-line-tl absolute top-1/2 left-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${C.matrix}20)`, width: 0 }} />
        <div className="cta-line-tr absolute top-1/2 right-0 h-[1px]" style={{ background: `linear-gradient(270deg, transparent, ${C.matrix}20)`, width: 0 }} />
        <div className="cta-line-bl absolute top-[60%] left-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.04))`, width: 0 }} />
        <div className="cta-line-br absolute top-[60%] right-0 h-[1px]" style={{ background: `linear-gradient(270deg, transparent, rgba(255,255,255,0.04))`, width: 0 }} />

        <div className="relative z-10 max-w-[700px] mx-auto text-center">
          <div className="cta-main-text" style={{ opacity: 0 }}>
            <h2 className="title-font text-3xl md:text-5xl font-black mb-6" style={{ color: C.silverBright }}>
              Stop Losing Leads.
              <br />
              <span className="matrix-gradient-text">Put AI to Work Today.</span>
            </h2>
            <p className="mb-10 max-w-[500px] mx-auto leading-relaxed text-lg" style={{ color: C.muted }}>
              Custom AI agent, built and deployed in 30 minutes. No code. No waiting. No burnout.
            </p>
          </div>
          <div className="cta-button-area flex flex-col items-center gap-5" style={{ opacity: 0 }}>
            <Button
              size="lg"
              onClick={() => scrollTo("forms")}
              className="px-12 py-6 text-lg font-bold rounded-2xl hover:scale-105 transition-all"
              style={{ background: `linear-gradient(135deg, ${C.matrix}, ${C.silverBright})`, color: "#000" }}
              data-testid="button-cta-final"
            >
              <Bot className="w-5 h-5 mr-2" /> BUILD MY CUSTOM AI AGENT NOW
            </Button>
            <a href="sms:+17542504912" data-testid="link-cta-text">
              <Button variant="outline" className="border-white/10 bg-white/[0.02]" style={{ color: C.muted }}>
                <MessageSquare className="w-4 h-4 mr-2" style={{ color: C.silver }} /> Questions? Text (754) 250-4912
              </Button>
            </a>
          </div>
        </div>
      </section>

      <footer className="py-8 px-5" style={{ borderTop: `1px solid ${C.cardBorder}` }} data-testid="footer">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.matrix}, ${C.silverBright})` }}>
                <Bot className="w-4 h-4 text-black" />
              </div>
              <span className="font-bold text-sm title-font" style={{ color: C.silverBright, textShadow: `0 0 15px ${C.matrix}30` }}>AI BOT SETUP</span>
            </div>
            <div className="flex gap-6 text-xs flex-wrap justify-center" style={{ color: C.muted }}>
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
            <p className="text-xs title-font" style={{ color: C.muted }}>aibotsetup.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
