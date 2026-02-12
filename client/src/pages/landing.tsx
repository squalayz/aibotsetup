import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, useInView } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Zap, Shield, Globe, Brain, Mail, Code,
  ArrowRight, Check, Wallet, CalendarCheck, Bot,
  ChevronRight, ExternalLink, Phone, Building2,
  HeadphonesIcon, Users, MessageSquare, Briefcase,
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
  { icon: Building2, title: "Real Estate", desc: "AI agents that answer property questions, schedule showings, and follow up with leads automatically.", gradient: "from-violet-500/15 to-cyan-500/15" },
  { icon: HeadphonesIcon, title: "Receptionist", desc: "Never miss a call again. AI answers phones, takes messages, books appointments, and routes calls.", gradient: "from-cyan-500/15 to-violet-500/15" },
  { icon: Users, title: "Customer Support", desc: "Handle tickets, answer FAQs, resolve issues, and escalate when needed -- all without human agents.", gradient: "from-violet-500/15 to-amber-500/15" },
  { icon: MessageSquare, title: "Social Media", desc: "Automate DMs, respond to comments, schedule posts, and grow your brand on autopilot.", gradient: "from-cyan-500/15 to-amber-500/15" },
  { icon: Briefcase, title: "Sales & Outreach", desc: "AI cold outreach, lead qualification, CRM updates, and follow-up sequences that close deals.", gradient: "from-amber-500/15 to-violet-500/15" },
  { icon: Zap, title: "Custom Anything", desc: "Whatever your business needs, we build it. If it can be automated with AI, we make it happen.", gradient: "from-violet-500/15 to-cyan-500/15" },
];

const selfFeatures = [
  "Step-by-step interactive guide",
  "Full OpenClaw + ClawHub setup",
  "Skill installation walkthrough",
  "Multi-platform connection guide",
  "Lifetime access to guide updates",
  "Community support included",
];

const vipFeatures = [
  "Everything in Self-Setup",
  "1-hour live screen-share session",
  "Custom bot personality setup",
  "Advanced skill configuration",
  "Troubleshooting & optimization",
  "Priority DM support after",
  "I do it all -- you just watch & learn",
];

const howItWorks = [
  { icon: Wallet, title: "Pay with Crypto", desc: "Send ETH or USDT to our wallet. Paste your TX hash to verify.", step: "01" },
  { icon: CalendarCheck, title: "Choose Your Path", desc: "Self-guided walkthrough or book a 1-on-1 live session.", step: "02" },
  { icon: Bot, title: "Bot Goes Live", desc: "Your custom AI agent is running 24/7 for your business.", step: "03" },
];

const stats = [
  { value: "3,000+", label: "Available Skills" },
  { value: "24/7", label: "Always Online" },
  { value: "15+", label: "Platforms Supported" },
  { value: "$0", label: "Monthly Bot Fees" },
];

