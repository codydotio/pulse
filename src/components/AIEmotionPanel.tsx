"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { EmotionalIntelligence } from "@/lib/types";
import { MOOD_CONFIG } from "@/lib/types";

export default function AIEmotionPanel() {
  const [intelligence, setIntelligence] = useState<EmotionalIntelligence | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch("/api/ai/insights");
        if (res.ok) setIntelligence(await res.json());
      } catch { /* silent */ }
    };
    fetch_();
    const interval = setInterval(fetch_, 25000);
    return () => clearInterval(interval);
  }, []);

  if (!intelligence) return null;

  const moodConfig = MOOD_CONFIG[intelligence.dominantMood];
  const shiftIcon = intelligence.moodShift === "brightening" ? "↗" : intelligence.moodShift === "deepening" ? "↘" : "→";

  return (
    <div className="max-w-md mx-auto px-4 mb-4">
      <motion.div
        layout
        className="rounded-2xl border overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${moodConfig.color}10, ${moodConfig.color}05)`,
          borderColor: `${moodConfig.color}30`,
        }}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${moodConfig.color}20` }}>
              <span className="text-xs">🧠</span>
            </div>
            <span className="text-sm font-medium" style={{ color: `${moodConfig.color}cc` }}>Emotional AI</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${moodConfig.color}20`, color: `${moodConfig.color}99` }}>
              AI-GENERATED
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-bold" style={{ color: moodConfig.color }}>
                {intelligence.empathyScore}
              </div>
              <div className="text-[8px] text-white/30">EMPATHY</div>
            </div>
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} className="text-white/30 text-xs">▼</motion.span>
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-3"
            >
              {/* Mood indicator */}
              <div className="flex items-center gap-2 mb-3 p-2 rounded-xl bg-white/[0.03]">
                <span className="text-lg">{moodConfig.emojis[0]}</span>
                <div>
                  <div className="text-xs font-medium text-white/70">Community mood: <span style={{ color: moodConfig.color }}>{intelligence.dominantMood}</span></div>
                  <div className="text-[9px] text-white/40">{shiftIcon} {intelligence.moodShift}</div>
                </div>
              </div>

              {/* Insights */}
              <div className="space-y-2">
                {intelligence.insights.map((insight) => (
                  <div key={insight.id} className="flex items-start gap-2 p-2 rounded-xl bg-white/[0.03]">
                    <span className="text-sm mt-0.5">
                      {insight.type === "community" ? "🌐" : insight.type === "personal" ? "💜" : "💫"}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs text-white/70 leading-relaxed">{insight.message}</p>
                      <span className="text-[9px] text-white/30 mt-1 inline-block">
                        {Math.round(insight.confidence * 100)}% confidence · AI-generated
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2 pt-2 border-t border-white/5">
                <span className="text-[9px] text-white/20">
                  Emotional AI analyzes collective mood patterns · Humans create all pulses
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
