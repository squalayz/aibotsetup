import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, useInView, AnimatePresence, useScroll, useTransform } from "framer-motion";
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
  Sparkles, Zap, Shield, Globe, Brain, Mail, Code,
  ArrowRight, Check, Bot, ChevronRight, ExternalLink,
  Phone, HeadphonesIcon, Users, MessageSquare, Briefcase,
  X, CheckCircle, Loader2, Eye, Link, BarChart3, Cpu,
  Calendar, Star, ChevronDown, Rocket, Settings,
} from "lucide-react";

function RevealSection({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, filter: "blur(8px)" }}
      animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function NeuralNetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const nodesRef = useRef<{ x: number; y: number; vx: number; vy: number; radius: number; pulse: number; pulseSpeed: number }[]>([]);
  const particlesRef = useRef<{ x: number; y: number; vy: number; vx: number; life: number; maxLife: number; size: number }[]>([]);
  const animRef = useRef(0);
  const scrollRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const isMobile = window.innerWidth < 768;
    const nodeCount = isMobile ? 20 : 50;
    const particleCount = isMobile ? 15 : 40;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const nodes: typeof nodesRef.current = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: 1.5 + Math.random() * 2,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.02,
      });
    }
    nodesRef.current = nodes;

    const particles: typeof particlesRef.current = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vy: -(0.2 + Math.random() * 0.5),
        vx: (Math.random() - 0.5) * 0.2,
        life: Math.random() * 200,
        maxLife: 150 + Math.random() * 150,
        size: 1 + Math.random() * 2,
      });
    }
    particlesRef.current = particles;

    const onMouse = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onScroll = () => { scrollRef.current = window.scrollY; };
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", resize);

    let paused = false;
    const onVisibility = () => { paused = document.hidden; };
    document.addEventListener("visibilitychange", onVisibility);

    const draw = () => {
      if (paused) { animRef.current = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const connectionDist = isMobile ? 120 : 160;

      nodes.forEach(n => {
        n.pulse += n.pulseSpeed;
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.12;
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach(n => {
        const glow = 0.3 + Math.sin(n.pulse) * 0.2;
        const distToMouse = Math.sqrt((n.x - mx) ** 2 + (n.y - my) ** 2);
        const mouseBoost = distToMouse < 200 ? (1 - distToMouse / 200) * 0.5 : 0;
        ctx.fillStyle = `rgba(0, 229, 255, ${glow + mouseBoost})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + mouseBoost * 2, 0, Math.PI * 2);
        ctx.fill();
      });

      particles.forEach(p => {
        p.life++;
        if (p.life > p.maxLife) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 10;
          p.life = 0;
        }
        p.x += p.vx;
        p.y += p.vy;

        const distToMouse = Math.sqrt((p.x - mx) ** 2 + (p.y - my) ** 2);
        if (distToMouse < 100) {
          const angle = Math.atan2(p.y - my, p.x - mx);
          p.x += Math.cos(angle) * 2;
          p.y += Math.sin(angle) * 2;
        }

        const lifeRatio = 1 - p.life / p.maxLife;
        const alpha = lifeRatio * 0.4;
        ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * lifeRatio, 0, Math.PI * 2);
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[1]" />;
}

function CursorCompanions() {
  const companionsRef = useRef<HTMLDivElement[]>([]);
  const positions = useRef([
    { x: 0, y: 0, targetX: 0, targetY: 0 },
    { x: 0, y: 0, targetX: 0, targetY: 0 },
    { x: 0, y: 0, targetX: 0, targetY: 0 },
  ]);
  const orbitAngle = useRef(0);
  const lastMoveTime = useRef(Date.now());
  const isMoving = useRef(false);

  useEffect(() => {
    if ("ontouchstart" in window) return;

    const onMouse = (e: MouseEvent) => {
      positions.current.forEach(p => {
        p.targetX = e.clientX;
        p.targetY = e.clientY;
      });
      lastMoveTime.current = Date.now();
      isMoving.current = true;
    };
    window.addEventListener("mousemove", onMouse);

    let raf: number;
    const animate = () => {
      const now = Date.now();
      if (now - lastMoveTime.current > 500) {
        isMoving.current = false;
        orbitAngle.current += 0.02;
      }

      positions.current.forEach((p, i) => {
        const delay = 0.04 + i * 0.03;
        if (isMoving.current) {
          p.x += (p.targetX - p.x) * delay;
          p.y += (p.targetY - p.y) * delay;
        } else {
          const angle = orbitAngle.current + (i * Math.PI * 2) / 3;
          const radius = 40 + i * 15;
          const orbitX = p.targetX + Math.cos(angle) * radius;
          const orbitY = p.targetY + Math.sin(angle) * radius;
          p.x += (orbitX - p.x) * 0.05;
          p.y += (orbitY - p.y) * 0.05;
        }

        const el = companionsRef.current[i];
        if (el) {
          el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`;
        }
      });

      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("mousemove", onMouse);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (typeof window !== "undefined" && "ontouchstart" in window) return null;

  const colors = [
    "bg-cyan-400/60 shadow-cyan-400/40",
    "bg-violet-400/50 shadow-violet-400/30",
    "bg-green-400/50 shadow-green-400/30",
  ];
  const sizes = ["w-3 h-3", "w-2.5 h-2.5", "w-2 h-2"];

  return (
    <div className="fixed inset-0 pointer-events-none z-[60]">
      {colors.map((c, i) => (
        <div
          key={i}
          ref={el => { if (el) companionsRef.current[i] = el; }}
          className={`absolute rounded-full ${sizes[i]} ${c} shadow-lg`}
          style={{ willChange: "transform" }}
        />
      ))}
    </div>
  );
}

function HolographicSphere() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let raf: number;
    let autoAngle = 0;
    const onMouse = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      setRotation({
        x: ((e.clientY - cy) / cy) * 15,
        y: ((e.clientX - cx) / cx) * 15,
      });
    };
    window.addEventListener("mousemove", onMouse);

    const auto = () => {
      autoAngle += 0.3;
      if (containerRef.current) {
        containerRef.current.style.setProperty("--auto-rotate", `${autoAngle}deg`);
      }
      raf = requestAnimationFrame(auto);
    };
    auto();

    return () => {
      window.removeEventListener("mousemove", onMouse);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[450px] md:h-[450px]"
      style={{
        perspective: "800px",
        perspectiveOrigin: "50% 50%",
      }}
    >
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: "transform 0.3s ease-out",
        }}
      >
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="absolute inset-0 rounded-full border border-cyan-500/20"
            style={{
              transform: `rotateY(${i * 60}deg) rotateX(var(--auto-rotate, 0deg))`,
              transformStyle: "preserve-3d",
            }}
          />
        ))}
        {[0, 1, 2].map(i => (
          <div
            key={`h-${i}`}
            className="absolute inset-0 rounded-full border border-violet-500/15"
            style={{
              transform: `rotateX(${i * 60}deg) rotateZ(var(--auto-rotate, 0deg))`,
              transformStyle: "preserve-3d",
            }}
          />
        ))}
        <div className="absolute inset-[15%] rounded-full bg-gradient-to-br from-cyan-500/5 via-violet-500/5 to-transparent" />
        <div className="absolute inset-0 rounded-full" style={{
          background: "radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)",
        }} />
      </div>
    </div>
  );
}

function ScanLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.1) 2px, rgba(0,229,255,0.1) 4px)",
      }} />
      <motion.div
        className="absolute left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.3), transparent)" }}
        animate={{ top: ["-5%", "105%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
      />
    </div>
  );
}

function TypewriterText({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const timer = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [isInView, delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 35);
    return () => clearInterval(interval);
  }, [started, text]);

  return (
    <span ref={ref} className={className}>
      {displayed}
      {started && displayed.length < text.length && (
        <span className="animate-pulse text-cyan-400">|</span>
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
    let start = 0;
    const duration = 2000;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(eased * target);
      setCount(start);
      if (progress < 1) requestAnimationFrame(tick);
    };
    tick();
  }, [isInView, target]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

function CircuitBorderCard({ children, className = "", color = "cyan" }: { children: React.ReactNode; className?: string; color?: string }) {
  const colorMap: Record<string, string> = {
    cyan: "rgba(0,229,255,0.4)",
    violet: "rgba(168,85,247,0.4)",
    green: "rgba(34,197,94,0.4)",
    orange: "rgba(251,146,60,0.4)",
  };
  const glowColor = colorMap[color] || colorMap.cyan;

  return (
    <div className={`relative group ${className}`}>
      <div className="absolute -inset-[1px] rounded-md overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[100px] h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)` }}
          animate={{
            left: ["-100px", "calc(100% + 100px)"],
            top: ["0px", "0px"],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
        />
      </div>
      {children}
    </div>
  );
}

function AgentFace({ name, color, role, message, themeColor }: {
  name: string; color: string; role: string; message: string; themeColor: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      setEyeOffset({ x: Math.max(-1, Math.min(1, dx)) * 4, y: Math.max(-1, Math.min(1, dy)) * 3 });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const colorStyles: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    teal: { bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-400", glow: "shadow-cyan-500/20" },
    purple: { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400", glow: "shadow-violet-500/20" },
    green: { bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-400", glow: "shadow-green-500/20" },
    orange: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", glow: "shadow-orange-500/20" },
  };
  const s = colorStyles[themeColor] || colorStyles.teal;

  return (
    <Card
      ref={ref}
      className={`p-6 ${s.bg} backdrop-blur-xl ${s.border} relative overflow-visible hover-elevate`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`card-agent-${name.toLowerCase()}`}
    >
      <div className="flex items-start gap-4">
        <div className={`relative w-16 h-16 rounded-md ${s.bg} ${s.border} border flex items-center justify-center shrink-0`}>
          <motion.div
            animate={{ scale: isHovered ? 1.1 : 1 }}
            className="relative"
          >
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center">
              <div className="relative w-6 h-4">
                <div className={`absolute left-0 top-0 w-2.5 h-2.5 rounded-full ${isHovered ? "bg-white" : "bg-white/60"} transition-colors duration-300`}>
                  <div
                    className={`absolute w-1 h-1 rounded-full bg-current ${s.text} transition-transform`}
                    style={{ transform: `translate(${3 + eyeOffset.x}px, ${3 + eyeOffset.y}px)` }}
                  />
                </div>
                <div className={`absolute right-0 top-0 w-2.5 h-2.5 rounded-full ${isHovered ? "bg-white" : "bg-white/60"} transition-colors duration-300`}>
                  <div
                    className={`absolute w-1 h-1 rounded-full bg-current ${s.text} transition-transform`}
                    style={{ transform: `translate(${3 + eyeOffset.x}px, ${3 + eyeOffset.y}px)` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            animate={isHovered ? { opacity: 0.6 } : { opacity: 0 }}
            className={`absolute -inset-2 rounded-md ${s.bg} blur-md`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`font-mono text-sm font-bold ${s.text}`}>{name}</span>
            <span className="flex items-center gap-1 text-[10px] text-green-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              ONLINE
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">{role}</p>
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 5, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: 5, height: 0 }}
                className={`text-xs ${s.border} border rounded-md p-2 ${s.bg} font-mono`}
              >
                <span className={s.text}>{name}:</span>{" "}
                <TypewriterText text={message} delay={0} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Card
      className="bg-card/40 backdrop-blur-xl border-violet-500/10 overflow-visible cursor-pointer hover-elevate"
      onClick={() => setOpen(!open)}
      data-testid={`faq-${question.slice(0, 20).toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex items-center justify-between gap-3 p-5">
        <span className="font-semibold text-foreground text-sm">{question}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <ChevronDown className="w-4 h-4 text-cyan-400 shrink-0" />
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
              <Bot className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
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
  const { toast } = useToast();

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
    <div className="relative min-h-screen overflow-x-hidden bg-[#0a0a1a]">
      <NeuralNetworkCanvas />
      <CursorCompanions />

      {/* Signup Modal */}
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
              <Card className="relative p-8 bg-[#0d0d1f]/95 backdrop-blur-xl border-green-500/20">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetForm}
                  className="absolute top-3 right-3 text-muted-foreground"
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
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-5" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-green-300 mb-3" data-testid="text-signup-success">We Got Your Request!</h3>
                      <p className="text-muted-foreground leading-relaxed mb-2">
                        Thanks {signupName ? signupName.split(" ")[0] : ""}! We'll be in touch shortly.
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                        We'll reach out to <strong className="text-green-300">{signupEmail}</strong> or <strong className="text-green-300">{signupPhone}</strong> to discuss your AI agent.
                      </p>
                      <div className="space-y-3">
                        <Card className="p-4 bg-green-500/5 border-green-500/15">
                          <div className="flex items-start gap-3">
                            <Bot className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                            <div className="text-left">
                              <p className="text-sm font-semibold text-foreground mb-1">What happens next?</p>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-400" /> We review your request within 24 hours</li>
                                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-400" /> We'll reach out to discuss your needs</li>
                                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-400" /> Get a custom quote for your AI agent</li>
                                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-400" /> Your agent gets built and goes live</li>
                              </ul>
                            </div>
                          </div>
                        </Card>
                      </div>
                      <Button
                        variant="outline"
                        onClick={resetForm}
                        className="mt-6 border-green-500/30 text-green-300"
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
                          className="w-16 h-16 rounded-md bg-gradient-to-br from-green-500/20 to-cyan-500/20 border border-green-500/20 flex items-center justify-center mx-auto mb-4"
                        >
                          <Bot className="w-8 h-8 text-green-400" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-foreground mb-2" data-testid="heading-signup-modal">Get Your AI Agent</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Tell us what you need and we'll build a custom AI agent for your business.
                          We'll reach out to discuss your project privately.
                        </p>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div>
                          <Label className="text-xs text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Users className="w-3.5 h-3.5" /> Your Name
                          </Label>
                          <Input
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            type="text"
                            placeholder="John Smith"
                            className="bg-background/60 border-cyan-500/15"
                            data-testid="input-signup-name"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5" /> Email Address
                          </Label>
                          <Input
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            type="email"
                            placeholder="you@email.com"
                            className="bg-background/60 border-cyan-500/15"
                            data-testid="input-signup-email"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5" /> Phone Number
                          </Label>
                          <Input
                            value={signupPhone}
                            onChange={(e) => setSignupPhone(e.target.value)}
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            className="bg-background/60 border-cyan-500/15"
                            data-testid="input-signup-phone"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <MessageSquare className="w-3.5 h-3.5" /> What do you need? (optional)
                          </Label>
                          <Textarea
                            value={signupMessage}
                            onChange={(e) => setSignupMessage(e.target.value)}
                            placeholder="e.g. I need an AI receptionist that answers calls and books appointments..."
                            className="bg-background/60 border-cyan-500/15 resize-none"
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

                      <p className="text-[11px] text-muted-foreground/60 text-center mt-3">
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

      <div className="relative z-10 max-w-[1200px] mx-auto px-5">
        {/* NAV */}
        <nav className="flex items-center justify-between gap-4 py-5 border-b border-cyan-500/10" data-testid="nav-main">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-md bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 rounded-md bg-gradient-to-br from-cyan-500/20 to-violet-500/20 blur-sm -z-10" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent tracking-tight font-mono">
              CLAWD
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="border-cyan-500/20 text-cyan-300 bg-cyan-500/5"
              onClick={() => setShowSignup(true)}
              data-testid="button-nav-cta"
            >
              Get Started
            </Button>
          </div>
        </nav>

        {/* ═══════════ SECTION 1: HERO ═══════════ */}
        <section className="text-center pt-24 pb-20 relative min-h-[90vh] flex flex-col items-center justify-center" data-testid="section-hero">
          <ScanLines />
          <HolographicSphere />

          <div className="relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Badge variant="outline" className="mb-8 border-cyan-500/30 text-cyan-300 bg-cyan-500/5 px-4 py-1.5 text-xs tracking-widest uppercase font-mono">
                <Sparkles className="w-3 h-3 mr-2" />
                AI Agents for Any Business
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="font-extrabold leading-[1.05] tracking-tight mb-8"
              style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)" }}
            >
              <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                We Build{" "}
              </span>
              <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-green-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                AI Agents
              </span>
              <br />
              <span className="bg-gradient-to-r from-white/90 via-cyan-200 to-violet-200 bg-clip-text text-transparent">
                That Run Your Business
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-slate-400 max-w-[700px] mx-auto mb-12 leading-relaxed"
              style={{ fontSize: "clamp(1rem, 2.5vw, 1.15rem)" }}
            >
              Our AI agents don't just chat — they <strong className="text-cyan-300">think, decide, and act</strong>.
              They answer your phones, book your appointments, follow up with leads, post your content,
              and close your sales — <strong className="text-violet-300">24/7, with zero burnout</strong>.
              Each agent is trained on your business data, plugged into your tools, and designed to handle
              real workflows end-to-end.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-col items-center gap-5"
            >
              <div className="relative group cursor-pointer" onClick={() => setShowSignup(true)} data-testid="button-free-signup-wrapper">
                <div className="absolute -inset-1.5 rounded-md bg-gradient-to-r from-green-500/50 via-emerald-400/40 to-green-500/50 blur-md group-hover:from-green-500/70 group-hover:via-emerald-400/60 group-hover:to-green-500/70 transition-all duration-700 animate-pulse" />
                <Button
                  size="lg"
                  data-testid="button-free-signup"
                  className="relative bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 border-green-400/40 text-white font-bold shadow-lg shadow-green-500/25 tracking-wide text-base px-8"
                >
                  <Bot className="w-5 h-5 mr-2" /> Get Your AI Agent Now
                </Button>
              </div>

              <a href="sms:+17542504912" data-testid="link-contact-text">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-violet-500/20 text-slate-400 bg-white/[0.02] backdrop-blur-sm"
                >
                  <MessageSquare className="w-4 h-4 mr-2 text-violet-400" /> Questions? Text (754) 250-4912
                </Button>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="mt-14 flex justify-center gap-8 text-xs text-slate-500 uppercase tracking-widest flex-wrap"
            >
              {[
                { icon: Bot, label: "Custom AI Agents", color: "text-cyan-500" },
                { icon: Shield, label: "Any Industry", color: "text-violet-500" },
                { icon: Zap, label: "24/7 Uptime", color: "text-green-500" },
                { icon: Globe, label: "Multi-Platform", color: "text-cyan-500" },
              ].map(item => (
                <span key={item.label} className="flex items-center gap-2">
                  <item.icon className={`w-3.5 h-3.5 ${item.color}`} /> {item.label}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════════ SECTION 2: CAPABILITIES ═══════════ */}
        <section className="py-20" data-testid="section-capabilities">
          <RevealSection>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-300 via-violet-300 to-cyan-400 bg-clip-text text-transparent mb-4">
                What Can Your AI Agent Do?
              </h2>
              <p className="text-slate-400 max-w-[600px] mx-auto">
                Each agent is custom-built with the exact capabilities your business needs
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-[1000px] mx-auto">
            {[
              { icon: Phone, title: "Answer Calls", desc: "Your AI picks up the phone 24/7, qualifies leads, and books appointments in real-time.", color: "cyan" },
              { icon: Calendar, title: "Book Appointments", desc: "Syncs with your calendar, handles scheduling, reschedules, and sends confirmations automatically.", color: "violet" },
              { icon: Mail, title: "Follow Up With Leads", desc: "Sends personalized follow-ups via text, email, or DM — no lead slips through the cracks.", color: "green" },
              { icon: MessageSquare, title: "Post Your Content", desc: "Generates and publishes social media content on autopilot across all your platforms.", color: "cyan" },
              { icon: Briefcase, title: "Close Sales", desc: "Handles objections, sends proposals, and guides prospects through your sales pipeline.", color: "violet" },
              { icon: Link, title: "Integrate Everything", desc: "Plugs into your CRM, calendar, email, socials, and 1,000+ other tools seamlessly.", color: "green" },
            ].map((cap, i) => (
              <RevealSection key={cap.title} delay={i * 0.08}>
                <CircuitBorderCard color={cap.color}>
                  <Card className="p-6 bg-white/[0.03] backdrop-blur-xl border-white/[0.06] group relative overflow-visible hover-elevate h-full" data-testid={`card-cap-${cap.title.toLowerCase().replace(/\s+/g, "-")}`}>
                    <div className="absolute inset-0 rounded-md bg-gradient-to-br from-cyan-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="relative">
                      <div className="w-12 h-12 rounded-md bg-gradient-to-br from-cyan-500/10 to-violet-500/10 flex items-center justify-center mb-4 border border-white/[0.06]">
                        <cap.icon className="w-6 h-6 text-cyan-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{cap.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{cap.desc}</p>
                    </div>
                  </Card>
                </CircuitBorderCard>
              </RevealSection>
            ))}
          </div>
        </section>

        {/* ═══════════ SECTION 3: MEET YOUR AI WORKFORCE ═══════════ */}
        <section className="py-20" data-testid="section-agents">
          <RevealSection>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-300 via-violet-300 to-green-300 bg-clip-text text-transparent mb-4">
                Meet Your AI Workforce
              </h2>
              <p className="text-slate-400 max-w-[550px] mx-auto">
                Specialized AI agents, each trained for a specific role in your business
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[900px] mx-auto">
            <RevealSection delay={0}>
              <AgentFace name="LUNA" role="The Receptionist — Handles calls & scheduling" message="I've booked 3 appointments for tomorrow and confirmed them all via text." themeColor="teal" color="cyan" />
            </RevealSection>
            <RevealSection delay={0.1}>
              <AgentFace name="ATLAS" role="The Closer — Sales & follow-ups" message="Just sent a follow-up to 12 warm leads. 4 have already responded." themeColor="purple" color="violet" />
            </RevealSection>
            <RevealSection delay={0.2}>
              <AgentFace name="NOVA" role="The Creator — Content & social media" message="Published 5 posts across Instagram, LinkedIn, and Twitter today." themeColor="green" color="green" />
            </RevealSection>
            <RevealSection delay={0.3}>
              <AgentFace name="SENTINEL" role="The Integrator — Systems & workflows" message="Synced your CRM with 3 new lead sources. Everything's connected." themeColor="orange" color="orange" />
            </RevealSection>
          </div>
        </section>

        {/* ═══════════ SECTION 4: HOW IT WORKS ═══════════ */}
        <section className="py-20" data-testid="section-how-it-works">
          <RevealSection>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-300 via-violet-300 to-cyan-400 bg-clip-text text-transparent mb-4">
                How It Works
              </h2>
              <p className="text-slate-400 max-w-[500px] mx-auto">From first contact to a live AI agent running your business</p>
            </div>
          </RevealSection>

          <div className="max-w-[700px] mx-auto relative">
            <div className="absolute left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-500/30 via-violet-500/30 to-green-500/30 hidden md:block" />

            {[
              { step: "01", title: "Tell Us What You Need", desc: "Fill out the form or text us. Tell us what job you want your AI agent to handle.", icon: MessageSquare, color: "cyan" },
              { step: "02", title: "We Learn Your Business", desc: "We learn your workflows, tools, tone of voice, and goals to build the perfect agent.", icon: Brain, color: "violet" },
              { step: "03", title: "We Build Your Custom Agent", desc: "Trained on your data, integrated with your stack, and tested before launch.", icon: Settings, color: "green" },
              { step: "04", title: "Launch & Scale", desc: "Your agent goes live and starts working immediately. Scale up anytime.", icon: Rocket, color: "cyan" },
            ].map((s, i) => (
              <RevealSection key={s.step} delay={i * 0.12}>
                <div className="flex gap-6 mb-8 items-start">
                  <div className="relative z-10 shrink-0">
                    <div className={`w-16 h-16 rounded-md bg-${s.color === "cyan" ? "cyan" : s.color === "violet" ? "violet" : "green"}-500/10 border border-${s.color === "cyan" ? "cyan" : s.color === "violet" ? "violet" : "green"}-500/20 flex items-center justify-center`}>
                      <s.icon className={`w-6 h-6 text-${s.color === "cyan" ? "cyan" : s.color === "violet" ? "violet" : "green"}-400`} />
                    </div>
                  </div>
                  <div className="pt-2">
                    <span className="text-xs font-mono text-cyan-500/60 tracking-widest">STEP {s.step}</span>
                    <h3 className="text-lg font-semibold text-white mt-1 mb-2">{s.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </section>

        {/* ═══════════ SECTION 5: PRICING ═══════════ */}
        <section className="py-20" data-testid="section-pricing">
          <RevealSection>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-300 via-violet-300 to-cyan-400 bg-clip-text text-transparent mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-slate-400 max-w-[500px] mx-auto">Choose the plan that fits your business. Scale anytime.</p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[1000px] mx-auto items-start">
            {[
              {
                name: "STARTER",
                price: 199,
                desc: "Best for solopreneurs",
                featured: false,
                features: ["1 Custom AI Agent", "Basic phone/text handling", "Calendar integration", "Email support"],
              },
              {
                name: "GROWTH",
                price: 499,
                desc: "Best for growing businesses",
                featured: true,
                features: ["Up to 3 AI Agents", "Advanced call handling + lead follow-up", "CRM integration", "Social media posting", "Priority support"],
              },
              {
                name: "ENTERPRISE",
                price: 799,
                desc: "Best for agencies & teams",
                featured: false,
                features: ["Unlimited AI Agents", "Full workflow automation", "Custom integrations", "Dedicated account manager", "White-glove setup"],
              },
            ].map((tier, i) => (
              <RevealSection key={tier.name} delay={i * 0.1}>
                <Card
                  className={`p-7 backdrop-blur-xl relative overflow-visible ${
                    tier.featured
                      ? "bg-gradient-to-b from-violet-500/10 to-cyan-500/5 border-violet-500/30 md:-mt-4 md:mb-4"
                      : "bg-white/[0.03] border-white/[0.06]"
                  }`}
                  data-testid={`card-pricing-${tier.name.toLowerCase()}`}
                >
                  {tier.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white border-0 font-mono text-[10px] tracking-widest px-3">
                        <Star className="w-3 h-3 mr-1" /> MOST POPULAR
                      </Badge>
                    </div>
                  )}

                  <div className="text-center mb-6 pt-2">
                    <span className="text-xs font-mono text-slate-500 tracking-widest">{tier.name}</span>
                    <div className="text-4xl font-bold text-white mt-2 mb-1">
                      $<CountUp target={tier.price} />
                      <span className="text-lg text-slate-500 font-normal">/mo</span>
                    </div>
                    <p className="text-xs text-slate-500">{tier.desc}</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    {tier.features.map(f => (
                      <div key={f} className="flex items-center gap-3 text-sm text-slate-300">
                        <Check className="w-4 h-4 text-green-400 shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>

                  <Button
                    className={`w-full font-semibold ${
                      tier.featured
                        ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-white border-violet-400/40"
                        : "bg-white/[0.05] text-white border-white/10"
                    }`}
                    onClick={() => setShowSignup(true)}
                    data-testid={`button-pricing-${tier.name.toLowerCase()}`}
                  >
                    Get Started <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              </RevealSection>
            ))}
          </div>
        </section>

        {/* ═══════════ SECTION 6: SOCIAL PROOF / STATS ═══════════ */}
        <section className="py-20" data-testid="section-stats">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-[900px] mx-auto mb-16">
            {[
              { target: 500, suffix: "+", label: "AI Agents Deployed" },
              { target: 50, suffix: "+", label: "Industries Served" },
              { target: 24, suffix: "/7/365", label: "Uptime" },
              { target: 10, suffix: "x", label: "Faster Response" },
            ].map((s, i) => (
              <RevealSection key={s.label} delay={i * 0.08}>
                <Card className="p-6 bg-white/[0.03] backdrop-blur-xl border-white/[0.06] text-center" data-testid={`card-stat-${s.label.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent mb-1">
                    <CountUp target={s.target} suffix={s.suffix} />
                  </div>
                  <div className="text-xs text-slate-500 uppercase tracking-widest">{s.label}</div>
                </Card>
              </RevealSection>
            ))}
          </div>
        </section>

        {/* ═══════════ SECTION 7: FAQ ═══════════ */}
        <section className="py-20" data-testid="section-faq">
          <RevealSection>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-300 via-violet-300 to-cyan-400 bg-clip-text text-transparent mb-4">
                Frequently Asked Questions
              </h2>
            </div>
          </RevealSection>

          <div className="max-w-[700px] mx-auto space-y-3">
            {[
              { q: "What exactly is an AI agent?", a: "An AI agent is a smart software program that works like a virtual employee. It can answer phone calls, respond to messages, book appointments, send follow-ups, post on social media, and more — all automatically, 24/7. It's trained on your specific business data so it knows your products, services, and processes." },
              { q: "How long does it take to set up?", a: "Most AI agents are built and deployed within 3-5 business days. Complex multi-agent systems with custom integrations may take 1-2 weeks. We handle the entire setup process for you." },
              { q: "What platforms does the AI agent work on?", a: "Our agents integrate with 1,000+ platforms including phone systems, SMS, email, Instagram, Facebook, WhatsApp, Slack, Discord, CRMs like HubSpot and Salesforce, calendars, Stripe, Shopify, and many more." },
              { q: "Can I change my plan later?", a: "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle." },
              { q: "Do I need any technical knowledge?", a: "Not at all. We handle everything — from building and training the agent to integrating it with your tools. You just tell us what you need and we make it happen." },
              { q: "What if I need something custom?", a: "That's exactly what we specialize in. Every AI agent we build is custom. Just tell us the job you want automated, and we'll design an agent specifically for your business workflow." },
            ].map((faq, i) => (
              <RevealSection key={faq.q} delay={i * 0.05}>
                <FAQItem question={faq.q} answer={faq.a} />
              </RevealSection>
            ))}
          </div>
        </section>

        {/* ═══════════ SECTION 8: FINAL CTA ═══════════ */}
        <section className="py-24" data-testid="section-cta">
          <RevealSection>
            <div className="text-center relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-r from-cyan-500/5 via-violet-500/5 to-green-500/5 blur-[100px]" />
              </div>

              <div className="relative">
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-300 via-violet-300 to-green-300 bg-clip-text text-transparent mb-5">
                  Ready to Put AI to Work?
                </h2>
                <p className="text-slate-400 max-w-[500px] mx-auto mb-10 text-lg leading-relaxed">
                  Join hundreds of businesses already running on autopilot.
                  Whatever your business needs automated — we'll build the agent.
                </p>

                <div className="flex flex-col items-center gap-5">
                  <div className="relative group cursor-pointer" onClick={() => setShowSignup(true)}>
                    <div className="absolute -inset-2 rounded-md bg-gradient-to-r from-green-500/40 via-cyan-500/30 to-green-500/40 blur-lg group-hover:from-green-500/60 group-hover:via-cyan-500/50 group-hover:to-green-500/60 transition-all duration-700 animate-pulse" />
                    <Button
                      size="lg"
                      data-testid="button-free-signup-cta"
                      className="relative bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 border-green-400/40 text-white font-bold shadow-lg shadow-green-500/25 tracking-wide text-base px-10 py-6"
                    >
                      <Bot className="w-5 h-5 mr-2" /> Get Your AI Agent Now
                    </Button>
                  </div>

                  <a href="sms:+17542504912" data-testid="link-contact-text-cta">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-violet-500/20 text-slate-400 bg-white/[0.02] backdrop-blur-sm"
                    >
                      <MessageSquare className="w-4 h-4 mr-2 text-violet-400" /> Questions? Text (754) 250-4912
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </RevealSection>
        </section>

        {/* ═══════════ SECTION 9: FOOTER ═══════════ */}
        <footer className="border-t border-white/[0.06] py-8" data-testid="footer">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-mono text-slate-500">
                &copy; 2026 CLAWD
              </span>
            </div>

            <div className="flex gap-6 flex-wrap items-center">
              {[
                { label: "OpenClaw", url: "https://openclaw.ai", external: true },
                { label: "ClawHub", url: "https://clawhub.ai", external: true },
                { label: "Moltbook", url: "https://moltbook.com", external: true },
                { label: "Terms", url: "/terms-and-conditions", external: false },
                { label: "Privacy", url: "/privacy", external: false },
              ].map(l => (
                <a
                  key={l.label}
                  href={l.url}
                  {...(l.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="text-xs text-slate-500 no-underline flex items-center gap-1 hover:text-slate-300 transition-colors"
                  data-testid={`link-footer-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {l.label} {l.external && <ExternalLink className="w-3 h-3" />}
                </a>
              ))}
            </div>

            <a href="sms:+17542504912" className="text-xs text-slate-500 flex items-center gap-1.5 hover:text-slate-300 transition-colors">
              <MessageSquare className="w-3 h-3" /> Text (754) 250-4912
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
