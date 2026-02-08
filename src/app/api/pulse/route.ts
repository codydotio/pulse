import { NextResponse } from "next/server";
import { createPulse, getActivePulses, getStats, registerUser, getUser } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const { userId, emoji, message, mood, fromDisplayName } = await request.json();

    // Auto-register user if not found (handles Vercel serverless cold starts)
    if (!getUser(userId)) {
      registerUser(userId, fromDisplayName || "Anonymous");
    }

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
