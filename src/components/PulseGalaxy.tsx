"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { Pulse } from "@/lib/types";
import { MOOD_CONFIG } from "@/lib/types";

interface Props {
  pulses: Pulse[];
  onPulseClick?: (pulse: Pulse) => void;
}

interface Orb {
  pulse: Pulse;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  radius: number;
  baseRadius: number;
  color: string;
  glowColor: string;
  phase: number; // for breathing animation
  speed: number;
  emoji: string;
}

export default function PulseGalaxy({ pulses, onPulseClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbsRef = useRef<Orb[]>([]);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const [hoveredPulse, setHoveredPulse] = useState<Pulse | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const starsRef = useRef<Array<{ x: number; y: number; r: number; twinkle: number; speed: number }>>([]);

  // Build orbs from pulses
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    // Generate stars once
    if (starsRef.current.length === 0) {
      starsRef.current = Array.from({ length: 80 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.3,
        twinkle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.005,
      }));
    }

    orbsRef.current = pulses.map((pulse, i) => {
      const existing = orbsRef.current.find((o) => o.pulse.id === pulse.id);
      const config = MOOD_CONFIG[pulse.mood];
      const baseRadius = Math.max(18, Math.min(50, 18 + pulse.resonanceTotal * 3));

      return {
        pulse,
        x: existing?.x ?? (pulse.x ?? 0.5) * w,
        y: existing?.y ?? (pulse.y ?? 0.5) * h,
        targetX: (pulse.x ?? 0.3 + Math.random() * 0.4) * w,
        targetY: (pulse.y ?? 0.3 + Math.random() * 0.4) * h,
        radius: existing?.radius ?? baseRadius,
        baseRadius,
        color: config.color,
        glowColor: config.glow,
        phase: existing?.phase ?? Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.5,
        emoji: pulse.emoji,
      };
    });
  }, [pulses]);

  // Handle canvas resize
  useEffect(() => {
    const updateSize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      time += 0.016; // ~60fps

      // Clear with deep space gradient
      const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
      grad.addColorStop(0, "#110E1F");
      grad.addColorStop(0.5, "#0A0816");
      grad.addColorStop(1, "#07060D");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Draw twinkling stars
      starsRef.current.forEach((star) => {
        star.twinkle += star.speed;
        const alpha = 0.2 + Math.sin(star.twinkle) * 0.3;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      });

      // Draw ambient nebula glow in center
      const nebulaGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.35);
      nebulaGrad.addColorStop(0, "rgba(167, 139, 250, 0.04)");
      nebulaGrad.addColorStop(0.5, "rgba(96, 165, 250, 0.02)");
      nebulaGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, w, h);

      // Draw connection lines between nearby orbs
      const orbs = orbsRef.current;
      for (let i = 0; i < orbs.length; i++) {
        for (let j = i + 1; j < orbs.length; j++) {
          const dx = orbs[i].x - orbs[j].x;
          const dy = orbs[i].y - orbs[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 150;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.08;
            ctx.beginPath();
            ctx.moveTo(orbs[i].x, orbs[i].y);
            ctx.lineTo(orbs[j].x, orbs[j].y);
            ctx.strokeStyle = `rgba(167, 139, 250, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw and update each orb
      const mouse = mouseRef.current;

      orbs.forEach((orb) => {
        // Gentle floating movement
        orb.phase += 0.008 * orb.speed;
        orb.x += Math.sin(orb.phase) * 0.3;
        orb.y += Math.cos(orb.phase * 0.7) * 0.2;

        // Drift toward target
        orb.x += (orb.targetX - orb.x) * 0.001;
        orb.y += (orb.targetY - orb.y) * 0.001;

        // Keep in bounds
        orb.x = Math.max(orb.baseRadius + 10, Math.min(w - orb.baseRadius - 10, orb.x));
        orb.y = Math.max(orb.baseRadius + 10, Math.min(h - orb.baseRadius - 10, orb.y));

        // Breathing radius
        const breathe = Math.sin(time * 1.5 + orb.phase) * 3;
        orb.radius = orb.baseRadius + breathe;

        // Mouse interaction — gentle repulsion/attraction
        let isHovered = false;
        if (mouse) {
          const dx = mouse.x - orb.x;
          const dy = mouse.y - orb.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < orb.radius + 10) {
            isHovered = true;
            orb.radius = orb.baseRadius + 8; // grow on hover
          } else if (dist < 100) {
            // Subtle attraction
            orb.x += dx * 0.002;
            orb.y += dy * 0.002;
          }
        }

        // Outer glow
        const glowGrad = ctx.createRadialGradient(
          orb.x, orb.y, orb.radius * 0.5,
          orb.x, orb.y, orb.radius * 2.5
        );
        glowGrad.addColorStop(0, orb.glowColor);
        glowGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glowGrad;
        ctx.fillRect(
          orb.x - orb.radius * 2.5,
          orb.y - orb.radius * 2.5,
          orb.radius * 5,
          orb.radius * 5
        );

        // Main orb
        const orbGrad = ctx.createRadialGradient(
          orb.x - orb.radius * 0.2,
          orb.y - orb.radius * 0.2,
          0,
          orb.x,
          orb.y,
          orb.radius
        );
        orbGrad.addColorStop(0, `rgba(255, 255, 255, 0.3)`);
        orbGrad.addColorStop(0.3, orb.color);
        orbGrad.addColorStop(1, `rgba(0, 0, 0, 0.2)`);

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fillStyle = orbGrad;
        ctx.fill();

        // Inner highlight
        ctx.beginPath();
        ctx.arc(
          orb.x - orb.radius * 0.25,
          orb.y - orb.radius * 0.25,
          orb.radius * 0.3,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.fill();

        // Emoji
        ctx.font = `${Math.round(orb.radius * 0.7)}px system-ui`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(orb.emoji, orb.x, orb.y);

        // Name label
        ctx.font = `500 11px system-ui, sans-serif`;
        ctx.fillStyle = isHovered ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)";
        ctx.fillText(orb.pulse.userName, orb.x, orb.y + orb.radius + 14);

        // Resonance count badge
        if (orb.pulse.resonanceCount > 0) {
          const badgeX = orb.x + orb.radius * 0.7;
          const badgeY = orb.y - orb.radius * 0.7;
          ctx.beginPath();
          ctx.arc(badgeX, badgeY, 9, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(251, 191, 36, 0.9)";
          ctx.fill();
          ctx.font = "bold 9px system-ui";
          ctx.fillStyle = "#000";
          ctx.fillText(`${orb.pulse.resonanceCount}`, badgeX, badgeY + 1);
        }
      });

      // Collective mood indicator text at top
      if (orbs.length > 0) {
        ctx.font = "500 12px system-ui, sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.textAlign = "center";
        ctx.fillText(
          `${orbs.length} humans pulsing`,
          w / 2,
          24
        );
      }

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  // Mouse tracking
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseRef.current = { x, y };

      // Check if hovering over an orb
      const orb = orbsRef.current.find((o) => {
        const dx = x - o.x;
        const dy = y - o.y;
        return Math.sqrt(dx * dx + dy * dy) < o.radius + 5;
      });

      if (orb) {
        setHoveredPulse(orb.pulse);
        setTooltipPos({ x: e.clientX, y: e.clientY });
      } else {
        setHoveredPulse(null);
      }
    },
    []
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas || !onPulseClick) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const orb = orbsRef.current.find((o) => {
        const dx = x - o.x;
        const dy = y - o.y;
        return Math.sqrt(dx * dx + dy * dy) < o.radius + 5;
      });

      if (orb) onPulseClick(orb.pulse);
    },
    [onPulseClick]
  );

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = null;
    setHoveredPulse(null);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[300px]">
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-2xl cursor-pointer"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onMouseLeave={handleMouseLeave}
      />

      {/* Tooltip */}
      {hoveredPulse && (
        <div
          className="fixed z-50 max-w-[260px] px-4 py-3 rounded-xl bg-black/90 backdrop-blur-sm border border-white/10 shadow-xl pointer-events-none"
          style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 50 }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-lg">{hoveredPulse.emoji}</span>
            <span className="text-white/80 text-sm font-medium">
              {hoveredPulse.userName}
            </span>
          </div>
          <div className="text-white/60 text-sm italic leading-snug">
            &ldquo;{hoveredPulse.message}&rdquo;
          </div>
          <div className="mt-2 text-[10px] text-amber-400/60">
            {hoveredPulse.resonanceCount} resonated · tap to resonate
          </div>
        </div>
      )}
    </div>
  );
}