export default function Landing() {
  const [, navigate] = useLocation();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handle = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <GridBackground />
      <FloatingBots />
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
              We Build AI Bots
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
              For Your Business
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-muted-foreground max-w-[700px] mx-auto mb-5 leading-relaxed"
            style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)" }}
          >
            Phone receptionists, real estate agents, customer support, sales bots, social media managers
            -- <strong className="text-violet-300">if it can be done with AI, we build it for you</strong>.
            Full AI agency services powered by{" "}
            <strong className="text-cyan-300">OpenClaw</strong>,{" "}
            <strong className="text-violet-300">ClawHub</strong> &{" "}
            <strong className="text-cyan-300">Moltbook</strong>.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-sm text-muted-foreground/80 max-w-[500px] mx-auto mb-10"
          >
            Personal assistants, business automation, custom AI workflows -- we do it all.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex gap-4 justify-center items-center flex-wrap"
          >
            <div className="relative group" data-testid="button-vip-hero-wrapper">
              <div className="absolute -inset-0.5 rounded-md bg-gradient-to-r from-amber-500/40 via-yellow-400/30 to-amber-500/40 blur-sm group-hover:from-amber-500/60 group-hover:via-yellow-400/50 group-hover:to-amber-500/60 transition-all duration-700" />
              <Button
                size="lg"
                onClick={() => navigate("/payment/vip")}
                data-testid="button-vip-hero"
                className="relative bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 border-amber-500/40 text-amber-100 font-bold shadow-lg shadow-amber-500/15 tracking-wide"
              >
                <Sparkles className="w-4 h-4 mr-2" /> Book 1-on-1 VIP &mdash; $799
              </Button>
            </div>
            <div className="relative group">
              <div className="absolute -inset-0.5 rounded-md bg-gradient-to-r from-cyan-500/30 via-violet-400/20 to-cyan-500/30 blur-sm group-hover:from-cyan-500/50 group-hover:via-violet-400/40 group-hover:to-cyan-500/50 transition-all duration-700" />
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/payment/self")}
                data-testid="button-self-setup-hero"
                className="relative border-cyan-500/30 text-cyan-200 bg-background/80 backdrop-blur-sm"
              >
                Self-Setup &mdash; $199 <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-12 flex justify-center gap-8 text-xs text-muted-foreground uppercase tracking-widest flex-wrap"
          >
            <span className="flex items-center gap-2"><SiEthereum className="w-3.5 h-3.5 text-violet-400" /> Pay with Crypto</span>
            <span className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-cyan-400" /> Any Industry</span>
            <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-violet-400" /> 24/7 Uptime</span>
            <span className="flex items-center gap-2"><Bot className="w-3.5 h-3.5 text-cyan-400" /> Custom AI Bots</span>
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
                AI Bots For Every Industry
              </h2>
              <p className="text-muted-foreground max-w-[550px] mx-auto">
                We don't just build one type of bot. Tell us what you need and we make it happen.
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

        <section className="py-16" data-testid="section-pricing">
          <FadeInSection>
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent mb-3">
                Pricing
              </h2>
              <p className="text-muted-foreground max-w-[500px] mx-auto">Choose the option that works best for you</p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[850px] mx-auto">
            <FadeInSection delay={0.1}>
              <Card className="p-8 bg-card/60 backdrop-blur-xl border-violet-500/10 relative overflow-visible h-full">
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-500/5 mb-5">Self-Setup</Badge>
                <div className="text-5xl font-serif font-bold text-foreground mb-2">$199</div>
                <p className="text-sm text-muted-foreground mb-6">Guided walkthrough at your own pace</p>
                <div className="border-t border-violet-500/10 pt-5 mb-6 space-y-3">
                  {selfFeatures.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-card-foreground">{item}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full border-violet-500/30 text-violet-300" onClick={() => navigate("/payment/self")} data-testid="button-self-setup-pricing">
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            </FadeInSection>

            <FadeInSection delay={0.2}>
              <Card className="p-8 bg-card/60 backdrop-blur-xl border-violet-500/25 relative overflow-visible h-full">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-t-md" />
                <div className="flex items-center gap-2 mb-5 flex-wrap">
                  <Badge variant="outline" className="border-violet-500/30 text-violet-400 bg-violet-500/5">1-on-1 VIP</Badge>
                  <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/5">Most Popular</Badge>
                </div>
                <div className="text-5xl font-serif font-bold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent mb-2">$799</div>
                <p className="text-sm text-muted-foreground mb-6">Personal 1-hour session with me</p>
                <div className="border-t border-violet-500/10 pt-5 mb-6 space-y-3">
                  {vipFeatures.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-card-foreground">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="relative group">
                  <div className="absolute -inset-0.5 rounded-md bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-amber-500/30 blur-sm group-hover:from-amber-500/50 group-hover:via-yellow-400/40 group-hover:to-amber-500/50 transition-all duration-700" />
                  <Button className="relative w-full bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 border-amber-500/40 text-amber-100 font-bold shadow-lg shadow-amber-500/15" onClick={() => navigate("/payment/vip")} data-testid="button-vip-pricing">
                    Book Your Session <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </FadeInSection>
          </div>
        </section>

        <section className="py-16" data-testid="section-how-it-works">
          <FadeInSection>
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent mb-3">
                How It Works
              </h2>
              <p className="text-muted-foreground max-w-[500px] mx-auto">From payment to your own AI agent in hours</p>
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
                  Ready to Automate Your Business?
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Whether you need a phone receptionist, sales bot, or a full AI-powered workflow --
                  we've got you covered. Let's build something incredible.
                </p>
                <div className="flex gap-4 justify-center items-center flex-wrap mb-6">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 rounded-md bg-gradient-to-r from-amber-500/40 via-yellow-400/30 to-amber-500/40 blur-sm group-hover:from-amber-500/60 group-hover:via-yellow-400/50 group-hover:to-amber-500/60 transition-all duration-700" />
                    <Button
                      size="lg"
                      onClick={() => navigate("/payment/vip")}
                      data-testid="button-vip-cta"
                      className="relative bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 border-amber-500/40 text-amber-100 font-bold shadow-lg shadow-amber-500/15 tracking-wide"
                    >
                      <Sparkles className="w-4 h-4 mr-2" /> Book 1-on-1 VIP &mdash; $799
                    </Button>
                  </div>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 rounded-md bg-gradient-to-r from-cyan-500/30 via-violet-400/20 to-cyan-500/30 blur-sm group-hover:from-cyan-500/50 group-hover:via-violet-400/40 group-hover:to-cyan-500/50 transition-all duration-700" />
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate("/payment/self")}
                      data-testid="button-self-cta"
                      className="relative border-cyan-500/30 text-cyan-200 bg-background/80 backdrop-blur-sm"
                    >
                      Self-Setup &mdash; $199
                    </Button>
                  </div>
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
