import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ensureDatabaseConnected } from "@/lib/db";
import User from "@/models/User";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FeedClient } from "@/components/feed/FeedClient";

export default async function FeedPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await ensureDatabaseConnected();
  const me = await User.findById(session.sub).lean();
  if (!me) redirect("/login");
  if (me.verificationStatus !== "verified") redirect("/pending");

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
