import { requireVerifiedPageUser } from "@/lib/pageAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FeedClient } from "@/components/feed/FeedClient";

export default async function FeedPage() {
  const me = await requireVerifiedPageUser();

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[60vh] max-w-2xl px-6 py-12">
        <h1 className="font-display text-[28px] text-ink">Community feed</h1>
        <p className="mt-1.5 text-sm text-muted">
          Updates from verified Maharajians — visible to members only.
        </p>
        <FeedClient me={{ name: me.name, photoUrl: me.photoUrl }} />
      </main>
      <Footer />
    </>
  );
}
