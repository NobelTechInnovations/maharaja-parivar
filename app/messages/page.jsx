import { requireVerifiedPageUser } from "@/lib/pageAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ConversationListClient } from "@/components/messages/ConversationListClient";

export default async function MessagesPage() {
  await requireVerifiedPageUser();

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[60vh] max-w-3xl px-6 py-12">
        <h1 className="font-display text-[28px] text-ink">Messages</h1>
        <p className="mt-1.5 text-sm text-muted">
          Conversations with the Maharajians you&rsquo;re connected with.
        </p>
        <ConversationListClient />
      </main>
      <Footer />
    </>
  );
}
