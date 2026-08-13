import { NextResponse } from "next/server";
import { requireVerifiedMember } from "@/lib/memberGuard";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import User from "@/models/User";
import { notify } from "@/lib/notify";

export async function GET(_request, { params }) {
  const { error } = await requireVerifiedMember();
  if (error) return error;

  const { id } = await params;
  const comments = await Comment.find({ postId: id }).sort({ createdAt: 1 }).lean();
  const userIds = [...new Set(comments.map((c) => String(c.userId)))];
  const users = await User.find({ _id: { $in: userIds } }).select("name photoUrl").lean();
  const userById = Object.fromEntries(users.map((u) => [String(u._id), u]));

  return NextResponse.json({
    comments: comments.map((c) => ({
      id: c._id,
      text: c.text,
      createdAt: c.createdAt,
      author: userById[String(c.userId)]
        ? { id: c.userId, name: userById[String(c.userId)].name, photoUrl: userById[String(c.userId)].photoUrl }
        : { id: c.userId, name: "A Maharajian" },
    })),
  });
}

export async function POST(request, { params }) {
  const { error, me } = await requireVerifiedMember();
  if (error) return error;

  const { id } = await params;
  const post = await Post.findById(id);
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const text = body?.text?.trim();
  if (!text) return NextResponse.json({ error: "Comment can't be empty." }, { status: 400 });

  const comment = await Comment.create({ postId: id, userId: me._id, text });
  post.commentCount += 1;
  await post.save();

  await notify({
    recipientId: post.userId,
    actorId: me._id,
    type: "post_comment",
    data: { postId: String(post._id) },
  });

  return NextResponse.json(
    {
      comment: {
        id: comment._id,
        text: comment.text,
        createdAt: comment.createdAt,
        author: { id: me._id, name: me.name, photoUrl: me.photoUrl },
      },
    },
    { status: 201 }
  );
}
