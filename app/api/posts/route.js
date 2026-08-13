import { NextResponse } from "next/server";
import { requireVerifiedMember } from "@/lib/memberGuard";
import Post from "@/models/Post";
import Like from "@/models/Like";
import User from "@/models/User";

export async function GET() {
  const { error, me } = await requireVerifiedMember();
  if (error) return error;

  const posts = await Post.find().sort({ createdAt: -1 }).limit(50).lean();
  const userIds = [...new Set(posts.map((p) => String(p.userId)))];
  const users = await User.find({ _id: { $in: userIds } }).select("name photoUrl").lean();
  const userById = Object.fromEntries(users.map((u) => [String(u._id), u]));

  const myLikes = await Like.find({ userId: me._id, postId: { $in: posts.map((p) => p._id) } })
    .select("postId")
    .lean();
  const likedPostIds = new Set(myLikes.map((l) => String(l.postId)));

  const results = posts.map((p) => ({
    id: p._id,
    text: p.text,
    imageUrl: p.imageUrl || "",
    createdAt: p.createdAt,
    likeCount: p.likeCount,
    commentCount: p.commentCount,
    likedByMe: likedPostIds.has(String(p._id)),
    author: userById[String(p.userId)]
      ? { id: p.userId, name: userById[String(p.userId)].name, photoUrl: userById[String(p.userId)].photoUrl }
      : { id: p.userId, name: "A Maharajian" },
  }));

  return NextResponse.json({ posts: results });
}

export async function POST(request) {
  const { error, me } = await requireVerifiedMember();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const text = (body?.text || "").trim();
  const imageUrl = (body?.imageUrl || "").trim();

  if (!text && !imageUrl) {
    return NextResponse.json({ error: "Say something, or add a photo, first." }, { status: 400 });
  }
  if (text.length > 2000) {
    return NextResponse.json({ error: "That's a bit long — keep it under 2000 characters." }, { status: 400 });
  }

  const post = await Post.create({ userId: me._id, text, imageUrl });

  return NextResponse.json(
    {
      post: {
        id: post._id,
        text: post.text,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
        likeCount: 0,
        commentCount: 0,
        likedByMe: false,
        author: { id: me._id, name: me.name, photoUrl: me.photoUrl },
      },
    },
    { status: 201 }
  );
}
