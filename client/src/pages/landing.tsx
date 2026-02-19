import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight, Check, Bot, ChevronDown, Phone, Mail,
  MessageSquare, Users, X, CheckCircle, Loader2, Calendar,
  Briefcase, Link, Zap, Shield, Globe, Sparkles,
} from "lucide-react";

const GLITCH_CHARS = "░▒▓█╔╗║═01∆Ωλ@#$%&*<>{}[]";
const COLORS = {
  bg: "#07070f",
  cyan: "#00e5ff",
  purple: "#a855f7",
  green: "#22c55e",
  red: "#ff0040",
  text: "#ffffff",
  muted: "#94a3b8",
};

function AIEntityFace({ reactToCTA = false }: { reactToCTA?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const lastMoveRef = useRef(Date.now());
  const animRef = useRef(0);
  const blinkRef = useRef({ active: false, progress: 0, nextBlink: 3000 + Math.random() * 5000 });
  const tiltRef = useRef(0);
  const glitchRef = useRef({ active: false, timer: 10000 + Math.random() * 5000 });
  const scanRef = useRef(0);
  const breathRef = useRef(0);
  const nodRef = useRef({ active: false, progress: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
      lastMoveRef.current = Date.now();
    };
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("resize", resize);

    let paused = false;
    const onVis = () => { paused = document.hidden; };
    document.addEventListener("visibilitychange", onVis);

    let elapsed = 0;
    let lastTime = performance.now();

    const drawFace = (w: number, h: number, dt: number) => {
      elapsed += dt;
      breathRef.current += dt * 0.001;
      const breath = Math.sin(breathRef.current) * 0.02 + 1;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const cx = w / 2;
      const cy = h * 0.45;
      const scale = Math.min(w, h) * 0.0028 * breath;
      const idleTime = Date.now() - lastMoveRef.current;

      if (idleTime > 3000) {
        tiltRef.current += (Math.sin(elapsed * 0.0003) * 0.06 - tiltRef.current) * 0.02;
      } else {
        tiltRef.current *= 0.95;
      }

      if (reactToCTA) {
        nodRef.current.active = true;
      }
      if (nodRef.current.active) {
        nodRef.current.progress += dt * 0.003;
        if (nodRef.current.progress > Math.PI * 2) {
          nodRef.current.active = false;
          nodRef.current.progress = 0;
        }
      }
      const nodOffset = nodRef.current.active ? Math.sin(nodRef.current.progress) * 4 : 0;

      blinkRef.current.nextBlink -= dt;
      if (blinkRef.current.nextBlink <= 0) {
        blinkRef.current.active = true;
        blinkRef.current.progress = 0;
        blinkRef.current.nextBlink = 3000 + Math.random() * 5000;
      }
      if (blinkRef.current.active) {
        blinkRef.current.progress += dt * 0.008;
        if (blinkRef.current.progress >= 1) blinkRef.current.active = false;
      }
      const blinkAmount = blinkRef.current.active ? Math.sin(blinkRef.current.progress * Math.PI) : 0;

      glitchRef.current.timer -= dt;
      if (glitchRef.current.timer <= 0) {
        glitchRef.current.active = true;
        glitchRef.current.timer = 10000 + Math.random() * 5000;
        setTimeout(() => { glitchRef.current.active = false; }, 100 + Math.random() * 150);
      }

      scanRef.current = (scanRef.current + dt * 0.08) % (h * 1.5);

      const glitchOff = glitchRef.current.active ? (Math.random() - 0.5) * 8 : 0;

      ctx.save();
      ctx.translate(cx + glitchOff, cy + nodOffset);
      ctx.rotate(tiltRef.current);

      const glow = 0.4 + Math.sin(breathRef.current * 2) * 0.15 + (reactToCTA ? 0.3 : 0);
      ctx.strokeStyle = `rgba(0, 229, 255, ${glow})`;
      ctx.lineWidth = 1.2;
      ctx.shadowColor = COLORS.cyan;
      ctx.shadowBlur = reactToCTA ? 20 : 10;

      const headW = 80 * scale;
      const headH = 100 * scale;
      const jawW = 60 * scale;

      ctx.beginPath();
      ctx.moveTo(-headW, -headH * 0.6);
      ctx.lineTo(-headW * 1.1, -headH * 0.2);
      ctx.lineTo(-headW, headH * 0.1);
      ctx.lineTo(-jawW, headH * 0.5);
      ctx.lineTo(-jawW * 0.3, headH * 0.65);
      ctx.lineTo(0, headH * 0.7);
      ctx.lineTo(jawW * 0.3, headH * 0.65);
      ctx.lineTo(jawW, headH * 0.5);
      ctx.lineTo(headW, headH * 0.1);
      ctx.lineTo(headW * 1.1, -headH * 0.2);
      ctx.lineTo(headW, -headH * 0.6);
      ctx.lineTo(headW * 0.7, -headH * 0.9);
      ctx.lineTo(headW * 0.3, -headH);
      ctx.lineTo(-headW * 0.3, -headH);
      ctx.lineTo(-headW * 0.7, -headH * 0.9);
      ctx.closePath();
      ctx.stroke();

      const crossLines: [number, number, number, number][] = [
        [-headW * 0.8, -headH * 0.5, headW * 0.8, -headH * 0.5],
        [-headW * 0.9, -headH * 0.15, headW * 0.9, -headH * 0.15],
        [-headW * 0.7, headH * 0.2, headW * 0.7, headH * 0.2],
        [-headW * 0.4, headH * 0.45, headW * 0.4, headH * 0.45],
        [0, -headH, 0, headH * 0.7],
      ];
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = `rgba(0, 229, 255, ${glow * 0.3})`;
      crossLines.forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      const eyeY = -headH * 0.18;
      const eyeSpacing = headW * 0.45;
      const eyeW = headW * 0.32;
      const eyeH = headH * 0.15 * (1 - blinkAmount * 0.9);
      const lookX = (mx - 0.5) * eyeW * 0.5;
      const lookY = (my - 0.5) * eyeH * 0.4;

      const eyeGlow = reactToCTA ? 1 : 0.7 + Math.sin(breathRef.current * 3) * 0.1;
      ctx.strokeStyle = `rgba(0, 229, 255, ${eyeGlow})`;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = reactToCTA ? 25 : 12;

      [-1, 1].forEach(side => {
        const ex = side * eyeSpacing;
        ctx.beginPath();
        ctx.moveTo(ex - eyeW, eyeY);
        ctx.lineTo(ex - eyeW * 0.3, eyeY - eyeH);
        ctx.lineTo(ex + eyeW * 0.3, eyeY - eyeH);
        ctx.lineTo(ex + eyeW, eyeY);
        ctx.lineTo(ex + eyeW * 0.3, eyeY + eyeH);
        ctx.lineTo(ex - eyeW * 0.3, eyeY + eyeH);
        ctx.closePath();
        ctx.stroke();

        const pupilR = eyeH * 0.3;
        ctx.fillStyle = `rgba(0, 229, 255, ${eyeGlow})`;
        ctx.beginPath();
        ctx.arc(ex + lookX, eyeY + lookY, pupilR, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.lineWidth = 0.8;
      ctx.strokeStyle = `rgba(0, 229, 255, ${glow * 0.4})`;
      ctx.beginPath();
      ctx.moveTo(-jawW * 0.3, headH * 0.35);
      ctx.lineTo(jawW * 0.3, headH * 0.35);
      ctx.stroke();

      ctx.strokeStyle = `rgba(0, 229, 255, ${glow * 0.3})`;
      ctx.lineWidth = 0.5;
      [
        [-headW * 0.6, headH * 0.05, -headW * 1.4, headH * 0.05],
        [headW * 0.6, headH * 0.05, headW * 1.4, headH * 0.05],
        [-headW * 0.5, -headH * 0.7, -headW * 1.3, -headH * 0.85],
        [headW * 0.5, -headH * 0.7, headW * 1.3, -headH * 0.85],
        [0, headH * 0.7, 0, headH * 1.1],
      ].forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.fillStyle = `rgba(0, 229, 255, ${glow * 0.5})`;
        ctx.beginPath();
        ctx.arc(x2, y2, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();

      const scanY = scanRef.current - h * 0.25;
      if (scanY > -10 && scanY < h) {
        ctx.fillStyle = `rgba(0, 229, 255, 0.03)`;
        ctx.fillRect(0, scanY, w, 3);
      }
    };

    const draw = () => {
      if (paused) { animRef.current = requestAnimationFrame(draw); return; }
      const now = performance.now();
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawFace(w, h, dt);
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      cancelAnimationFrame(animRef.current);
    };
  }, [reactToCTA]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

function MiniAIFace({ color, size = 64 }: { color: string; size?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [eyeOff, setEyeOff] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / 200));
      const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / 200));
      setEyeOff({ x: dx * 3, y: dy * 2 });
    };
    window.addEventListener("mousemove", handler);

    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3000 + Math.random() * 4000);

    return () => {
      window.removeEventListener("mousemove", handler);
      clearInterval(blinkInterval);
    };
  }, []);

  const colors: Record<string, { border: string; bg: string; pupil: string }> = {
    teal: { border: "border-cyan-500/40", bg: "bg-cyan-500/10", pupil: "bg-cyan-400" },
    purple: { border: "border-violet-500/40", bg: "bg-violet-500/10", pupil: "bg-violet-400" },
    green: { border: "border-green-500/40", bg: "bg-green-500/10", pupil: "bg-green-400" },
    orange: { border: "border-orange-500/40", bg: "bg-orange-500/10", pupil: "bg-orange-400" },
  };
  const c = colors[color] || colors.teal;
  const eyeH = blink ? 1 : 8;

  return (
    <div ref={ref} className={`relative ${c.border} border ${c.bg} rounded-md flex items-center justify-center`} style={{ width: size, height: size }}>
      <div className="flex gap-3 items-center">
        {[-1, 1].map(side => (
          <div
            key={side}
            className="relative bg-white/10 rounded-sm overflow-hidden"
            style={{ width: 14, height: eyeH, transition: "height 0.1s" }}
          >
            {!blink && (
              <div
                className={`absolute rounded-full ${c.pupil}`}
                style={{
                  width: 4, height: 4,
                  left: 5 + eyeOff.x,
                  top: 2 + eyeOff.y,
                  transition: "left 0.15s, top 0.15s",
                }}
              />
            )}
          </div>
        ))}
      </div>
      <div className="absolute -inset-1 rounded-md opacity-0 hover:opacity-100 transition-opacity" style={{ boxShadow: `0 0 20px ${color === "teal" ? COLORS.cyan : color === "purple" ? COLORS.purple : color === "green" ? COLORS.green : "#fb923c"}40` }} />
    </div>
  );
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function DecodeText({ text, className = "", delay = 0, as: Tag = "span" }: {
  text: string; className?: string; delay?: number; as?: "span" | "h1" | "h2" | "h3" | "p";
}) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(text.split("").map(() => GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]));
  const [resolved, setResolved] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true });
  const startedRef = useRef(false);

  useEffect(() => {
    if (reduced) { setDisplay(text.split("")); setResolved(true); return; }
    if (!isInView || startedRef.current) return;
    startedRef.current = true;
    const chars = text.split("");
    const current = chars.map(() => GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]);
    setDisplay([...current]);

    const timer = setTimeout(() => {
      let idx = 0;
      const scrambleInterval = setInterval(() => {
        current.forEach((_, i) => {
          if (i > idx) current[i] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        });
        setDisplay([...current]);
      }, 40);

      const resolveInterval = setInterval(() => {
        if (idx < chars.length) {
          current[idx] = chars[idx];
          setDisplay([...current]);
          idx++;
        } else {
          clearInterval(resolveInterval);
          clearInterval(scrambleInterval);
          setResolved(true);
        }
      }, 60);

      return () => {
        clearInterval(scrambleInterval);
        clearInterval(resolveInterval);
      };
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [isInView, text, delay]);

  useEffect(() => {
    if (!resolved) return;
    const chars = text.split("");
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * chars.length);
      if (chars[idx] === " ") return;
      const arr = [...chars];
      arr[idx] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
      setDisplay(arr);
      setTimeout(() => setDisplay([...chars]), 100);
    }, 5000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [resolved, text]);

  return (
    <Tag ref={ref as any} className={`font-mono ${className}`}>
      {display.map((ch, i) => (
        <span key={i} style={{ color: !resolved && ch !== text[i] ? COLORS.cyan : undefined, transition: "color 0.1s" }}>
          {ch}
        </span>
      ))}
    </Tag>
  );
}

