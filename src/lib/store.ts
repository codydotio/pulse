// ============================================================
// PULSE — In-Memory Store
// ============================================================

import type {
  AlienUser,
  Pulse,
  Resonance,
  PulseStats,
  UserState,
  MoodCategory,
} from "./types";

const INITIAL_BALANCE = 10; // More tokens for resonance micro-payments

const users: Map<string, AlienUser> = new Map();
const pulses: Map<string, Pulse> = new Map();
const resonances: Resonance[] = [];
const balances: Map<string, number> = new Map();
const activePulses: Map<string, string> = new Map(); // userId -> pulseId

type Subscriber = (event: string, data: unknown) => void;
const subscribers: Set<Subscriber> = new Set();

// ---- Seed Data ----
function seed() {
  if (users.size > 0) return;

  const demoUsers = [
    { id: "alien_p01", name: "Aria" },
    { id: "alien_p02", name: "Zephyr" },
    { id: "alien_p03", name: "Luna" },
    { id: "alien_p04", name: "Kai" },
    { id: "alien_p05", name: "Ember" },
    { id: "alien_p06", name: "Nova" },
    { id: "alien_p07", name: "Sage" },
    { id: "alien_p08", name: "River" },
    { id: "alien_p09", name: "Phoenix" },
    { id: "alien_p10", name: "Wren" },
    { id: "alien_p11", name: "Indigo" },
    { id: "alien_p12", name: "Soleil" },
  ];

  demoUsers.forEach((u) => {
    users.set(u.id, {
      id: u.id,
      alienId: u.id,
      displayName: u.name,
      verified: true,
      createdAt: Date.now() - Math.random() * 3600000,
    });
    balances.set(u.id, INITIAL_BALANCE);
  });

  const demoPulses: Array<{
    userId: string;
    emoji: string;
    message: string;
    mood: MoodCategory;
    resonance: number;
  }> = [
    { userId: "alien_p01", emoji: "✨", message: "Building something that matters today. This feeling is everything.", mood: "determination", resonance: 5 },
    { userId: "alien_p02", emoji: "🌊", message: "Found stillness in the chaos of a hackathon. Breathing.", mood: "calm", resonance: 3 },
    { userId: "alien_p03", emoji: "💛", message: "A stranger just helped me fix a bug. Humans are amazing.", mood: "gratitude", resonance: 8 },
    { userId: "alien_p04", emoji: "🚀", message: "3 hours in and the code is FLOWING. Pure creative energy.", mood: "energy", resonance: 4 },
    { userId: "alien_p05", emoji: "🌅", message: "We're building the future in this room right now.", mood: "hope", resonance: 6 },
    { userId: "alien_p06", emoji: "😄", message: "Just had the best conversation of my life in the elevator.", mood: "joy", resonance: 7 },
    { userId: "alien_p07", emoji: "💭", message: "What if identity is the foundation of everything good online?", mood: "reflection", resonance: 4 },
    { userId: "alien_p08", emoji: "❤️", message: "To everyone here: you belong. You are enough.", mood: "love", resonance: 12 },
    { userId: "alien_p09", emoji: "⚡", message: "Sleep is for after the demo. Let's SHIP.", mood: "energy", resonance: 6 },
    { userId: "alien_p10", emoji: "🙏", message: "Thank you Frontier Tower for this space. Magic happens here.", mood: "gratitude", resonance: 5 },
    { userId: "alien_p11", emoji: "🔮", message: "Somewhere in this building is the next big thing. I can feel it.", mood: "hope", resonance: 3 },
    { userId: "alien_p12", emoji: "🥰", message: "My team just surprised me with coffee. It's the little things.", mood: "love", resonance: 9 },
  ];

  demoPulses.forEach((p, i) => {
    const pulse: Pulse = {
      id: `pulse_demo_${i}`,
      userId: p.userId,
      userName: users.get(p.userId)!.displayName,
      emoji: p.emoji,
      message: p.message,
      mood: p.mood,
      resonanceCount: p.resonance,
      resonanceTotal: p.resonance * 1,
      createdAt: Date.now() - (demoPulses.length - i) * 240000,
      x: 0.15 + Math.random() * 0.7,
      y: 0.15 + Math.random() * 0.7,
    };
    pulses.set(pulse.id, pulse);
    activePulses.set(p.userId, pulse.id);
  });
}

seed();

// ---- Public API ----

export function registerUser(alienId: string, displayName: string): AlienUser {
  const existing = users.get(alienId);
  if (existing) return existing;

  const user: AlienUser = {
    id: alienId,
    alienId,
    displayName,
    verified: true,
    createdAt: Date.now(),
  };
  users.set(alienId, user);
  balances.set(alienId, INITIAL_BALANCE);
  broadcast("user_joined", { id: alienId, name: displayName });
  return user;
}

export function getUser(userId: string): AlienUser | undefined {
  return users.get(userId);
}

