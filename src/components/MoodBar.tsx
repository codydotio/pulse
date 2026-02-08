"use client";

import { motion } from "framer-motion";
import type { PulseStats } from "@/lib/types";
import { MOOD_CONFIG, type MoodCategory } from "@/lib/types";

interface Props {
  stats: PulseStats | null;
}

export default function MoodBar({ stats }: Props) {
  if (!stats) return null;

  const total = Object.values(stats.moodDistribution).reduce((a, b) => a + b, 0) || 1;

  const segments = (Object.entries(stats.moodDistribution) as [MoodCategory, number][])
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="px-4">
      {/* Mood distribution bar */}
      <div className="flex rounded-full overflow-hidden h-2 bg-white/5">
        {segments.map(([mood, count]) => (
          <motion.div
            key={mood}
            initial={{ width: 0 }}
            animate={{ width: `${(count / total) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ background: MOOD_CONFIG[mood].color }}
            className="h-full"
            title={`${MOOD_CONFIG[mood].label}: ${count}`}
          />
        ))}
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between mt-2 text-[10px] text-white/30">
        <span>{stats.activeHumans} humans</span>
        <span>{stats.totalPulses} pulses</span>
        <span>{stats.totalResonance} resonances</span>
        <span className="flex items-center gap-1">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: MOOD_CONFIG[stats.topMood].color }}
          />
          {MOOD_CONFIG[stats.topMood].label} dominant
        </span>
      </div>
    </div>
  );
}
