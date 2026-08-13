import { redirect } from "next/navigation";
import { getSession, clearSessionCookie } from "@/lib/auth";
import { ensureDatabaseConnected } from "@/lib/db";
import User from "@/models/User";

/**
 * Server-component auth guard for pages. Loads the current user (any
 * status) or redirects to /login — clearing the session cookie first if
 * it pointed at a user that no longer exists (a deleted account, or a
 * token signed by a since-changed JWT_SECRET), so the browser stops
 * resending a cookie that will never verify. Without this, a page could
 * bounce someone to /login who genuinely believes they're signed in,
 * with no obvious way to recover other than clearing cookies by hand.
 */
export async function requirePageUser(loginPath = "/login") {
  const session = await getSession();
  if (!session) redirect(loginPath);

  try {
    await ensureDatabaseConnected();
  } catch {
    redirect(loginPath);
  }

  const me = await User.findById(session.sub);
  if (!me) {
    await clearSessionCookie();
    redirect(loginPath);
  }

  return me;
}

/** Same as requirePageUser, but also requires the account to be verified. */
export async function requireVerifiedPageUser(loginPath = "/login") {
  const me = await requirePageUser(loginPath);
  if (me.verificationStatus !== "verified") redirect("/pending");
  return me;
}
