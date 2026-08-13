import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import User from "@/models/User";
import AlumniProfile from "@/models/AlumniProfile";

const VALID_STATUSES = ["pending", "verified", "rejected"];

export async function GET(request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pending";
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status filter." }, { status: 400 });
  }

  const users = await User.find({ verificationStatus: status })
    .select("name email phone verificationStatus createdAt")
    .sort({ createdAt: 1 })
    .lean();

  const profiles = await AlumniProfile.find({
    userId: { $in: users.map((u) => u._id) },
  }).lean();
  const profileByUser = Object.fromEntries(profiles.map((p) => [String(p.userId), p]));

  const results = users.map((u) => ({
    id: u._id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    createdAt: u.createdAt,
    profile: profileByUser[String(u._id)]
      ? {
          course: profileByUser[String(u._id)].course,
          passingYear: profileByUser[String(u._id)].passingYear,
          currentCity: profileByUser[String(u._id)].currentCity,
          currentState: profileByUser[String(u._id)].currentState,
        }
      : null,
  }));

  return NextResponse.json({ users: results });
}
