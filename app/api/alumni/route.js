import { NextResponse } from "next/server";
import { ensureDatabaseConnected } from "@/lib/db";
import { getSession } from "@/lib/auth";
import User from "@/models/User";
import AlumniProfile from "@/models/AlumniProfile";
import Follow from "@/models/Follow";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  try {
    await ensureDatabaseConnected();
  } catch {
    return NextResponse.json(
      { error: "We couldn't reach the database. Please try again shortly." },
      { status: 503 }
    );
  }

  const me = await User.findById(session.sub);
  if (!me || me.verificationStatus !== "verified") {
    return NextResponse.json(
      { error: "Your account needs to be verified before you can search the directory." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const city = searchParams.get("city")?.trim();
  const profession = searchParams.get("profession")?.trim();
  const batch = searchParams.get("batch")?.trim();

  // Missing the field entirely (profiles created before isPublic existed)
  // counts as public — only an explicit false hides someone from search.
  const profileMatch = { isPublic: { $ne: false } };
  if (city) profileMatch.currentCity = new RegExp(escapeRegex(city), "i");
  if (profession) profileMatch.profession = new RegExp(escapeRegex(profession), "i");
  if (batch && /^\d{4}$/.test(batch)) profileMatch.passingYear = Number(batch);

  if (q) {
    const matches = await User.find({
      verificationStatus: "verified",
      name: new RegExp(escapeRegex(q), "i"),
    }).select("_id");
    if (matches.length === 0) return NextResponse.json({ results: [] });
    profileMatch.userId = { $in: matches.map((u) => u._id) };
  }

  const profiles = await AlumniProfile.find(profileMatch)
    .populate({ path: "userId", select: "name photoUrl verificationStatus" })
    .limit(60)
    .lean();

  const candidates = profiles.filter(
    (p) => p.userId && p.userId.verificationStatus === "verified" && String(p.userId._id) !== session.sub
  );

  const results = await Promise.all(
    candidates.map(async (p) => ({
      id: p.userId._id,
      name: p.userId.name,
      photoUrl: p.userId.photoUrl,
      passingYear: p.passingYear,
      course: p.course,
      currentCity: p.currentCity,
      currentState: p.currentState,
      profession: p.profession,
      organization: p.organization,
      followerCount: await Follow.countDocuments({ followingId: p.userId._id }),
    }))
  );

  return NextResponse.json({ results });
}
