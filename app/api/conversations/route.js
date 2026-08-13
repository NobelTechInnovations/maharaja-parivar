import { NextResponse } from "next/server";
import { requireVerifiedMember } from "@/lib/memberGuard";
import Conversation from "@/models/Conversation";
import Connection from "@/models/Connection";
import Message from "@/models/Message";

export async function GET() {
  const { error, me } = await requireVerifiedMember();
  if (error) return error;

  const conversations = await Conversation.find({ participants: me._id })
    .populate({ path: "participants", select: "name photoUrl" })
    .sort({ lastMessageAt: -1 })
    .lean();

  const results = await Promise.all(
    conversations.map(async (c) => {
      const other = c.participants.find((p) => String(p._id) !== String(me._id));
      const lastMessage = await Message.findOne({ conversationId: c._id })
        .sort({ createdAt: -1 })
        .lean();
      return {
        id: c._id,
        user: other ? { id: other._id, name: other.name, photoUrl: other.photoUrl } : null,
        lastMessage: lastMessage?.text || null,
        lastMessageAt: c.lastMessageAt,
      };
    })
  );

  return NextResponse.json({ conversations: results });
}

export async function POST(request) {
  const { error, me } = await requireVerifiedMember();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const withUserId = body?.withUserId;
  if (!withUserId) {
    return NextResponse.json({ error: "Missing recipient." }, { status: 400 });
  }

  const connection = await Connection.findOne({
    status: "accepted",
    $or: [
      { fromUser: me._id, toUser: withUserId },
      { fromUser: withUserId, toUser: me._id },
    ],
  });
  if (!connection) {
    return NextResponse.json(
      { error: "You can only message someone you're connected with." },
      { status: 403 }
    );
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [me._id, withUserId], $size: 2 },
  });
  if (!conversation) {
    conversation = await Conversation.create({ participants: [me._id, withUserId] });
  }

  return NextResponse.json({ id: conversation._id });
}
