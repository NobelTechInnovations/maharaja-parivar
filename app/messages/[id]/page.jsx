import { notFound } from "next/navigation";
import { requireVerifiedPageUser } from "@/lib/pageAuth";
import Conversation from "@/models/Conversation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThreadClient } from "@/components/messages/ThreadClient";

export default async function ThreadPage({ params }) {
  const me = await requireVerifiedPageUser();

  const { id } = await params;
  const conversation = await Conversation.findById(id)
    .populate({ path: "participants", select: "name photoUrl" })
    .lean()
    .catch(() => null);

  const isParticipant = conversation?.participants.some(
    (p) => String(p._id) === String(me._id)
  );
  if (!conversation || !isParticipant) notFound();

  const other = conversation.participants.find((p) => String(p._id) !== String(me._id));

  return (
    <>
      <Navbar />
      <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-6 py-12">
        <ThreadClient
          conversationId={id}
          other={other ? { id: String(other._id), name: other.name, photoUrl: other.photoUrl } : null}
        />
      </main>
      <Footer />
    </>
  );
}