function GlitchWord({ children, text, className = "" }: { children: React.ReactNode; text?: string; className?: string }) {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 150);
    }, 4000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      {glitching && text && (
        <>
          <span className="absolute inset-0" style={{ color: COLORS.cyan, clipPath: "inset(0 0 50% 0)", transform: "translateX(2px)" }} aria-hidden="true">{text}</span>
          <span className="absolute inset-0" style={{ color: COLORS.red, clipPath: "inset(50% 0 0 0)", transform: "translateX(-2px)" }} aria-hidden="true">{text}</span>
        </>
      )}
    </span>
  );
}

function TypewriterText({ text, className = "", delay = 0, speed = 30 }: { text: string; className?: string; delay?: number; speed?: number }) {
  const reduced = useReducedMotion();
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (reduced) { setDisplayed(text); return; }
    if (!isInView) return;
    const timer = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [isInView, delay, reduced, text]);

  useEffect(() => {
    if (reduced || !started) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [started, text, speed, reduced]);

  return (
    <span ref={ref} className={className}>
      {reduced ? text : displayed}
      {!reduced && started && displayed.length < text.length && (
        <span className="inline-block w-2 h-4 ml-0.5 align-middle animate-pulse" style={{ backgroundColor: COLORS.cyan }} />
      )}
    </span>
  );
}

