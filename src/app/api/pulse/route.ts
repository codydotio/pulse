import { NextResponse } from "next/server";
import { createPulse, getActivePulses, getStats } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const { userId, emoji, message, mood } = await request.json();
    const result = createPulse(userId, emoji, message, mood);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ pulse: result });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const pulses = getActivePulses();
    const stats = getStats();
    return NextResponse.json({ pulses, stats });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
