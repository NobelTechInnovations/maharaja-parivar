import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession, clearSessionCookie } from "@/lib/auth";
import { ensureDatabaseConnected } from "@/lib/db";
import User from "@/models/User";
import AlumniProfile from "@/models/AlumniProfile";
import Follow from "@/models/Follow";
import Connection from "@/models/Connection";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ProfileActions } from "@/components/alumni/ProfileActions";
import { GuestFollowButton } from "@/components/alumni/GuestFollowButton";

export default async function AlumniProfilePage({ params }) {
  const { id } = await params;
  const profilePath = `/alumni/${id}`;

  try {
    await ensureDatabaseConnected();
  } catch {
    redirect(`/login?next=${encodeURIComponent(profilePath)}`);
  }

  const session = await getSession();
  let me = session ? await User.findById(session.sub) : null;

  // A stale/invalid session cookie (deleted account, or a token from
  // before JWT_SECRET changed) — this page supports guests anyway, so
  // just clear the cookie and fall through as one rather than bouncing
  // someone to /login who thinks they're already signed in.
  if (session && !me) {
    await clearSessionCookie();
    me = null;
  }

  if (me && String(id) === String(me._id)) redirect("/me/profile");

  const target = await User.findById(id)
    .select("name photoUrl verificationStatus phone email")
    .lean()
    .catch(() => null);
  if (!target || target.verificationStatus !== "verified") notFound();

  const profile = await AlumniProfile.findOne({ userId: id }).lean();
  const isPublicProfile = profile?.isPublic !== false;

  // Guests (no session) can only see public profiles.
  if (!me) {
    if (!isPublicProfile) redirect(`/login?next=${encodeURIComponent(profilePath)}`);
  } else if (me.verificationStatus !== "verified") {
    redirect("/pending");
  }

  const followerCount = await Follow.countDocuments({ followingId: id });

  let isFollowing = false;
  let initialConnection = null;
  if (me) {
    const [followDoc, connectionDoc] = await Promise.all([
      Follow.exists({ followerId: me._id, followingId: id }),
      Connection.findOne({
        $or: [
          { fromUser: me._id, toUser: id },
          { fromUser: id, toUser: me._id },
        ],
      }).lean(),
    ]);
    isFollowing = Boolean(followDoc);

    if (connectionDoc) {
      initialConnection = {
        id: String(connectionDoc._id),
        status: connectionDoc.status,
        direction: String(connectionDoc.fromUser) === String(me._id) ? "sent" : "received",
      };
      if (connectionDoc.status === "accepted") {
        const theirShares = connectionDoc.contactShares?.[String(id)] || [];
        initialConnection.theirPhone = theirShares.includes("phone") ? target.phone : undefined;
        initialConnection.theirEmail = theirShares.includes("email") ? target.email : undefined;
      }
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link href={me ? "/discover" : "/"} className="text-sm text-muted hover:text-ink">
          {me ? "← Back to directory" : "← Back to Maharaja Parivaar"}
        </Link>

        <Card className="mt-4 p-7 sm:p-9">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <Avatar name={target.name} photoUrl={target.photoUrl} size={72} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl text-ink">{target.name}</h1>
                <Badge tone="verified">Maharaja Alumni ✓</Badge>
              </div>
              <p className="mt-1 text-sm text-muted">
                {profile?.course || "Maharaja College"}
                {profile?.passingYear ? ` · Batch ${profile.passingYear}` : ""}
              </p>
              {profile?.currentCity && (
                <p className="mt-0.5 text-sm text-muted">
                  {profile.currentCity}
                  {profile.currentState ? `, ${profile.currentState}` : ""}
                </p>
              )}
              <p className="mt-1.5 text-xs text-muted">
                {followerCount} {followerCount === 1 ? "follower" : "followers"}
              </p>
            </div>
          </div>

          {profile?.bio && (
            <p className="mt-6 text-[15px] leading-relaxed text-muted">{profile.bio}</p>
          )}

          <div className="mt-6 grid gap-5 border-t border-line pt-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Maharaja College
              </p>
              <p className="mt-1 text-sm text-ink">
                {profile?.course || "—"}
                {profile?.admissionYear && profile?.passingYear
                  ? ` · ${profile.admissionYear}–${profile.passingYear}`
                  : ""}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Home town</p>
              <p className="mt-1 text-sm text-ink">
                {profile?.homeTown
                  ? `${profile.homeTown}${profile.homeState ? `, ${profile.homeState}` : ""}`
                  : "—"}
              </p>
            </div>
            {profile?.profession && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Profession
                </p>
                <p className="mt-1 text-sm text-ink">
                  {profile.profession}
                  {profile.organization ? ` · ${profile.organization}` : ""}
                </p>
                {profile?.designation && (
                  <p className="mt-0.5 text-sm text-muted">{profile.designation}</p>
                )}
              </div>
            )}
            {(profile?.department || profile?.hostelStatus) && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Stream &amp; hostel status
                </p>
                <p className="mt-1 text-sm text-ink">
                  {[profile?.department, profile?.hostelStatus].filter(Boolean).join(" · ")}
                </p>
              </div>
            )}
          </div>

          {me ? (
            <ProfileActions
              targetId={String(target._id)}
              targetName={target.name}
              initialFollow={{ isFollowing, followerCount }}
              initialConnection={initialConnection}
            />
          ) : (
            <div className="mt-8 border-t border-line pt-6">
              <GuestFollowButton profilePath={profilePath} />
              <p className="mt-3 text-xs text-muted">
                Log in to follow {target.name.split(" ")[0]}, connect, and message —
                phone numbers and addresses are never shown on a profile, guest or
                member, unless this person has chosen to share them with you directly.
              </p>
            </div>
          )}
        </Card>
      </main>
      <Footer />
    </>
  );
}
