import { NextResponse } from "next/server";
import { requireVerifiedMember } from "@/lib/memberGuard";
import Post from "@/models/Post";
import Like from "@/models/Like";
import { notify } from "@/lib/notify";

export async function POST(_request, { params }) {
  const { error, me } = await requireVerifiedMember();
  if (error) return error;

  const { id } = await params;
  const post = await Post.findById(id);
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });

  const existing = await Like.findOne({ postId: id, userId: me._id });
  if (existing) {
    await existing.deleteOne();
    post.likeCount = Math.max(0, post.likeCount - 1);
  } else {
    await Like.create({ postId: id, userId: me._id });
    post.likeCount += 1;
    await notify({
      recipientId: post.userId,
      actorId: me._id,
      type: "post_like",
      data: { postId: String(post._id) },
    });
  }
  await post.save();

  return NextResponse.json({ likeCount: post.likeCount, likedByMe: !existing });
}
