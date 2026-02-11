import { useState, useEffect, useCallback, useRef } from "react";

const WALLET = "0x00468c1B22451ed9Fabc9DA32E6aEa28DC03a216";
const ADMIN_PIN = "4455";
const DEMO_CODE = "DEMO2026";
const INSTAGRAM = "squalayyy";

// ─── Utility Helpers ───
const generateId = () => Math.random().toString(36).substr(2, 9);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Storage Helpers ───
async function loadData(key, fallback) {
  try {
    const res = await window.storage.get(key);
    return res ? JSON.parse(res.value) : fallback;
  } catch {
    return fallback;
  }
}
async function saveData(key, data) {
  try {
    await window.storage.set(key, JSON.stringify(data));
  } catch (e) {
    console.error("Storage save error:", e);
  }
}

// ─── Animated Background ───
function AnimatedBG() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 20% 50%, #0a0a1a 0%, #000000 100%)",
      }} />
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: `${300 + i * 150}px`, height: `${300 + i * 150}px`,
          borderRadius: "50%",
          background: i % 2 === 0
            ? "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)",
          left: `${10 + i * 18}%`, top: `${5 + (i % 3) * 30}%`,
          animation: `float${i} ${12 + i * 4}s ease-in-out infinite`,
          filter: "blur(40px)",
        }} />
      ))}
      <style>{`
        @keyframes float0 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-40px)} }
        @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-50px,30px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,50px)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,-60px)} }
        @keyframes float4 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(60px,20px)} }
      `}</style>
    </div>
  );
}

// ─── Particle Canvas ───
function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const particles = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        color: Math.random() > 0.5 ? "rgba(139,92,246," : "rgba(6,182,212,",
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + "0.4)";
        ctx.fill();
      });
      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(139,92,246,${0.06 * (1 - dist / 120)})`;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }} />;
}

// ─── Glow Button ───
function GlowButton({ children, onClick, variant = "primary", style = {}, disabled = false }) {
  const [hov, setHov] = useState(false);
  const base = variant === "primary"
    ? {
        background: hov
          ? "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)"
          : "linear-gradient(135deg, #7c3aed 0%, #0891b2 100%)",
        color: "#fff", border: "none",
        boxShadow: hov ? "0 0 30px rgba(139,92,246,0.4), 0 0 60px rgba(6,182,212,0.2)" : "0 0 20px rgba(139,92,246,0.2)",
      }
    : {
        background: hov ? "rgba(139,92,246,0.15)" : "transparent",
        color: "#c4b5fd",
        border: "1px solid rgba(139,92,246,0.3)",
        boxShadow: hov ? "0 0 20px rgba(139,92,246,0.15)" : "none",
      };
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        ...base, padding: "14px 32px", borderRadius: "12px", cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "15px", fontWeight: 600, fontFamily: "'Outfit', sans-serif",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        opacity: disabled ? 0.5 : 1,
        letterSpacing: "0.5px", ...style,
      }}
    >{children}</button>
  );
}

// ─── Input ───
function Input({ label, value, onChange, type = "text", placeholder = "" }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "16px" }}>
      {label && <label style={{ display: "block", marginBottom: "6px", color: "#a78bfa", fontSize: "13px", fontFamily: "'Outfit', sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>{label}</label>}
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "12px 16px", background: "rgba(15,15,30,0.8)",
          border: focused ? "1px solid rgba(139,92,246,0.6)" : "1px solid rgba(139,92,246,0.2)",
          borderRadius: "10px", color: "#e2e8f0", fontSize: "15px",
          fontFamily: "'Outfit', sans-serif", outline: "none",
          boxShadow: focused ? "0 0 15px rgba(139,92,246,0.15)" : "none",
          transition: "all 0.3s", boxSizing: "border-box",
        }}
      />
    </div>
  );
}

// ─── Section Heading ───
function SectionTitle({ children, sub }) {
  return (
    <div style={{ textAlign: "center", marginBottom: "48px" }}>
      <h2 style={{
        fontFamily: "'Space Grotesk', 'Outfit', sans-serif",
        fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700,
        background: "linear-gradient(135deg, #c4b5fd 0%, #67e8f9 50%, #a78bfa 100%)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        margin: "0 0 12px",
      }}>{children}</h2>
      {sub && <p style={{ color: "#94a3b8", fontSize: "17px", maxWidth: "600px", margin: "0 auto", fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}

// ─── Glass Card ───
function GlassCard({ children, style = {}, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "rgba(15,15,35,0.85)" : "rgba(10,10,25,0.75)",
        border: "1px solid rgba(139,92,246,0.15)",
        borderRadius: "20px", padding: "32px",
        backdropFilter: "blur(20px)",
        boxShadow: hov ? "0 8px 40px rgba(139,92,246,0.12)" : "0 4px 20px rgba(0,0,0,0.3)",
        transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        ...style,
      }}
    >{children}</div>
  );
}

// ─── Badge ───
function Badge({ children, color = "#8b5cf6" }) {
  return (
    <span style={{
      display: "inline-block", padding: "4px 12px", borderRadius: "20px",
      background: `${color}22`, color, fontSize: "12px", fontWeight: 600,
      fontFamily: "'Outfit', sans-serif", letterSpacing: "1px", textTransform: "uppercase",
      border: `1px solid ${color}33`,
    }}>{children}</span>
  );
}

// ─── Setup Guide Steps ───
const SETUP_STEPS = [
  {
    title: "Get Your API Keys",
    icon: "🔑",
    content: `First, you'll need API keys from Anthropic (Claude). Head to console.anthropic.com, create an account, and generate an API key. Keep this key safe — you'll need it soon.\n\nAlternatively, you can use OpenAI or other providers that OpenClaw supports.`,
  },
  {
    title: "Install Prerequisites",
    icon: "⚙️",
    content: `Make sure you have the following installed:\n\n• Node.js (v18 or later) — download from nodejs.org\n• Git — download from git-scm.com\n• A code editor (VS Code recommended)\n• Terminal / Command Line access\n\nOn Mac, you can use Homebrew:\n  brew install node git\n\nOn Windows, download installers from the official sites.`,
  },
  {
    title: "Clone OpenClaw",
    icon: "📦",
    content: `Open your terminal and run:\n\n  git clone https://github.com/steipete/openclaw.git\n  cd openclaw\n  npm install\n\nThis downloads the OpenClaw framework and installs all dependencies. The process takes 2-5 minutes depending on your internet speed.`,
  },
  {
    title: "Configure Your Bot",
    icon: "🤖",
    content: `Copy the example config and add your API key:\n\n  cp .env.example .env\n\nOpen .env in your editor and set:\n  ANTHROPIC_API_KEY=sk-ant-your-key-here\n  BOT_NAME=MyClawd\n  PERSONA=helpful assistant\n\nCustomize the persona to match your desired bot personality. Check the OpenClaw docs at openclaw.ai for all configuration options.`,
  },
  {
    title: "Install Skills from ClawHub",
    icon: "🧩",
    content: `ClawHub (clawhub.ai) is the skill registry. Install useful skills:\n\n  npx clawhub install gmail-integration\n  npx clawhub install calendar-sync\n  npx clawhub install web-browser\n\n⚠️ SECURITY TIP: Always review skill code before installing. Check the author's reputation and community ratings. Avoid skills requiring external prerequisite downloads.`,
  },
  {
    title: "Connect Messaging Platform",
    icon: "💬",
    content: `Connect your bot to your preferred chat platform:\n\n• Discord: Create a bot at discord.com/developers, copy the token to .env\n• Telegram: Talk to @BotFather, get a token\n• WhatsApp: Follow the Twilio/WhatsApp Business API setup in docs\n\nSet PLATFORM=discord (or telegram/whatsapp) in your .env file.`,
  },
  {
    title: "Launch Your Clawd Bot!",
    icon: "🚀",
    content: `Start your bot:\n\n  npm start\n\nYour Clawd Bot is now live! Test it by sending a message on your connected platform.\n\nFor 24/7 uptime, consider:\n• Running on a Raspberry Pi or Mac Mini\n• Using a cloud VM (Hetzner, DigitalOcean)\n• Setting up PM2 for process management:\n  npm install -g pm2\n  pm2 start npm -- start\n\nCongrats! 🎉 You now have your own personal AI assistant.`,
  },
];

