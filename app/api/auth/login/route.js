import { NextResponse } from "next/server";
import { ensureDatabaseConnected } from "@/lib/db";
import User from "@/models/User";
import { verifyPassword, signSession, setSessionCookie } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    await ensureDatabaseConnected();
  } catch {
    return NextResponse.json(
      { error: "We couldn't reach the database. Please try again shortly." },
      { status: 503 }
    );
  }

  const normalizedEmail = String(body.email).trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  // Same generic message whether the email is unknown or the password is
  // wrong — don't confirm which emails have accounts.
  const invalid = () =>
    NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });

  if (!user) return invalid();

  const ok = await verifyPassword(body.password, user.passwordHash);
  if (!ok) return invalid();

  const token = signSession(user);
  await setSessionCookie(token);

  return NextResponse.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      verificationStatus: user.verificationStatus,
    },
  });
}
