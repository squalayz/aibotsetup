import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles, Zap, Shield, Globe, Brain, Mail, Code,
  ArrowRight, Check, Wallet, CalendarCheck, Bot,
  ChevronRight, ExternalLink, Phone, Building2,
  HeadphonesIcon, Users, MessageSquare, Briefcase,
  Video, X, CheckCircle, Loader2, Eye, Link,
  BarChart3, Cpu,
} from "lucide-react";
import { SiEthereum } from "react-icons/si";

const WALLET = "0x00468c1B22451ed9Fabc9DA32E6aEa28DC03a216";

function FadeInSection({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function GlowOrb({ className }: { className?: string }) {
  return (
    <div className={`absolute rounded-full blur-[100px] pointer-events-none ${className}`} />
  );
}

interface FloatingBot {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  angle: number;
  wobble: number;
  wobbleSpeed: number;
}

function FloatingBots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const botsRef = useRef<FloatingBot[]>([]);
  const animRef = useRef<number>(0);

  const initBots = useCallback(() => {
    const bots: FloatingBot[] = [];
    const count = window.innerWidth < 768 ? 6 : 12;
    for (let i = 0; i < count; i++) {
      bots.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 12 + Math.random() * 18,
        speed: 0.15 + Math.random() * 0.3,
        opacity: 0.04 + Math.random() * 0.08,
        angle: Math.random() * Math.PI * 2,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.005 + Math.random() * 0.01,
      });
    }
    botsRef.current = bots;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    };
    resize();
    initBots();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      botsRef.current.forEach((bot) => {
        bot.wobble += bot.wobbleSpeed;
        bot.x += Math.cos(bot.angle) * bot.speed + Math.sin(bot.wobble) * 0.3;
        bot.y += Math.sin(bot.angle) * bot.speed * 0.5 + Math.cos(bot.wobble * 0.7) * 0.2;

        if (bot.x > canvas.width + 30) bot.x = -30;
        if (bot.x < -30) bot.x = canvas.width + 30;
        if (bot.y > canvas.height + 30) bot.y = -30;
        if (bot.y < -30) bot.y = canvas.height + 30;

        const s = bot.size;
        ctx.save();
        ctx.translate(bot.x, bot.y);
        ctx.globalAlpha = bot.opacity;

        ctx.fillStyle = "#8b5cf6";
        ctx.beginPath();
        const bw = s, bh = s * 0.7, br = s * 0.15;
        ctx.moveTo(-bw / 2 + br, -bh / 2);
        ctx.lineTo(bw / 2 - br, -bh / 2);
        ctx.quadraticCurveTo(bw / 2, -bh / 2, bw / 2, -bh / 2 + br);
        ctx.lineTo(bw / 2, bh / 2 - br);
        ctx.quadraticCurveTo(bw / 2, bh / 2, bw / 2 - br, bh / 2);
        ctx.lineTo(-bw / 2 + br, bh / 2);
        ctx.quadraticCurveTo(-bw / 2, bh / 2, -bw / 2, bh / 2 - br);
        ctx.lineTo(-bw / 2, -bh / 2 + br);
        ctx.quadraticCurveTo(-bw / 2, -bh / 2, -bw / 2 + br, -bh / 2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#06b6d4";
        const eyeY = -s * 0.1;
        const eyeSize = s * 0.12;
        ctx.beginPath();
        ctx.arc(-s * 0.15, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.15, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#8b5cf6";
        ctx.fillRect(-s * 0.08, s * 0.35, s * 0.04, s * 0.2);
        ctx.fillRect(s * 0.04, s * 0.35, s * 0.04, s * 0.2);

        ctx.strokeStyle = "#8b5cf6";
        ctx.lineWidth = s * 0.04;
        ctx.beginPath();
        ctx.moveTo(-s * 0.5, -s * 0.05);
        ctx.lineTo(-s * 0.35, -s * 0.05);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s * 0.35, -s * 0.05);
        ctx.lineTo(s * 0.5, -s * 0.05);
        ctx.stroke();

        const antennaHeight = s * 0.2 + Math.sin(bot.wobble * 2) * s * 0.05;
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.35);
        ctx.lineTo(0, -s * 0.35 - antennaHeight);
        ctx.stroke();
        ctx.fillStyle = "#06b6d4";
        ctx.beginPath();
        ctx.arc(0, -s * 0.35 - antennaHeight, s * 0.06, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [initBots]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

function GridBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-violet-600/5 blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-cyan-600/4 blur-[150px]" />
    </div>
  );
}

const features = [
  { icon: Phone, title: "AI Phone Agents", desc: "Automated receptionists, appointment booking, customer support calls -- all handled by your AI bot, 24/7.", color: "text-cyan-400" },
  { icon: Mail, title: "Email & Calendar", desc: "Reads, drafts, and sends emails. Manages your entire calendar autonomously.", color: "text-violet-400" },
  { icon: Code, title: "Code & Build", desc: "Write code, review PRs, build full apps -- all from a chat message on Discord or Telegram.", color: "text-cyan-400" },
  { icon: Sparkles, title: "3000+ Skills", desc: "Tap into ClawHub's massive skill registry. Gmail, Slack, web browsing, crypto, CRM, and more.", color: "text-violet-400" },
  { icon: Globe, title: "Multi-Platform", desc: "Connect via Discord, Telegram, WhatsApp, phone, SMS, or any channel your customers use.", color: "text-cyan-400" },
  { icon: Brain, title: "Persistent Memory", desc: "Your bot remembers context across conversations. It gets smarter the more you use it.", color: "text-violet-400" },
];

const useCases = [
  { icon: Phone, title: "AI Receptionists", desc: "Answer every call, book appointments, and route inquiries -- automatically, around the clock.", gradient: "from-violet-500/15 to-cyan-500/15" },
  { icon: Briefcase, title: "Sales Agents", desc: "Qualify leads, send follow-ups, and close deals -- your AI never forgets a prospect.", gradient: "from-cyan-500/15 to-violet-500/15" },
  { icon: HeadphonesIcon, title: "Support Bots", desc: "Resolve tickets without scripts. Your AI reads context, finds answers, and handles real issues.", gradient: "from-violet-500/15 to-amber-500/15" },
  { icon: MessageSquare, title: "Social Media Managers", desc: "Create content, schedule posts, and engage your audience -- all on autopilot.", gradient: "from-cyan-500/15 to-amber-500/15" },
  { icon: Zap, title: "Custom Workflows", desc: "Replace entire manual processes. If a human does it repeatedly, an AI agent can do it better.", gradient: "from-amber-500/15 to-violet-500/15" },
];

const howItWorks = [
  { icon: Video, title: "Join Free Zoom Class", desc: "Sign up and attend our live training session — completely free.", step: "01" },
  { icon: Bot, title: "Learn to Build Your Bot", desc: "Follow along step-by-step as we build a real AI bot live.", step: "02" },
  { icon: Zap, title: "Bot Goes Live", desc: "Your custom AI agent is running 24/7 for your business.", step: "03" },
];

const stats = [
  { value: "3,000+", label: "Available Skills" },
  { value: "24/7", label: "Always Online" },
  { value: "1,000+", label: "Platforms Supported" },
  { value: "$0", label: "Monthly Bot Fees" },
];

export default function Landing() {
  const [, navigate] = useLocation();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showSignup, setShowSignup] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const { toast } = useToast();

  const signupMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/signups", {
        email: signupEmail,
        phone: signupPhone,
      });
      return res.json();
    },
    onSuccess: () => {
      setSignupSuccess(true);
    },
    onError: (err: Error) => {
      toast({ title: "Signup Error", description: err.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    const handle = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <GridBackground />
      <FloatingBots />

      <AnimatePresence>
        {showSignup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => { if (!signupSuccess) setShowSignup(false); }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[480px]"
            >
              <div className="absolute -inset-1 rounded-md bg-gradient-to-r from-green-500/30 via-emerald-400/20 to-cyan-500/30 blur-lg" />
              <Card className="relative p-8 bg-card/95 backdrop-blur-xl border-green-500/20">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setShowSignup(false); setSignupSuccess(false); setSignupEmail(""); setSignupPhone(""); }}
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
                      <h3 className="font-serif text-2xl font-bold text-green-300 mb-3" data-testid="text-signup-success">You're In!</h3>
                      <p className="text-muted-foreground leading-relaxed mb-2">
                        You've been signed up for the free Zoom class.
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                        We'll text you the Zoom link to <strong className="text-green-300">{signupPhone}</strong> before the session. Keep an eye on your phone!
                      </p>
                      <div className="space-y-3">
                        <Card className="p-4 bg-green-500/5 border-green-500/15">
                          <div className="flex items-start gap-3">
                            <Video className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                            <div className="text-left">
                              <p className="text-sm font-semibold text-foreground mb-1">What happens next?</p>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-400" /> You'll receive a text with the Zoom link</li>
                                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-400" /> Join the live class at the scheduled time</li>
                                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-400" /> Learn how to build your own AI bot step-by-step</li>
                                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-400" /> Ask questions live and get real-time help</li>
                              </ul>
                            </div>
                          </div>
                        </Card>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => { setShowSignup(false); setSignupSuccess(false); setSignupEmail(""); setSignupPhone(""); }}
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
                          className="w-16 h-16 rounded-md bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 flex items-center justify-center mx-auto mb-4"
                        >
                          <Video className="w-8 h-8 text-green-400" />
                        </motion.div>
                        <h3 className="font-serif text-2xl font-bold text-foreground mb-2" data-testid="heading-signup-modal">Free Zoom Class</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Join our live Zoom session where we walk you through building your own AI bot from scratch.
                          Completely free — no strings attached.
                        </p>
                      </div>

                      <Card className="p-4 bg-green-500/5 border-green-500/10 mb-6">
                        <h4 className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-3">What you'll learn</h4>
                        <ul className="space-y-2">
                          {[
                            "How to set up your own AI bot from zero",
                            "Connect your bot to thousands of platforms",
                            "Install skills from ClawHub marketplace",
                            "Automate your business with AI workflows",
                            "Live Q&A — ask anything!",
                          ].map((item) => (
                            <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </Card>

                      <div className="space-y-4 mb-6">
                        <div>
                          <Label className="text-xs text-green-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5" /> Email Address
                          </Label>
                          <Input
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            type="email"
                            placeholder="you@email.com"
                            className="bg-background/60 border-green-500/15"
                            data-testid="input-signup-email"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-green-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5" /> Phone Number
                          </Label>
                          <Input
                            value={signupPhone}
                            onChange={(e) => setSignupPhone(e.target.value)}
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            className="bg-background/60 border-green-500/15"
                            data-testid="input-signup-phone"
                          />
                          <p className="text-xs text-muted-foreground/70 mt-1.5 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> Required — we'll text you the Zoom link
                          </p>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 border-green-400/40 text-white font-bold"
                        onClick={() => signupMutation.mutate()}
                        disabled={!signupEmail || !signupPhone || signupMutation.isPending}
                        data-testid="button-submit-signup"
                      >
                        {signupMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Video className="w-4 h-4 mr-2" />
                        )}
                        {signupMutation.isPending ? "Signing Up..." : "Sign Up — It's Free"}
                      </Button>

                      <p className="text-[11px] text-muted-foreground/60 text-center mt-3">
                        No credit card needed. We'll only use your info to send the Zoom link.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div
        className="fixed w-[600px] h-[600px] rounded-full pointer-events-none z-[2] transition-transform duration-700"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)",
          left: mousePos.x - 300,
          top: mousePos.y - 300,
        }}
      />

      <div className="relative z-10 max-w-[1200px] mx-auto px-5">
        <nav className="flex items-center justify-between gap-4 py-5 border-b border-violet-500/10" data-testid="nav-main">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-md bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 rounded-md bg-gradient-to-br from-violet-500/20 to-cyan-500/20 blur-sm -z-10" />
            </div>
            <span className="font-serif text-xl font-bold bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent tracking-tight">
              CLAWD
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
          </div>
        </nav>

        <section className="text-center pt-20 pb-16 relative" data-testid="section-hero">
          <GlowOrb className="w-[500px] h-[500px] bg-violet-600/10 top-0 left-1/2 -translate-x-1/2 -translate-y-1/4" />
          <GlowOrb className="w-[300px] h-[300px] bg-cyan-600/8 top-20 right-0" />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge variant="outline" className="mb-6 border-violet-500/30 text-violet-300 bg-violet-500/5 px-4 py-1.5 text-xs tracking-widest uppercase font-sans">
              <Sparkles className="w-3 h-3 mr-2" />
              AI Agents for Any Business
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-serif font-extrabold leading-[1.05] tracking-tight mb-6"
            style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)" }}
          >
            <span className="bg-gradient-to-r from-white via-violet-200 to-cyan-200 bg-clip-text text-transparent">
              We Build AI Agents
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
              That Run Your Business
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-muted-foreground max-w-[700px] mx-auto mb-10 leading-relaxed"
            style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)" }}
          >
            Our AI agents don't just chat — they <strong className="text-violet-300">think, decide, and act</strong>.
            They answer your phones, book your appointments, follow up with leads, post your content,
            and close your sales — <strong className="text-cyan-300">24/7, with zero burnout</strong>.
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
              <div className="absolute -inset-1 rounded-md bg-gradient-to-r from-green-500/50 via-emerald-400/40 to-green-500/50 blur-md group-hover:from-green-500/70 group-hover:via-emerald-400/60 group-hover:to-green-500/70 transition-all duration-700 animate-pulse" />
              <Button
                size="lg"
                data-testid="button-free-signup"
                className="relative bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 border-green-400/40 text-white font-bold shadow-lg shadow-green-500/20 tracking-wide"
              >
                <Video className="w-5 h-5 mr-2" /> Free Zoom Class — Sign Up Now
              </Button>
            </div>

            <a href="sms:+17542504912" data-testid="link-contact-text">
              <Button
                size="lg"
                variant="outline"
                className="border-violet-500/20 text-muted-foreground bg-background/40 backdrop-blur-sm"
              >
                <MessageSquare className="w-4 h-4 mr-2 text-violet-400" /> Questions? Text (754) 250-4912
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-12 flex justify-center gap-8 text-xs text-muted-foreground uppercase tracking-widest flex-wrap"
          >
            <span className="flex items-center gap-2"><Bot className="w-3.5 h-3.5 text-violet-400" /> Custom AI Agents</span>
            <span className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-cyan-400" /> Any Industry</span>
            <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-violet-400" /> 24/7 Uptime</span>
            <span className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-cyan-400" /> Multi-Platform</span>
          </motion.div>
        </section>

        <section className="py-12" data-testid="section-stats">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <FadeInSection key={s.label} delay={i * 0.08}>
                <Card className="p-5 bg-card/40 backdrop-blur-xl border-violet-500/10 text-center" data-testid={`card-stat-${s.label.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className="text-3xl font-serif font-bold bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent mb-1" data-testid={`text-stat-${s.label.toLowerCase().replace(/\s+/g, "-")}`}>{s.value}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest">{s.label}</div>
                </Card>
              </FadeInSection>
            ))}
          </div>
        </section>

        <section className="py-16" data-testid="section-use-cases">
          <FadeInSection>
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent mb-3">
                What Our Agents Do
              </h2>
              <p className="text-muted-foreground max-w-[600px] mx-auto">
                We connect large language models to your existing systems — your CRM, calendar, phone line, socials, and more — so your AI agent doesn't just respond, it operates.
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-[1000px] mx-auto">
            {useCases.map((uc, i) => (
              <FadeInSection key={uc.title} delay={i * 0.08}>
                <Card className="p-6 bg-card/60 backdrop-blur-xl border-violet-500/10 group relative overflow-visible hover-elevate" data-testid={`card-usecase-${uc.title.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className={`absolute inset-0 rounded-md bg-gradient-to-br ${uc.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-md bg-gradient-to-br from-violet-500/15 to-cyan-500/15 flex items-center justify-center mb-4 border border-violet-500/10">
                      <uc.icon className="w-6 h-6 text-violet-300" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{uc.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{uc.desc}</p>
                  </div>
                </Card>
              </FadeInSection>
            ))}
          </div>
        </section>

        <section className="py-16" data-testid="section-ai-landscape">
          <FadeInSection>
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent mb-3">
                The AI Landscape Has Changed
              </h2>
              <p className="text-muted-foreground max-w-[550px] mx-auto">Here's what's now possible for your business</p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-[1000px] mx-auto">
            {[
              { icon: Brain, title: "Language Models (LLMs)", desc: "AI that understands context, writes content, answers customer questions, negotiates, and makes decisions like a trained employee.", gradient: "from-violet-500/15 to-cyan-500/15" },
              { icon: Phone, title: "Voice AI", desc: "Agents that answer your phone, sound human, handle objections, book appointments, and transfer calls -- 24/7 in any language.", gradient: "from-cyan-500/15 to-violet-500/15" },
              { icon: Eye, title: "Vision AI", desc: "Bots that read documents, scan receipts, analyze images, process invoices, and extract data from anything visual.", gradient: "from-violet-500/15 to-amber-500/15" },
              { icon: Link, title: "Tool Integration", desc: "Connect AI to your CRM, calendar, Stripe, Shopify, Google Workspace, social platforms, phone systems, email, spreadsheets -- over 15,000+ apps.", gradient: "from-cyan-500/15 to-amber-500/15" },
              { icon: Cpu, title: "Multi-Agent Systems", desc: "Multiple AI agents working together: one handles calls, another manages socials, another follows up with leads -- all running simultaneously.", gradient: "from-amber-500/15 to-violet-500/15" },
              { icon: BarChart3, title: "Real-Time Learning", desc: "Agents trained on YOUR business data: your pricing, your FAQs, your tone of voice, your processes, your customer history.", gradient: "from-violet-500/15 to-cyan-500/15" },
            ].map((item, i) => (
              <FadeInSection key={item.title} delay={i * 0.08}>
                <Card className="p-6 bg-card/60 backdrop-blur-xl border-violet-500/10 group relative overflow-visible hover-elevate h-full" data-testid={`card-ai-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className={`absolute inset-0 rounded-md bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-md bg-gradient-to-br from-violet-500/15 to-cyan-500/15 flex items-center justify-center mb-4 border border-violet-500/10">
                      <item.icon className="w-6 h-6 text-violet-300" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </Card>
              </FadeInSection>
            ))}
          </div>
        </section>

        <section className="py-16" data-testid="section-industries">
          <FadeInSection>
            <Card className="max-w-[900px] mx-auto p-10 md:p-12 bg-card/60 backdrop-blur-xl border-violet-500/15 text-center relative overflow-visible">
              <GlowOrb className="w-[500px] h-[500px] bg-cyan-600/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="relative">
                <h2 className="font-serif text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent mb-4">
                  This Works for Every Industry
                </h2>
                <p className="text-muted-foreground leading-relaxed max-w-[700px] mx-auto mb-6">
                  Real estate, law firms, dental offices, med spas, restaurants, e-commerce, insurance, fitness studios, contractors, salons, marketing agencies, car dealerships, property management, coaching businesses, nonprofits --
                </p>
                <p className="text-lg font-semibold text-foreground">
                  If your business talks to customers, <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">AI can handle it.</span>
                </p>
              </div>
            </Card>
          </FadeInSection>
        </section>

        <section className="py-16" data-testid="section-features">
          <FadeInSection>
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent mb-3">
                What Your Bot Can Do
              </h2>
              <p className="text-muted-foreground max-w-[500px] mx-auto">Powerful capabilities built into every AI agent we create</p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FadeInSection key={f.title} delay={i * 0.08}>
                <Card className="p-6 bg-card/60 backdrop-blur-xl border-violet-500/10 group relative overflow-visible hover-elevate">
                  <div className="absolute inset-0 rounded-md bg-gradient-to-br from-violet-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <f.icon className={`w-7 h-7 ${f.color} mb-4`} />
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </Card>
              </FadeInSection>
            ))}
          </div>
        </section>


        <section className="py-16" data-testid="section-how-it-works">
          <FadeInSection>
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent mb-3">
                How It Works
              </h2>
              <p className="text-muted-foreground max-w-[500px] mx-auto">From signup to a live AI agent running your business</p>
            </div>
          </FadeInSection>

          <div className="flex justify-center gap-5 flex-wrap">
            {howItWorks.map((s, i) => (
              <FadeInSection key={s.step} delay={i * 0.12}>
                <Card className="max-w-[300px] text-center p-8 bg-card/60 backdrop-blur-xl border-violet-500/10 relative overflow-visible hover-elevate">
                  <div className="w-14 h-14 rounded-full mx-auto mb-5 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center border border-violet-500/15">
                    <s.icon className="w-6 h-6 text-violet-300" />
                  </div>
                  <span className="text-xs text-violet-400/60 font-mono tracking-widest">{s.step}</span>
                  <h3 className="font-serif text-lg font-semibold text-foreground mt-1 mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </Card>
              </FadeInSection>
            ))}
          </div>
        </section>

        <section className="py-16" data-testid="section-cta">
          <FadeInSection>
            <Card className="max-w-[700px] mx-auto p-10 md:p-12 bg-card/60 backdrop-blur-xl border-violet-500/15 text-center relative overflow-visible">
              <GlowOrb className="w-[400px] h-[400px] bg-violet-600/8 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="relative">
                <h2 className="font-serif text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent mb-3">
                  Tell Us the Job. We'll Build the Agent.
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Whatever your business needs automated — phones, sales, support, socials, or something
                  entirely custom — we'll build an AI agent that handles it end-to-end.
                </p>
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="relative group cursor-pointer" onClick={() => setShowSignup(true)}>
                    <div className="absolute -inset-0.5 rounded-md bg-gradient-to-r from-green-500/40 via-emerald-400/30 to-green-500/40 blur-sm group-hover:from-green-500/60 group-hover:via-emerald-400/50 group-hover:to-green-500/60 transition-all duration-700" />
                    <Button
                      size="lg"
                      data-testid="button-free-signup-cta"
                      className="relative bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 border-green-400/40 text-white font-bold shadow-lg shadow-green-500/20 tracking-wide"
                    >
                      <Video className="w-4 h-4 mr-2" /> Free Zoom Class — Sign Up Now
                    </Button>
                  </div>
                  <a href="sms:+17542504912" data-testid="link-contact-text-cta">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-violet-500/20 text-muted-foreground bg-background/40 backdrop-blur-sm"
                    >
                      <MessageSquare className="w-4 h-4 mr-2 text-violet-400" /> Questions? Text (754) 250-4912
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          </FadeInSection>
        </section>

        <footer className="border-t border-violet-500/10 py-6 flex justify-between items-center flex-wrap gap-3" data-testid="footer">
          <span className="text-xs text-muted-foreground font-sans">
            &copy; 2026 Clawd &middot; Built with OpenClaw, ClawHub & Moltbook
          </span>
          <div className="flex gap-5 flex-wrap">
            {[
              { label: "OpenClaw", url: "https://openclaw.ai", external: true },
              { label: "ClawHub", url: "https://clawhub.ai", external: true },
              { label: "Moltbook", url: "https://moltbook.com", external: true },
              { label: "Terms", url: "/terms-and-conditions", external: false },
              { label: "Privacy", url: "/privacy", external: false },
              { label: "Refund Policy", url: "/refund", external: false },
            ].map((l) => (
              <a
                key={l.label}
                href={l.url}
                {...(l.external ? { target: "_blank", rel: "noreferrer" } : {})}
                className="text-xs text-muted-foreground no-underline flex items-center gap-1"
                data-testid={`link-footer-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {l.label} {l.external && <ExternalLink className="w-3 h-3" />}
              </a>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
