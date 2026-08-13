/**
 * OTP module — built now, not wired up yet.
 *
 * Registration and login currently run on email + password only (see
 * lib/auth.js and app/api/auth/*). This file exists so that turning on
 * OTP-based verification later (email OTP first, SMS OTP once a provider
 * like MSG91/Twilio Verify is picked — see the plan's "Open decisions")
 * is a matter of flipping OTP_ENABLED and wiring sendOtp() into the
 * register/login routes, not writing this from scratch.
 *
 * Nothing in the app currently calls sendOtp() or verifyOtp().
 */

export const OTP_ENABLED = process.env.OTP_ENABLED === "true";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const OTP_LENGTH = 6;

// In-memory store — fine for local dev only. Once wired up for real,
// swap this for a short-lived collection (or Redis) so it survives
// across serverless instances.
const otpStore = new Map();

export function generateOtp(length = OTP_LENGTH) {
  const max = 10 ** length;
  return String(Math.floor(Math.random() * max)).padStart(length, "0");
}

export function issueOtp(identifier) {
  const code = generateOtp();
  otpStore.set(identifier, { code, expiresAt: Date.now() + OTP_TTL_MS });
  return code;
}

export function checkOtp(identifier, code) {
  const entry = otpStore.get(identifier);
  if (!entry) return false;
  const isValid = entry.code === code && Date.now() < entry.expiresAt;
  if (isValid) otpStore.delete(identifier);
  return isValid;
}

/**
 * Not implemented yet. Intended shape once a provider is chosen:
 * sendOtp({ channel: "email" | "sms", to, code }) -> Promise<void>
 */
export async function sendOtp() {
  throw new Error(
    "sendOtp() is not implemented yet — OTP delivery is planned but not active. " +
      "Registration currently uses email + password."
  );
}
