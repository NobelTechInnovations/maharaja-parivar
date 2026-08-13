import { NextResponse } from "next/server";
import { requireSignedIn } from "@/lib/memberGuard";

// Separate from /api/profile since the photo lives on User, not AlumniProfile.
export async function POST(request) {
  const { error, me } = await requireSignedIn();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const photoUrl = body?.photoUrl;
  if (!photoUrl || typeof photoUrl !== "string") {
    return NextResponse.json({ error: "Missing photo URL." }, { status: 400 });
  }

  me.photoUrl = photoUrl;
  await me.save();

  return NextResponse.json({ photoUrl: me.photoUrl });
}
