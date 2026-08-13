import { requirePageUser } from "@/lib/pageAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NotificationsClient } from "@/components/notifications/NotificationsClient";

export default async function NotificationsPage() {
  await requirePageUser();

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
