"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAlien, usePulseData } from "@/hooks/usePulse";
import OnboardingScreen from "@/components/OnboardingScreen";
import PulseGalaxy from "@/components/PulseGalaxy";
import CreatePulseModal from "@/components/CreatePulseModal";
import ResonateModal from "@/components/ResonateModal";
import MoodBar from "@/components/MoodBar";
import AIEmotionPanel from "@/components/AIEmotionPanel";
import type { Pulse } from "@/lib/types";

export default function Home() {
  const { user, userState, isVerifying, error, verify, createPulse, resonate } = useAlien();
  const { pulses, stats } = usePulseData();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPulse, setSelectedPulse] = useState<Pulse | null>(null);

  if (!user) {
    return <OnboardingScreen onVerify={verify} isVerifying={isVerifying} error={error} />;
  }

  return (
    <main className="min-h-screen bg-pulse-void text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-pulse-void/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">💫</span>
              <div>
                <h1 className="text-base font-bold">Mood Orbit</h1>
                <div className="text-[10px] text-white/30 uppercase tracking-wider">Collective Emotions</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] text-white/30">Balance</div>
                <div className="text-sm font-bold text-pulse-warm">{userState?.balance ?? 0}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-pulse-glow/20 flex items-center justify-center text-xs font-bold text-pulse-glow">
                {user.displayName[0]}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mood Bar */}
      <div className="max-w-md mx-auto pt-3">
        <MoodBar stats={stats} />
      </div>

      {/* Emotional AI */}
      <AIEmotionPanel />

      {/* Galaxy */}
      <div className="max-w-md mx-auto px-4 py-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl overflow-hidden border border-white/[0.06]"
          style={{ height: "50vh", minHeight: "320px" }}
        >
          <PulseGalaxy
            pulses={pulses}
            onPulseClick={(pulse) => {
              if (pulse.userId !== user.id) setSelectedPulse(pulse);
            }}
          />
        </motion.div>
      </div>

      {/* Active pulse indicator */}
      {userState?.activePulse && (
        <div className="max-w-md mx-auto px-4 mb-4">
          <div className="px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
            <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Your Active Pulse</div>
            <div className="text-sm text-white/70">
              {userState.activePulse.emoji} &ldquo;{userState.activePulse.message}&rdquo;
            </div>
            <div className="text-[10px] text-pulse-warm mt-1">
              {userState.activePulse.resonanceCount} resonated
            </div>
          </div>
        </div>
      )}

      {/* Recent resonances quick list */}
      {pulses.length > 0 && (
        <div className="max-w-md mx-auto px-4 pb-28">
          <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Top Pulses</div>
          <div className="space-y-2">
            {pulses.slice(0, 5).map((p) => (
              <motion.button
                key={p.id}
                onClick={() => { if (p.userId !== user.id) setSelectedPulse(p); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors text-left"
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-lg">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/50 font-medium">{p.userName}</div>
                  <div className="text-xs text-white/30 truncate">{p.message}</div>
                </div>
                <div className="text-[10px] text-pulse-warm/60 font-medium">
                  {p.resonanceCount}💫
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* FAB — Create Pulse */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-30">
        <motion.button
          onClick={() => setShowCreate(true)}
          className="px-8 py-4 rounded-full bg-gradient-to-r from-pulse-glow to-pulse-energy text-white font-bold text-base shadow-2xl shadow-pulse-glow/30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", damping: 20 }}
        >
          💫 Send a Pulse
        </motion.button>
      </div>

      {/* Modals */}
      <CreatePulseModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={createPulse}
      />

      {selectedPulse && (
        <ResonateModal
          pulse={selectedPulse}
          onClose={() => setSelectedPulse(null)}
          onResonate={resonate}
          balance={userState?.balance ?? 0}
        />
      )}
    </main>
  );
}
