import { requireVerifiedPageUser } from "@/lib/pageAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DiscoverClient } from "@/components/discover/DiscoverClient";

export default async function DiscoverPage() {
  await requireVerifiedPageUser();

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[60vh] max-w-6xl px-6 py-12">
        <h1 className="font-display text-[28px] text-ink">Find your Maharajians</h1>
        <p className="mt-1.5 max-w-xl text-sm text-muted">
          Search by name, city, batch or profession — every result here has already
          been verified.
        </p>
        <DiscoverClient />
      </main>
      <Footer />
    </>
  );
}
