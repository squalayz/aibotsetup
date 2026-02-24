import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
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
  Briefcase, Zap, Shield, Globe,
  TrendingUp, DollarSign, BarChart3, Star, Send,
} from "lucide-react";
import robotImgSrc from "@assets/liftapp_(10)_1771462069765.png";

const GLITCH_CHARS = "░▒▓█╔╗║═01∆Ωλ@#$%&*<>{}[]";
const EASE_PREMIUM: [number, number, number, number] = [0.16, 1, 0.3, 1];
const C = {
  bg: "#050510",
  cyan: "#00e5ff",
  purple: "#a855f7",
  green: "#22c55e",
  text: "#ffffff",
  muted: "#9ca3af",
};

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

function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    type Node = { x: number; y: number; vx: number; vy: number };
    const nodes: Node[] = [];
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 30 : 60;
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      });
    }

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      const maxDist = isMobile ? 100 : 150;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.15;
            ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach(n => {
        ctx.fillStyle = "rgba(0, 240, 255, 0.3)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      frame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-30" />;
}

function RobotHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const eyePosRef = useRef({ lx: 0, ly: 0, rx: 0, ry: 0 });
  const animRef = useRef(0);
  const visibleRef = useRef(true);
  const isMobile = useRef(typeof window !== "undefined" && window.innerWidth < 768);

  type Particle = { x: number; y: number; life: number; speed: number; size: number; drift: number };
  const particlesRef = useRef<Particle[]>([]);
  const scanRef = useRef({ timer: 12000, active: false, y: 0 });
  const glitchRef = useRef({ timer: 18000 + Math.random() * 7000 });
  const sonarRef = useRef({ timer: 10000, active: false, progress: 0 });

  type EnergyDot = { path: number; t: number; speed: number };
  const energyDotsRef = useRef<EnergyDot[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      isMobile.current = window.innerWidth < 768;
    };
    resize();

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    };
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("resize", resize);

    const observer = new IntersectionObserver(([entry]) => { visibleRef.current = entry.isIntersecting; }, { threshold: 0.05 });
    observer.observe(container);

    const maxParticles = isMobile.current ? 10 : 25;
    for (let i = 0; i < maxParticles; i++) {
      particlesRef.current.push({
        x: 0.35 + Math.random() * 0.3,
        y: 0.25 + Math.random() * 0.5,
        life: Math.random(),
        speed: 0.3 + Math.random() * 0.5,
        size: 1 + Math.random(),
        drift: Math.random() * Math.PI * 2,
      });
    }

    const energyPaths: [number, number, number, number][] = [
      [0.50, 0.22, 0.42, 0.50],
      [0.50, 0.22, 0.58, 0.50],
      [0.50, 0.35, 0.50, 0.75],
      [0.44, 0.28, 0.38, 0.55],
      [0.56, 0.28, 0.62, 0.55],
      [0.50, 0.40, 0.44, 0.60],
    ];
    for (let i = 0; i < energyPaths.length; i++) {
      energyDotsRef.current.push({ path: i, t: Math.random(), speed: 0.15 + Math.random() * 0.2 });
    }

    let elapsed = 0;
    let lastTime = performance.now();

    const draw = () => {
      if (!visibleRef.current) { animRef.current = requestAnimationFrame(draw); return; }
      const now = performance.now();
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;
      elapsed += dt;

      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const lerp = 0.05;

      if (!isMobile.current) {
        const leftEyeX = w * 0.47;
        const leftEyeY = h * 0.14;
        const rightEyeX = w * 0.53;
        const rightEyeY = h * 0.14;
        const maxDisp = 6;

        const targetLX = leftEyeX + (mx - 0.5) * maxDisp * 2;
        const targetLY = leftEyeY + (my - 0.5) * maxDisp * 2;
        const targetRX = rightEyeX + (mx - 0.5) * maxDisp * 2;
        const targetRY = rightEyeY + (my - 0.5) * maxDisp * 2;

        eyePosRef.current.lx += (targetLX - eyePosRef.current.lx) * lerp;
        eyePosRef.current.ly += (targetLY - eyePosRef.current.ly) * lerp;
        eyePosRef.current.rx += (targetRX - eyePosRef.current.rx) * lerp;
        eyePosRef.current.ry += (targetRY - eyePosRef.current.ry) * lerp;

        const drawEye = (ex: number, ey: number) => {
          const outerGrad = ctx.createRadialGradient(ex, ey, 0, ex, ey, 25);
          outerGrad.addColorStop(0, "rgba(0, 240, 255, 0.06)");
          outerGrad.addColorStop(1, "transparent");
          ctx.fillStyle = outerGrad;
          ctx.beginPath();
          ctx.arc(ex, ey, 25, 0, Math.PI * 2);
          ctx.fill();

          const grad = ctx.createRadialGradient(ex, ey, 0, ex, ey, 8);
          grad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
          grad.addColorStop(0.4, "rgba(0, 240, 255, 0.7)");
          grad.addColorStop(1, "transparent");
          ctx.fillStyle = grad;
          ctx.shadowColor = C.cyan;
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(ex, ey, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        };
        drawEye(eyePosRef.current.lx, eyePosRef.current.ly);
        drawEye(eyePosRef.current.rx, eyePosRef.current.ry);
      }

      ctx.shadowBlur = 0;
      energyPaths.forEach(([x1, y1, x2, y2]) => {
        ctx.strokeStyle = "rgba(0, 240, 255, 0.06)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1 * w, y1 * h);
        ctx.lineTo(x2 * w, y2 * h);
        ctx.stroke();
      });

      energyDotsRef.current.forEach(dot => {
        dot.t += dt * 0.001 * dot.speed;
        if (dot.t > 1) dot.t -= 1;
        const p = energyPaths[dot.path];
        const dx = p[0] + (p[2] - p[0]) * dot.t;
        const dy = p[1] + (p[3] - p[1]) * dot.t;
        ctx.fillStyle = "rgba(0, 240, 255, 0.7)";
        ctx.shadowColor = C.cyan;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(dx * w, dy * h, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      particlesRef.current.forEach(p => {
        p.life -= dt * 0.0004 * p.speed;
        p.y -= dt * 0.00003 * p.speed;
        p.x += Math.sin(elapsed * 0.001 + p.drift) * 0.0003;
        if (p.life <= 0) {
          p.x = 0.35 + Math.random() * 0.3;
          p.y = 0.30 + Math.random() * 0.35;
          p.life = 0.8 + Math.random() * 0.2;
          p.speed = 0.3 + Math.random() * 0.5;
          p.drift = Math.random() * Math.PI * 2;
        }
        ctx.fillStyle = `rgba(0, 240, 255, ${p.life * 0.4})`;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      scanRef.current.timer -= dt;
      if (scanRef.current.timer <= 0) {
        scanRef.current.active = true;
        scanRef.current.y = 0;
        scanRef.current.timer = 12000;
      }
      if (scanRef.current.active) {
        scanRef.current.y += dt * 0.0005 * h;
        if (scanRef.current.y > h) {
          scanRef.current.active = false;
        } else {
          const sy = scanRef.current.y;
          ctx.fillStyle = "rgba(0, 240, 255, 0.04)";
          ctx.fillRect(0, sy - 10, w, 20);
          ctx.strokeStyle = "rgba(0, 240, 255, 0.5)";
          ctx.lineWidth = 2;
          ctx.shadowColor = C.cyan;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(0, sy);
          ctx.lineTo(w, sy);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      const chestX = w * 0.50;
      const chestY = h * 0.35;
      const breathScale = 0.8 + Math.sin(elapsed * 0.0008 * Math.PI * 2) * 0.2;
      const chestR = 35 * breathScale;
      const chestGrad = ctx.createRadialGradient(chestX, chestY, 0, chestX, chestY, chestR);
      chestGrad.addColorStop(0, "rgba(0, 240, 255, 0.15)");
      chestGrad.addColorStop(1, "transparent");
      ctx.fillStyle = chestGrad;
      ctx.beginPath();
      ctx.arc(chestX, chestY, chestR, 0, Math.PI * 2);
      ctx.fill();

      sonarRef.current.timer -= dt;
      if (sonarRef.current.timer <= 0) {
        sonarRef.current.active = true;
        sonarRef.current.progress = 0;
        sonarRef.current.timer = 10000;
      }
      if (sonarRef.current.active) {
        sonarRef.current.progress += dt * 0.0008;
        if (sonarRef.current.progress >= 1) {
          sonarRef.current.active = false;
        } else {
          const sp = sonarRef.current.progress;
          const sr = sp * Math.max(w, h) * 0.5;
          ctx.strokeStyle = `rgba(0, 240, 255, ${(1 - sp) * 0.15})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(chestX, chestY, sr, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    if (eyePosRef.current.lx === 0) {
      const rect2 = container.getBoundingClientRect();
      eyePosRef.current = { lx: rect2.width * 0.47, ly: rect2.height * 0.14, rx: rect2.width * 0.53, ry: rect2.height * 0.14 };
    }

    draw();

    const glitchLoop = () => {
      if (!visibleRef.current || !imgRef.current) {
        glitchRef.current.timer = 18000 + Math.random() * 7000;
        setTimeout(glitchLoop, glitchRef.current.timer);
        return;
      }
      const img = imgRef.current;
      img.classList.add("robot-glitch-1");
      setTimeout(() => {
        img.classList.remove("robot-glitch-1");
        img.classList.add("robot-glitch-2");
        setTimeout(() => {
          img.classList.remove("robot-glitch-2");
        }, 60);
      }, 80);
      glitchRef.current.timer = 18000 + Math.random() * 7000;
      setTimeout(glitchLoop, glitchRef.current.timer);
    };
    const glitchTimeout = setTimeout(glitchLoop, glitchRef.current.timer);

    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", resize);
      observer.disconnect();
      cancelAnimationFrame(animRef.current);
      clearTimeout(glitchTimeout);
    };
  }, []);

  return (
    <div ref={containerRef} className="hero-robot-container" data-testid="robot-hero-container">
      <div className="robot-glow-bg" />
      <img
        ref={imgRef}
        src={robotImgSrc}
        alt="AI Agent"
        className="robot-image"
        draggable={false}
      />
      <canvas ref={canvasRef} className="robot-fx-canvas" />
    </div>
  );
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
      }, 50);

      return () => {
        clearInterval(scrambleInterval);
        clearInterval(resolveInterval);
      };
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [isInView, text, delay, reduced]);

  useEffect(() => {
    if (reduced || !resolved) return;
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
  }, [resolved, text, reduced]);

  return (
    <Tag ref={ref as any} className={className}>
      {display.map((ch, i) => (
        <span key={i} style={{ color: !resolved && ch !== text[i] ? C.cyan : undefined, transition: "color 0.1s" }}>
          {ch}
        </span>
      ))}
    </Tag>
  );
}

function GlitchWord({ children, text, className = "" }: { children: React.ReactNode; text?: string; className?: string }) {
  const reduced = useReducedMotion();
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const interval = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 150);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [reduced]);

  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      {glitching && text && (
        <>
          <span className="absolute inset-0" style={{ color: C.cyan, clipPath: "inset(0 0 50% 0)", transform: "translateX(2px)" }} aria-hidden="true">{text}</span>
          <span className="absolute inset-0" style={{ color: "#ff0040", clipPath: "inset(50% 0 0 0)", transform: "translateX(-2px)" }} aria-hidden="true">{text}</span>
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
        <span className="inline-block w-2 h-4 ml-0.5 align-middle animate-pulse" style={{ backgroundColor: C.cyan }} />
      )}
    </span>
  );
}

function CountUp({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
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
    };
    tick();
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
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
      transition={{ duration: 0.8, delay, ease: EASE_PREMIUM }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FAQTypewriter({ answer }: { answer: string }) {
  const reduced = useReducedMotion();
  const [displayed, setDisplayed] = useState("");
  const startedRef = useRef(false);

  useEffect(() => {
    if (reduced) { setDisplayed(answer); return; }
    if (startedRef.current) return;
    startedRef.current = true;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(answer.slice(0, i + 1));
      i++;
      if (i >= answer.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [answer, reduced]);

  return (
    <span className="font-mono text-sm text-slate-300 leading-relaxed">
      {displayed}
      {!reduced && displayed.length < answer.length && (
        <span className="inline-block w-2 h-3.5 ml-0.5 align-middle animate-pulse" style={{ backgroundColor: C.cyan }} />
      )}
    </span>
  );
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
        <span className="font-semibold text-white text-sm">{question}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <ChevronDown className="w-4 h-4 shrink-0" style={{ color: C.cyan }} />
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
              <Bot className="w-4 h-4 shrink-0 mt-0.5" style={{ color: C.cyan }} />
              <FAQTypewriter answer={answer} />
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
        <p className="text-slate-400 text-sm leading-relaxed mb-4">
          We'll reach out to <strong className="text-white">{values.email}</strong> or <strong className="text-white">{values.phone}</strong> shortly.
        </p>
        <Button
          variant="outline"
          onClick={() => { setSuccess(false); setValues({}); }}
          className="border-white/10 text-slate-300"
          data-testid={`button-${type}-reset`}
        >
          Submit Another
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid={`form-${type}`}>
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2 title-font" style={{ color: accentColor }}>{title}</h3>
        <p className="text-sm text-slate-400">{subtitle}</p>
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
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-cyan-400/40"
              required={field.required}
              data-testid={`select-${type}-${field.name}`}
            >
              <option value="" className="bg-zinc-900">{field.placeholder}</option>
              {field.options.map(opt => (
                <option key={opt} value={opt} className="bg-zinc-900">{opt}</option>
              ))}
            </select>
          ) : field.type === "textarea" ? (
            <Textarea
              value={values[field.name] || ""}
              onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
              placeholder={field.placeholder}
              className="bg-white/[0.03] border-white/[0.08] resize-none text-sm"
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
              required={field.required}
              data-testid={`input-${type}-${field.name}`}
            />
          )}
        </div>
      ))}
      <Button
        type="submit"
        className="w-full font-bold text-black py-5"
        style={{ background: buttonColor }}
        disabled={!values.name || !values.email || !values.phone || mutation.isPending}
        data-testid={`button-submit-${type}`}
      >
        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
        {mutation.isPending ? "Submitting..." : buttonText}
      </Button>
    </form>
  );
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileView, setIsMobileView] = useState(typeof window !== "undefined" && window.innerWidth < 768);
  const { toast } = useToast();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    const resizeHandler = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener("scroll", handler);
    window.addEventListener("resize", resizeHandler);
    return () => { window.removeEventListener("scroll", handler); window.removeEventListener("resize", resizeHandler); };
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ backgroundColor: C.bg }}>

      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_PREMIUM }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass-nav" : ""}`}
        style={{ backgroundColor: scrolled ? "rgba(5,5,16,0.92)" : "transparent" }}
        data-testid="nav-main"
      >
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between gap-4 h-14 md:h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }} data-testid="text-logo">
              CLAWD
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-8" style={{ fontSize: "14px", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>
            {[
              { id: "features", label: "Capabilities" },
              { id: "agents", label: "AI Team" },
              { id: "trading", label: "AI Trading" },
              { id: "build", label: "30-Min Build" },
              { id: "forms", label: "Get Started" },
            ].map(link => (
              <Button
                key={link.id}
                variant="link"
                onClick={() => scrollTo(link.id)}
                className="text-gray-400 hover:text-white transition-colors duration-300 ease-out p-0 h-auto text-sm font-medium uppercase tracking-wide"
                data-testid={`nav-${link.id}`}
              >
                {link.label}
              </Button>
            ))}
          </div>
          <Button
            onClick={() => scrollTo("forms")}
            className="nav-cta-pill"
            data-testid="button-nav-cta"
          >
            <Zap className="w-3.5 h-3.5" /> GET YOUR AGENT
          </Button>
        </div>
      </motion.nav>

      <section className="relative min-h-screen flex items-center overflow-hidden pt-16 pb-20" data-testid="section-hero">
        <NeuralCanvas />
        <div className="scanline-overlay" />

        <div className="hero-bg-glow" />

        <div className="max-w-7xl mx-auto w-full flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-0 relative z-20 px-5">
          <div className="w-full lg:w-[50%] relative z-10 text-center lg:text-left" style={{ paddingLeft: isMobileView ? 0 : "5%" }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: EASE_PREMIUM }}
            >
              <div
                className="inline-flex items-center gap-2.5 mb-10"
                style={{
                  background: "rgba(0, 229, 255, 0.08)",
                  border: "1px solid rgba(0, 229, 255, 0.2)",
                  borderRadius: "50px",
                  padding: "8px 20px",
                }}
              >
                <div className="w-2 h-2 rounded-full dot-pulse" style={{ backgroundColor: C.green }} />
                <span style={{ fontSize: "12px", letterSpacing: "0.1em", fontWeight: 500, color: "#9ca3af", textTransform: "uppercase" as const }}>
                  LIVE AI AGENTS • 24/7 • ZERO BURNOUT
                </span>
              </div>
            </motion.div>

            <div className="mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(1.9rem, 4.5vw, 3.6rem)", lineHeight: 1.1, fontWeight: 700, letterSpacing: "-0.02em" }}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5, ease: EASE_PREMIUM }}>
                <DecodeText text="We Build" as="span" className="text-white" delay={0.5} />
              </motion.div>
              <br />
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.7, ease: EASE_PREMIUM }} className="inline">
                <span className="neon-gradient-text">
                  <DecodeText text="AI Agents" as="span" delay={0.7} className="neon-gradient-text" />
                </span>
              </motion.div>
              <br />
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.9, ease: EASE_PREMIUM }}>
                <DecodeText text="That Run Your" as="span" className="text-white" delay={0.9} />
              </motion.div>
              <br />
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 1.1, ease: EASE_PREMIUM }} className="inline">
                <GlitchWord text="Business" className="text-white">
                  <DecodeText text="Business" as="span" delay={1.1} className="text-white" />
                </GlitchWord>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.3, ease: EASE_PREMIUM }}
              className="max-w-[520px] mb-10 mx-auto lg:mx-0"
              style={{ fontSize: "18px", lineHeight: 1.7, color: "#9ca3af" }}
            >
              <TypewriterText
                text="Custom AI that answers calls, books appointments, closes sales, trades crypto & stocks, posts content, and scales your business — built in under 30 minutes."
                delay={1.5}
                speed={18}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.6, ease: EASE_PREMIUM }}
              className="flex flex-col sm:flex-row items-center lg:items-center gap-4 sm:gap-8 mb-12"
            >
              <Button
                size="lg"
                onClick={() => scrollTo("forms")}
                className="hero-primary-btn group flex items-center gap-2"
                data-testid="button-hero-cta"
              >
                Build My Agent in 30 Min
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>

              <Button
                variant="link"
                onClick={() => scrollTo("trading")}
                className="hero-text-link-cyan flex items-center gap-1.5 p-0 h-auto"
                data-testid="button-hero-trading"
              >
                See AI Trading <ArrowRight className="w-3.5 h-3.5" />
              </Button>

              <Button
                variant="link"
                onClick={() => scrollTo("form-card-team")}
                className="hero-text-link-muted flex items-center gap-1.5 p-0 h-auto"
                data-testid="button-hero-team"
              >
                <Users className="w-3.5 h-3.5" /> Join The Team
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 2.0, ease: EASE_PREMIUM }}
              className="flex gap-10 flex-wrap justify-center lg:justify-start pt-6"
              style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}
            >
              {["Instant Deploy", "Zero Coding", "100% Custom"].map((item, i) => (
                <motion.span
                  key={item}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.0 + i * 0.15, duration: 0.5, ease: EASE_PREMIUM }}
                  className="flex items-center gap-2"
                  style={{ fontSize: "13px", letterSpacing: "0.08em", color: "#6b7280", textTransform: "uppercase" as const }}
                >
                  <Check className="w-3.5 h-3.5" style={{ color: "#22c55e" }} />
                  {item}
                </motion.span>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: EASE_PREMIUM }}
            className="w-full lg:w-[50%] relative"
            style={{
              minHeight: isMobileView ? "35vh" : "500px",
              height: isMobileView ? "35vh" : "70vh",
              maxHeight: isMobileView ? "350px" : "750px",
              marginRight: isMobileView ? 0 : "-5%",
            }}
          >
            <RobotHero />
            <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{
              background: `linear-gradient(to top, ${C.bg}, transparent)`,
            }} />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 2.2, ease: EASE_PREMIUM }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
          style={{ fontSize: "11px", letterSpacing: "0.15em", color: "#4b5563" }}
        >
          <div className="scroll-indicator-line" />
          SCROLL TO EXPLORE
        </motion.div>
      </section>

      <RevealSection>
        <div className="border-t border-white/5 py-5" data-testid="section-trust">
          <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-x-12 gap-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.6 }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE_PREMIUM }}
              viewport={{ once: true }}
              className="flex items-center gap-4 text-xs font-mono"
            >
              <span className="text-slate-500">POWERED BY</span>
              <span className="neon-text-cyan text-[11px]">GROK • CLAUDE • GPT • LLAMA</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.6 }}
              transition={{ duration: 0.6, delay: 0.25, ease: EASE_PREMIUM }}
              viewport={{ once: true }}
              className="h-px w-12 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            />
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.6 }}
              transition={{ duration: 0.6, delay: 0.4, ease: EASE_PREMIUM }}
              viewport={{ once: true }}
              className="text-xs text-slate-500"
            >
              Trusted by businesses scaling right now
            </motion.div>
          </div>
        </div>
      </RevealSection>

      <section id="features" className="py-24 relative" data-testid="section-features">
        <div className="max-w-7xl mx-auto px-6">
          <RevealSection>
            <div className="text-center mb-16">
              <span className="px-5 py-2 rounded-full bg-purple-500/10 text-purple-400 text-xs tracking-[3px] uppercase font-mono">NEXT-GEN AI THAT ACTS</span>
              <h2 className="title-font text-4xl md:text-5xl lg:text-6xl font-black mt-6">
                Your AI Doesn't Just Chat.
                <br />
                It <span style={{ color: C.cyan }}>Thinks</span> • <span style={{ color: C.purple }}>Decides</span> • <span style={{ color: C.green }}>Closes</span>
              </h2>
            </div>
          </RevealSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Phone, title: "Answers Calls 24/7", desc: "Qualifies leads, books appointments, handles objections. Voice + SMS + WhatsApp.", color: C.cyan, stat: "99.8% pickup rate • 2.4s avg answer" },
              { icon: Calendar, title: "Books Appointments", desc: "Syncs with Google/Outlook calendar. Auto reminders, reschedules, no-show follow ups.", color: C.purple, stat: "∞ automated scheduling" },
              { icon: TrendingUp, title: "Closes Sales & Trades", desc: "AI sales agents that follow up leads, send proposals, negotiate. Plus AI Trading for stocks & crypto.", color: C.green, stat: "24/7 autonomous execution" },
              { icon: MessageSquare, title: "Posts Content", desc: "Creates and publishes across all your social platforms on autopilot. Consistent brand voice.", color: C.cyan, stat: "Multi-platform automation" },
              { icon: Shield, title: "Manages Workflows", desc: "Connects to your CRM, email, calendar, and 100+ tools. Zero manual work.", color: C.purple, stat: "100+ integrations" },
              { icon: Globe, title: "Scales Your Empire", desc: "Handle unlimited customers simultaneously. No hiring, no training, no burnout.", color: C.green, stat: "Unlimited capacity" },
            ].map((cap, i) => (
              <RevealSection key={cap.title} delay={i * 0.08}>
                <div className="glass-card rounded-2xl p-8 group transition-all duration-300 h-full" style={{ borderColor: `${cap.color}20` }} data-testid={`card-cap-${i}`}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${cap.color}12` }}>
                    <cap.icon className="w-7 h-7" style={{ color: cap.color }} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{cap.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">{cap.desc}</p>
                  <div className="h-px w-full" style={{ background: `linear-gradient(to right, transparent, ${cap.color}40, transparent)` }} />
                  <div className="pt-4 text-[11px] font-mono" style={{ color: cap.color }}>{cap.stat}</div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      <section id="agents" className="py-24 relative" style={{ background: "linear-gradient(to bottom, rgba(5,5,16,1), rgba(10,10,30,1))" }} data-testid="section-agents">
        <div className="max-w-7xl mx-auto px-6">
          <RevealSection>
            <div className="text-center mb-16">
              <h2 className="title-font text-4xl md:text-5xl lg:text-6xl font-black">Your 24/7 AI Dream Team</h2>
              <p className="text-lg text-slate-400 mt-4">Each specialist is custom-trained for your exact business</p>
            </div>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "LUNA", role: "Receptionist • Voice AI", color: C.cyan, message: "Hi! I just booked a consultation for your 2pm slot with Mr. Ramirez. He's pre-qualified and excited.", emoji: "👩‍💼" },
              { name: "ATLAS", role: "Sales Closer • Deal Maker", color: C.purple, message: "Proposal sent and signed! $14,700 closed in 11 minutes. Next up is the $47k enterprise deal.", emoji: "🧔" },
              { name: "TRADER-X", role: "Crypto & Stocks Leverage Trader", color: C.green, message: "14 new posts scheduled. Just opened 3x long on SOL at 142.87 — +4.2% in 47 seconds.", emoji: "📈" },
            ].map((agent, i) => (
              <RevealSection key={agent.name} delay={i * 0.1}>
                <div className="glass-card rounded-2xl overflow-hidden" data-testid={`card-agent-${agent.name.toLowerCase()}`}>
                  <div className="h-1.5" style={{ background: agent.color }} />
                  <div className="p-7">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-3xl" style={{ backgroundColor: `${agent.color}12` }}>
                        {agent.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg title-font" style={{ color: agent.color }}>{agent.name}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-green-400/15 text-green-400 rounded-full flex items-center gap-1 font-mono">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> ONLINE
                          </span>
                        </div>
                        <div className="text-xs" style={{ color: agent.color }}>{agent.role}</div>
                      </div>
                    </div>
                    <div className="bg-black/40 rounded-xl p-4 text-sm leading-relaxed">
                      <span style={{ color: agent.color }} className="font-mono font-bold">{agent.name}:</span>{" "}
                      <TypewriterText text={agent.message} delay={1 + i * 0.5} speed={18} className="text-slate-300" />
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      <section id="trading" className="py-24 relative" data-testid="section-trading">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <RevealSection>
              <div>
                <div className="uppercase text-green-400 tracking-[3px] text-xs mb-4 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  NEW • LIVE MARKET AGENTS
                </div>
                <h2 className="title-font text-4xl md:text-5xl lg:text-6xl font-black leading-none mb-6">
                  AI Trading Agents That
                  <br />
                  <span style={{ color: C.green }}>Actually Make Money</span>
                </h2>
                <p className="text-lg text-slate-300 mb-10">
                  Stocks • Crypto • Futures • Options • 100x Leverage. 24/7 autonomous execution with risk management, backtesting, and real-time sentiment analysis.
                </p>

                <div className="space-y-6 mb-10">
                  <div className="flex items-center gap-5">
                    <div className="text-4xl md:text-5xl font-mono font-black" style={{ color: C.green }}>+318%</div>
                    <div>
                      <div className="font-semibold text-white">30-day avg return (backtested)</div>
                      <div className="text-xs text-slate-500">BTC/ETH/SOL portfolios</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="text-4xl md:text-5xl font-mono font-black" style={{ color: C.cyan }}>0.8s</div>
                    <div>
                      <div className="font-semibold text-white">Execution speed</div>
                      <div className="text-xs text-slate-500">Binance, Bybit, Coinbase Advanced</div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => scrollTo("forms")}
                  className="px-8 py-5 bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold text-lg rounded-2xl hover:scale-105 transition-all"
                  data-testid="button-trading-cta"
                >
                  <Bot className="w-5 h-5 mr-2" /> DEPLOY YOUR TRADING AGENT NOW
                </Button>
              </div>
            </RevealSection>

            <RevealSection delay={0.2}>
              <div className="glass-card rounded-2xl p-6 relative">
                <div className="bg-black/60 rounded-xl p-5 font-mono text-sm mb-6">
                  <div className="flex justify-between mb-4 items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-white font-bold">TRADER-X LIVE</span>
                    </div>
                    <div className="text-green-400 font-bold">+2.84% today</div>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-slate-400">Long SOL 3x @ 142.87</span>
                      <span className="text-green-400 font-bold">+4.21%</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-slate-400">Short ETH 5x @ 2,874</span>
                      <span className="text-red-400 font-bold">-0.91%</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-slate-400">Closed NVDA call @ 138</span>
                      <span className="text-green-400 font-bold">+$1,294 profit</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-400">BTC swing 2x long</span>
                      <span className="text-green-400 font-bold">+1.87%</span>
                    </div>
                  </div>
                </div>

                <div className="h-48 bg-gradient-to-br from-green-900/20 to-transparent rounded-xl flex items-center justify-center border border-green-400/20 relative overflow-hidden">
                  <LiveChart />
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      <section id="build" className="py-24 border-t border-b border-cyan-500/15" data-testid="section-build">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <RevealSection>
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 px-6 py-3 rounded-2xl mb-8 border border-cyan-400/20">
              <Zap className="w-6 h-6 text-cyan-400" />
              <span className="uppercase tracking-[3px] font-bold text-cyan-400 text-sm title-font">30-Minute Magic</span>
            </div>

            <h2 className="title-font text-4xl md:text-5xl lg:text-6xl font-black max-w-3xl mx-auto leading-tight">
              From idea to live AI agent in under <span style={{ color: C.cyan }}>30 minutes</span>. No code. No waiting.
            </h2>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              { num: "01", title: "Tell us your business", desc: "Describe what you need in plain English", color: C.cyan },
              { num: "02", title: "AI builds it instantly", desc: "Custom prompts, voice, integrations", color: C.purple },
              { num: "03", title: "Deploy & profit", desc: "Connect phone/calendar/exchanges and go live", color: C.green },
            ].map((step, i) => (
              <RevealSection key={step.num} delay={i * 0.15}>
                <div className="text-left">
                  <div className="text-6xl font-black font-mono mb-3 title-font" style={{ color: step.color }}>{step.num}</div>
                  <div className="font-bold text-white text-lg mb-2">{step.title}</div>
                  <div className="text-sm text-slate-400">{step.desc}</div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      <section id="forms" className="py-24 relative" data-testid="section-forms">
        <div className="max-w-7xl mx-auto px-6">
          <RevealSection>
            <div className="text-center mb-16">
              <h2 className="title-font text-4xl md:text-5xl font-black mb-4">Ready to 10x Your Business?</h2>
              <p className="text-lg text-slate-400">Choose your path and let's build something incredible</p>
            </div>
          </RevealSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RevealSection delay={0}>
              <div className="glass-card rounded-2xl p-8 h-full border-cyan-400/20" data-testid="form-card-general">
                <InquiryForm
                  type="general"
                  title="Custom AI Agent"
                  subtitle="Tell us what you need and we'll build it"
                  accentColor={C.cyan}
                  buttonColor="linear-gradient(90deg, #00f0ff, #0ea5e9)"
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
            </RevealSection>

            <RevealSection delay={0.1}>
              <div className="glass-card rounded-2xl p-8 h-full border-green-400/20 relative overflow-hidden" data-testid="form-card-trading">
                <div className="absolute top-0 right-0 px-3 py-1 bg-green-400 text-black text-[10px] font-bold uppercase tracking-wider rounded-bl-lg">New</div>
                <InquiryForm
                  type="trading"
                  title="AI Trading Agent"
                  subtitle="Autonomous trading for stocks, crypto & leverage"
                  accentColor={C.green}
                  buttonColor="linear-gradient(90deg, #22ff88, #10b981)"
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
            </RevealSection>

            <RevealSection delay={0.2}>
              <div id="form-card-team" className="glass-card rounded-2xl p-8 h-full border-purple-400/20" data-testid="form-card-team">
                <InquiryForm
                  type="team"
                  title="Join Our Team"
                  subtitle="Earn 30% lifetime commission on every referral"
                  accentColor={C.purple}
                  buttonColor="linear-gradient(90deg, #c026d3, #a855f7)"
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
            </RevealSection>
          </div>

          <RevealSection delay={0.3}>
            <div className="text-center mt-10">
              <a href="sms:+17542504912" data-testid="link-contact-text">
                <Button variant="outline" size="lg" className="border-white/10 text-slate-400 bg-white/[0.02]">
                  <MessageSquare className="w-4 h-4 mr-2" style={{ color: C.purple }} /> Questions? Text (754) 250-4912
                </Button>
              </a>
            </div>
          </RevealSection>
        </div>
      </section>

      <section className="py-20 px-5" data-testid="section-stats">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { target: 500, suffix: "+", label: "Agents Deployed", color: C.cyan },
              { target: 50, suffix: "+", label: "Industries", color: C.purple },
              { target: 24, suffix: "/7/365", label: "Uptime", color: C.green },
              { target: 30, suffix: " min", label: "Setup Time", color: C.cyan },
            ].map((s, i) => (
              <RevealSection key={s.label} delay={i * 0.1}>
                <div className="glass-card rounded-2xl p-6 text-center" data-testid={`card-stat-${i}`}>
                  <div className="title-font text-3xl md:text-4xl font-black mb-2" style={{ color: s.color }}>
                    <CountUp target={s.target} suffix={s.suffix} />
                  </div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">{s.label}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-5" data-testid="section-faq">
        <div className="max-w-[700px] mx-auto">
          <RevealSection>
            <div className="text-center mb-14">
              <h2 className="title-font text-3xl md:text-4xl font-black mb-4">
                <DecodeText text="Frequently Asked Questions" as="span" delay={0} />
              </h2>
            </div>
          </RevealSection>

          <div className="space-y-3">
            {[
              { q: "What industries do your AI agents work for?", a: "Our agents are industry-agnostic. We've built them for real estate, healthcare, e-commerce, coaching, legal, home services, and dozens more. If your business has repetitive workflows, we can automate them." },
              { q: "How long does setup take?", a: "Most agents are live within 30 minutes. We handle everything — training, integration, testing — so you don't have to lift a finger." },
              { q: "Do I need technical skills?", a: "Not at all. We build and manage everything for you. You just tell us what you need in plain English, and we make it happen." },
              { q: "Can the AI handle complex conversations?", a: "Yes. Our agents use advanced language models trained on your specific business data. They handle objections, answer detailed questions, and know when to escalate to a human." },
              { q: "How does AI trading work?", a: "Our trading agents use real-time market analysis, sentiment data, and proven strategies to execute trades autonomously. They support crypto, stocks, futures, and leverage trading on major exchanges." },
              { q: "What about the team commission program?", a: "Refer businesses to us, we build their AI agents, and you earn 30% lifetime commission for every month they stay. No cap on earnings." },
            ].map(faq => (
              <RevealSection key={faq.q} delay={0}>
                <FAQItem question={faq.q} answer={faq.a} />
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-5 relative" data-testid="section-cta">
        <div className="absolute inset-0 overflow-hidden flex items-center justify-center opacity-5 pointer-events-none">
          <img src={robotImgSrc} alt="" className="h-[400px] object-contain" style={{ filter: `drop-shadow(0 0 60px ${C.cyan})`, mixBlendMode: "lighten" }} />
        </div>
        <div className="relative z-10 max-w-[700px] mx-auto text-center">
          <RevealSection>
            <h2 className="title-font text-3xl md:text-5xl font-black mb-6">
              <GlitchWord text="Stop Losing Leads.">
                <DecodeText text="Stop Losing Leads." as="span" delay={0} />
              </GlitchWord>
              <br />
              <span className="neon-gradient-text">Put AI to Work Today.</span>
            </h2>
            <p className="text-slate-400 mb-10 max-w-[500px] mx-auto leading-relaxed text-lg">
              Custom AI agent, built and deployed in 30 minutes. No code. No waiting. No burnout.
            </p>
            <div className="flex flex-col items-center gap-5">
              <Button
                size="lg"
                onClick={() => scrollTo("forms")}
                className="px-12 py-6 text-lg font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-green-400 text-black rounded-2xl hover:scale-105 transition-all"
                data-testid="button-cta-final"
              >
                <Bot className="w-5 h-5 mr-2" /> BUILD MY CUSTOM AI AGENT NOW
              </Button>
              <a href="sms:+17542504912" data-testid="link-cta-text">
                <Button variant="outline" className="border-white/10 text-slate-400 bg-white/[0.02]">
                  <MessageSquare className="w-4 h-4 mr-2" style={{ color: C.purple }} /> Questions? Text (754) 250-4912
                </Button>
              </a>
            </div>
          </RevealSection>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-8 px-5" data-testid="footer">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>CLAWD</span>
            </div>
            <div className="flex gap-6 text-xs text-slate-500 flex-wrap justify-center">
              {[
                { label: "Home", action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
                { label: "Capabilities", action: () => scrollTo("features") },
                { label: "AI Trading", action: () => scrollTo("trading") },
                { label: "Get Started", action: () => scrollTo("forms") },
                { label: "FAQ", action: () => scrollTo("section-faq") },
              ].map(l => (
                <button key={l.label} onClick={l.action} className="hover:text-white transition-colors duration-300" data-testid={`link-footer-${l.label.toLowerCase()}`}>
                  {l.label}
                </button>
              ))}
              <a href="sms:+17542504912" className="hover:text-white transition-colors duration-300" data-testid="link-footer-contact">Contact</a>
            </div>
            <p className="text-xs text-slate-600" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              aibotsetup.com
            </p>
          </div>
        </div>
      </footer>
    </div>
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
      grad.addColorStop(0, "rgba(34, 255, 136, 0.15)");
      grad.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.moveTo(0, h);
      points.forEach((p, i) => {
        const x = (i / (maxPoints - 1)) * w;
        const y = h - (p / 100) * h;
        if (i === 0) ctx.lineTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.lineTo(w, h);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      points.forEach((p, i) => {
        const x = (i / (maxPoints - 1)) * w;
        const y = h - (p / 100) * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
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
