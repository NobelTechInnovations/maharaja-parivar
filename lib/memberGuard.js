import { NextResponse } from "next/server";
import { ensureDatabaseConnected } from "@/lib/db";
import { getSession } from "@/lib/auth";
import User from "@/models/User";

/**
 * Shared guard for API routes that only need someone signed in — pending
 * accounts included. Used for things like uploading a profile photo,
 * which should work while a registration is still awaiting review.
 * Returns { me } on success, or { error: <NextResponse> } to return
 * directly from the caller.
 */
export async function requireSignedIn() {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Not signed in." }, { status: 401 }) };
  }

  try {
    await ensureDatabaseConnected();
  } catch {
    return {
      error: NextResponse.json(
        { error: "We couldn't reach the database. Please try again shortly." },
        { status: 503 }
      ),
    };
  }

  const me = await User.findById(session.sub);
  if (!me) {
    return { error: NextResponse.json({ error: "Not signed in." }, { status: 401 }) };
  }

  return { me };
}

/**
 * Shared guard for API routes that need a signed-in, verified member.
 * Returns { me } on success, or { error: <NextResponse> } to return
 * directly from the caller.
 */
export async function requireVerifiedMember() {
  const { error, me } = await requireSignedIn();
  if (error) return { error };

  if (me.verificationStatus !== "verified") {
    return {
      error: NextResponse.json(
        { error: "Your account needs to be verified first." },
        { status: 403 }
      ),
    };
  }

  return { me };
}
