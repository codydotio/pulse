"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MoodCategory } from "@/lib/types";
import { MOOD_CONFIG } from "@/lib/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (emoji: string, message: string, mood: MoodCategory) => Promise<void>;
}

const MOODS = Object.entries(MOOD_CONFIG) as [MoodCategory, typeof MOOD_CONFIG[MoodCategory]][];

export default function CreatePulseModal({ isOpen, onClose, onCreate }: Props) {
  const [selectedMood, setSelectedMood] = useState<MoodCategory | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!selectedMood || !selectedEmoji || !message.trim()) return;
    setIsSending(true);
    setError(null);
    try {
      await onCreate(selectedEmoji, message.trim(), selectedMood);
      setSelectedMood(null);
      setSelectedEmoji("");
      setMessage("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create pulse");
    } finally {
      setIsSending(false);
    }
  };

  const reset = () => {
    setSelectedMood(null);
    setSelectedEmoji("");
    setMessage("");
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        >
          <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={reset} />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-gradient-to-b from-pulse-nebula to-pulse-deep border border-white/10 shadow-2xl"
          >
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Send a Pulse</h3>
                <button onClick={reset} className="text-white/40 hover:text-white/70 text-2xl">×</button>
              </div>

              {/* Step 1: Pick mood */}
              <label className="text-white/50 text-xs uppercase tracking-wider mb-3 block">
                How are you feeling?
              </label>
              <div className="grid grid-cols-4 gap-2 mb-5">
                {MOODS.map(([key, config]) => (
                  <motion.button
                    key={key}
                    onClick={() => { setSelectedMood(key); setSelectedEmoji(""); }}
                    className={`py-3 px-2 rounded-xl text-center transition-all border ${
                      selectedMood === key
                        ? "border-white/30 bg-white/10"
                        : "border-transparent bg-white/[0.03] hover:bg-white/[0.06]"
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-lg mb-1">{config.emojis[0]}</div>
                    <div className="text-[10px] text-white/50">{config.label}</div>
                  </motion.button>
                ))}
              </div>

              {/* Step 2: Pick emoji */}
              {selectedMood && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <label className="text-white/50 text-xs uppercase tracking-wider mb-3 block">
                    Pick your emoji
                  </label>
                  <div className="flex gap-2 mb-5">
                    {MOOD_CONFIG[selectedMood].emojis.map((e) => (
                      <motion.button
                        key={e}
                        onClick={() => setSelectedEmoji(e)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border transition-all ${
                          selectedEmoji === e
                            ? "border-white/30 bg-white/10 scale-110"
                            : "border-transparent bg-white/[0.03] hover:bg-white/[0.06]"
                        }`}
                        whileTap={{ scale: 0.9 }}
                      >
                        {e}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Message */}
              {selectedEmoji && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">
                    What&apos;s on your mind? (120 chars)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 120))}
                    placeholder="Be real. Be human. What are you feeling right now?"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-pulse-glow/50 resize-none text-sm"
                  />
                  <div className="text-right text-[10px] text-white/30 mt-1 mb-4">
                    {message.length}/120
                  </div>

                  {error && (
                    <div className="mb-4 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <motion.button
                    onClick={handleSend}
                    disabled={isSending || !message.trim()}
                    className="w-full py-4 rounded-2xl font-bold text-base shadow-lg disabled:opacity-40 transition-transform active:scale-95"
                    style={{
                      background: `linear-gradient(135deg, ${MOOD_CONFIG[selectedMood!].color}, ${MOOD_CONFIG[selectedMood!].color}88)`,
                      color: "#000",
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {isSending ? "Pulsing..." : `${selectedEmoji} Send Pulse`}
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
