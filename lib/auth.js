import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";

// On Vercel, env vars set in the dashboard only apply from the next
// redeploy onward — if JWT_SECRET is missing here in production, every
// session this instance signs is unverifiable by any other instance (or
// itself, after a redeploy), which reads exactly like "I was logged in,
// then randomly got bounced to /login". Logged once per cold start so
// it's visible in `vercel logs` instead of failing silently.
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.warn(
    "JWT_SECRET is not set — falling back to a hardcoded dev secret in production. " +
      "Set JWT_SECRET in your Vercel project's Environment Variables (Production) and redeploy."
  );
}

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-maharaja-parivar-secret";
const SESSION_COOKIE = "mp_session";
const SESSION_MAX_AGE_DAYS = 30;

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export function signSession(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, verificationStatus: user.verificationStatus },
    JWT_SECRET,
    { expiresIn: `${SESSION_MAX_AGE_DAYS}d` }
  );
}

export function verifySession(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function setSessionCookie(token) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

// Password reset tokens — only the hash is ever persisted (models/User.js
// resetTokenHash), matching how the password itself is stored.
export function generateResetToken() {
  return randomBytes(32).toString("hex");
}

export function hashResetToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
