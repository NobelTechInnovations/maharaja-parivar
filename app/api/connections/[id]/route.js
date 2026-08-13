import { NextResponse } from "next/server";
import { requireVerifiedMember } from "@/lib/memberGuard";
import Connection from "@/models/Connection";
import { notify } from "@/lib/notify";

export async function PATCH(request, { params }) {
  const { error, me } = await requireVerifiedMember();
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const action = body?.action;
  if (!["accept", "decline"].includes(action)) {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const connection = await Connection.findById(id);
  if (!connection) {
    return NextResponse.json({ error: "Connection not found." }, { status: 404 });
  }
  if (String(connection.toUser) !== String(me._id)) {
    return NextResponse.json(
      { error: "Only the person a request was sent to can respond to it." },
      { status: 403 }
    );
  }
  if (connection.status !== "pending") {
    return NextResponse.json({ error: "This request has already been handled." }, { status: 409 });
  }

  connection.status = action === "accept" ? "accepted" : "declined";
  await connection.save();

  if (action === "accept") {
    await notify({
      recipientId: connection.fromUser,
      actorId: me._id,
      type: "connection_accepted",
      data: { connectionId: String(connection._id) },
    });
  }

  return NextResponse.json({ id: connection._id, status: connection.status });
}
