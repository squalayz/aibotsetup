import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, useInView } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Zap, Shield, Globe, Brain, Mail, Code,
  ArrowRight, Check, Wallet, CalendarCheck, Bot,
  ChevronRight, ExternalLink,
} from "lucide-react";
import { SiInstagram, SiEthereum } from "react-icons/si";

const INSTAGRAM = "squalayyy";
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

const features = [
  { icon: Mail, title: "Email & Calendar", desc: "Reads, drafts, and sends emails. Manages your entire calendar autonomously.", color: "text-cyan-400" },
  { icon: Code, title: "Code & Build", desc: "Write code, review PRs, build apps \u2014 all from a chat message on Discord or Telegram.", color: "text-violet-400" },
  { icon: Sparkles, title: "3000+ Skills", desc: "Tap into ClawHub's massive skill registry. Gmail, Slack, web browsing, crypto, and more.", color: "text-cyan-400" },
  { icon: Shield, title: "Your Data, Your Machine", desc: "Runs locally on your computer. Your API keys, your data \u2014 nothing leaves your system.", color: "text-violet-400" },
  { icon: Globe, title: "Multi-Platform", desc: "Connect via Discord, Telegram, WhatsApp, or any messaging app you already use.", color: "text-cyan-400" },
  { icon: Brain, title: "Persistent Memory", desc: "Your bot remembers context across conversations. It gets smarter the more you use it.", color: "text-violet-400" },
];

const selfFeatures = [
  "Step-by-step interactive guide",
  "Full OpenClaw + ClawHub setup",
  "Skill installation walkthrough",
  "Multi-platform connection guide",
  "Lifetime access to guide updates",
  "Community support via Instagram",
];

const vipFeatures = [
  "Everything in Self-Setup",
  "1-hour live screen-share session",
  "Custom bot personality setup",
  "Advanced skill configuration",
  "Troubleshooting & optimization",
  "Priority DM support after",
  "I do it all \u2014 you just watch & learn",
];

const howItWorks = [
  { icon: Wallet, title: "Pay with Crypto", desc: "Send ETH or USDT to our wallet. Paste your TX hash to verify.", step: "01" },
  { icon: CalendarCheck, title: "Choose Your Path", desc: "Self-guided walkthrough or book a 1-on-1 live session.", step: "02" },
  { icon: Bot, title: "Bot Goes Live", desc: "Your personal Clawd Bot is running 24/7 on your machine.", step: "03" },
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
            <a
              href="https://ig.me/m/squalayyy"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-ig-dm-nav"
            >
              <Button variant="outline" size="sm" className="border-pink-500/30 text-pink-400 gap-2">
                <SiInstagram className="w-4 h-4" /> DM @{INSTAGRAM}
              </Button>
            </a>
          </div>
        </nav>

        <section className="text-center pt-20 pb-16 relative" data-testid="section-hero">
          <GlowOrb className="w-[500px] h-[500px] bg-violet-600/10 top-0 left-1/2 -translate-x-1/2 -translate-y-1/4" />
          <GlowOrb className="w-[300px] h-[300px] bg-cyan-600/8 top-20 right-0" />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge variant="outline" className="mb-6 border-violet-500/30 text-violet-300 bg-violet-500/5 px-4 py-1.5 text-xs tracking-widest uppercase font-sans">
              <Sparkles className="w-3 h-3 mr-2" />
              Powered by OpenClaw + ClawHub + Moltbook
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
              Your Personal AI
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
              Agent, Set Up For You
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-muted-foreground max-w-[650px] mx-auto mb-10 leading-relaxed"
            style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)" }}
          >
            Get your own Clawd Bot running using{" "}
            <strong className="text-violet-300">OpenClaw</strong>,{" "}
            <strong className="text-cyan-300">ClawHub</strong> skills, and the{" "}
            <strong className="text-violet-300">Moltbook</strong> ecosystem &mdash; reading emails, managing your calendar, coding, and more.
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
            <Button size="lg" variant="outline" onClick={() => navigate("/payment/self")} data-testid="button-self-setup-hero" className="border-violet-500/30 text-violet-300">
              Self-Setup &mdash; $199 <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-12 flex justify-center gap-8 text-xs text-muted-foreground uppercase tracking-widest"
          >
            <span className="flex items-center gap-2"><SiEthereum className="w-3.5 h-3.5 text-violet-400" /> Pay with Crypto</span>
            <span className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-cyan-400" /> Self-Hosted</span>
            <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-violet-400" /> 24/7 Uptime</span>
          </motion.div>
        </section>

        <section className="py-16" data-testid="section-features">
          <FadeInSection>
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent mb-3">
                What You're Getting
              </h2>
              <p className="text-muted-foreground max-w-[500px] mx-auto">Everything your Clawd Bot can do once it's set up</p>
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
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 to-cyan-500 rounded-t-md" />
                <div className="flex items-center gap-2 mb-5 flex-wrap">
                  <Badge variant="outline" className="border-violet-500/30 text-violet-400 bg-violet-500/5">1-on-1 VIP</Badge>
                  <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/5">Most Popular</Badge>
                </div>
                <div className="text-5xl font-serif font-bold bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent mb-2">$799</div>
                <p className="text-sm text-muted-foreground mb-6">Personal 1-hour session with me</p>
                <div className="border-t border-violet-500/10 pt-5 mb-6 space-y-3">
                  {vipFeatures.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-card-foreground">{item}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 border-violet-500/50 text-white shadow-lg shadow-violet-500/20" onClick={() => navigate("/payment/vip")} data-testid="button-vip-pricing">
                  Book Your Session <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
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
              <p className="text-muted-foreground max-w-[500px] mx-auto">From payment to your own AI assistant in hours</p>
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
            <Card className="max-w-[650px] mx-auto p-10 md:p-12 bg-card/60 backdrop-blur-xl border-violet-500/15 text-center relative overflow-visible">
              <GlowOrb className="w-[400px] h-[400px] bg-violet-600/8 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="relative">
                <h2 className="font-serif text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent mb-3">
                  Ready to Build Your AI Agent?
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Join the growing community of people running their own personal AI assistants. Questions? DM me.
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
                  <Button size="lg" variant="outline" onClick={() => navigate("/payment/self")} data-testid="button-self-cta" className="border-violet-500/30 text-violet-300">
                    Self-Setup &mdash; $199
                  </Button>
                </div>
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-violet-500/15" />
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-violet-500/15" />
                </div>
                <a
                  href="https://ig.me/m/squalayyy"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-ig-dm-cta"
                >
                  <Button variant="outline" size="lg" className="border-pink-500/30 text-pink-400 gap-2">
                    <SiInstagram className="w-5 h-5" /> DM @{INSTAGRAM} for Info
                  </Button>
                </a>
              </div>
            </Card>
          </FadeInSection>
        </section>

        <footer className="border-t border-violet-500/10 py-6 flex justify-between items-center flex-wrap gap-3" data-testid="footer">
          <span className="text-xs text-muted-foreground font-sans">
            &copy; 2026 Clawd &middot; Built with OpenClaw, ClawHub & Moltbook
          </span>
          <div className="flex gap-5">
            {[
              { label: "OpenClaw", url: "https://openclaw.ai" },
              { label: "ClawHub", url: "https://clawhub.ai" },
              { label: "Moltbook", url: "https://moltbook.com" },
              { label: "Instagram", url: `https://instagram.com/${INSTAGRAM}` },
            ].map((l) => (
              <a
                key={l.label}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground no-underline flex items-center gap-1"
                data-testid={`link-footer-${l.label.toLowerCase()}`}
              >
                {l.label} <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
