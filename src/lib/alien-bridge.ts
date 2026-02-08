// ============================================================
// ALIEN JS BRIDGE — Abstraction Layer (shared pattern)
// 🚨 HACKATHON SWAP POINT — same as Kindness Chain 🚨
// ============================================================

import type { AlienUser } from "./types";

const IS_MOCK = process.env.NEXT_PUBLIC_ALIEN_MODE !== "real";

const MOCK_NAMES = [
  "Aria", "Zephyr", "Juniper", "Caspian", "Lyric", "Phoenix",
  "Indigo", "Soleil", "Orion", "Meadow", "Jasper", "Coral",
];

export async function verifyIdentity(): Promise<{
  success: boolean;
  alienId: string;
  displayName: string;
}> {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 1500));
    const mockId = `alien_${Date.now().toString(36)}`;
    return {
      success: true,
      alienId: mockId,
      displayName: MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)],
    };
  }

  // 🚀 REAL ALIEN SSO — UNCOMMENT AT HACKATHON
  // import { alienVerifyIdentity } from './alien-sso-integration';
  // const result = await alienVerifyIdentity();
  // return { success: result.success, alienId: result.alienId, displayName: `Human ${result.alienId.slice(0,6)}`, proofOfHuman: result.proofOfHuman };

  throw new Error("Set NEXT_PUBLIC_ALIEN_MODE=mock or implement real bridge");
}

export async function sendPayment(
  recipientAlienId: string,
  amount: number,
  memo: string
): Promise<{ success: boolean; txHash: string }> {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 800));
    return {
      success: true,
      txHash: `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`,
    };
  }

  // 🚀 REAL ALIEN WALLET — GET API FROM HACKATHON DOCS
  // const wallet = (window as any).AlienWallet || (window as any).alien?.wallet;
  // const tx = await wallet.sendPayment({ to: recipientAlienId, amount, currency: 'ALIEN', memo });
  // return { success: true, transactionId: tx.id, amount };

  throw new Error("Set NEXT_PUBLIC_ALIEN_MODE=mock or implement real bridge");
}

export function isAlienBridgeAvailable(): boolean {
  if (typeof window === "undefined") return false;
  if (IS_MOCK) return true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return !!(w.AlienBridge || w.alien || w.Alien);
}