export function getUserState(userId: string): UserState {
  const balance = balances.get(userId) || 0;
  const activePulseId = activePulses.get(userId);
  const activePulse = activePulseId ? pulses.get(activePulseId) || null : null;
  const given = resonances.filter((r) => r.fromUserId === userId).length;
  const received = resonances.filter((r) => {
    const p = pulses.get(r.pulseId);
    return p && p.userId === userId;
  }).length;

  return { balance, activePulse, resonancesGiven: given, resonancesReceived: received };
}

export function createPulse(
  userId: string,
  emoji: string,
  message: string,
  mood: MoodCategory
): Pulse | { error: string } {
  if (!users.has(userId)) return { error: "Not verified" };
  if (!message.trim() || message.length > 120) return { error: "Message must be 1-120 characters" };

  // Deactivate old pulse if exists
  const oldPulseId = activePulses.get(userId);
  if (oldPulseId) {
    // Keep it in history but remove active status
    activePulses.delete(userId);
  }

  const pulse: Pulse = {
    id: `pulse_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId,
    userName: users.get(userId)!.displayName,
    emoji,
    message: message.trim(),
    mood,
    resonanceCount: 0,
    resonanceTotal: 0,
    createdAt: Date.now(),
    x: 0.15 + Math.random() * 0.7,
    y: 0.15 + Math.random() * 0.7,
  };

  pulses.set(pulse.id, pulse);
  activePulses.set(userId, pulse.id);
  broadcast("new_pulse", pulse);
  return pulse;
}

export function addResonance(
  fromUserId: string,
  pulseId: string,
  amount: number,
  txHash?: string
): Resonance | { error: string } {
  if (!users.has(fromUserId)) return { error: "Not verified" };
  const pulse = pulses.get(pulseId);
  if (!pulse) return { error: "Pulse not found" };
  if (pulse.userId === fromUserId) return { error: "Can't resonate with your own pulse" };
  if (amount < 1 || amount > 3) return { error: "Resonance amount must be 1-3" };

  const balance = balances.get(fromUserId) || 0;
  if (balance < amount) return { error: "Insufficient balance" };

  const resonance: Resonance = {
    id: `res_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    fromUserId,
    fromUserName: users.get(fromUserId)!.displayName,
    pulseId,
    amount,
    createdAt: Date.now(),
    txHash,
  };

  resonances.push(resonance);
  balances.set(fromUserId, balance - amount);
  balances.set(pulse.userId, (balances.get(pulse.userId) || 0) + amount);

  // Update pulse
  pulse.resonanceCount += 1;
  pulse.resonanceTotal += amount;

  broadcast("resonance", { resonance, pulse });
  return resonance;
}

export function getAllPulses(): Pulse[] {
  return Array.from(pulses.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export function getActivePulses(): Pulse[] {
  const activeIds = new Set(activePulses.values());
  return Array.from(pulses.values())
    .filter((p) => activeIds.has(p.id))
    .sort((a, b) => b.resonanceTotal - a.resonanceTotal);
}

export function getStats(): PulseStats {
  const allPulses = Array.from(pulses.values());
  const moodDist: Record<MoodCategory, number> = {
    joy: 0, gratitude: 0, hope: 0, calm: 0,
    energy: 0, love: 0, reflection: 0, determination: 0,
  };

  allPulses.forEach((p) => {
    moodDist[p.mood] = (moodDist[p.mood] || 0) + 1;
  });

  const topMood = (Object.entries(moodDist) as [MoodCategory, number][])
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "hope";

  return {
    totalPulses: allPulses.length,
    totalResonance: resonances.reduce((sum, r) => sum + r.amount, 0),
    topMood,
    activeHumans: users.size,
    moodDistribution: moodDist,
  };
}

export function getRecentActivity(limit = 20): Array<{ type: string; data: unknown; timestamp: number }> {
  const activity: Array<{ type: string; data: unknown; timestamp: number }> = [];

  Array.from(pulses.values())
    .slice(-limit)
    .forEach((p) => {
      activity.push({ type: "pulse", data: p, timestamp: p.createdAt });
    });

  resonances.slice(-limit).forEach((r) => {
    const pulse = pulses.get(r.pulseId);
    activity.push({
      type: "resonance",
      data: { ...r, pulseEmoji: pulse?.emoji, pulseUserName: pulse?.userName },
      timestamp: r.createdAt,
    });
  });

  return activity.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

// ---- SSE ----
export function subscribe(callback: Subscriber) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function broadcast(event: string, data: unknown) {
  subscribers.forEach((cb) => {
    try { cb(event, data); } catch { subscribers.delete(cb); }
  });
}

export function getPulseData() {
  return {
    pulses: Array.from(pulses.values()).map(p => ({
      ...p,
      resonances: resonances.filter(r => r.pulseId === p.id).length,
    })),
  };
}
