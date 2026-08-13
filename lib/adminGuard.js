import { NextResponse } from "next/server";
import { ensureDatabaseConnected } from "@/lib/db";
import { getSession } from "@/lib/auth";
import User from "@/models/User";

/**
 * Shared guard for /api/admin/* routes. Returns { me } on success, or
 * { error: <NextResponse> } to return directly from the caller.
 */
export async function requireAdmin() {
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
  if (!me || me.role !== "admin") {
    return { error: NextResponse.json({ error: "Admins only." }, { status: 403 }) };
  }

  return { me };
}
