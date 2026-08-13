import { NextResponse } from "next/server";
import { requireSignedIn } from "@/lib/memberGuard";
import Notification from "@/models/Notification";

// Lightweight endpoint the navbar bell polls — avoids pulling the full
// notification list just to know if the dot should show.
export async function GET() {
  const { error, me } = await requireSignedIn();
  if (error) return error;

  const count = await Notification.countDocuments({ recipientId: me._id, read: false });
  return NextResponse.json({ count });
}
