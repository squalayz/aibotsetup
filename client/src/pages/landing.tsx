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
  Briefcase, Link, Zap, Shield, Globe, Sparkles, Star,
} from "lucide-react";
import robotImgSrc from "@assets/liftapp_(10)_1771462069765.png";

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
          outerGrad.addColorStop(0, "rgba(0, 150, 255, 0.06)");
          outerGrad.addColorStop(1, "transparent");
          ctx.fillStyle = outerGrad;
          ctx.beginPath();
          ctx.arc(ex, ey, 25, 0, Math.PI * 2);
          ctx.fill();

          const grad = ctx.createRadialGradient(ex, ey, 0, ex, ey, 8);
          grad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
          grad.addColorStop(0.4, "rgba(0, 150, 255, 0.7)");
          grad.addColorStop(1, "transparent");
          ctx.fillStyle = grad;
          ctx.shadowColor = "#0096ff";
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
        ctx.strokeStyle = "rgba(0, 150, 255, 0.06)";
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
        ctx.fillStyle = "rgba(0, 200, 255, 0.7)";
        ctx.shadowColor = "#0096ff";
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
        ctx.fillStyle = `rgba(0, 180, 255, ${p.life * 0.4})`;
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
          ctx.fillStyle = "rgba(0, 200, 255, 0.04)";
          ctx.fillRect(0, sy - 10, w, 20);
          ctx.strokeStyle = "rgba(0, 200, 255, 0.5)";
          ctx.lineWidth = 2;
          ctx.shadowColor = "#0096ff";
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
      chestGrad.addColorStop(0, "rgba(0, 150, 255, 0.15)");
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
          ctx.strokeStyle = `rgba(0, 150, 255, ${(1 - sp) * 0.15})`;
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
        alt="CLAWD AI Agent"
        className="robot-image"
        draggable={false}
      />
      <canvas ref={canvasRef} className="robot-fx-canvas" />
    </div>
  );
}

