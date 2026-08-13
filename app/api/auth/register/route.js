import { NextResponse } from "next/server";
import { ensureDatabaseConnected } from "@/lib/db";
import User from "@/models/User";
import AlumniProfile from "@/models/AlumniProfile";
import { hashPassword, signSession, setSessionCookie } from "@/lib/auth";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, password, phone } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email and password are required." },
      { status: 400 }
    );
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

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const isFounderAdmin = ADMIN_EMAILS.includes(normalizedEmail);

  const user = await User.create({
    name,
    email: normalizedEmail,
    passwordHash: await hashPassword(password),
    phone,
    role: isFounderAdmin ? "admin" : "member",
    verificationStatus: isFounderAdmin ? "verified" : "pending",
    verifiedAt: isFounderAdmin ? new Date() : undefined,
  });

  // Just the account for now — batch, course and location are collected
  // afterwards in the profile-setup step, not on the sign-up form.
  await AlumniProfile.create({ userId: user._id });

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
