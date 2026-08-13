import { NextResponse } from "next/server";
import { requireVerifiedMember } from "@/lib/memberGuard";
import Follow from "@/models/Follow";
import User from "@/models/User";
import { notify } from "@/lib/notify";

export async function GET(_request, { params }) {
  const { error, me } = await requireVerifiedMember();
  if (error) return error;

  const { id } = await params;
  const [followerCount, isFollowing] = await Promise.all([
    Follow.countDocuments({ followingId: id }),
    Follow.exists({ followerId: me._id, followingId: id }),
  ]);

  return NextResponse.json({ followerCount, isFollowing: Boolean(isFollowing) });
}

export async function POST(_request, { params }) {
  const { error, me } = await requireVerifiedMember();
  if (error) return error;

  const { id } = await params;
  if (String(me._id) === String(id)) {
    return NextResponse.json({ error: "You can't follow yourself." }, { status: 400 });
  }

  const target = await User.findById(id).select("verificationStatus");
  if (!target || target.verificationStatus !== "verified") {
    return NextResponse.json({ error: "Maharajian not found." }, { status: 404 });
  }

  const existing = await Follow.findOne({ followerId: me._id, followingId: id });
  if (existing) {
    await existing.deleteOne();
  } else {
    await Follow.create({ followerId: me._id, followingId: id });
    await notify({ recipientId: id, actorId: me._id, type: "follow" });
  }

  const followerCount = await Follow.countDocuments({ followingId: id });
  return NextResponse.json({ followerCount, isFollowing: !existing });
}