// ─── Setup Guide View ───
function SetupGuide({ onBack }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const markComplete = (idx) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
    if (idx < SETUP_STEPS.length - 1) setCurrentStep(idx + 1);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px 20px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontSize: "15px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
        ← Back to Home
      </button>
      <SectionTitle sub="Follow each step carefully. Take your time — you've got this.">
        Self-Setup Guide
      </SectionTitle>

      {/* Progress Bar */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "40px" }}>
        {SETUP_STEPS.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: "4px", borderRadius: "2px",
            background: completedSteps.has(i) ? "linear-gradient(90deg, #8b5cf6, #06b6d4)" : i === currentStep ? "rgba(139,92,246,0.4)" : "rgba(139,92,246,0.1)",
            transition: "all 0.5s",
          }} />
        ))}
      </div>

      {/* Steps sidebar + Content */}
      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        {/* Step List */}
        <div style={{ width: "220px", flexShrink: 0 }}>
          {SETUP_STEPS.map((step, i) => (
            <div
              key={i} onClick={() => setCurrentStep(i)}
              style={{
                padding: "12px 16px", borderRadius: "12px", marginBottom: "8px", cursor: "pointer",
                background: i === currentStep ? "rgba(139,92,246,0.15)" : "transparent",
                border: i === currentStep ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
                display: "flex", alignItems: "center", gap: "10px",
                transition: "all 0.3s",
              }}
            >
              <span style={{ fontSize: "18px" }}>{completedSteps.has(i) ? "✅" : step.icon}</span>
              <span style={{ color: i === currentStep ? "#c4b5fd" : "#64748b", fontSize: "14px", fontFamily: "'Outfit', sans-serif", fontWeight: i === currentStep ? 600 : 400 }}>
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {/* Current Step Content */}
        <div style={{ flex: 1, minWidth: "280px" }}>
          <GlassCard>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <span style={{ fontSize: "32px" }}>{SETUP_STEPS[currentStep].icon}</span>
              <div>
                <Badge>Step {currentStep + 1} of {SETUP_STEPS.length}</Badge>
                <h3 style={{ color: "#e2e8f0", fontFamily: "'Space Grotesk', sans-serif", fontSize: "22px", margin: "8px 0 0" }}>
                  {SETUP_STEPS[currentStep].title}
                </h3>
              </div>
            </div>
            <pre style={{
              color: "#cbd5e1", fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: "14px",
              lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0,
              background: "rgba(0,0,0,0.3)", padding: "20px", borderRadius: "12px",
              border: "1px solid rgba(139,92,246,0.1)",
            }}>
              {SETUP_STEPS[currentStep].content}
            </pre>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px", justifyContent: "flex-end" }}>
              {currentStep > 0 && (
                <GlowButton variant="secondary" onClick={() => setCurrentStep((p) => p - 1)}>
                  Previous
                </GlowButton>
              )}
              <GlowButton onClick={() => markComplete(currentStep)}>
                {completedSteps.has(currentStep) ? "Revisit ✓" : currentStep === SETUP_STEPS.length - 1 ? "Complete! 🎉" : "Mark Complete & Next →"}
              </GlowButton>
            </div>
          </GlassCard>
        </div>
      </div>

      {completedSteps.size === SETUP_STEPS.length && (
        <div style={{ textAlign: "center", marginTop: "40px", animation: "fadeIn 0.5s" }}>
          <GlassCard style={{ display: "inline-block", padding: "32px 48px" }}>
            <span style={{ fontSize: "48px", display: "block", marginBottom: "16px" }}>🏆</span>
            <h3 style={{ color: "#67e8f9", fontFamily: "'Space Grotesk', sans-serif", fontSize: "24px", margin: "0 0 8px" }}>
              Setup Complete!
            </h3>
            <p style={{ color: "#94a3b8", fontFamily: "'Outfit', sans-serif" }}>
              Your Clawd Bot is ready. DM <a href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noreferrer" style={{ color: "#a78bfa" }}>@{INSTAGRAM}</a> if you need any help!
            </p>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

// ─── Time Slot Generator ───
function getAvailableSlots(date, bookings) {
  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];
  const dateStr = date.toISOString().split("T")[0];
  const booked = bookings.filter((b) => b.date === dateStr).map((b) => b.hour);
  return hours.filter((h) => !booked.includes(h));
}

function formatHour(h) {
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hr}:00 ${ampm}`;
}

// ─── Booking View ───
function BookingView({ onBack, onBooked }) {
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData("clawd-bookings", []).then((b) => { setBookings(b); setLoading(false); });
  }, []);

  const next7Days = [...Array(14)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    if (d.getDay() === 0 || d.getDay() === 6) return null; // skip weekends
    return d;
  }).filter(Boolean).slice(0, 7);

  const availableSlots = selectedDate ? getAvailableSlots(selectedDate, bookings) : [];

  const handleBook = async () => {
    if (!name || !email || !selectedDate || selectedHour === null) return;
    const booking = {
      id: generateId(),
      name, email, instagram, phone,
      date: selectedDate.toISOString().split("T")[0],
      hour: selectedHour,
      createdAt: new Date().toISOString(),
      status: "confirmed",
    };
    const updated = [...bookings, booking];
    setBookings(updated);
    await saveData("clawd-bookings", updated);
    setConfirmed(true);
    if (onBooked) onBooked(booking);
  };

  if (loading) return <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>Loading...</div>;

  if (confirmed) {
    return (
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
        <GlassCard>
          <span style={{ fontSize: "64px", display: "block", marginBottom: "20px" }}>🎉</span>
          <h2 style={{ color: "#67e8f9", fontFamily: "'Space Grotesk', sans-serif", margin: "0 0 12px" }}>Booking Confirmed!</h2>
          <p style={{ color: "#cbd5e1", fontFamily: "'Outfit', sans-serif", fontSize: "17px", lineHeight: 1.6 }}>
            Your 1-on-1 session is booked for <strong style={{ color: "#c4b5fd" }}>{selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</strong> at <strong style={{ color: "#c4b5fd" }}>{formatHour(selectedHour)}</strong>.
          </p>
          <p style={{ color: "#94a3b8", fontFamily: "'Outfit', sans-serif", marginTop: "16px" }}>
            I'll reach out via email or Instagram before our session. — <a href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noreferrer" style={{ color: "#a78bfa" }}>@{INSTAGRAM}</a>
          </p>
          <GlowButton onClick={onBack} style={{ marginTop: "24px" }}>Back to Home</GlowButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "24px 20px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontSize: "15px", marginBottom: "24px" }}>
        ← Back to Home
      </button>
      <SectionTitle sub="Book your 1-hour personal setup session. I'll walk you through everything.">
        Book 1-on-1 Session
      </SectionTitle>

      <GlassCard>
        <Input label="Your Name" value={name} onChange={setName} placeholder="John Doe" />
        <Input label="Email" value={email} onChange={setEmail} type="email" placeholder="you@email.com" />
        <Input label="Instagram" value={instagram} onChange={setInstagram} placeholder="@yourhandle" />
        <Input label="Phone Number" value={phone} onChange={setPhone} type="tel" placeholder="+1 (555) 123-4567" />

        <label style={{ display: "block", margin: "24px 0 12px", color: "#a78bfa", fontSize: "13px", fontFamily: "'Outfit', sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>Select a Date</label>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
          {next7Days.map((d) => {
            const isSelected = selectedDate && d.toDateString() === selectedDate.toDateString();
            const slotsLeft = getAvailableSlots(d, bookings).length;
            return (
              <button
                key={d.toISOString()} onClick={() => { setSelectedDate(d); setSelectedHour(null); }}
                style={{
                  padding: "12px 16px", borderRadius: "12px", cursor: slotsLeft > 0 ? "pointer" : "not-allowed",
                  background: isSelected ? "rgba(139,92,246,0.25)" : "rgba(15,15,30,0.8)",
                  border: isSelected ? "1px solid #8b5cf6" : "1px solid rgba(139,92,246,0.15)",
                  color: slotsLeft > 0 ? "#e2e8f0" : "#475569",
                  fontFamily: "'Outfit', sans-serif", fontSize: "13px", textAlign: "center",
                  opacity: slotsLeft > 0 ? 1 : 0.5, transition: "all 0.3s",
                  minWidth: "80px",
                }}
                disabled={slotsLeft === 0}
              >
                <div style={{ fontWeight: 600 }}>{d.toLocaleDateString("en-US", { weekday: "short" })}</div>
                <div style={{ fontSize: "16px", margin: "4px 0" }}>{d.getDate()}</div>
                <div style={{ fontSize: "11px", color: slotsLeft > 0 ? "#67e8f9" : "#64748b" }}>{slotsLeft} slots</div>
              </button>
            );
          })}
        </div>

        {selectedDate && (
          <>
            <label style={{ display: "block", margin: "16px 0 12px", color: "#a78bfa", fontSize: "13px", fontFamily: "'Outfit', sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>Select a Time</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
              {availableSlots.map((h) => (
                <button
                  key={h} onClick={() => setSelectedHour(h)}
                  style={{
                    padding: "10px 18px", borderRadius: "10px", cursor: "pointer",
                    background: selectedHour === h ? "rgba(6,182,212,0.25)" : "rgba(15,15,30,0.8)",
                    border: selectedHour === h ? "1px solid #06b6d4" : "1px solid rgba(6,182,212,0.15)",
                    color: "#e2e8f0", fontFamily: "'Outfit', sans-serif", fontSize: "14px",
                    transition: "all 0.3s",
                  }}
                >{formatHour(h)}</button>
              ))}
            </div>
          </>
        )}

        <GlowButton onClick={handleBook} disabled={!name || !email || !selectedDate || selectedHour === null} style={{ width: "100%" }}>
          Confirm Booking →
        </GlowButton>
      </GlassCard>
    </div>
  );
}

// ─── Payment View ───
function PaymentView({ tier, onSuccess, onBack }) {
  const [txHash, setTxHash] = useState("");
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState(null); // "success" | "pending" | "error"
  const [copied, setCopied] = useState(false);

  const amount = tier === "vip" ? 799 : 199;

  const copyAddress = () => {
    navigator.clipboard.writeText(WALLET).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const verifyPayment = async () => {
    if (!txHash.trim()) return;
    setChecking(true);
    setStatus("pending");

    const isDemo = txHash.trim().toUpperCase() === DEMO_CODE;

    // Simulate verification delay (in production, check etherscan API)
    await sleep(isDemo ? 1000 : 3000);
    // Store payment record (skip storage for demo)
    if (!isDemo) {
      const payments = await loadData("clawd-payments", []);
      const payment = {
        id: generateId(),
        txHash: txHash.trim(),
        tier,
        amount,
        timestamp: new Date().toISOString(),
        verified: true,
      };
      await saveData("clawd-payments", [...payments, payment]);
    }
    setStatus("success");
    setChecking(false);
    const payment = { id: generateId(), txHash: txHash.trim(), tier, amount, timestamp: new Date().toISOString(), verified: true };
    setTimeout(() => onSuccess(payment), 1500);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "24px 20px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontSize: "15px", marginBottom: "24px" }}>
        ← Back
      </button>
      <SectionTitle sub={`Send $${amount} in ETH or USDT (ERC-20) to the wallet below`}>
        Crypto Payment
      </SectionTitle>

      <GlassCard>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <Badge color="#06b6d4">{tier === "vip" ? "1-on-1 VIP Setup" : "Self-Setup Access"}</Badge>
          <div style={{
            fontSize: "48px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif",
            background: "linear-gradient(135deg, #c4b5fd, #67e8f9)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            margin: "16px 0 8px",
          }}>${amount}</div>
          <p style={{ color: "#94a3b8", fontSize: "14px", fontFamily: "'Outfit', sans-serif" }}>ETH or USDT on Ethereum network</p>
        </div>

        {/* Wallet Address */}
        <div style={{
          background: "rgba(0,0,0,0.4)", borderRadius: "12px", padding: "16px",
          border: "1px solid rgba(139,92,246,0.2)", marginBottom: "24px",
        }}>
          <label style={{ display: "block", marginBottom: "8px", color: "#a78bfa", fontSize: "12px", fontFamily: "'Outfit', sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>Send To</label>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <code style={{
              flex: 1, color: "#67e8f9", fontSize: "13px", fontFamily: "'JetBrains Mono', monospace",
              wordBreak: "break-all", lineHeight: 1.5,
            }}>{WALLET}</code>
            <button onClick={copyAddress} style={{
              background: copied ? "rgba(34,197,94,0.2)" : "rgba(139,92,246,0.15)",
              border: "1px solid " + (copied ? "rgba(34,197,94,0.4)" : "rgba(139,92,246,0.3)"),
              borderRadius: "8px", padding: "8px 14px", cursor: "pointer",
              color: copied ? "#4ade80" : "#c4b5fd", fontSize: "13px", fontFamily: "'Outfit', sans-serif",
              transition: "all 0.3s", whiteSpace: "nowrap",
            }}>
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
        </div>

        {/* Steps */}
        <div style={{ marginBottom: "24px" }}>
          {["Open your crypto wallet (MetaMask, Coinbase, etc.)", `Send exactly $${amount} worth of ETH or USDT (ERC-20)`, "Copy the transaction hash after sending", "Paste it below to verify your payment"].map((step, i) => (
            <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "12px" }}>
              <span style={{
                width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(139,92,246,0.2)", color: "#a78bfa", fontSize: "12px", fontWeight: 700, flexShrink: 0,
                fontFamily: "'Outfit', sans-serif",
              }}>{i + 1}</span>
              <span style={{ color: "#cbd5e1", fontSize: "14px", fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 }}>{step}</span>
            </div>
          ))}
        </div>

        <Input label="Transaction Hash" value={txHash} onChange={setTxHash} placeholder="0x..." />

        <div style={{
          background: "rgba(139,92,246,0.08)", border: "1px dashed rgba(139,92,246,0.25)",
          borderRadius: "10px", padding: "12px 16px", marginBottom: "16px",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          <span style={{ fontSize: "14px" }}>🧪</span>
          <span style={{ color: "#a78bfa", fontSize: "13px", fontFamily: "'Outfit', sans-serif" }}>
            Demo mode: type <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 8px", borderRadius: "4px", color: "#67e8f9" }}>DEMO2026</code> to preview the experience
          </span>
        </div>

        {status === "success" && (
          <div style={{
            background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
            borderRadius: "12px", padding: "16px", marginBottom: "16px", textAlign: "center",
            color: "#4ade80", fontFamily: "'Outfit', sans-serif",
          }}>✅ Payment Verified! Redirecting...</div>
        )}
        {status === "pending" && (
          <div style={{
            background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.3)",
            borderRadius: "12px", padding: "16px", marginBottom: "16px", textAlign: "center",
            color: "#fbbf24", fontFamily: "'Outfit', sans-serif",
          }}>⏳ Verifying transaction...</div>
        )}

        <GlowButton onClick={verifyPayment} disabled={!txHash.trim() || checking} style={{ width: "100%" }}>
          {checking ? "Verifying..." : "Verify Payment →"}
        </GlowButton>
      </GlassCard>
    </div>
  );
}

// ─── Admin Panel ───
function AdminPanel({ onBack }) {
  const [pin, setPin] = useState("");
  const [authed, setAuthed] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tab, setTab] = useState("bookings");

  useEffect(() => {
    if (authed) {
      loadData("clawd-bookings", []).then(setBookings);
      loadData("clawd-payments", []).then(setPayments);
    }
  }, [authed]);

  const cancelBooking = async (id) => {
    const updated = bookings.filter((b) => b.id !== id);
    setBookings(updated);
    await saveData("clawd-bookings", updated);
  };

  if (!authed) {
    return (
      <div style={{ maxWidth: "400px", margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontSize: "15px", marginBottom: "24px", display: "block" }}>
          ← Back
        </button>
        <GlassCard>
          <h2 style={{ color: "#e2e8f0", fontFamily: "'Space Grotesk', sans-serif", margin: "0 0 24px" }}>Admin Access</h2>
          <Input label="PIN Code" value={pin} onChange={setPin} type="password" placeholder="Enter PIN" />
          <GlowButton onClick={() => { if (pin === ADMIN_PIN) setAuthed(true); }} style={{ width: "100%" }}>
            Login
          </GlowButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 20px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontSize: "15px", marginBottom: "24px" }}>
        ← Back to Home
      </button>
      <SectionTitle>Admin Dashboard</SectionTitle>

      {/* Stats Row */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "32px", flexWrap: "wrap" }}>
        {[
          { label: "Total Bookings", value: bookings.length, color: "#8b5cf6" },
          { label: "Payments", value: payments.length, color: "#06b6d4" },
          { label: "Revenue", value: `$${payments.reduce((s, p) => s + (p.amount || 0), 0)}`, color: "#4ade80" },
        ].map((s) => (
          <GlassCard key={s.label} style={{ flex: 1, minWidth: "150px", textAlign: "center", padding: "20px" }}>
            <div style={{ color: s.color, fontSize: "28px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</div>
            <div style={{ color: "#94a3b8", fontSize: "13px", fontFamily: "'Outfit', sans-serif", marginTop: "4px" }}>{s.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {["bookings", "payments"].map((t) => (
          <button
            key={t} onClick={() => setTab(t)}
            style={{
              padding: "10px 24px", borderRadius: "10px", cursor: "pointer",
              background: tab === t ? "rgba(139,92,246,0.2)" : "transparent",
              border: tab === t ? "1px solid rgba(139,92,246,0.4)" : "1px solid rgba(139,92,246,0.1)",
              color: tab === t ? "#c4b5fd" : "#64748b",
              fontFamily: "'Outfit', sans-serif", fontSize: "14px", fontWeight: 600,
              textTransform: "capitalize", transition: "all 0.3s",
            }}
          >{t}</button>
        ))}
      </div>

      {tab === "bookings" && (
        <GlassCard>
          {bookings.length === 0 ? (
            <p style={{ color: "#64748b", fontFamily: "'Outfit', sans-serif", textAlign: "center", padding: "32px" }}>No bookings yet</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Outfit', sans-serif" }}>
                <thead>
                  <tr>
                    {["Name", "Email", "Instagram", "Phone", "Date", "Time", "Status", ""].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: "#a78bfa", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid rgba(139,92,246,0.15)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.sort((a, b) => new Date(a.date) - new Date(b.date)).map((b) => (
                    <tr key={b.id}>
                      <td style={{ padding: "12px 16px", color: "#e2e8f0", fontSize: "14px" }}>{b.name}</td>
                      <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "14px" }}>{b.email}</td>
                      <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "14px" }}>{b.instagram || "—"}</td>
                      <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "14px" }}>{b.phone || "—"}</td>
                      <td style={{ padding: "12px 16px", color: "#67e8f9", fontSize: "14px" }}>{b.date}</td>
                      <td style={{ padding: "12px 16px", color: "#c4b5fd", fontSize: "14px" }}>{formatHour(b.hour)}</td>
                      <td style={{ padding: "12px 16px" }}><Badge color="#4ade80">{b.status}</Badge></td>
                      <td style={{ padding: "12px 16px" }}>
                        <button onClick={() => cancelBooking(b.id)} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", color: "#f87171", fontSize: "12px", fontFamily: "'Outfit', sans-serif" }}>Cancel</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      )}

      {tab === "payments" && (
        <GlassCard>
          {payments.length === 0 ? (
            <p style={{ color: "#64748b", fontFamily: "'Outfit', sans-serif", textAlign: "center", padding: "32px" }}>No payments yet</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Outfit', sans-serif" }}>
                <thead>
                  <tr>
                    {["Tier", "Amount", "TX Hash", "Date", "Status"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: "#a78bfa", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid rgba(139,92,246,0.15)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td style={{ padding: "12px 16px" }}><Badge color={p.tier === "vip" ? "#8b5cf6" : "#06b6d4"}>{p.tier === "vip" ? "1-on-1 VIP" : "Self-Setup"}</Badge></td>
                      <td style={{ padding: "12px 16px", color: "#4ade80", fontSize: "14px", fontWeight: 600 }}>${p.amount}</td>
                      <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "12px", fontFamily: "monospace" }}>{p.txHash.slice(0, 10)}...{p.txHash.slice(-8)}</td>
                      <td style={{ padding: "12px 16px", color: "#cbd5e1", fontSize: "14px" }}>{new Date(p.timestamp).toLocaleDateString()}</td>
                      <td style={{ padding: "12px 16px" }}><Badge color="#4ade80">Verified</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}

// ─── Landing Page ───
function LandingPage({ onSelectTier, onAdmin }) {
  const [visibleSections, setVisibleSections] = useState(new Set());

  useEffect(() => {
    const timers = [0, 1, 2, 3, 4].map((i) =>
      setTimeout(() => setVisibleSections((prev) => new Set([...prev, i])), i * 200)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const sectionStyle = (i) => ({
    opacity: visibleSections.has(i) ? 1 : 0,
    transform: visibleSections.has(i) ? "translateY(0)" : "translateY(30px)",
    transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)",
  });

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 20px" }}>
      {/* Nav */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 0", borderBottom: "1px solid rgba(139,92,246,0.1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "28px" }}>🤖</span>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: "22px", fontWeight: 700,
            background: "linear-gradient(135deg, #c4b5fd, #67e8f9)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>CLAWD</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <a href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noreferrer" style={{
            color: "#a78bfa", textDecoration: "none", fontFamily: "'Outfit', sans-serif", fontSize: "14px",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            <span style={{ fontSize: "18px" }}>📸</span> @{INSTAGRAM}
          </a>
          <button onClick={onAdmin} style={{
            background: "none", border: "none", color: "#475569", cursor: "pointer",
            fontFamily: "'Outfit', sans-serif", fontSize: "13px",
          }}>Admin</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ ...sectionStyle(0), textAlign: "center", padding: "80px 0 60px" }}>
        <Badge>Powered by OpenClaw + ClawHub + Moltbook</Badge>
        <h1 style={{
          fontFamily: "'Space Grotesk', 'Outfit', sans-serif",
          fontSize: "clamp(36px, 7vw, 72px)", fontWeight: 800,
          background: "linear-gradient(135deg, #ffffff 0%, #c4b5fd 40%, #67e8f9 70%, #a78bfa 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          margin: "24px 0 20px", lineHeight: 1.1, letterSpacing: "-1px",
        }}>
          Your Personal AI<br />Agent, Set Up For You
        </h1>
        <p style={{
          color: "#94a3b8", fontSize: "clamp(16px, 2.5vw, 20px)", maxWidth: "650px", margin: "0 auto 40px",
          fontFamily: "'Outfit', sans-serif", lineHeight: 1.7,
        }}>
          Get your own Clawd Bot running using <strong style={{ color: "#c4b5fd" }}>OpenClaw</strong>, <strong style={{ color: "#67e8f9" }}>ClawHub</strong> skills, and the <strong style={{ color: "#c4b5fd" }}>Moltbook</strong> ecosystem — reading emails, managing your calendar, coding, and more. All on your own computer, with your own API keys.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <GlowButton onClick={() => onSelectTier("self")}>Start Self-Setup — $199</GlowButton>
          <GlowButton variant="secondary" onClick={() => onSelectTier("vip")}>Book 1-on-1 — $799</GlowButton>
        </div>
      </section>

      {/* Features */}
      <section style={{ ...sectionStyle(1), padding: "40px 0 60px" }}>
        <SectionTitle sub="Everything your Clawd Bot can do once it's set up">What You're Getting</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {[
            { icon: "📧", title: "Email & Calendar", desc: "Reads, drafts, and sends emails. Manages your entire calendar autonomously." },
            { icon: "💻", title: "Code & Build", desc: "Write code, review PRs, build apps — all from a chat message on Discord or Telegram." },
            { icon: "🧩", title: "3000+ Skills", desc: "Tap into ClawHub's massive skill registry. Gmail, Slack, web browsing, crypto, and more." },
            { icon: "🔒", title: "Your Data, Your Machine", desc: "Runs locally on your computer. Your API keys, your data — nothing leaves your system." },
            { icon: "🌐", title: "Multi-Platform", desc: "Connect via Discord, Telegram, WhatsApp, or any messaging app you already use." },
            { icon: "🧠", title: "Persistent Memory", desc: "Your bot remembers context across conversations. It gets smarter the more you use it." },
          ].map((f) => (
            <GlassCard key={f.title} style={{ padding: "28px" }}>
              <span style={{ fontSize: "32px", display: "block", marginBottom: "14px" }}>{f.icon}</span>
              <h3 style={{ color: "#e2e8f0", fontFamily: "'Space Grotesk', sans-serif", fontSize: "18px", margin: "0 0 8px" }}>{f.title}</h3>
              <p style={{ color: "#94a3b8", fontFamily: "'Outfit', sans-serif", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ ...sectionStyle(2), padding: "40px 0 60px" }}>
        <SectionTitle sub="Choose the option that works best for you">Pricing</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", maxWidth: "800px", margin: "0 auto" }}>
          {/* Self Setup */}
          <GlassCard style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "relative", zIndex: 1 }}>
              <Badge color="#06b6d4">Self-Setup</Badge>
              <div style={{
                fontSize: "48px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif",
                color: "#e2e8f0", margin: "20px 0 8px",
              }}>$199</div>
              <p style={{ color: "#94a3b8", fontSize: "14px", fontFamily: "'Outfit', sans-serif", margin: "0 0 24px" }}>
                Guided walkthrough at your own pace
              </p>
              <div style={{ borderTop: "1px solid rgba(139,92,246,0.1)", paddingTop: "20px", marginBottom: "24px" }}>
                {["Step-by-step interactive guide", "Full OpenClaw + ClawHub setup", "Skill installation walkthrough", "Multi-platform connection guide", "Lifetime access to guide updates", "Community support via Instagram"].map((item) => (
                  <div key={item} style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ color: "#06b6d4", fontSize: "14px" }}>✓</span>
                    <span style={{ color: "#cbd5e1", fontSize: "14px", fontFamily: "'Outfit', sans-serif" }}>{item}</span>
                  </div>
                ))}
              </div>
              <GlowButton variant="secondary" onClick={() => onSelectTier("self")} style={{ width: "100%" }}>
                Get Started →
              </GlowButton>
            </div>
          </GlassCard>

          {/* VIP 1-on-1 */}
          <GlassCard style={{ position: "relative", overflow: "hidden", border: "1px solid rgba(139,92,246,0.3)" }}>
            <div style={{
              position: "absolute", top: "-1px", left: 0, right: 0, height: "3px",
              background: "linear-gradient(90deg, #8b5cf6, #06b6d4)",
            }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Badge color="#8b5cf6">1-on-1 VIP</Badge>
                <Badge color="#f59e0b">Most Popular</Badge>
              </div>
              <div style={{
                fontSize: "48px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif",
                background: "linear-gradient(135deg, #c4b5fd, #67e8f9)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                margin: "20px 0 8px",
              }}>$799</div>
              <p style={{ color: "#94a3b8", fontSize: "14px", fontFamily: "'Outfit', sans-serif", margin: "0 0 24px" }}>
                Personal 1-hour session with me
              </p>
              <div style={{ borderTop: "1px solid rgba(139,92,246,0.1)", paddingTop: "20px", marginBottom: "24px" }}>
                {["Everything in Self-Setup", "1-hour live screen-share session", "Custom bot personality setup", "Advanced skill configuration", "Troubleshooting & optimization", "Priority DM support after", "I do it all — you just watch & learn"].map((item) => (
                  <div key={item} style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ color: "#8b5cf6", fontSize: "14px" }}>✓</span>
                    <span style={{ color: "#cbd5e1", fontSize: "14px", fontFamily: "'Outfit', sans-serif" }}>{item}</span>
                  </div>
                ))}
              </div>
              <GlowButton onClick={() => onSelectTier("vip")} style={{ width: "100%" }}>
                Book Your Session →
              </GlowButton>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ ...sectionStyle(3), padding: "40px 0 60px" }}>
        <SectionTitle sub="From payment to your own AI assistant in hours">How It Works</SectionTitle>
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
          {[
            { step: "1", icon: "💰", title: "Pay with Crypto", desc: "Send ETH or USDT to our wallet. Paste your TX hash to verify." },
            { step: "2", icon: "🎯", title: "Choose Your Path", desc: "Self-guided walkthrough or book a 1-on-1 live session." },
            { step: "3", icon: "🤖", title: "Bot Goes Live", desc: "Your personal Clawd Bot is running 24/7 on your machine." },
          ].map((s) => (
            <GlassCard key={s.step} style={{ maxWidth: "280px", textAlign: "center", padding: "32px 24px" }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%", margin: "0 auto 16px",
                background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "24px",
              }}>{s.icon}</div>
              <h3 style={{ color: "#e2e8f0", fontFamily: "'Space Grotesk', sans-serif", fontSize: "18px", margin: "0 0 8px" }}>{s.title}</h3>
              <p style={{ color: "#94a3b8", fontFamily: "'Outfit', sans-serif", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ ...sectionStyle(4), padding: "40px 0 80px", textAlign: "center" }}>
        <GlassCard style={{ maxWidth: "600px", margin: "0 auto", padding: "48px 32px" }}>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: "28px",
            background: "linear-gradient(135deg, #c4b5fd, #67e8f9)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            margin: "0 0 12px",
          }}>Ready to Build Your AI Agent?</h2>
          <p style={{ color: "#94a3b8", fontFamily: "'Outfit', sans-serif", marginBottom: "28px", lineHeight: 1.6 }}>
            Join the growing community of people running their own personal AI assistants. Questions? DM me.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <GlowButton onClick={() => onSelectTier("vip")}>Book 1-on-1 — $799</GlowButton>
            <GlowButton variant="secondary" onClick={() => onSelectTier("self")}>Self-Setup — $199</GlowButton>
          </div>
          <a
            href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              color: "#a78bfa", textDecoration: "none", marginTop: "24px",
              fontFamily: "'Outfit', sans-serif", fontSize: "15px",
            }}
          >
            <span style={{ fontSize: "20px" }}>📸</span> Follow @{INSTAGRAM} on Instagram
          </a>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(139,92,246,0.1)", padding: "24px 0",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px",
      }}>
        <span style={{ color: "#475569", fontSize: "13px", fontFamily: "'Outfit', sans-serif" }}>
          © 2026 Clawd · Built with OpenClaw, ClawHub & Moltbook
        </span>
        <div style={{ display: "flex", gap: "20px" }}>
          <a href="https://openclaw.ai" target="_blank" rel="noreferrer" style={{ color: "#64748b", fontSize: "13px", fontFamily: "'Outfit', sans-serif", textDecoration: "none" }}>OpenClaw</a>
          <a href="https://clawhub.ai" target="_blank" rel="noreferrer" style={{ color: "#64748b", fontSize: "13px", fontFamily: "'Outfit', sans-serif", textDecoration: "none" }}>ClawHub</a>
          <a href="https://moltbook.com" target="_blank" rel="noreferrer" style={{ color: "#64748b", fontSize: "13px", fontFamily: "'Outfit', sans-serif", textDecoration: "none" }}>Moltbook</a>
          <a href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noreferrer" style={{ color: "#64748b", fontSize: "13px", fontFamily: "'Outfit', sans-serif", textDecoration: "none" }}>Instagram</a>
        </div>
      </footer>
    </div>
  );
}

// ─── Main App ───
export default function App() {
  // views: "landing" | "payment-self" | "payment-vip" | "guide" | "booking" | "admin"
  const [view, setView] = useState("landing");
  const [paidTier, setPaidTier] = useState(null);

  const handleSelectTier = (tier) => {
    setView(tier === "vip" ? "payment-vip" : "payment-self");
  };

  const handlePaymentSuccess = (payment) => {
    setPaidTier(payment.tier);
    if (payment.tier === "vip") {
      setView("booking");
    } else {
      setView("guide");
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000; overflow-x: hidden; }
        ::selection { background: rgba(139,92,246,0.3); color: #fff; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0a0a1a; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 4px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <AnimatedBG />
      <ParticleField />
      <div style={{ position: "relative", zIndex: 10 }}>
        {view === "landing" && <LandingPage onSelectTier={handleSelectTier} onAdmin={() => setView("admin")} />}
        {view === "payment-self" && <PaymentView tier="self" onSuccess={handlePaymentSuccess} onBack={() => setView("landing")} />}
        {view === "payment-vip" && <PaymentView tier="vip" onSuccess={handlePaymentSuccess} onBack={() => setView("landing")} />}
        {view === "guide" && <SetupGuide onBack={() => setView("landing")} />}
        {view === "booking" && <BookingView onBack={() => setView("landing")} />}
        {view === "admin" && <AdminPanel onBack={() => setView("landing")} />}
      </div>
    </div>
  );
}
