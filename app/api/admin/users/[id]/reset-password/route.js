import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import User from "@/models/User";
import { generateTempPassword, hashPassword } from "@/lib/auth";

// Sets a brand-new password for a user and returns it in plaintext exactly
// once, for the admin to relay directly (call, WhatsApp, in person) — used
// when someone can't complete the self-serve /forgot-password flow (e.g.
// email isn't reaching them). Nothing about a user's previous password is
// ever recoverable — bcrypt hashes are one-way — so this issues a new one
// rather than "revealing" the old one.
export async function POST(_request, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const target = await User.findById(id);
  if (!target) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const tempPassword = generateTempPassword();
  target.passwordHash = await hashPassword(tempPassword);
  target.resetTokenHash = undefined;
  target.resetTokenExpires = undefined;
  await target.save();

  return NextResponse.json({ email: target.email, temporaryPassword: tempPassword });
}
