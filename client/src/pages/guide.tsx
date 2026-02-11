import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight,
  Key, Settings, Package, Bot, Puzzle, MessageSquare, Rocket, Trophy,
} from "lucide-react";
import { SiInstagram } from "react-icons/si";

const INSTAGRAM = "squalayyy";

const SETUP_STEPS = [
  {
    title: "Get Your API Keys",
    icon: Key,
    content: `First, you'll need API keys from Anthropic (Claude). Head to console.anthropic.com, create an account, and generate an API key. Keep this key safe — you'll need it soon.

Alternatively, you can use OpenAI or other providers that OpenClaw supports.`,
  },
  {
    title: "Install Prerequisites",
    icon: Settings,
    content: `Make sure you have the following installed:

  Node.js (v18 or later) — download from nodejs.org
  Git — download from git-scm.com
  A code editor (VS Code recommended)
  Terminal / Command Line access

On Mac, you can use Homebrew:
  brew install node git

On Windows, download installers from the official sites.`,
  },
  {
    title: "Clone OpenClaw",
    icon: Package,
    content: `Open your terminal and run:

  git clone https://github.com/steipete/openclaw.git
  cd openclaw
  npm install

This downloads the OpenClaw framework and installs all dependencies. The process takes 2-5 minutes depending on your internet speed.`,
  },
  {
    title: "Configure Your Bot",
    icon: Bot,
    content: `Copy the example config and add your API key:

  cp .env.example .env

Open .env in your editor and set:
  ANTHROPIC_API_KEY=sk-ant-your-key-here
  BOT_NAME=MyClawd
  PERSONA=helpful assistant

Customize the persona to match your desired bot personality. Check the OpenClaw docs at openclaw.ai for all configuration options.`,
  },
  {
    title: "Install Skills from ClawHub",
    icon: Puzzle,
    content: `ClawHub (clawhub.ai) is the skill registry. Install useful skills:

  npx clawhub install gmail-integration
  npx clawhub install calendar-sync
  npx clawhub install web-browser

SECURITY TIP: Always review skill code before installing. Check the author's reputation and community ratings. Avoid skills requiring external prerequisite downloads.`,
  },
  {
    title: "Connect Messaging Platform",
    icon: MessageSquare,
    content: `Connect your bot to your preferred chat platform:

  Discord: Create a bot at discord.com/developers, copy the token to .env
  Telegram: Talk to @BotFather, get a token
  WhatsApp: Follow the Twilio/WhatsApp Business API setup in docs

Set PLATFORM=discord (or telegram/whatsapp) in your .env file.`,
  },
  {
    title: "Launch Your Clawd Bot!",
    icon: Rocket,
    content: `Start your bot:

  npm start

Your Clawd Bot is now live! Test it by sending a message on your connected platform.

For 24/7 uptime, consider:
  Running on a Raspberry Pi or Mac Mini
  Using a cloud VM (Hetzner, DigitalOcean)
  Setting up PM2 for process management:
    npm install -g pm2
    pm2 start npm -- start

Congrats! You now have your own personal AI assistant.`,
  },
];

export default function GuidePage() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const markComplete = (idx: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
    if (idx < SETUP_STEPS.length - 1) setCurrentStep(idx + 1);
  };

  const progressPercent = (completedSteps.size / SETUP_STEPS.length) * 100;
  const CurrentIcon = SETUP_STEPS[currentStep].icon;

  return (
    <div className="relative z-10 max-w-[900px] mx-auto px-5 py-8">
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-6 text-violet-400" data-testid="button-back-guide">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent mb-3">
          Self-Setup Guide
        </h1>
        <p className="text-muted-foreground">Follow each step carefully. Take your time &mdash; you've got this.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs text-muted-foreground font-mono">{completedSteps.size}/{SETUP_STEPS.length}</span>
          <Progress value={progressPercent} className="flex-1 h-1.5 bg-violet-500/10 [&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-cyan-500" />
          <span className="text-xs text-muted-foreground font-mono">{Math.round(progressPercent)}%</span>
        </div>
      </motion.div>

      <div className="flex gap-6 flex-col md:flex-row">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="md:w-[240px] shrink-0">
          <div className="space-y-1.5">
            {SETUP_STEPS.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`w-full flex items-center gap-3 p-3 rounded-md text-left transition-all duration-300 border ${
                    i === currentStep
                      ? "bg-violet-500/15 border-violet-500/30 text-foreground"
                      : "bg-transparent border-transparent text-muted-foreground"
                  }`}
                  data-testid={`button-step-${i}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    completedSteps.has(i) ? "bg-green-500/20" : i === currentStep ? "bg-violet-500/20" : "bg-muted/30"
                  }`}>
                    {completedSteps.has(i) ? (
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <StepIcon className={`w-3.5 h-3.5 ${i === currentStep ? "text-violet-400" : "text-muted-foreground"}`} />
                    )}
                  </div>
                  <span className={`text-sm ${i === currentStep ? "font-semibold" : "font-normal"}`}>{step.title}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8 bg-card/60 backdrop-blur-xl border-violet-500/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-md bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center border border-violet-500/15">
                    <CurrentIcon className="w-6 h-6 text-violet-300" />
                  </div>
                  <div>
                    <Badge variant="outline" className="border-violet-500/30 text-violet-400 bg-violet-500/5 text-xs mb-1">
                      Step {currentStep + 1} of {SETUP_STEPS.length}
                    </Badge>
                    <h3 className="font-serif text-xl font-semibold text-foreground">
                      {SETUP_STEPS[currentStep].title}
                    </h3>
                  </div>
                </div>

                <pre className="text-sm text-card-foreground font-mono leading-[1.9] whitespace-pre-wrap bg-background/60 p-5 rounded-md border border-violet-500/10 mb-6 overflow-x-auto" data-testid="text-guide-content">
                  {SETUP_STEPS[currentStep].content}
                </pre>

                <div className="flex gap-3 justify-end flex-wrap">
                  {currentStep > 0 && (
                    <Button variant="outline" onClick={() => setCurrentStep((p) => p - 1)} className="border-violet-500/30 text-violet-300" data-testid="button-guide-prev">
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                  )}
                  <Button
                    onClick={() => markComplete(currentStep)}
                    className="bg-gradient-to-r from-violet-600 to-cyan-600 border-violet-500/50 text-white shadow-lg shadow-violet-500/20"
                    data-testid="button-guide-next"
                  >
                    {completedSteps.has(currentStep) ? (
                      <>Revisit <Check className="w-4 h-4 ml-1" /></>
                    ) : currentStep === SETUP_STEPS.length - 1 ? (
                      <>Complete! <Trophy className="w-4 h-4 ml-1" /></>
                    ) : (
                      <>Mark Complete & Next <ChevronRight className="w-4 h-4 ml-1" /></>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {completedSteps.size === SETUP_STEPS.length && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center">
                <Card className="inline-block p-10 bg-card/60 backdrop-blur-xl border-violet-500/15">
                  <Trophy className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-bold text-cyan-300 mb-2">Setup Complete!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your Clawd Bot is ready. DM{" "}
                    <a href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noreferrer" className="text-violet-400 no-underline">
                      @{INSTAGRAM}
                    </a>{" "}
                    if you need any help!
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
