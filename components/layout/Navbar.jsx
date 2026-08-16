import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { getSession } from "@/lib/auth";
import { ensureDatabaseConnected } from "@/lib/db";
import User from "@/models/User";
import Notification from "@/models/Notification";

async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  try {
    await ensureDatabaseConnected();
  } catch {
    return null;
  }
  return User.findById(session.sub).select("name role verificationStatus").lean();
}

export async function Navbar() {
  const user = await getCurrentUser();
  const unreadCount = user
    ? await Notification.countDocuments({ recipientId: user._id, read: false })
    : 0;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-maroon font-display text-[15px] text-white">
              M
            </span>
            <span className="font-display text-[18px] leading-none text-ink">
              Maharaja Parivar
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted lg:flex">
            {user?.verificationStatus === "verified" && (
              <>
                <Link href="/discover" className="hover:text-ink">
                  Directory
                </Link>
                <Link href="/feed" className="hover:text-ink">
                  Feed
                </Link>
                <Link href="/connections" className="hover:text-ink">
                  Connections
                </Link>
                <Link href="/messages" className="hover:text-ink">
                  Messages
                </Link>
              </>
            )}
            {user?.role === "admin" && (
              <Link href="/admin" className="hover:text-ink">
                Admin
              </Link>
            )}
            {!user && (
              <>
                <Link href="/#about" className="hover:text-ink">
                  About
                </Link>
                <Link href="/#how-it-works" className="hover:text-ink">
                  How it works
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user && <NotificationBell initialCount={unreadCount} />}
            {/* Mobile carries login/join/logout/profile in the bottom tab
                bar instead — this row is desktop-only from here on. */}
            {user ? (
              <div className="hidden items-center gap-3 lg:flex">
                <Link href="/me/profile" className="text-sm text-muted hover:text-ink">
                  Hi, {user.name.split(" ")[0]}
                </Link>
                <LogoutButton />
              </div>
            ) : (
              <div className="hidden items-center gap-3 lg:flex">
                <Button href="/login" variant="ghost" size="md">
                  Log in
                </Button>
                <Button href="/register" variant="primary" size="md">
                  Join the Parivar
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      <MobileTabBar isVerified={user?.verificationStatus === "verified"} />
    </>
  );
}
