// ============================================================
// PULSE — Type Definitions
// Collective emotion board for verified humans
// ============================================================

export interface AlienUser {
  id: string;
  alienId: string;
  displayName: string;
  verified: boolean;
  createdAt: number;
}

// A "pulse" is a short emotional broadcast from a verified human
export interface Pulse {
  id: string;
  userId: string;
  userName: string;
  emoji: string;
  message: string; // max 120 chars — keep it raw and real
  mood: MoodCategory;
  resonanceCount: number; // how many people resonated
  resonanceTotal: number; // total tokens received
  createdAt: number;
  x?: number; // position in the galaxy (0-1 normalized)
  y?: number;
}

export type MoodCategory =
  | "joy"
  | "gratitude"
  | "hope"
  | "calm"
  | "energy"
  | "love"
  | "reflection"
  | "determination";

export interface Resonance {
  id: string;
  fromUserId: string;
  fromUserName: string;
  pulseId: string;
  amount: number;
  createdAt: number;
  txHash?: string;
}

export interface PulseStats {
  totalPulses: number;
  totalResonance: number;
  topMood: MoodCategory;
  activeHumans: number;
  moodDistribution: Record<MoodCategory, number>;
}

export interface UserState {
  balance: number;
  activePulse: Pulse | null; // one active pulse per human
  resonancesGiven: number;
  resonancesReceived: number;
}

// Mood → visual mapping
export const MOOD_CONFIG: Record<
  MoodCategory,
  { color: string; glow: string; label: string; emojis: string[] }
> = {
  joy: {
    color: "#FBBF24",
    glow: "rgba(251, 191, 36, 0.4)",
    label: "Joy",
    emojis: ["😊", "😄", "🎉", "✨", "🌟"],
  },
  gratitude: {
    color: "#F472B6",
    glow: "rgba(244, 114, 182, 0.4)",
    label: "Gratitude",
    emojis: ["🙏", "💛", "🌻", "💝", "🤗"],
  },
  hope: {
    color: "#A78BFA",
    glow: "rgba(167, 139, 250, 0.4)",
    label: "Hope",
    emojis: ["🌅", "🕊️", "🌈", "💫", "🔮"],
  },
  calm: {
    color: "#34D399",
    glow: "rgba(52, 211, 153, 0.4)",
    label: "Calm",
    emojis: ["🧘", "🍃", "☁️", "🌊", "💆"],
  },
  energy: {
    color: "#60A5FA",
    glow: "rgba(96, 165, 250, 0.4)",
    label: "Energy",
    emojis: ["⚡", "🚀", "🔥", "💪", "🏃"],
  },
  love: {
    color: "#FB7185",
    glow: "rgba(251, 113, 133, 0.4)",
    label: "Love",
    emojis: ["❤️", "💕", "🥰", "💗", "💞"],
  },
  reflection: {
    color: "#818CF8",
    glow: "rgba(129, 140, 248, 0.4)",
    label: "Reflection",
    emojis: ["🤔", "💭", "📖", "🌙", "🪞"],
  },
  determination: {
    color: "#F97316",
    glow: "rgba(249, 115, 22, 0.4)",
    label: "Determination",
    emojis: ["💪", "🎯", "🔥", "⭐", "🏔️"],
  },
};

export interface MoodInsight {
  id: string;
  type: "community" | "personal" | "suggestion";
  message: string;
  mood?: MoodCategory;
  confidence: number;
  createdAt: number;
  isAI: true;
}

export interface EmotionalIntelligence {
  insights: MoodInsight[];
  dominantMood: MoodCategory;
  moodShift: "brightening" | "deepening" | "steady";
  empathyScore: number; // community resonance level 0-100
  lastAnalysis: number;
}

export interface AlienIdentityResult {
  success: boolean;
  alienId: string;
  displayName: string;
  proofOfHuman: boolean;
}

export interface AlienPaymentResult {
  success: boolean;
  transactionId: string;
}
