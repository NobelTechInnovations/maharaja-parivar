import { NextResponse } from "next/server";
import { requireSignedIn } from "@/lib/memberGuard";
import Notification from "@/models/Notification";

// Body omitted or {} -> mark everything read. { id } -> mark just one.
export async function POST(request) {
  const { error, me } = await requireSignedIn();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const filter = { recipientId: me._id, read: false };
  if (body?.id) filter._id = body.id;

  await Notification.updateMany(filter, { $set: { read: true } });
  return NextResponse.json({ ok: true });
}
