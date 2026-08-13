import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ensureDatabaseConnected } from "@/lib/db";
import User from "@/models/User";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NotificationsClient } from "@/components/notifications/NotificationsClient";

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await ensureDatabaseConnected();
  const me = await User.findById(session.sub);
  if (!me) redirect("/login");

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[60vh] max-w-2xl px-6 py-12">
        <h1 className="font-display text-[28px] text-ink">Notifications</h1>
        <p className="mt-1.5 text-sm text-muted">
          Follows, connection requests, messages, and activity on your posts.
        </p>
        <NotificationsClient />
      </main>
      <Footer />
    </>
  );
}
