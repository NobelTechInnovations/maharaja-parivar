import { NextResponse } from "next/server";
import { ensureDatabaseConnected } from "@/lib/db";
import User from "@/models/User";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  try {
    await ensureDatabaseConnected();
  } catch {
    return NextResponse.json({ user: null }, { status: 503 });
  }
  const user = await User.findById(session.sub).select("-passwordHash");
  if (!user) return NextResponse.json({ user: null });

  return NextResponse.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      verificationStatus: user.verificationStatus,
    },
  });
}
