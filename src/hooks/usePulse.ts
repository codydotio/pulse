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

export function useAlien() {
  const [user, setUser] = useState<AlienUser | null>(null);
  const [userState, setUserState] = useState<UserState | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      body: JSON.stringify({ userId: user.id, emoji, message, mood }),
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
    if (stateData.state) setUserState(stateData.state);
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
      body: JSON.stringify({ fromUserId: user.id, pulseId, amount, txHash: payment.transactionId }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    if (data.state) setUserState(data.state);
    return data.resonance;
  }, [user]);

  return { user, userState, isVerifying, error, verify, createPulse, resonate };
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

    // SSE
    const es = new EventSource("/api/events");
    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === "new_pulse" || parsed.type === "resonance") {
          refresh();
        }
      } catch {}
    };
    return () => es.close();
  }, [refresh]);

  return { pulses, stats, refresh };
}
