import { NextResponse } from "next/server";
import { ensureDatabaseConnected } from "@/lib/db";
import User from "@/models/User";
import { generateResetToken, hashResetToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Enter your email." }, { status: 400 });
  }

  try {
    await ensureDatabaseConnected();
  } catch {
    return NextResponse.json(
      { error: "We couldn't reach the database. Please try again shortly." },
      { status: 503 }
    );
  }

  const user = await User.findOne({ email });

  // Same response whether or not the email exists — don't confirm which
  // addresses have accounts.
  if (user) {
    const token = generateResetToken();
    user.resetTokenHash = hashResetToken(token);
    user.resetTokenExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.save();
    await sendPasswordResetEmail(user, token);
  }

  return NextResponse.json({
    message: "If that email has an account, a reset link is on its way.",
  });
}
