import { NextResponse } from "next/server";
import { ensureDatabaseConnected } from "@/lib/db";
import User from "@/models/User";
import { hashResetToken, hashPassword } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const token = body?.token;
  const password = body?.password;

  if (!token || !password) {
    return NextResponse.json({ error: "Missing token or password." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  try {
    await ensureDatabaseConnected();
  } catch {
    return NextResponse.json(
      { error: "We couldn't reach the database. Please try again shortly." },
      { status: 503 }
    );
  }

  const user = await User.findOne({
    resetTokenHash: hashResetToken(token),
    resetTokenExpires: { $gt: new Date() },
  });

  if (!user) {
    return NextResponse.json(
      { error: "This link is invalid or has expired. Request a new one." },
      { status: 400 }
    );
  }

  user.passwordHash = await hashPassword(password);
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  return NextResponse.json({ ok: true });
}
