"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onVerify: () => Promise<unknown>;
  isVerifying: boolean;
  error: string | null;
}

export default function OnboardingScreen({ onVerify, isVerifying, error }: Props) {
  const [started, setStarted] = useState(false);

  return (
    <div className="fixed inset-0 bg-pulse-void flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { color: "#A78BFA", size: 200, x: "20%", y: "30%", delay: 0 },
          { color: "#F472B6", size: 150, x: "70%", y: "20%", delay: 2 },
          { color: "#34D399", size: 180, x: "50%", y: "60%", delay: 4 },
          { color: "#FBBF24", size: 120, x: "80%", y: "70%", delay: 1 },
          { color: "#60A5FA", size: 160, x: "30%", y: "75%", delay: 3 },
        ].map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
              background: `radial-gradient(circle, ${orb.color}30 0%, transparent 70%)`,
              transform: "translate(-50%, -50%)",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
              x: [0, 20, -10, 0],
              y: [0, -15, 10, 0],
            }}
            transition={{
              duration: 8 + i,
              repeat: Infinity,
              delay: orb.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!started ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 text-center max-w-sm"
          >
            <motion.div
              className="text-7xl mb-5"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              💫
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
              Mood Orbit
            </h1>
            <p className="text-white/50 text-base leading-relaxed mb-8">
              The collective heartbeat of this room.
              <br /><br />
              Share how you&apos;re feeling. Resonate with others.
              <br />
              Watch the emotional galaxy form in real-time.
            </p>
            <motion.button
              onClick={() => setStarted(true)}
              className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-pulse-glow to-pulse-energy text-white font-semibold text-lg shadow-lg shadow-pulse-glow/20"
              whileTap={{ scale: 0.97 }}
            >
              Enter the Galaxy
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="verify"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 text-center max-w-sm"
          >
            <motion.div
              className="text-7xl mb-5"
              animate={isVerifying ? { rotate: [0, 360] } : {}}
              transition={isVerifying ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
            >
              👽
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Prove You&apos;re Human
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mb-8">
              Only verified humans can pulse.
              <br />
              One identity. One voice. Real emotions only.
            </p>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <motion.button
              onClick={onVerify}
              disabled={isVerifying}
              className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-pulse-warm to-amber-500 text-black font-semibold text-lg shadow-lg shadow-pulse-warm/25 disabled:opacity-50"
              whileTap={!isVerifying ? { scale: 0.97 } : {}}
            >
              {isVerifying ? "Verifying..." : "Verify with Alien ID"}
            </motion.button>

            <button
              onClick={() => setStarted(false)}
              className="mt-4 text-white/30 text-sm hover:text-white/50"
            >
              ← Back
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-6 text-white/15 text-xs">
        Built on <span className="text-white/25">Alien Protocol</span>
      </div>
    </div>
  );
}
