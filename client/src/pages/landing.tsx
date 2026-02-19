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

function AIEntityHumanoid({ reactToCTA = false, className = "" }: { reactToCTA?: boolean; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const lastMoveRef = useRef(Date.now());
  const animRef = useRef(0);
  const blinkRef = useRef({ active: false, progress: 0, nextBlink: 3000 + Math.random() * 5000 });
  const tiltRef = useRef(0);
  const glitchRef = useRef({ active: false, timer: 15000 + Math.random() * 5000 });
  const breathRef = useRef(0);
  const surgeRef = useRef({ active: false, timer: 8000 + Math.random() * 4000, progress: 0 });
  const engageRef = useRef(0);
  const embersRef = useRef<{ x: number; y: number; life: number; speed: number; size: number }[]>([]);

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
      mouseRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
      lastMoveRef.current = Date.now();
    };
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("resize", resize);

    let paused = false;
    const onVis = () => { paused = document.hidden; };
    document.addEventListener("visibilitychange", onVis);

    let elapsed = 0;
    let lastTime = performance.now();

    const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    };

    const drawBody = (w: number, h: number, dt: number) => {
      elapsed += dt;
      breathRef.current += dt * 0.0008;
      const breath = Math.sin(breathRef.current * Math.PI * 2) * 0.015 + 1;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const cx = w * 0.5;
      const cy = h * 0.38;
      const s = Math.min(w, h) * 0.0024 * breath;
      const idleTime = Date.now() - lastMoveRef.current;

      if (idleTime > 3000) {
        tiltRef.current += (Math.sin(elapsed * 0.0003) * 0.04 - tiltRef.current) * 0.02;
      } else {
        tiltRef.current *= 0.95;
      }

      const targetEngage = reactToCTA ? 1 : 0;
      engageRef.current += (targetEngage - engageRef.current) * 0.05;
      const engage = engageRef.current;

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
      let glitchOff = 0;
      if (glitchRef.current.timer <= 0) {
        glitchRef.current.active = true;
        glitchRef.current.timer = 15000 + Math.random() * 5000;
        setTimeout(() => { glitchRef.current.active = false; }, 80 + Math.random() * 120);
      }
      if (glitchRef.current.active) glitchOff = (Math.random() - 0.5) * 10;

      surgeRef.current.timer -= dt;
      if (surgeRef.current.timer <= 0) {
        surgeRef.current.active = true;
        surgeRef.current.progress = 0;
        surgeRef.current.timer = 8000 + Math.random() * 4000;
      }
      if (surgeRef.current.active) {
        surgeRef.current.progress += dt * 0.002;
        if (surgeRef.current.progress >= 1) surgeRef.current.active = false;
      }

      if (Math.random() < 0.03) {
        embersRef.current.push({ x: cx + (Math.random() - 0.5) * 80 * s, y: cy + 40 * s, life: 1, speed: 0.5 + Math.random() * 0.8, size: 1 + Math.random() * 2 });
      }
      embersRef.current = embersRef.current.filter(e => {
        e.life -= dt * 0.001 * e.speed;
        e.y -= dt * 0.03 * e.speed;
        e.x += Math.sin(elapsed * 0.002 + e.y * 0.01) * 0.3;
        return e.life > 0;
      });

      ctx.save();
      ctx.translate(cx + glitchOff, cy + engage * -8);
      ctx.rotate(tiltRef.current);

      const glow = 0.35 + Math.sin(breathRef.current * Math.PI * 4) * 0.12 + engage * 0.25;
      const surgeGlow = surgeRef.current.active ? Math.sin(surgeRef.current.progress * Math.PI) * 0.5 : 0;

      ctx.shadowColor = COLORS.cyan;
      ctx.shadowBlur = 8 + engage * 12 + surgeGlow * 20;
      ctx.strokeStyle = `rgba(0, 229, 255, ${glow + surgeGlow * 0.3})`;
      ctx.lineWidth = 1;

      const headW = 55 * s;
      const headH = 70 * s;
      const shoulderW = 130 * s;
      const shoulderY = headH * 0.95;
      const chestH = 110 * s;
      const armW = 40 * s;

      ctx.beginPath();
      ctx.moveTo(-headW * 0.3, -headH);
      ctx.lineTo(-headW * 0.7, -headH * 0.9);
      ctx.lineTo(-headW, -headH * 0.55);
      ctx.lineTo(-headW * 1.05, -headH * 0.15);
      ctx.lineTo(-headW * 0.9, headH * 0.1);
      ctx.lineTo(-headW * 0.55, headH * 0.45);
      ctx.lineTo(-headW * 0.2, headH * 0.6);
      ctx.lineTo(0, headH * 0.65);
      ctx.lineTo(headW * 0.2, headH * 0.6);
      ctx.lineTo(headW * 0.55, headH * 0.45);
      ctx.lineTo(headW * 0.9, headH * 0.1);
      ctx.lineTo(headW * 1.05, -headH * 0.15);
      ctx.lineTo(headW, -headH * 0.55);
      ctx.lineTo(headW * 0.7, -headH * 0.9);
      ctx.lineTo(headW * 0.3, -headH);
      ctx.closePath();
      ctx.stroke();

      ctx.lineWidth = 0.5;
      ctx.strokeStyle = `rgba(0, 229, 255, ${glow * 0.25})`;
      const headDetails: [number, number, number, number][] = [
        [-headW * 0.8, -headH * 0.5, headW * 0.8, -headH * 0.5],
        [-headW * 0.9, -headH * 0.1, headW * 0.9, -headH * 0.1],
        [-headW * 0.6, headH * 0.25, headW * 0.6, headH * 0.25],
        [0, -headH * 0.95, 0, headH * 0.6],
        [-headW * 0.3, -headH * 0.85, -headW * 0.3, headH * 0.55],
        [headW * 0.3, -headH * 0.85, headW * 0.3, headH * 0.55],
      ];
      headDetails.forEach(([x1, y1, x2, y2]) => drawLine(x1, y1, x2, y2));

      ctx.strokeStyle = `rgba(168, 85, 247, ${glow * 0.2})`;
      ctx.lineWidth = 0.4;
      for (let i = 0; i < 5; i++) {
        const y = -headH * 0.8 + i * headH * 0.35;
        drawLine(-headW * 0.6, y, -headW * 0.2, y + headH * 0.1);
        drawLine(headW * 0.6, y, headW * 0.2, y + headH * 0.1);
      }

      const eyeY = -headH * 0.18;
      const eyeSpacing = headW * 0.48;
      const eyeW = headW * 0.3;
      const eyeH = headH * 0.13 * (1 - blinkAmount * 0.9);
      const lookX = (mx - 0.5) * eyeW * 0.45;
      const lookY = (my - 0.5) * eyeH * 0.35;
      const eyeGlow = 0.8 + engage * 0.2 + Math.sin(breathRef.current * Math.PI * 6) * 0.05;

      ctx.strokeStyle = `rgba(0, 229, 255, ${eyeGlow})`;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 15 + engage * 15;

      [-1, 1].forEach(side => {
        const ex = side * eyeSpacing;
        ctx.beginPath();
        ctx.moveTo(ex - eyeW, eyeY);
        ctx.lineTo(ex - eyeW * 0.4, eyeY - eyeH);
        ctx.lineTo(ex + eyeW * 0.4, eyeY - eyeH);
        ctx.lineTo(ex + eyeW, eyeY);
        ctx.lineTo(ex + eyeW * 0.4, eyeY + eyeH);
        ctx.lineTo(ex - eyeW * 0.4, eyeY + eyeH);
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = `rgba(0, 229, 255, ${eyeGlow})`;
        ctx.shadowBlur = 20 + engage * 20;
        ctx.beginPath();
        ctx.arc(ex + lookX, eyeY + lookY, eyeH * 0.35, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${eyeGlow * 0.6})`;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(ex + lookX - eyeH * 0.1, eyeY + lookY - eyeH * 0.1, eyeH * 0.12, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.lineWidth = 0.6;
      ctx.strokeStyle = `rgba(0, 229, 255, ${glow * 0.35})`;
      ctx.shadowBlur = 6;
      drawLine(-headW * 0.2, headH * 0.35, headW * 0.2, headH * 0.35);

      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(0, 229, 255, ${glow})`;
      ctx.shadowBlur = 8 + surgeGlow * 15;

      const neckW = headW * 0.35;
      drawLine(-neckW, headH * 0.65, -neckW * 1.2, shoulderY);
      drawLine(neckW, headH * 0.65, neckW * 1.2, shoulderY);

      ctx.beginPath();
      ctx.moveTo(-neckW * 1.2, shoulderY);
      ctx.lineTo(-shoulderW * 0.5, shoulderY + 5 * s);
      ctx.lineTo(-shoulderW * 0.7, shoulderY + 10 * s);
      ctx.lineTo(-shoulderW * 0.85, shoulderY + 15 * s);
      ctx.lineTo(-shoulderW, shoulderY + 25 * s);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(neckW * 1.2, shoulderY);
      ctx.lineTo(shoulderW * 0.5, shoulderY + 5 * s);
      ctx.lineTo(shoulderW * 0.7, shoulderY + 10 * s);
      ctx.lineTo(shoulderW * 0.85, shoulderY + 15 * s);
      ctx.lineTo(shoulderW, shoulderY + 25 * s);
      ctx.stroke();

      ctx.lineWidth = 0.5;
      ctx.strokeStyle = `rgba(0, 229, 255, ${glow * 0.3})`;
      for (let i = 0; i < 4; i++) {
        const y = shoulderY + 5 * s + i * 6 * s;
        drawLine(-shoulderW * (0.5 + i * 0.12), y, -shoulderW * (0.5 + i * 0.12) - 12 * s, y + 8 * s);
        drawLine(shoulderW * (0.5 + i * 0.12), y, shoulderW * (0.5 + i * 0.12) + 12 * s, y + 8 * s);
      }

      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(0, 229, 255, ${glow})`;
      const chestTop = shoulderY + 25 * s;
      ctx.beginPath();
      ctx.moveTo(-shoulderW, chestTop);
      ctx.lineTo(-shoulderW * 0.9, chestTop + chestH * 0.3);
      ctx.lineTo(-shoulderW * 0.75, chestTop + chestH * 0.6);
      ctx.lineTo(-shoulderW * 0.55, chestTop + chestH * 0.85);
      ctx.lineTo(-shoulderW * 0.3, chestTop + chestH);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(shoulderW, chestTop);
      ctx.lineTo(shoulderW * 0.9, chestTop + chestH * 0.3);
      ctx.lineTo(shoulderW * 0.75, chestTop + chestH * 0.6);
      ctx.lineTo(shoulderW * 0.55, chestTop + chestH * 0.85);
      ctx.lineTo(shoulderW * 0.3, chestTop + chestH);
      ctx.stroke();

      drawLine(-shoulderW * 0.3, chestTop + chestH, shoulderW * 0.3, chestTop + chestH);

      ctx.lineWidth = 0.4;
      ctx.strokeStyle = `rgba(0, 229, 255, ${glow * 0.2})`;
      for (let i = 0; i < 6; i++) {
        const ribY = chestTop + chestH * (0.15 + i * 0.13);
        const ribW = shoulderW * (0.85 - i * 0.08);
        drawLine(-ribW, ribY, -ribW * 0.15, ribY + 4 * s);
        drawLine(ribW, ribY, ribW * 0.15, ribY + 4 * s);
      }

      const coreY = chestTop + chestH * 0.4;
      const coreR = 18 * s;
      const corePulse = 0.6 + Math.sin(breathRef.current * Math.PI * 4) * 0.3 + surgeGlow * 0.5 + engage * 0.2;

      ctx.fillStyle = `rgba(0, 229, 255, ${corePulse * 0.08})`;
      ctx.shadowColor = COLORS.cyan;
      ctx.shadowBlur = 40 + surgeGlow * 40;
      ctx.beginPath();
      ctx.arc(0, coreY, coreR * 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(0, 229, 255, ${corePulse * 0.15})`;
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(0, coreY, coreR * 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(0, 229, 255, ${corePulse})`;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 25 + surgeGlow * 30;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + elapsed * 0.001;
        const px = Math.cos(angle) * coreR;
        const py = Math.sin(angle) * coreR + coreY;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = `rgba(255, 255, 255, ${corePulse * 0.9})`;
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, coreY, coreR * 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(168, 85, 247, ${glow * 0.25})`;
      ctx.shadowColor = COLORS.purple;
      ctx.shadowBlur = 8;
      ctx.lineWidth = 0.6;

      const circuitPaths: [number, number, number, number][] = [
        [0, coreY - coreR, 0, shoulderY + 10 * s],
        [0, coreY + coreR, 0, chestTop + chestH * 0.8],
        [-coreR, coreY, -shoulderW * 0.7, chestTop + chestH * 0.3],
        [coreR, coreY, shoulderW * 0.7, chestTop + chestH * 0.3],
        [-shoulderW * 0.6, chestTop + chestH * 0.5, -shoulderW * 0.8, chestTop + chestH * 0.7],
        [shoulderW * 0.6, chestTop + chestH * 0.5, shoulderW * 0.8, chestTop + chestH * 0.7],
      ];
      circuitPaths.forEach(([x1, y1, x2, y2]) => drawLine(x1, y1, x2, y2));

      const flowSpeed = elapsed * 0.003;
      ctx.fillStyle = `rgba(0, 229, 255, ${0.5 + surgeGlow * 0.5})`;
      ctx.shadowColor = COLORS.cyan;
      ctx.shadowBlur = 6;
      circuitPaths.forEach(([x1, y1, x2, y2], idx) => {
        const t = ((flowSpeed + idx * 0.3) % 1);
        const fx = x1 + (x2 - x1) * t;
        const fy = y1 + (y2 - y1) * t;
        ctx.beginPath();
        ctx.arc(fx, fy, 1.5 * s, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.strokeStyle = `rgba(0, 229, 255, ${glow * 0.6})`;
      ctx.lineWidth = 0.8;
      ctx.shadowBlur = 5;
      const armTopL = chestTop;
      const armTopR = chestTop;

      ctx.beginPath();
      ctx.moveTo(-shoulderW, armTopL);
      ctx.lineTo(-shoulderW - armW * 0.3, armTopL + chestH * 0.25);
      ctx.lineTo(-shoulderW - armW * 0.5, armTopL + chestH * 0.5);
      ctx.lineTo(-shoulderW - armW * 0.4, armTopL + chestH * 0.75);
      ctx.lineTo(-shoulderW - armW * 0.2, armTopL + chestH * 0.95);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(shoulderW, armTopR);
      ctx.lineTo(shoulderW + armW * 0.3, armTopR + chestH * 0.25);
      ctx.lineTo(shoulderW + armW * 0.5, armTopR + chestH * 0.5);
      ctx.lineTo(shoulderW + armW * 0.4, armTopR + chestH * 0.75);
      ctx.lineTo(shoulderW + armW * 0.2, armTopR + chestH * 0.95);
      ctx.stroke();

      ctx.lineWidth = 0.4;
      ctx.strokeStyle = `rgba(168, 85, 247, ${glow * 0.15})`;
      for (let i = 0; i < 4; i++) {
        const ay = armTopL + chestH * (0.2 + i * 0.2);
        const ax = -shoulderW - armW * (0.2 + Math.sin(i * 0.8) * 0.3);
        ctx.beginPath();
        ctx.arc(ax, ay, 4 * s, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let i = 0; i < 4; i++) {
        const ay = armTopR + chestH * (0.2 + i * 0.2);
        const ax = shoulderW + armW * (0.2 + Math.sin(i * 0.8) * 0.3);
        ctx.beginPath();
        ctx.arc(ax, ay, 4 * s, 0, Math.PI * 2);
        ctx.stroke();
      }

      const handY = armTopL + chestH * 0.95;
      ctx.strokeStyle = `rgba(0, 229, 255, ${glow * 0.4})`;
      ctx.lineWidth = 0.6;
      for (let f = 0; f < 4; f++) {
        const fx = -shoulderW - armW * 0.2 + (f - 1.5) * 4 * s;
        drawLine(fx, handY, fx + (f - 1.5) * 2 * s, handY + 10 * s);
      }
      for (let f = 0; f < 4; f++) {
        const fx = shoulderW + armW * 0.2 + (f - 1.5) * 4 * s;
        drawLine(fx, handY, fx + (f - 1.5) * 2 * s, handY + 10 * s);
      }

      ctx.strokeStyle = `rgba(0, 229, 255, ${glow * 0.15})`;
      ctx.lineWidth = 0.5;
      const hexSize = 8 * s;
      const hexPositions: [number, number][] = [
        [-shoulderW * 0.5, chestTop + chestH * 0.2],
        [shoulderW * 0.5, chestTop + chestH * 0.2],
        [-shoulderW * 0.35, chestTop + chestH * 0.55],
        [shoulderW * 0.35, chestTop + chestH * 0.55],
        [-shoulderW * 0.7, chestTop + chestH * 0.45],
        [shoulderW * 0.7, chestTop + chestH * 0.45],
      ];
      hexPositions.forEach(([hx, hy]) => {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
          const px = hx + Math.cos(angle) * hexSize;
          const py = hy + Math.sin(angle) * hexSize;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      });

      ctx.restore();

      ctx.shadowColor = COLORS.cyan;
      ctx.shadowBlur = 4;
      embersRef.current.forEach(e => {
        ctx.fillStyle = `rgba(0, 229, 255, ${e.life * 0.6})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
      });

      if (surgeRef.current.active) {
        const surgeProgress = surgeRef.current.progress;
        const surgeRadius = surgeProgress * Math.max(w, h) * 0.6;
        const chestTopAbs = cy + shoulderY + 25 * s;
        const coreYAbs = chestTopAbs + chestH * 0.4;
        ctx.strokeStyle = `rgba(0, 229, 255, ${(1 - surgeProgress) * 0.12})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = COLORS.cyan;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(cx, coreYAbs, surgeRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const draw = () => {
      if (paused) { animRef.current = requestAnimationFrame(draw); return; }
      const now = performance.now();
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBody(rect.width, rect.height, dt);
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

  return <canvas ref={canvasRef} className={`w-full h-full ${className}`} />;
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

          <div className="w-full md:w-[55%] relative" style={{ minHeight: "500px", height: "70vh", maxHeight: "750px" }}>
            <div className="absolute inset-0 md:-left-[10%]" style={{
              background: `radial-gradient(ellipse at center bottom, rgba(0,229,255,0.05) 0%, transparent 60%)`,
            }}>
              <AIEntityHumanoid reactToCTA={ctaHover} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-32" style={{
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
        <div className="absolute inset-0 overflow-hidden flex items-center justify-center opacity-20 pointer-events-none">
          <div className="w-[200px] h-[200px]">
            <AIEntityHumanoid />
          </div>
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
