"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import { ImagePlus, X } from "lucide-react";

function timeAgo(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function PostComments({ postId, open }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!open) return;
    fetch(`/api/posts/${postId}/comments`)
      .then((res) => res.json())
      .then((data) => setComments(data.comments || []))
      .finally(() => setLoading(false));
  }, [open, postId]);

  async function submit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: trimmed }),
    });
    const data = await res.json();
    if (res.ok) setComments((c) => [...c, data.comment]);
  }

  if (!open) return null;

  return (
    <div className="mt-3 space-y-3 border-t border-line pt-3">
      {loading && <p className="text-xs text-muted">Loading comments…</p>}
      {comments.map((c) => (
        <div key={c.id} className="flex items-start gap-2.5">
          <Avatar name={c.author.name} photoUrl={c.author.photoUrl} size={28} />
          <div className="rounded-xl bg-panel-soft px-3 py-2 text-sm">
            <Link href={`/alumni/${c.author.id}`} className="font-medium text-ink hover:underline">
              {c.author.name}
            </Link>{" "}
            <span className="text-ink">{c.text}</span>
          </div>
        </div>
      ))}
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment…"
          className="flex-1 rounded-lg border border-line bg-white px-3 py-1.5 text-sm outline-none focus:border-maroon/50 focus:ring-2 focus:ring-maroon/10"
        />
        <button type="submit" className="text-sm font-medium text-maroon hover:underline">
          Post
        </button>
      </form>
    </div>
  );
}

function PostCard({ post, onLike, highlighted }) {
  const [openComments, setOpenComments] = useState(false);

  return (
    <Card
      id={`post-${post.id}`}
      className={cn(
        "scroll-mt-24 p-5 transition-shadow",
        highlighted && "ring-2 ring-maroon/50"
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar name={post.author.name} photoUrl={post.author.photoUrl} size={40} />
        <div>
          <Link href={`/alumni/${post.author.id}`} className="text-sm font-semibold text-ink hover:underline">
            {post.author.name}
          </Link>
          <div className="text-xs text-muted">{timeAgo(post.createdAt)}</div>
        </div>
      </div>
      {post.text && (
        <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{post.text}</p>
      )}
      {post.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.imageUrl}
          alt=""
          className="mt-3 max-h-[480px] w-full rounded-lg border border-line object-cover"
        />
      )}
      <div className="mt-4 flex items-center gap-5 border-t border-line pt-3 text-sm">
        <button
          type="button"
          onClick={() => onLike(post.id)}
          className={`font-medium ${post.likedByMe ? "text-maroon" : "text-muted hover:text-maroon"}`}
        >
          {post.likedByMe ? "♥" : "♡"} {post.likeCount > 0 ? post.likeCount : ""} Like
        </button>
        <button
          type="button"
          onClick={() => setOpenComments((v) => !v)}
          className="font-medium text-muted hover:text-ink"
        >
          💬 {post.commentCount > 0 ? post.commentCount : ""} Comment
        </button>
      </div>
      <PostComments postId={post.id} open={openComments} />
    </Card>
  );
}

export function FeedClient({ me }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [highlightedId, setHighlightedId] = useState(null);
  const fileRef = useRef(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't load the feed.");
        return;
      }
      setPosts(data.posts);
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Coming from a notification like "so-and-so commented on your post" —
  // jump to and briefly highlight that exact post.
  useEffect(() => {
    if (loading || posts.length === 0) return;
    const hash = window.location.hash;
    if (!hash.startsWith("#post-")) return;
    const id = hash.replace("#post-", "");
    const el = document.getElementById(`post-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedId(id);
    const timeout = setTimeout(() => setHighlightedId(null), 2500);
    return () => clearTimeout(timeout);
  }, [loading, posts]);

  async function handleImagePick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) setImageUrl(data.url);
    } finally {
      setImageUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handlePost(e) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed && !imageUrl) return;
    setPosting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, imageUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setPosts((p) => [data.post, ...p]);
        setDraft("");
        setImageUrl("");
      }
    } finally {
      setPosting(false);
    }
  }

  async function handleLike(id) {
    setPosts((p) =>
      p.map((post) =>
        post.id === id
          ? {
              ...post,
              likedByMe: !post.likedByMe,
              likeCount: post.likeCount + (post.likedByMe ? -1 : 1),
            }
          : post
      )
    );
    await fetch(`/api/posts/${id}/like`, { method: "POST" });
  }

  return (
    <div className="mt-8">
      <Card className="p-5">
        <form onSubmit={handlePost}>
          <div className="flex gap-3">
            <Avatar name={me.name} photoUrl={me.photoUrl} size={40} />
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Share something with fellow Maharajians…"
              rows={3}
              className="flex-1 resize-none rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-maroon/50 focus:ring-2 focus:ring-maroon/10"
            />
          </div>
          {imageUrl && (
            <div className="relative ml-[52px] mt-3 inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="" className="max-h-56 rounded-lg border border-line" />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white"
              >
                <X size={13} />
              </button>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={imageUploading}
              className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-maroon disabled:opacity-50"
            >
              <ImagePlus size={16} />
              {imageUploading ? "Uploading…" : "Photo"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleImagePick}
              className="hidden"
            />
            <Button type="submit" size="md" disabled={posting || imageUploading || (!draft.trim() && !imageUrl)}>
              {posting ? "Posting…" : "Post"}
            </Button>
          </div>
        </form>
      </Card>

      <div className="mt-6 space-y-4">
        {loading && <p className="text-sm text-muted">Loading…</p>}
        {error && <p className="text-sm text-maroon">{error}</p>}
        {!loading && !error && posts.length === 0 && (
          <p className="text-sm text-muted">
            Nobody&rsquo;s posted yet — be the first Maharajian to share something.
          </p>
        )}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={handleLike}
            highlighted={highlightedId === String(post.id)}
          />
        ))}
      </div>
    </div>
  );
}
