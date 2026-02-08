"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { AlienUser, Pulse, PulseStats, MoodCategory } from "@/lib/types";
import { verifyIdentity, sendPayment } from "@/lib/alien-bridge";

interface UserState {
  balance: number;
  activePulse: Pulse | null;
  resonancesGiven: number;
  resonancesReceived: number;
}

const SESSION_KEY = "pulse_session";

interface StoredSession {
  user: AlienUser;
  userState: UserState;
}

function saveSession(user: AlienUser, userState: UserState) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user, userState }));
  } catch {}
}

function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

export function useAlien() {
  const [user, setUser] = useState<AlienUser | null>(null);
  const [userState, setUserState] = useState<UserState | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-restore session on mount
  useEffect(() => {
    const session = loadSession();
    if (session?.user) {
      setUser(session.user);
      setUserState(session.userState);

      // Re-register with backend (ensures user exists in this serverless instance)
      fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alienId: session.user.alienId,
          displayName: session.user.displayName,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.state) setUserState(data.state);
        })
        .catch(() => {});
    }
  }, []);

  const verify = useCallback(async () => {
    setIsVerifying(true);
    setError(null);
    try {
      const identity = await verifyIdentity();
      if (!identity.success) throw new Error("Verification failed");
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alienId: identity.alienId, displayName: identity.displayName }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setUser(data.user);
      setUserState(data.state);

      // Persist session so page refresh keeps you logged in
      saveSession(data.user, data.state);

      return data.user;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      return null;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const createPulse = useCallback(async (emoji: string, message: string, mood: MoodCategory) => {
    if (!user) throw new Error("Not verified");
    const res = await fetch("/api/pulse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, emoji, message, mood, fromDisplayName: user.displayName }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    // Refresh user state
    const stateRes = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alienId: user.alienId, displayName: user.displayName }),
    });
    const stateData = await stateRes.json();
    if (stateData.state) {
      setUserState(stateData.state);
      saveSession(user, stateData.state);
    }
    // Signal data hooks to refetch (SSE doesn't work on Vercel serverless)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("pulse-action"));
    }
    return data.pulse;
  }, [user]);

  const resonate = useCallback(async (pulseId: string, amount: number) => {
    if (!user) throw new Error("Not verified");
    // Payment through Alien bridge
    const payment = await sendPayment("pulse_resonance", amount, `Resonance for ${pulseId}`);
    if (!payment.success) throw new Error("Payment failed");

    const res = await fetch("/api/resonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromUserId: user.id, fromDisplayName: user.displayName, pulseId, amount, txHash: payment.transactionId }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    if (data.state) {
      setUserState(data.state);
      saveSession(user, data.state);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("pulse-action"));
    }
    return data.resonance;
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    setUserState(null);
    clearSession();
    localStorage.removeItem("alien_mock_identity");
  }, []);

  return { user, userState, isVerifying, error, verify, createPulse, resonate, logout };
}

export function usePulseData() {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [stats, setStats] = useState<PulseStats | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/pulse");
      const data = await res.json();
      setPulses(data.pulses || []);
      setStats(data.stats || null);
    } catch {}
  }, []);

  useEffect(() => {
    refresh();

    // SSE (works locally, may not on Vercel serverless)
    const es = new EventSource("/api/events");
    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === "new_pulse" || parsed.type === "resonance") {
          refresh();
        }
      } catch {}
    };

    // Listen for local action events (serverless fallback)
    const handleAction = () => setTimeout(refresh, 500);
    window.addEventListener("pulse-action", handleAction);

    // Poll every 15s for multi-user updates
    const poll = setInterval(refresh, 15000);

    return () => {
      es.close();
      window.removeEventListener("pulse-action", handleAction);
      clearInterval(poll);
    };
  }, [refresh]);

  return { pulses, stats, refresh };
}
