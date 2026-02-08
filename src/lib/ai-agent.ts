import type { MoodInsight, MoodCategory, EmotionalIntelligence } from "./types";
import { MOOD_CONFIG } from "./types";

const COMMUNITY_TEMPLATES: Record<string, string[]> = {
  joy: [
    "The community is radiating joy right now — {count} happy pulses in the last hour",
    "Joy is contagious today! The galaxy is glowing with positive energy",
  ],
  gratitude: [
    "A wave of gratitude is washing through the community. Beautiful.",
    "People are feeling thankful — {count} gratitude pulses and counting",
  ],
  hope: [
    "Hope is the dominant frequency right now. The community believes in better tomorrows",
    "Hopeful energy is building — {count} people are looking forward",
  ],
  calm: [
    "The community has found a peaceful wavelength. Calm energy prevails",
    "A gentle calm has settled over the galaxy. Breathe it in.",
  ],
  energy: [
    "High energy! The community is buzzing with excitement and drive",
    "Electric vibes — {count} people are feeling energized right now",
  ],
  love: [
    "Love is in the air! The community is sharing warmth and connection",
    "Hearts are open today — love pulses are lighting up the galaxy",
  ],
  reflection: [
    "The community is in a reflective mood. Deep thoughts are being shared",
    "A contemplative energy has taken hold. People are looking inward",
  ],
  determination: [
    "Determination is surging! The community is focused and driven",
    "Strong resolve — people are pushing through challenges together",
  ],
};

const EMPATHY_PROMPTS = [
  "Someone shared a vulnerable moment. Your resonance could mean the world to them.",
  "A pulse nearby is waiting to be heard. Sometimes all we need is to know someone cares.",
  "The community thrives on connection. Have you resonated with someone today?",
  "Every resonance strengthens the emotional fabric of this community.",
  "Someone's joy deserves celebration. Someone's struggle deserves support.",
  "Your emotional presence matters here. Share what you're feeling.",
];

export function analyzeEmotions(
  pulses: Array<{ mood: MoodCategory; resonances: number; createdAt: number }>,
  userMood?: MoodCategory
): EmotionalIntelligence {
  const now = Date.now();
  const recent = pulses.filter(p => p.createdAt > now - 60 * 60 * 1000);
  const insights: MoodInsight[] = [];

  // Count moods
  const moodCounts: Record<string, number> = {};
  for (const p of recent) {
    moodCounts[p.mood] = (moodCounts[p.mood] || 0) + 1;
  }

  // Find dominant mood
  const dominantMood = (Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "calm") as MoodCategory;
  const dominantCount = moodCounts[dominantMood] || 0;

  // Community insight
  const templates = COMMUNITY_TEMPLATES[dominantMood] || COMMUNITY_TEMPLATES.calm;
  const template = templates[Math.floor(Math.random() * templates.length)];
  insights.push({
    id: `ai_community_${now}`,
    type: "community",
    message: template.replace("{count}", String(dominantCount)),
    mood: dominantMood,
    confidence: Math.min(0.95, 0.5 + dominantCount * 0.05),
    createdAt: now,
    isAI: true,
  });

  // Empathy suggestion
  insights.push({
    id: `ai_empathy_${now}`,
    type: "suggestion",
    message: EMPATHY_PROMPTS[Math.floor(Math.random() * EMPATHY_PROMPTS.length)],
    confidence: 0.8,
    createdAt: now,
    isAI: true,
  });

  // Personal insight (if user has a mood)
  if (userMood) {
    const config = MOOD_CONFIG[userMood];
    const sameMoodCount = moodCounts[userMood] || 0;
    insights.push({
      id: `ai_personal_${now}`,
      type: "personal",
      message: sameMoodCount > 1
        ? `You're not alone in feeling ${userMood} — ${sameMoodCount} others share this wavelength right now ${config.emojis[0]}`
        : `Your ${userMood} pulse adds a unique frequency to the galaxy ${config.emojis[0]}`,
      mood: userMood,
      confidence: 0.75,
      createdAt: now,
      isAI: true,
    });
  }

  // Determine mood shift
  const olderPulses = pulses.filter(p => p.createdAt > now - 2 * 60 * 60 * 1000 && p.createdAt <= now - 60 * 60 * 1000);
  const positiveMoods = ["joy", "gratitude", "hope", "love", "energy"];
  const recentPositive = recent.filter(p => positiveMoods.includes(p.mood)).length / Math.max(1, recent.length);
  const olderPositive = olderPulses.filter(p => positiveMoods.includes(p.mood)).length / Math.max(1, olderPulses.length);

  const moodShift = recentPositive > olderPositive + 0.1 ? "brightening" as const
    : recentPositive < olderPositive - 0.1 ? "deepening" as const
    : "steady" as const;

  const totalResonances = recent.reduce((sum, p) => sum + p.resonances, 0);
  const empathyScore = Math.min(100, Math.floor(totalResonances * 5 + recent.length * 3));

  return {
    insights,
    dominantMood,
    moodShift,
    empathyScore,
    lastAnalysis: now,
  };
}

// 🚨 HACKATHON SWAP POINT — OpenClaw Integration 🚨
// Replace mock analysis with real OpenClaw agent:
//
// const claw = new WebSocket('ws://127.0.0.1:18789');
// claw.send(JSON.stringify({
//   type: 'tool.invoke',
//   tool: 'emotional-intelligence',
//   params: { pulses, userMood }
// }));
//
// OpenClaw's persistent memory can track emotional patterns
// over time for deeper, more personalized insights.
