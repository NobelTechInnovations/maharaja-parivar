import { NextResponse } from "next/server";
import { requireVerifiedMember } from "@/lib/memberGuard";
import Connection from "@/models/Connection";
import User from "@/models/User";
import { notify } from "@/lib/notify";

function shapeConnection(conn, meId) {
  const otherUser =
    String(conn.fromUser._id) === String(meId) ? conn.toUser : conn.fromUser;
  const direction = String(conn.fromUser._id) === String(meId) ? "sent" : "received";
  return {
    id: conn._id,
    status: conn.status,
    note: conn.note,
    direction,
    createdAt: conn.createdAt,
    myShares: conn.contactShares?.[String(meId)] || [],
    theirShares: conn.contactShares?.[String(otherUser._id)] || [],
    user: {
      id: otherUser._id,
      name: otherUser.name,
      photoUrl: otherUser.photoUrl,
      phone: otherUser.phone,
      email: otherUser.email,
    },
  };
}

export async function GET() {
  const { error, me } = await requireVerifiedMember();
  if (error) return error;

  const connections = await Connection.find({
    $or: [{ fromUser: me._id }, { toUser: me._id }],
    status: { $ne: "blocked" },
  })
    .populate({ path: "fromUser", select: "name photoUrl phone email" })
    .populate({ path: "toUser", select: "name photoUrl phone email" })
    .sort({ createdAt: -1 })
    .lean();

  const shaped = connections.map((c) => shapeConnection(c, me._id));

  // Never leak the other person's raw phone/email unless they've
  // explicitly shared that specific field with this connection.
  for (const c of shaped) {
    if (!c.theirShares.includes("phone")) c.user.phone = undefined;
    if (!c.theirShares.includes("email")) c.user.email = undefined;
  }

  return NextResponse.json({
    received: shaped.filter((c) => c.direction === "received" && c.status === "pending"),
    sent: shaped.filter((c) => c.direction === "sent" && c.status === "pending"),
    accepted: shaped.filter((c) => c.status === "accepted"),
  });
}

export async function POST(request) {
  const { error, me } = await requireVerifiedMember();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const toUserId = body?.toUserId;
  if (!toUserId) {
    return NextResponse.json({ error: "Missing recipient." }, { status: 400 });
  }
  if (String(toUserId) === String(me._id)) {
    return NextResponse.json({ error: "You can't connect with yourself." }, { status: 400 });
  }

  const target = await User.findById(toUserId).select("verificationStatus");
  if (!target || target.verificationStatus !== "verified") {
    return NextResponse.json({ error: "Maharajian not found." }, { status: 404 });
  }

  const note = (body?.note || "").slice(0, 400);

  const existing = await Connection.findOne({
    $or: [
      { fromUser: me._id, toUser: toUserId },
      { fromUser: toUserId, toUser: me._id },
    ],
  });

  if (existing) {
    if (existing.status === "pending" || existing.status === "accepted") {
      return NextResponse.json(
        { error: "There's already a connection or pending request between you two." },
        { status: 409 }
      );
    }
    // A previously declined request — let them try again, as a fresh
    // request from whoever is asking this time.
    existing.status = "pending";
    existing.note = note;
    existing.fromUser = me._id;
    existing.toUser = toUserId;
    existing.contactShares = {};
    await existing.save();
    await notify({
      recipientId: toUserId,
      actorId: me._id,
      type: "connection_request",
      data: { connectionId: String(existing._id) },
    });
    return NextResponse.json({ id: existing._id, status: existing.status }, { status: 201 });
  }

  const connection = await Connection.create({ fromUser: me._id, toUser: toUserId, note });
  await notify({
    recipientId: toUserId,
    actorId: me._id,
    type: "connection_request",
    data: { connectionId: String(connection._id) },
  });
  return NextResponse.json({ id: connection._id, status: connection.status }, { status: 201 });
}