function MiniAIBust({ color, size = 64 }: { color: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const blinkRef = useRef(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const colorMap: Record<string, string> = {
      teal: COLORS.cyan, purple: COLORS.purple, green: COLORS.green, orange: "#fb923c"
    };
    const c = colorMap[color] || COLORS.cyan;

    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };
    window.addEventListener("mousemove", onMouse);

    const blinkInterval = setInterval(() => {
      blinkRef.current = true;
      setTimeout(() => { blinkRef.current = false; }, 150);
    }, 3000 + Math.random() * 4000);

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size * 0.35;
      const s = size * 0.012;

      ctx.strokeStyle = `${c}80`;
      ctx.lineWidth = 0.8;
      ctx.shadowColor = c;
      ctx.shadowBlur = 4;

      ctx.beginPath();
      ctx.moveTo(cx - 12 * s, cy - 16 * s);
      ctx.lineTo(cx - 16 * s, cy - 5 * s);
      ctx.lineTo(cx - 14 * s, cy + 5 * s);
      ctx.lineTo(cx - 8 * s, cy + 12 * s);
      ctx.lineTo(cx, cy + 14 * s);
      ctx.lineTo(cx + 8 * s, cy + 12 * s);
      ctx.lineTo(cx + 14 * s, cy + 5 * s);
      ctx.lineTo(cx + 16 * s, cy - 5 * s);
      ctx.lineTo(cx + 12 * s, cy - 16 * s);
      ctx.closePath();
      ctx.stroke();

      const shY = cy + 14 * s;
      ctx.beginPath();
      ctx.moveTo(cx - 8 * s, shY);
      ctx.lineTo(cx - 22 * s, shY + 12 * s);
      ctx.lineTo(cx - 22 * s, shY + 20 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 8 * s, shY);
      ctx.lineTo(cx + 22 * s, shY + 12 * s);
      ctx.lineTo(cx + 22 * s, shY + 20 * s);
      ctx.stroke();

      const eyeY = cy - 3 * s;
      const eyeSpacing = 7 * s;
      const eyeH = blinkRef.current ? 0.3 : 2.5 * s;
      const lookX = (mouseRef.current.x - 0.5) * 3;
      const lookY = (mouseRef.current.y - 0.5) * 2;

      ctx.fillStyle = c;
      ctx.shadowBlur = 8;
      [-1, 1].forEach(side => {
        const ex = cx + side * eyeSpacing;
        ctx.beginPath();
        ctx.arc(ex + lookX, eyeY + lookY, eyeH, 0, Math.PI * 2);
        ctx.fill();
      });

      frame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("mousemove", onMouse);
      clearInterval(blinkInterval);
      cancelAnimationFrame(frame);
    };
  }, [color, size]);

  return <canvas ref={ref} style={{ width: size, height: size }} />;
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
        <span key={i} style={{ color: !resolved && ch !== text[i] ? COLORS.cyan : undefined, transition: "color 0.1s" }}>
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
  const [isMobileView, setIsMobileView] = useState(typeof window !== "undefined" && window.innerWidth < 768);
  const { toast } = useToast();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    const resizeHandler = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener("scroll", handler);
    window.addEventListener("resize", resizeHandler);
    return () => { window.removeEventListener("scroll", handler); window.removeEventListener("resize", resizeHandler); };
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
    onSuccess: () => setSignupSuccess(true),
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ backgroundColor: COLORS.bg }}>

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
                    <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-4">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}>
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
                      <Button variant="outline" onClick={resetForm} className="mt-6 border-green-500/30" style={{ color: "#86efac" }} data-testid="button-signup-done">
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
                          <Input value={signupName} onChange={(e) => setSignupName(e.target.value)} type="text" placeholder="John Smith" className="bg-white/[0.03] border-white/[0.08]" data-testid="input-signup-name" />
                        </div>
                        <div>
                          <Label className="text-xs uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color: COLORS.cyan }}>
                            <Mail className="w-3.5 h-3.5" /> Email Address
                          </Label>
                          <Input value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} type="email" placeholder="you@email.com" className="bg-white/[0.03] border-white/[0.08]" data-testid="input-signup-email" />
                        </div>
                        <div>
                          <Label className="text-xs uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color: COLORS.cyan }}>
                            <Phone className="w-3.5 h-3.5" /> Phone Number
                          </Label>
                          <Input value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} type="tel" placeholder="+1 (555) 123-4567" className="bg-white/[0.03] border-white/[0.08]" data-testid="input-signup-phone" />
                        </div>
                        <div>
                          <Label className="text-xs uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color: COLORS.cyan }}>
                            <MessageSquare className="w-3.5 h-3.5" /> What do you need? (optional)
                          </Label>
                          <Textarea value={signupMessage} onChange={(e) => setSignupMessage(e.target.value)} placeholder="e.g. I need an AI receptionist that answers calls..." className="bg-white/[0.03] border-white/[0.08] resize-none" rows={3} data-testid="input-signup-message" />
                        </div>
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 border-green-400/40 text-white font-bold"
                        onClick={() => signupMutation.mutate()}
                        disabled={!signupName || !signupEmail || !signupPhone || signupMutation.isPending}
                        data-testid="button-submit-signup"
                      >
                        {signupMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                        {signupMutation.isPending ? "Submitting..." : "Get My AI Agent"}
                      </Button>
                      <p className="text-[11px] text-slate-500 text-center mt-3">No commitment required. We'll reach out to discuss your project.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? "backdrop-blur-xl border-b border-white/[0.06]" : ""}`}
        style={{ backgroundColor: scrolled ? "rgba(7,7,15,0.85)" : "transparent" }}
        data-testid="nav-main"
      >
        <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between gap-4 h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: "rgba(0,229,255,0.12)", border: "1px solid rgba(0,229,255,0.2)" }}>
              <Bot className="w-4.5 h-4.5" style={{ color: COLORS.cyan }} />
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ color: COLORS.cyan, fontFamily: "'Orbitron', sans-serif" }}>
              CLAWD
            </span>
          </div>
          <div className="relative group">
            <div className="absolute -inset-[1px] rounded-md overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute w-16 h-[2px] animate-circuit-trace" style={{ background: `linear-gradient(90deg, transparent, ${COLORS.green}, transparent)` }} />
            </div>
            <Button variant="outline" size="sm" className="border-white/10 text-white bg-white/[0.03]" onClick={() => setShowSignup(true)} data-testid="button-nav-cta">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center pt-16 pb-20 px-5" data-testid="section-hero">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col-reverse md:flex-row items-center gap-8 md:gap-0">
          <div className="w-full md:w-[45%] relative z-10 text-left">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Badge variant="outline" className="mb-6 border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 text-xs tracking-widest uppercase" style={{ color: COLORS.cyan, fontFamily: "'Orbitron', sans-serif" }}>
                <Sparkles className="w-3 h-3 mr-2" />
                AI Agents for Any Business
              </Badge>
            </motion.div>

            <div className="hero-headline mb-6" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 1.1 }}>
              <DecodeText text="We Build " as="span" className="" delay={0.3} />
              <br />
              <GlitchWord text="AI Agents" className="gradient-text-animate">
                <DecodeText text="AI Agents" as="span" delay={0.5} className="gradient-text-animate" />
              </GlitchWord>
              <br />
              <DecodeText text="That Run" as="span" className="" delay={0.7} />
              <br />
              <DecodeText text="Your Business" as="span" className="" delay={0.9} />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="text-slate-400 max-w-[500px] mb-10 leading-relaxed"
              style={{ fontSize: "clamp(0.95rem, 2vw, 1.1rem)" }}
            >
              <TypewriterText
                text="Our AI agents don't just chat — they think, decide, and act. They answer your phones, book appointments, follow up leads, post content, and close sales — 24/7, with zero burnout."
                delay={1.8}
                speed={20}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.5 }}
              className="flex flex-col items-start gap-4"
            >
              <div
                className="relative group cursor-pointer"
                onClick={() => setShowSignup(true)}
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
                <Button size="lg" variant="outline" className="border-white/10 text-slate-400 bg-white/[0.02]">
                  <MessageSquare className="w-4 h-4 mr-2" style={{ color: COLORS.purple }} /> Questions? Text (754) 250-4912
                </Button>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 3 }}
              className="mt-10 flex gap-4 md:gap-6 text-xs text-slate-500 uppercase tracking-widest flex-wrap"
            >
              {["Custom AI", "24/7 Uptime", "Multi-Platform"].map((item, i) => (
                <motion.span key={item} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3 + i * 0.15 }} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS.cyan }} />
                  {item}
                </motion.span>
              ))}
            </motion.div>
          </div>

          <div className="w-full md:w-[55%] relative" style={{ minHeight: isMobileView ? "40vh" : "500px", height: isMobileView ? "40vh" : "70vh", maxHeight: isMobileView ? "400px" : "750px" }}>
            <RobotHero />
            <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{
              background: `linear-gradient(to top, ${COLORS.bg}, transparent)`,
            }} />
          </div>
        </div>
      </section>

      <section className="py-20 px-5" data-testid="section-capabilities">
        <div className="max-w-[1000px] mx-auto">
          <RevealSection>
            <div className="text-center mb-14">
              <h2 className="hero-headline-sm text-3xl md:text-4xl mb-4">
                <DecodeText text="What Your AI Agent Does" as="span" delay={0} />
              </h2>
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
                    <h3 className="hero-headline-sm text-base font-semibold text-white mb-2">
                      <DecodeText text={cap.title} as="span" />
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{cap.desc}</p>
                  </div>
                </Card>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-5" data-testid="section-agents">
        <div className="max-w-[1000px] mx-auto">
          <RevealSection>
            <div className="text-center mb-14">
              <h2 className="hero-headline-sm text-3xl md:text-4xl mb-4">
                <DecodeText text="Your AI Team" as="span" delay={0} />
              </h2>
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
                    <div className="shrink-0 rounded-md border border-white/[0.06] overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
                      <MiniAIBust color={agent.color} size={56} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-bold" style={{ color: agent.borderColor, fontFamily: "'Orbitron', sans-serif" }}>
                          <DecodeText text={agent.name} as="span" delay={0.2 + i * 0.1} />
                        </span>
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

      <section className="py-20 px-5" data-testid="section-how-it-works">
        <div className="max-w-[700px] mx-auto">
          <RevealSection>
            <div className="text-center mb-14">
              <h2 className="hero-headline-sm text-3xl md:text-4xl mb-4">
                <DecodeText text="How It Works" as="span" delay={0} />
              </h2>
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
              { num: 1, title: "Book a Free Zoom Call", desc: "See AI agents in action, live" },
              { num: 2, title: "Tell Us Your Workflows", desc: "We learn your business inside and out" },
              { num: 3, title: "We Build Your Agent", desc: "Custom-trained on your data and tools" },
              { num: 4, title: "Launch & Profit", desc: "Your agent goes live and starts working day one" },
            ].map((step, i) => (
              <RevealSection key={step.num} delay={i * 0.15}>
                <div className="flex items-start gap-5 mb-10 last:mb-0 pl-0">
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-12 h-12 rounded-md flex items-center justify-center border border-white/[0.08]" style={{ backgroundColor: "rgba(0,229,255,0.08)" }}>
                      <span className="text-lg font-bold" style={{ color: COLORS.cyan, fontFamily: "'Orbitron', sans-serif" }}>{step.num}</span>
                    </div>
                  </div>
                  <div className="pt-1">
                    <h3 className="hero-headline-sm text-lg font-semibold text-white mb-1">
                      <DecodeText text={step.title} as="span" delay={0.2 + i * 0.1} />
                    </h3>
                    <p className="text-sm text-slate-400">{step.desc}</p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-5" data-testid="section-pricing">
        <div className="max-w-[1000px] mx-auto">
          <RevealSection>
            <div className="text-center mb-14">
              <h2 className="hero-headline-sm text-3xl md:text-4xl mb-4">
                <DecodeText text="Choose Your Plan" as="span" delay={0} />
              </h2>
              <p className="text-slate-400 max-w-[550px] mx-auto">
                Flexible pricing for businesses of every size
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Starter",
                price: 199,
                desc: "Perfect for solo businesses needing one focused AI agent",
                features: ["1 Custom AI Agent", "Phone or Chat Support", "Basic Integration (1 tool)", "Email Notifications", "5-Day Setup"],
                popular: false,
              },
              {
                name: "Growth",
                price: 499,
                desc: "For growing businesses that need multiple capabilities",
                features: ["2 Custom AI Agents", "Phone, Chat & Email Support", "Full CRM Integration", "Lead Tracking Dashboard", "Priority 3-Day Setup", "Monthly Optimization"],
                popular: true,
              },
              {
                name: "Enterprise",
                price: 799,
                desc: "Complete AI workforce for established businesses",
                features: ["4 Custom AI Agents", "Omnichannel Support", "Unlimited Integrations", "Advanced Analytics", "1-on-1 Strategy Session", "48-Hour Setup", "Dedicated Account Manager"],
                popular: false,
              },
            ].map((tier, i) => (
              <RevealSection key={tier.name} delay={i * 0.12}>
                <Card
                  className={`relative p-6 bg-white/[0.02] border-white/[0.06] overflow-visible hover-elevate h-full flex flex-col ${tier.popular ? "md:-mt-4 md:mb-4" : ""}`}
                  data-testid={`card-pricing-${tier.name.toLowerCase()}`}
                >
                  {tier.popular && (
                    <>
                      <div className="absolute -inset-[2px] rounded-md overflow-hidden pointer-events-none">
                        <motion.div
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(90deg, ${COLORS.cyan}40, ${COLORS.purple}40, ${COLORS.green}40, ${COLORS.cyan}40)`,
                            backgroundSize: "300% 100%",
                          }}
                          animate={{ backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0 px-4 text-xs uppercase tracking-widest" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                          <Star className="w-3 h-3 mr-1" /> Most Popular
                        </Badge>
                      </div>
                    </>
                  )}

                  <div className="relative flex flex-col h-full">
                    <p className="text-sm font-semibold mb-2" style={{ color: COLORS.cyan, fontFamily: "'Orbitron', sans-serif" }}>{tier.name}</p>
                    <div className="hero-headline mb-3" style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", lineHeight: 1.1 }}>
                      $<CountUp target={tier.price} />
                    </div>
                    <p className="text-sm text-slate-400 mb-6 leading-relaxed">{tier.desc}</p>

                    <ul className="space-y-2.5 mb-8 flex-1">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                          <Check className="w-4 h-4 shrink-0" style={{ color: COLORS.green }} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full font-bold ${tier.popular ? "text-white" : "text-white border-white/10"}`}
                      variant={tier.popular ? "default" : "outline"}
                      style={tier.popular ? { background: `linear-gradient(90deg, #16a34a, #10b981, #16a34a)`, borderColor: "rgba(34,197,94,0.4)" } : {}}
                      onClick={() => setShowSignup(true)}
                      data-testid={`button-pricing-${tier.name.toLowerCase()}`}
                    >
                      Get Started <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Card>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

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
                  <div className="hero-headline text-3xl md:text-4xl mb-2">
                    <CountUp target={s.target} suffix={s.suffix} />
                  </div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">{s.label}</p>
                </Card>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-5" data-testid="section-faq">
        <div className="max-w-[700px] mx-auto">
          <RevealSection>
            <div className="text-center mb-14">
              <h2 className="hero-headline-sm text-3xl md:text-4xl mb-4">
                <DecodeText text="Frequently Asked Questions" as="span" delay={0} />
              </h2>
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

      <section className="py-24 px-5 relative" data-testid="section-cta">
        <div className="absolute inset-0 overflow-hidden flex items-center justify-center opacity-10 pointer-events-none">
          <img src={robotImgSrc} alt="" className="h-[300px] object-contain" style={{ filter: "drop-shadow(0 0 40px rgba(0,150,255,0.3))", mixBlendMode: "lighten" }} />
        </div>
        <div className="relative z-10 max-w-[700px] mx-auto text-center">
          <RevealSection>
            <h2 className="hero-headline text-3xl md:text-5xl mb-6">
              <GlitchWord text="Ready to Put AI to Work?">
                <DecodeText text="Ready to Put AI to Work?" as="span" delay={0} />
              </GlitchWord>
            </h2>
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

      <footer className="border-t border-white/[0.06] py-8 px-5" data-testid="footer">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.15)" }}>
                <Bot className="w-3.5 h-3.5" style={{ color: COLORS.cyan }} />
              </div>
              <span className="font-bold text-sm" style={{ color: COLORS.cyan, fontFamily: "'Orbitron', sans-serif" }}>CLAWD</span>
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
            <p className="text-xs text-slate-600" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              Built by CLAWD
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
