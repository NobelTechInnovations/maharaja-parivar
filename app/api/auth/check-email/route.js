import { NextResponse } from "next/server";
import { ensureDatabaseConnected } from "@/lib/db";
import User from "@/models/User";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ exists: false });
  }

  try {
    await ensureDatabaseConnected();
  } catch {
    // Don't block the form over this — the real check still happens on submit.
    return NextResponse.json({ exists: false });
  }

  const existing = await User.findOne({ email }).select("_id").lean();
  return NextResponse.json({ exists: Boolean(existing) });
}
