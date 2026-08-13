import { NextResponse } from "next/server";
import { ensureDatabaseConnected } from "@/lib/db";
import AlumniProfile from "@/models/AlumniProfile";
import { getSession } from "@/lib/auth";

async function requireSession() {
  const session = await getSession();
  if (!session) return null;
  try {
    await ensureDatabaseConnected();
  } catch {
    return "db-error";
  }
  return session;
}

export async function GET() {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (session === "db-error") {
    return NextResponse.json(
      { error: "We couldn't reach the database. Please try again shortly." },
      { status: 503 }
    );
  }

  const profile = await AlumniProfile.findOne({ userId: session.sub });
  return NextResponse.json({ profile });
}

const EDITABLE_FIELDS = [
  "admissionYear",
  "passingYear",
  "course",
  "department",
  "homeTown",
  "homeState",
  "currentCity",
  "currentState",
  "currentCountry",
  "profession",
  "organization",
  "designation",
  "hostelStatus",
  "bio",
  "isPublic",
];

export async function POST(request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (session === "db-error") {
    return NextResponse.json(
      { error: "We couldn't reach the database. Please try again shortly." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

  const update = {};
  for (const field of EDITABLE_FIELDS) {
    if (body[field] === undefined || body[field] === "") continue;
    if (field === "admissionYear" || field === "passingYear") {
      update[field] = Number(body[field]);
    } else {
      update[field] = body[field];
    }
  }

  const profile = await AlumniProfile.findOneAndUpdate(
    { userId: session.sub },
    { $set: update },
    { new: true, upsert: true }
  );

  return NextResponse.json({ profile });
}
