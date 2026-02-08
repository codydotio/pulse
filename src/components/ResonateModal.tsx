"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Pulse } from "@/lib/types";
import { MOOD_CONFIG } from "@/lib/types";

interface Props {
  pulse: Pulse | null;
  onClose: () => void;
  onResonate: (pulseId: string, amount: number) => Promise<void>;
  balance: number;
}

export default function ResonateModal({ pulse, onClose, onResonate, balance }: Props) {
  const [amount, setAmount] = useState(1);
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!pulse) return null;

  const config = MOOD_CONFIG[pulse.mood];

  const handleResonate = async () => {
    setIsSending(true);
    try {
      await onResonate(pulse.id, amount);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setAmount(1);
        onClose();
      }, 1500);
    } catch {
      // error handled upstream
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-6"
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl"
          style={{ background: `linear-gradient(160deg, ${config.color}15, #0E0B1A)` }}
        >
          {success ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-center py-4"
            >
              <div className="text-5xl mb-3">💫</div>
              <div className="text-white font-bold text-lg">Resonance Sent!</div>
              <div className="text-white/50 text-sm mt-1">
                You connected with {pulse.userName}
              </div>
            </motion.div>
          ) : (
            <>
              {/* Pulse preview */}
              <div className="text-center mb-5">
                <div className="text-4xl mb-2">{pulse.emoji}</div>
                <div className="text-white font-medium text-sm">{pulse.userName}</div>
                <div className="text-white/50 text-sm italic mt-2 leading-relaxed">
                  &ldquo;{pulse.message}&rdquo;
                </div>
                <div
                  className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-medium"
                  style={{ background: `${config.color}20`, color: config.color }}
                >
                  {config.label}
                </div>
              </div>

              {/* Amount */}
              <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block text-center">
                How much do you resonate?
              </label>
              <div className="flex gap-2 justify-center mb-4">
                {[1, 2, 3].map((n) => (
                  <motion.button
                    key={n}
                    onClick={() => setAmount(n)}
                    disabled={n > balance}
                    className={`w-16 py-3 rounded-xl text-sm font-bold transition-all ${
                      amount === n
                        ? "text-black shadow-lg"
                        : n > balance
                          ? "bg-white/5 text-white/20"
                          : "bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                    style={amount === n ? { background: config.color } : {}}
                    whileTap={n <= balance ? { scale: 0.95 } : {}}
                  >
                    {"💫".repeat(n)}
                  </motion.button>
                ))}
              </div>
              <div className="text-center text-[10px] text-white/30 mb-5">
                Balance: {balance} tokens
              </div>

              <motion.button
                onClick={handleResonate}
                disabled={isSending || balance < amount}
                className="w-full py-4 rounded-2xl font-bold text-base shadow-lg disabled:opacity-40 active:scale-95 transition-transform text-black"
                style={{ background: config.color }}
                whileTap={{ scale: 0.97 }}
              >
                {isSending ? "Sending..." : `Resonate with ${pulse.userName}`}
              </motion.button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
