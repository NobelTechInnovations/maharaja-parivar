import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { ensureDatabaseConnected } from "@/lib/db";
import User from "@/models/User";
import AlumniProfile from "@/models/AlumniProfile";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";

export default async function MyProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await ensureDatabaseConnected();
  const me = await User.findById(session.sub).lean();
  if (!me) redirect("/login");

  const profile = await AlumniProfile.findOne({ userId: me._id }).lean();

  const statusTone =
    me.verificationStatus === "verified"
      ? "verified"
      : me.verificationStatus === "rejected"
        ? "neutral"
        : "pending";
  const statusLabel =
    me.verificationStatus === "verified"
      ? "Maharaja Alumni ✓"
      : me.verificationStatus === "rejected"
        ? "Not approved"
        : "Pending review";

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-[28px] text-ink">My profile</h1>
          <Button href="/profile/setup" variant="secondary" size="md">
            Edit profile
          </Button>
        </div>

        <Card className="mt-6 p-7 sm:p-9">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <Avatar name={me.name} photoUrl={me.photoUrl} size={72} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-2xl text-ink">{me.name}</h2>
                <Badge tone={statusTone}>{statusLabel}</Badge>
                {profile && !profile.isPublic && <Badge tone="neutral">Private profile</Badge>}
              </div>
              <p className="mt-1 text-sm text-muted">
                {profile?.course || "Course not added yet"}
                {profile?.passingYear ? ` · Batch ${profile.passingYear}` : ""}
              </p>
              {profile?.currentCity && (
                <p className="mt-0.5 text-sm text-muted">
                  {profile.currentCity}
                  {profile.currentState ? `, ${profile.currentState}` : ""}
                </p>
              )}
            </div>
          </div>

          {me.verificationStatus === "pending" && (
            <p className="mt-6 rounded-lg bg-sandstone/15 px-3.5 py-2.5 text-sm text-[#7a5c22]">
              Your account is still waiting on the founder&rsquo;s review — you can fill in
              your profile in the meantime, it just won&rsquo;t be visible to other
              Maharajians yet.
            </p>
          )}

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
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Profession</p>
              <p className="mt-1 text-sm text-ink">
                {profile?.profession
                  ? `${profile.profession}${profile.organization ? ` · ${profile.organization}` : ""}`
                  : "—"}
              </p>
              {profile?.designation && (
                <p className="mt-0.5 text-sm text-muted">{profile.designation}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Stream &amp; hostel status
              </p>
              <p className="mt-1 text-sm text-ink">
                {[profile?.department, profile?.hostelStatus].filter(Boolean).join(" · ") || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Contact (only ever shared by you, per connection)
              </p>
              <p className="mt-1 text-sm text-ink">
                {me.email}
                {me.phone ? ` · ${me.phone}` : ""}
              </p>
            </div>
          </div>
        </Card>

        <p className="mt-4 text-sm text-muted">
          Manage who can see your profile in the directory, and share your contact details
          per-connection, from{" "}
          <Link href="/connections" className="text-maroon hover:underline">
            your connections page
          </Link>
          .
        </p>
      </main>
      <Footer />
    </>
  );
}
