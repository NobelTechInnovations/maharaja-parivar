import { NextResponse } from "next/server";
import { requireVerifiedMember } from "@/lib/memberGuard";
import Connection from "@/models/Connection";

const SHAREABLE_FIELDS = ["phone", "email"];

export async function POST(request, { params }) {
  const { error, me } = await requireVerifiedMember();
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const fields = Array.isArray(body?.fields)
    ? body.fields.filter((f) => SHAREABLE_FIELDS.includes(f))
    : null;

  if (!fields) {
    return NextResponse.json({ error: "Invalid fields." }, { status: 400 });
  }

  const connection = await Connection.findById(id);
  if (!connection) {
    return NextResponse.json({ error: "Connection not found." }, { status: 404 });
  }
  const meInThisConnection =
    String(connection.fromUser) === String(me._id) ||
    String(connection.toUser) === String(me._id);
  if (!meInThisConnection) {
    return NextResponse.json({ error: "Not your connection." }, { status: 403 });
  }
  if (connection.status !== "accepted") {
    return NextResponse.json(
      { error: "You can only share contact details on an accepted connection." },
      { status: 409 }
    );
  }

  connection.contactShares = {
    ...(connection.contactShares || {}),
    [String(me._id)]: fields,
  };
  connection.markModified("contactShares");
  await connection.save();

  return NextResponse.json({ shared: fields });
}
