import { NextResponse } from "next/server";
import { requireSignedIn } from "@/lib/memberGuard";
import Notification from "@/models/Notification";
import User from "@/models/User";

const LABELS = {
  follow: (name) => `${name} started following you`,
  connection_request: (name) => `${name} sent you a connection request`,
  connection_accepted: (name) => `${name} accepted your connection request`,
  message: (name) => `${name} sent you a message`,
  post_like: (name) => `${name} liked your post`,
  post_comment: (name) => `${name} commented on your post`,
};

function linkFor(n) {
  switch (n.type) {
    case "follow":
      return `/alumni/${n.actorId}`;
    case "connection_request":
    case "connection_accepted":
      return "/connections";
    case "message":
      return `/messages/${n.data?.conversationId || ""}`;
    case "post_like":
    case "post_comment":
      return "/feed";
    default:
      return "/notifications";
  }
}

export async function GET() {
  const { error, me } = await requireSignedIn();
  if (error) return error;

  const notifications = await Notification.find({ recipientId: me._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const actorIds = [...new Set(notifications.map((n) => String(n.actorId)))];
  const actors = await User.find({ _id: { $in: actorIds } }).select("name photoUrl").lean();
  const actorById = Object.fromEntries(actors.map((a) => [String(a._id), a]));

  const results = notifications.map((n) => {
    const actor = actorById[String(n.actorId)];
    const actorName = actor?.name || "A Maharajian";
    return {
      id: n._id,
      type: n.type,
      read: n.read,
      createdAt: n.createdAt,
      text: (LABELS[n.type] || (() => "New activity"))(actorName),
      link: linkFor(n),
      actor: actor ? { id: actor._id, name: actor.name, photoUrl: actor.photoUrl } : null,
    };
  });

  const unreadCount = await Notification.countDocuments({ recipientId: me._id, read: false });

  return NextResponse.json({ notifications: results, unreadCount });
}
