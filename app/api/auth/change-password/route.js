import { NextResponse } from "next/server";
import { requireSignedIn } from "@/lib/memberGuard";
import { verifyPassword, hashPassword } from "@/lib/auth";

// Self-serve password change — separate from the admin-issued temporary
// password (/api/admin/users/[id]/reset-password) and the email-link
// reset (/api/auth/reset-password). This is the one a member reaches for
// once they're already logged in with a temp/admin-set password and want
// to pick their own.
export async function POST(request) {
  const { error, me } = await requireSignedIn();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const currentPassword = body?.currentPassword;
  const newPassword = body?.newPassword;

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Enter your current and new password." },
      { status: 400 }
    );
  }
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const ok = await verifyPassword(currentPassword, me.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
  }

  me.passwordHash = await hashPassword(newPassword);
  await me.save();

  return NextResponse.json({ ok: true });
}
