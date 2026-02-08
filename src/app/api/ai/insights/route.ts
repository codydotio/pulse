import { NextResponse } from "next/server";
import { getPulseData } from "@/lib/store";
import { analyzeEmotions } from "@/lib/ai-agent";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userMood = searchParams.get("mood") as any;
    const data = getPulseData();
    const pulses = data.pulses.map(p => ({
      mood: p.mood,
      resonances: p.resonances,
      createdAt: p.createdAt,
    }));
    const intelligence = analyzeEmotions(pulses, userMood || undefined);
    return NextResponse.json(intelligence);
  } catch {
    return NextResponse.json({ error: "AI analysis failed" }, { status: 500 });
  }
}
