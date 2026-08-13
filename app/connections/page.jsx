import { requireVerifiedPageUser } from "@/lib/pageAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ConnectionsClient } from "@/components/connections/ConnectionsClient";

export default async function ConnectionsPage() {
  await requireVerifiedPageUser();

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[60vh] max-w-4xl px-6 py-12">
        <h1 className="font-display text-[28px] text-ink">Connections</h1>
        <p className="mt-1.5 text-sm text-muted">
          Requests, connections, and what you&rsquo;ve chosen to share with each of them.
        </p>
        <ConnectionsClient />
      </main>
      <Footer />
    </>
  );
}
