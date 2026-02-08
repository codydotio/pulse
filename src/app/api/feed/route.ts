import { NextResponse } from "next/server";
import { getRecentActivity } from "@/lib/store";

export async function GET() {
  try {
    const activity = getRecentActivity(30);
    return NextResponse.json({ activity });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
