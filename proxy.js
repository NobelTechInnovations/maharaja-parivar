import { NextResponse } from "next/server";

// Routes that need someone signed in. /alumni/[id] is deliberately excluded
// — a public profile is viewable by guests, so that page decides its own
// access rules (and its own login redirect, for the actions that do need
// an account) rather than being blanket-gated here.
const PROTECTED_PREFIXES = [
  "/discover",
  "/feed",
  "/connections",
  "/messages",
  "/me",
  "/profile/setup",
  "/admin",
  "/pending",
  "/notifications",
];

const SESSION_COOKIE = "mp_session";

export function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  if (!isProtected) return NextResponse.next();

  // Presence-only check — this just decides whether to bounce to /login
  // with a return path. The actual signature/role/verification checks
  // still happen server-side on each page, same as before.
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  if (hasSession) return NextResponse.next();

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  loginUrl.searchParams.set("next", pathname + search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/discover/:path*",
    "/feed/:path*",
    "/connections/:path*",
    "/messages/:path*",
    "/me/:path*",
    "/profile/setup",
    "/admin/:path*",
    "/pending",
    "/notifications/:path*",
  ],
};
