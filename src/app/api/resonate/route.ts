import { NextResponse } from "next/server";
import { addResonance, getUserState } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const { fromUserId, pulseId, amount, txHash } = await request.json();
    const result = addResonance(fromUserId, pulseId, amount, txHash);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    const state = getUserState(fromUserId);
    return NextResponse.json({ resonance: result, state });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
