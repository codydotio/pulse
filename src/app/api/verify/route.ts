import { NextResponse } from "next/server";
import { registerUser, getUserState } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const { alienId, displayName } = await request.json();
    if (!alienId || !displayName) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const user = registerUser(alienId, displayName);
    const state = getUserState(user.id);
    return NextResponse.json({ user, state });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