function FAQTypewriter({ answer }: { answer: string }) {
  const [displayed, setDisplayed] = useState("");
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(answer.slice(0, i + 1));
      i++;
      if (i >= answer.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [answer]);

  return (
    <span className="font-mono text-sm text-slate-300 leading-relaxed">
      {displayed}
      {displayed.length < answer.length && (
        <span className="inline-block w-2 h-3.5 ml-0.5 align-middle animate-pulse" style={{ backgroundColor: COLORS.cyan }} />
      )}
    </span>
  );
}

function CountUp({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const [flash, setFlash] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
      else {
        setFlash(true);
        setTimeout(() => setFlash(false), 200);
      }
    };
    tick();
  }, [isInView, target]);

  return (
    <span ref={ref} className={flash ? "text-cyan-300" : ""} style={{ transition: "color 0.2s" }}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

function CircuitBorderButton({ children, onClick, className = "", testId }: {
  children: React.ReactNode; onClick?: () => void; className?: string; testId?: string;
}) {
  return (
    <div className="relative group inline-block">
      <div className="absolute -inset-[1px] rounded-md overflow-hidden pointer-events-none">
        <div className="absolute w-20 h-[2px] animate-circuit-trace" style={{ background: `linear-gradient(90deg, transparent, ${COLORS.green}, transparent)` }} />
      </div>
      <Button onClick={onClick} className={className} data-testid={testId}>
        {children}
      </Button>
    </div>
  );
}

function RevealSection({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Card
      className="bg-white/[0.02] backdrop-blur-xl border-white/[0.06] overflow-visible cursor-pointer hover-elevate"
      onClick={() => setOpen(!open)}
      data-testid={`faq-${question.slice(0, 20).toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex items-center justify-between gap-3 p-5">
        <span className="font-semibold text-white text-sm">{question}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <ChevronDown className="w-4 h-4 shrink-0" style={{ color: COLORS.cyan }} />
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
            <div className="px-5 pb-5 flex items-start gap-3">
              <Bot className="w-4 h-4 shrink-0 mt-0.5" style={{ color: COLORS.cyan }} />
              <FAQTypewriter answer={answer} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function Landing() {
  const [, navigate] = useLocation();
  const [showSignup, setShowSignup] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupMessage, setSignupMessage] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [ctaHover, setCtaHover] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const resetForm = () => {
    setShowSignup(false);
    setSignupSuccess(false);
    setSignupName("");
    setSignupEmail("");
    setSignupPhone("");
    setSignupMessage("");
  };

  const signupMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/signups", {
        name: signupName,
        email: signupEmail,
        phone: signupPhone,
        message: signupMessage || undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      setSignupSuccess(true);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ backgroundColor: COLORS.bg }}>

      {/* ═══════════ SIGNUP MODAL ═══════════ */}
      <AnimatePresence>
        {showSignup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => { if (!signupSuccess) setShowSignup(false); }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[480px]"
            >
              <div className="absolute -inset-1 rounded-md bg-gradient-to-r from-green-500/30 via-cyan-500/20 to-green-500/30 blur-lg" />
              <Card className="relative p-8 border-green-500/20" style={{ backgroundColor: "#0d0d1f" }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetForm}
                  className="absolute top-3 right-3 text-slate-400"
                  data-testid="button-close-signup"
                >
                  <X className="w-4 h-4" />
                </Button>

                <AnimatePresence mode="wait">
                  {signupSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-4"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
                      >
                        <CheckCircle className="w-16 h-16 mx-auto mb-5" style={{ color: COLORS.green }} />
                      </motion.div>
                      <h3 className="text-2xl font-bold mb-3" style={{ color: "#86efac" }} data-testid="text-signup-success">We Got Your Request!</h3>
                      <p className="text-slate-400 leading-relaxed mb-2">
                        Thanks {signupName ? signupName.split(" ")[0] : ""}! We'll be in touch shortly.
                      </p>
                      <p className="text-sm text-slate-400 leading-relaxed mb-6">
                        We'll reach out to <strong style={{ color: "#86efac" }}>{signupEmail}</strong> or <strong style={{ color: "#86efac" }}>{signupPhone}</strong> to discuss your AI agent.
                      </p>
                      <Card className="p-4 border-green-500/15" style={{ backgroundColor: "rgba(34,197,94,0.05)" }}>
                        <div className="flex items-start gap-3">
                          <Bot className="w-5 h-5 shrink-0 mt-0.5" style={{ color: COLORS.green }} />
                          <div className="text-left">
                            <p className="text-sm font-semibold text-white mb-1">What happens next?</p>
                            <ul className="text-xs text-slate-400 space-y-1">
                              <li className="flex items-center gap-2"><Check className="w-3 h-3" style={{ color: COLORS.green }} /> We review your request within 24 hours</li>
                              <li className="flex items-center gap-2"><Check className="w-3 h-3" style={{ color: COLORS.green }} /> We'll reach out to discuss your needs</li>
                              <li className="flex items-center gap-2"><Check className="w-3 h-3" style={{ color: COLORS.green }} /> Get a custom quote for your AI agent</li>
                              <li className="flex items-center gap-2"><Check className="w-3 h-3" style={{ color: COLORS.green }} /> Your agent gets built and goes live</li>
                            </ul>
                          </div>
                        </div>
                      </Card>
                      <Button
                        variant="outline"
                        onClick={resetForm}
                        className="mt-6 border-green-500/30"
                        style={{ color: "#86efac" }}
                        data-testid="button-signup-done"
                      >
                        Got it!
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="text-center mb-6">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", damping: 15, stiffness: 200 }}
                          className="w-16 h-16 rounded-md border border-green-500/20 flex items-center justify-center mx-auto mb-4"
                          style={{ backgroundColor: "rgba(34,197,94,0.08)" }}
                        >
                          <Bot className="w-8 h-8" style={{ color: COLORS.green }} />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-white mb-2" data-testid="heading-signup-modal">Get Your AI Agent</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          Tell us what you need and we'll build a custom AI agent for your business.
                        </p>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div>
                          <Label className="text-xs uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color: COLORS.cyan }}>
                            <Users className="w-3.5 h-3.5" /> Your Name
                          </Label>
                          <Input
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            type="text"
                            placeholder="John Smith"
                            className="bg-white/[0.03] border-white/[0.08]"
                            data-testid="input-signup-name"
                          />
                        </div>
                        <div>
                          <Label className="text-xs uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color: COLORS.cyan }}>
                            <Mail className="w-3.5 h-3.5" /> Email Address
                          </Label>
                          <Input
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            type="email"
                            placeholder="you@email.com"
                            className="bg-white/[0.03] border-white/[0.08]"
                            data-testid="input-signup-email"
                          />
                        </div>
                        <div>
                          <Label className="text-xs uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color: COLORS.cyan }}>
                            <Phone className="w-3.5 h-3.5" /> Phone Number
                          </Label>
                          <Input
                            value={signupPhone}
                            onChange={(e) => setSignupPhone(e.target.value)}
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            className="bg-white/[0.03] border-white/[0.08]"
                            data-testid="input-signup-phone"
                          />
                        </div>
                        <div>
                          <Label className="text-xs uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color: COLORS.cyan }}>
                            <MessageSquare className="w-3.5 h-3.5" /> What do you need? (optional)
                          </Label>
                          <Textarea
                            value={signupMessage}
                            onChange={(e) => setSignupMessage(e.target.value)}
                            placeholder="e.g. I need an AI receptionist that answers calls..."
                            className="bg-white/[0.03] border-white/[0.08] resize-none"
                            rows={3}
                            data-testid="input-signup-message"
                          />
                        </div>
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 border-green-400/40 text-white font-bold"
                        onClick={() => signupMutation.mutate()}
                        disabled={!signupName || !signupEmail || !signupPhone || signupMutation.isPending}
                        data-testid="button-submit-signup"
                      >
                        {signupMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <ArrowRight className="w-4 h-4 mr-2" />
                        )}
                        {signupMutation.isPending ? "Submitting..." : "Get My AI Agent"}
                      </Button>

                      <p className="text-[11px] text-slate-500 text-center mt-3">
                        No commitment required. We'll reach out to discuss your project.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ NAVBAR ═══════════ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? "backdrop-blur-xl border-b border-white/[0.06]" : ""
        }`}
        style={{ backgroundColor: scrolled ? "rgba(7,7,15,0.85)" : "transparent" }}
        data-testid="nav-main"
      >
        <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between gap-4 h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: "rgba(0,229,255,0.12)", border: "1px solid rgba(0,229,255,0.2)" }}>
              <Bot className="w-4.5 h-4.5" style={{ color: COLORS.cyan }} />
            </div>
            <span className="text-lg font-bold font-mono tracking-tight" style={{ color: COLORS.cyan }}>
              CLAWD
            </span>
          </div>
          <div className="relative group">
            <div className="absolute -inset-[1px] rounded-md overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute w-16 h-[2px] animate-circuit-trace" style={{ background: `linear-gradient(90deg, transparent, ${COLORS.green}, transparent)` }} />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 text-white bg-white/[0.03]"
              onClick={() => setShowSignup(true)}
              data-testid="button-nav-cta"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 pb-20 px-5" data-testid="section-hero">
        <div className="absolute inset-0 overflow-hidden">
          <AIEntityFace reactToCTA={ctaHover} />
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{ backgroundColor: `rgba(0,229,255,${0.1 + Math.random() * 0.15})`, left: `${10 + Math.random() * 80}%`, top: `${10 + Math.random() * 80}%` }}
              animate={{ y: [0, -20, 0], opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 5 }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-[900px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge variant="outline" className="mb-8 border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 text-xs tracking-widest uppercase font-mono" style={{ color: COLORS.cyan }}>
              <Sparkles className="w-3 h-3 mr-2" />
              AI Agents for Any Business
            </Badge>
          </motion.div>

          <div className="mb-8" style={{ fontSize: "clamp(2.2rem, 6.5vw, 4.5rem)", lineHeight: 1.05, fontWeight: 800 }}>
            <DecodeText
              text="We Build "
              as="span"
              className="text-white"
              delay={0.3}
            />
            <GlitchWord text="AI Agents" className="bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-300 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              <DecodeText text="AI Agents" as="span" delay={0.5} className="bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-300 bg-clip-text text-transparent" />
            </GlitchWord>
            <br />
            <DecodeText
              text="That Run Your Business"
              as="span"
              className="text-white/90"
              delay={0.7}
            />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="text-slate-400 max-w-[700px] mx-auto mb-12 leading-relaxed"
            style={{ fontSize: "clamp(1rem, 2.5vw, 1.15rem)" }}
          >
            <TypewriterText
              text="Our AI agents don't just chat — they think, decide, and act. They answer your phones, book appointments, follow up leads, post content, and close sales — 24/7, with zero burnout."
              delay={2}
              speed={25}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.5 }}
            className="flex flex-col items-center gap-5"
          >
            <div
              className="relative group cursor-pointer"
              onClick={() => setShowSignup(true)}
              onMouseEnter={() => setCtaHover(true)}
              onMouseLeave={() => setCtaHover(false)}
              data-testid="button-free-signup-wrapper"
            >
              <div className="absolute -inset-3 rounded-md opacity-40 group-hover:opacity-80 transition-all duration-500" style={{
                background: `radial-gradient(ellipse, ${COLORS.green}40, transparent 70%)`,
              }} />
              <div className="absolute -inset-1.5 rounded-md blur-md group-hover:blur-lg transition-all duration-500 animate-pulse" style={{
                background: `linear-gradient(90deg, ${COLORS.green}50, ${COLORS.cyan}30, ${COLORS.green}50)`,
              }} />
              <Button
                size="lg"
                data-testid="button-free-signup"
                className="relative text-white font-bold shadow-lg tracking-wide text-base px-8"
                style={{ background: `linear-gradient(90deg, #16a34a, #10b981, #16a34a)`, borderColor: "rgba(34,197,94,0.4)" }}
              >
                <Bot className="w-5 h-5 mr-2" /> Get Your AI Agent Now
              </Button>
            </div>

            <a href="sms:+17542504912" data-testid="link-contact-text">
              <Button
                size="lg"
                variant="outline"
                className="border-white/10 text-slate-400 bg-white/[0.02]"
              >
                <MessageSquare className="w-4 h-4 mr-2" style={{ color: COLORS.purple }} /> Questions? Text (754) 250-4912
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 3 }}
            className="mt-14 flex justify-center gap-6 md:gap-8 text-xs text-slate-500 uppercase tracking-widest flex-wrap"
          >
            {["Custom AI Agents", "Any Industry", "24/7 Uptime", "Multi-Platform"].map((item, i) => (
              <motion.span
                key={item}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3 + i * 0.15 }}
                className="flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS.cyan }} />
                {item}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ SECTION 2: CAPABILITIES ═══════════ */}
      <section className="py-20 px-5" data-testid="section-capabilities">
        <div className="max-w-[1000px] mx-auto">
          <RevealSection>
            <div className="text-center mb-14">
              <DecodeText text="What Your AI Agent Does" as="h2" className="text-3xl md:text-4xl font-bold text-white mb-4" delay={0} />
              <p className="text-slate-400 max-w-[600px] mx-auto">
                Each agent is custom-built with the exact capabilities your business needs
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Phone, title: "Answer Calls 24/7", desc: "Picks up every call, qualifies leads, books appointments instantly.", color: "cyan" },
              { icon: Calendar, title: "Book Appointments", desc: "Syncs with your calendar and handles all scheduling automatically.", color: "violet" },
              { icon: Mail, title: "Follow Up Leads", desc: "Sends personalized texts, emails, and DMs so no lead goes cold.", color: "green" },
              { icon: MessageSquare, title: "Post Content", desc: "Creates and publishes across all your social platforms on autopilot.", color: "cyan" },
              { icon: Briefcase, title: "Close Sales", desc: "Handles objections, sends proposals, and moves deals forward.", color: "violet" },
              { icon: Link, title: "Integrate Everything", desc: "Connects to your CRM, calendar, email, and 100+ tools.", color: "green" },
            ].map((cap, i) => (
              <RevealSection key={cap.title} delay={i * 0.08}>
                <Card
                  className="p-6 bg-white/[0.02] border-white/[0.05] group relative overflow-visible hover-elevate h-full"
                  data-testid={`card-cap-${cap.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="absolute -inset-[1px] rounded-md overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.div
                      className="absolute w-24 h-[2px]"
                      style={{ background: `linear-gradient(90deg, transparent, ${cap.color === "cyan" ? COLORS.cyan : cap.color === "violet" ? COLORS.purple : COLORS.green}80, transparent)` }}
                      animate={{ left: ["-100px", "calc(100% + 100px)"], top: ["0px", "0px"] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
                    />
                  </div>
                  <div className="relative">
                    <div className="w-11 h-11 rounded-md flex items-center justify-center mb-4 border border-white/[0.06]" style={{
                      backgroundColor: `${cap.color === "cyan" ? COLORS.cyan : cap.color === "violet" ? COLORS.purple : COLORS.green}10`,
                    }}>
                      <cap.icon className="w-5 h-5 group-hover:drop-shadow-[0_0_8px_currentColor] transition-all" style={{
                        color: cap.color === "cyan" ? COLORS.cyan : cap.color === "violet" ? COLORS.purple : COLORS.green,
                      }} />
                    </div>
                    <DecodeText text={cap.title} as="h3" className="text-base font-semibold text-white mb-2" />
                    <p className="text-sm text-slate-400 leading-relaxed">{cap.desc}</p>
                  </div>
                </Card>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 3: YOUR AI TEAM ═══════════ */}
      <section className="py-20 px-5" data-testid="section-agents">
        <div className="max-w-[1000px] mx-auto">
          <RevealSection>
            <div className="text-center mb-14">
              <DecodeText text="Your AI Team" as="h2" className="text-3xl md:text-4xl font-bold text-white mb-4" delay={0} />
              <p className="text-slate-400 max-w-[550px] mx-auto">
                Specialized AI agents, each trained for a specific role in your business
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { name: "LUNA", color: "teal", role: "Receptionist / Calls", message: "Hi! I just booked a consultation for your 2pm slot. The lead came from your Google Ad — high intent.", borderColor: COLORS.cyan },
              { name: "ATLAS", color: "purple", role: "Sales / Closing", message: "Just sent the proposal to that warm lead. They opened it twice — I'm following up with a personalized offer now.", borderColor: COLORS.purple },
              { name: "NOVA", color: "green", role: "Content / Social Media", message: "Your Instagram post is live. I also scheduled 3 more for this week based on your top-performing content.", borderColor: COLORS.green },
              { name: "SENTINEL", color: "orange", role: "Integration / Workflows", message: "I synced your new CRM contacts with your email list. 47 contacts added and tagged automatically.", borderColor: "#fb923c" },
            ].map((agent, i) => (
              <RevealSection key={agent.name} delay={i * 0.1}>
                <Card
                  className="p-5 bg-white/[0.02] border-white/[0.05] group overflow-visible hover-elevate"
                  data-testid={`card-agent-${agent.name.toLowerCase()}`}
                >
                  <div className="flex items-start gap-4">
                    <MiniAIFace color={agent.color} size={56} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <DecodeText text={agent.name} as="span" className="text-sm font-bold" delay={0.2 + i * 0.1} />
                        <span className="flex items-center gap-1 text-[10px] font-mono" style={{ color: COLORS.green }}>
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: COLORS.green }} />
                          ONLINE
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">{agent.role}</p>
                      <div className="text-xs rounded-md p-2.5 font-mono border border-white/[0.05]" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
                        <span style={{ color: agent.borderColor }}>{agent.name}:</span>{" "}
                        <TypewriterText text={agent.message} delay={1 + i * 0.3} speed={20} className="text-slate-300" />
                      </div>
                    </div>
                  </div>
                </Card>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 4: HOW IT WORKS ═══════════ */}
      <section className="py-20 px-5" data-testid="section-how-it-works">
        <div className="max-w-[700px] mx-auto">
          <RevealSection>
            <div className="text-center mb-14">
              <DecodeText text="How It Works" as="h2" className="text-3xl md:text-4xl font-bold text-white mb-4" delay={0} />
            </div>
          </RevealSection>

          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-[2px]" style={{ backgroundColor: "rgba(0,229,255,0.1)" }}>
              <motion.div
                className="absolute left-0 w-full h-8 rounded-full"
                style={{ background: `linear-gradient(to bottom, transparent, ${COLORS.cyan}, transparent)` }}
                animate={{ top: ["0%", "100%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
            </div>

            {[
              { num: 1, title: "Book a Free Zoom Call", desc: "See AI agents in action, live", icon: Calendar },
              { num: 2, title: "Tell Us Your Workflows", desc: "We learn your business inside and out", icon: MessageSquare },
              { num: 3, title: "We Build Your Agent", desc: "Custom-trained on your data and tools", icon: Bot },
              { num: 4, title: "Launch & Profit", desc: "Your agent goes live and starts working day one", icon: Zap },
            ].map((step, i) => (
              <RevealSection key={step.num} delay={i * 0.15}>
                <div className="flex items-start gap-5 mb-10 last:mb-0 pl-0">
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-12 h-12 rounded-md flex items-center justify-center border border-white/[0.08]" style={{ backgroundColor: "rgba(0,229,255,0.08)" }}>
                      <span className="text-lg font-bold font-mono" style={{ color: COLORS.cyan }}>{step.num}</span>
                    </div>
                  </div>
                  <div className="pt-1">
                    <DecodeText text={step.title} as="h3" className="text-lg font-semibold text-white mb-1" delay={0.2 + i * 0.1} />
                    <p className="text-sm text-slate-400">{step.desc}</p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 5: STATS ═══════════ */}
      <section className="py-20 px-5" data-testid="section-stats">
        <div className="max-w-[900px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { target: 500, suffix: "+", label: "Agents Deployed" },
              { target: 50, suffix: "+", label: "Industries" },
              { target: 24, suffix: "/7/365", label: "Uptime" },
              { target: 10, suffix: "x", label: "Faster Responses" },
            ].map((s, i) => (
              <RevealSection key={s.label} delay={i * 0.1}>
                <Card className="p-6 bg-white/[0.02] border-white/[0.05] text-center" data-testid={`card-stat-${s.label.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className="text-3xl md:text-4xl font-bold font-mono text-white mb-2">
                    <CountUp target={s.target} suffix={s.suffix} />
                  </div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">{s.label}</p>
                </Card>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 6: FAQ ═══════════ */}
      <section className="py-20 px-5" data-testid="section-faq">
        <div className="max-w-[700px] mx-auto">
          <RevealSection>
            <div className="text-center mb-14">
              <DecodeText text="Frequently Asked Questions" as="h2" className="text-3xl md:text-4xl font-bold text-white mb-4" delay={0} />
            </div>
          </RevealSection>

          <div className="space-y-3">
            {[
              { q: "What industries do your AI agents work for?", a: "Our agents are industry-agnostic. We've built them for real estate, healthcare, e-commerce, coaching, legal, home services, and dozens more. If your business has repetitive workflows, we can automate them." },
              { q: "How long does setup take?", a: "Most agents are live within 5-7 business days. We handle everything — training, integration, testing — so you don't have to." },
              { q: "Do I need technical skills?", a: "Not at all. We build and manage everything for you. You just tell us what you need, and we make it happen." },
              { q: "Can the AI agent handle complex conversations?", a: "Yes. Our agents use advanced language models trained on your specific business data. They handle objections, answer detailed questions, and know when to escalate to a human." },
              { q: "What if I want to make changes after launch?", a: "We offer ongoing support and optimization. Your agent evolves with your business." },
            ].map(faq => (
              <RevealSection key={faq.q} delay={0}>
                <FAQItem question={faq.q} answer={faq.a} />
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 7: FINAL CTA ═══════════ */}
      <section className="py-24 px-5 relative" data-testid="section-cta">
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <AIEntityFace />
        </div>
        <div className="relative z-10 max-w-[700px] mx-auto text-center">
          <RevealSection>
            <DecodeText text="Ready to Put AI to Work?" as="h2" className="text-3xl md:text-5xl font-bold text-white mb-6" delay={0} />
            <p className="text-slate-400 mb-10 max-w-[500px] mx-auto leading-relaxed">
              Stop losing leads, missing calls, and doing everything manually. Let an AI agent handle it.
            </p>
            <div className="flex flex-col items-center gap-5">
              <div className="relative group cursor-pointer" onClick={() => setShowSignup(true)}>
                <div className="absolute -inset-3 rounded-md opacity-40 group-hover:opacity-80 transition-all duration-500" style={{
                  background: `radial-gradient(ellipse, ${COLORS.green}40, transparent 70%)`,
                }} />
                <div className="absolute -inset-1.5 rounded-md blur-md group-hover:blur-lg transition-all duration-500 animate-pulse" style={{
                  background: `linear-gradient(90deg, ${COLORS.green}50, ${COLORS.cyan}30, ${COLORS.green}50)`,
                }} />
                <Button
                  size="lg"
                  data-testid="button-free-signup-cta"
                  className="relative text-white font-bold shadow-lg tracking-wide text-lg px-10"
                  style={{ background: `linear-gradient(90deg, #16a34a, #10b981, #16a34a)`, borderColor: "rgba(34,197,94,0.4)" }}
                >
                  <Bot className="w-5 h-5 mr-2" /> Get Your AI Agent Now
                </Button>
              </div>
              <a href="sms:+17542504912" data-testid="link-contact-text-cta">
                <Button variant="outline" className="border-white/10 text-slate-400 bg-white/[0.02]">
                  <MessageSquare className="w-4 h-4 mr-2" style={{ color: COLORS.purple }} /> Questions? Text (754) 250-4912
                </Button>
              </a>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-white/[0.06] py-8 px-5" data-testid="footer">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.15)" }}>
                <Bot className="w-3.5 h-3.5" style={{ color: COLORS.cyan }} />
              </div>
              <span className="font-bold font-mono text-sm" style={{ color: COLORS.cyan }}>CLAWD</span>
            </div>
            <div className="flex gap-6 text-xs text-slate-500 flex-wrap justify-center">
              {[
                { label: "Home", href: "#" },
                { label: "Services", href: "#" },
                { label: "FAQ", href: "#" },
                { label: "Contact", href: "sms:+17542504912" },
              ].map(l => (
                <a key={l.label} href={l.href} className="hover:text-white transition-colors" data-testid={`link-footer-${l.label.toLowerCase()}`}>
                  {l.label}
                </a>
              ))}
            </div>
            <p className="text-xs text-slate-600 font-mono">
              Built by CLAWD
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
