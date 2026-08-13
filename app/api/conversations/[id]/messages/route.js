import { NextResponse } from "next/server";
import { requireVerifiedMember } from "@/lib/memberGuard";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { notify } from "@/lib/notify";

async function loadConversationForMember(id, meId) {
  const conversation = await Conversation.findById(id);
  if (!conversation) return null;
  const isParticipant = conversation.participants.some((p) => String(p) === String(meId));
  return isParticipant ? conversation : null;
}

export async function GET(_request, { params }) {
  const { error, me } = await requireVerifiedMember();
  if (error) return error;

  const { id } = await params;
  const conversation = await loadConversationForMember(id, me._id);
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  const messages = await Message.find({ conversationId: id })
    .sort({ createdAt: 1 })
    .limit(200)
    .lean();

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m._id,
      text: m.text,
      senderId: m.senderId,
      mine: String(m.senderId) === String(me._id),
      createdAt: m.createdAt,
    })),
  });
}

export async function POST(request, { params }) {
  const { error, me } = await requireVerifiedMember();
  if (error) return error;

  const { id } = await params;
  const conversation = await loadConversationForMember(id, me._id);
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const text = body?.text?.trim();
  if (!text) {
    return NextResponse.json({ error: "Message can't be empty." }, { status: 400 });
  }

  const message = await Message.create({ conversationId: id, senderId: me._id, text });
  conversation.lastMessageAt = message.createdAt;
  await conversation.save();

  const recipientId = conversation.participants.find((p) => String(p) !== String(me._id));
  await notify({
    recipientId,
    actorId: me._id,
    type: "message",
    data: { conversationId: String(conversation._id) },
  });

  return NextResponse.json({ id: message._id }, { status: 201 });
}
