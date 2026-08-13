"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function ProfileActions({ targetId, targetName, initialFollow, initialConnection }) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollow.isFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollow.followerCount);
  const [followBusy, setFollowBusy] = useState(false);

  const [connection, setConnection] = useState(initialConnection);
  const [connectBusy, setConnectBusy] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  async function toggleFollow() {
    setFollowBusy(true);
    try {
      const res = await fetch(`/api/follow/${targetId}`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setFollowing(data.isFollowing);
        setFollowerCount(data.followerCount);
      }
    } finally {
      setFollowBusy(false);
    }
  }

  async function sendConnectRequest() {
    setConnectBusy(true);
    setError("");
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: targetId, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't send the request.");
        return;
      }
      setConnection({ id: data.id, status: "pending", direction: "sent" });
      setShowNote(false);
    } finally {
      setConnectBusy(false);
    }
  }

  async function respond(action) {
    setConnectBusy(true);
    try {
      const res = await fetch(`/api/connections/${connection.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) setConnection((c) => ({ ...c, status: data.status }));
    } finally {
      setConnectBusy(false);
    }
  }

  async function openMessage() {
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ withUserId: targetId }),
    });
    const data = await res.json();
    if (res.ok) router.push(`/messages/${data.id}`);
  }

  return (
    <div className="mt-8 border-t border-line pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant={following ? "secondary" : "primary"}
          size="md"
          disabled={followBusy}
          onClick={toggleFollow}
        >
          {following ? "Following" : "Follow"}
        </Button>
        <span className="text-xs text-muted">
          {followerCount} {followerCount === 1 ? "follower" : "followers"}
        </span>

        <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />

        {!connection && !showNote && (
          <Button variant="secondary" size="md" onClick={() => setShowNote(true)}>
            Connect
          </Button>
        )}

        {connection?.status === "pending" && connection.direction === "sent" && (
          <Button variant="secondary" size="md" disabled>
            Request sent
          </Button>
        )}

        {connection?.status === "pending" && connection.direction === "received" && (
          <>
            <Button size="md" disabled={connectBusy} onClick={() => respond("accept")}>
              Accept request
            </Button>
            <Button variant="secondary" size="md" disabled={connectBusy} onClick={() => respond("decline")}>
              Decline
            </Button>
          </>
        )}

        {connection?.status === "accepted" && (
          <Button variant="secondary" size="md" onClick={openMessage}>
            Message
          </Button>
        )}

        {connection?.status === "declined" && (
          <Button variant="secondary" size="md" onClick={() => setShowNote(true)}>
            Send request again
          </Button>
        )}
      </div>

      {showNote && (
        <div className="mt-3 max-w-md">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={`Say hello to ${targetName.split(" ")[0]}… (optional)`}
            rows={2}
            className="w-full resize-none rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-maroon/50 focus:ring-2 focus:ring-maroon/10"
          />
          <div className="mt-2 flex gap-2">
            <Button size="md" disabled={connectBusy} onClick={sendConnectRequest}>
              {connectBusy ? "Sending…" : "Send request"}
            </Button>
            <Button variant="ghost" size="md" onClick={() => setShowNote(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-maroon">{error}</p>}

      {connection?.status === "accepted" && (connection.theirPhone || connection.theirEmail) && (
        <p className="mt-3 text-sm text-ink">
          {targetName.split(" ")[0]} has shared:{" "}
          {[connection.theirPhone, connection.theirEmail].filter(Boolean).join(" · ")}
        </p>
      )}

      <p className="mt-3 text-xs text-muted">
        {connection?.status === "accepted"
          ? "Phone numbers and addresses are only ever visible if they've chosen to share them with you — never automatically."
          : "Connecting opens messaging. Phone numbers and addresses are never shown on a profile directly, and only shared if the other person chooses to."}
      </p>
    </div>
  );
}
