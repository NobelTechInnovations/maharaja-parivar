import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";

const sections = [
  {
    title: "Who this is for",
    body: "Maharaja Parivaar is for people who have genuinely studied at Maharaja's College, Jaipur — any course, any batch, any year. Creating an account under a false identity or on someone else's behalf isn't allowed.",
  },
  {
    title: "Verification",
    body: "Every account is reviewed by the founder before it's visible to anyone else. You're responsible for the accuracy of what you submit — batch, course, and current details. Deliberately false information can get an account rejected or removed.",
  },
  {
    title: "How your information is used",
    body: "Your name, batch, course, and the location/profession details you choose to add are used to power search and your public profile (if you keep it public — you can make it unlisted in Profile settings at any time). Your phone number, email, and address are never shown on your profile and are only ever visible to someone else if you explicitly choose to share them with a connection.",
  },
  {
    title: "Community conduct",
    body: "Be someone another Maharajian would be glad to have found. Harassment, impersonation, spam, unsolicited commercial messages, and using this community to locate someone who doesn't want to be found are all grounds for removal. Report anything that violates this to info@maharajaparivar.in.",
  },
  {
    title: "Your content",
    body: "Posts, photos, and comments you share on the feed are visible to other verified members. Don't post anything you don't have the right to share, and don't post private information about someone else without their consent.",
  },
  {
    title: "Account & data removal",
    body: "You can ask to have your account and data removed at any time by writing to info@maharajaparivar.in. This is an independent, alumni-run project — not an official service of Maharaja's College or the University of Rajasthan.",
  },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <Link href="/register" className="text-sm text-muted hover:text-ink">
          ← Back
        </Link>
        <h1 className="mt-4 font-display text-[28px] text-ink">
          Terms &amp; Community Guidelines
        </h1>
        <p className="mt-2 text-sm text-muted">
          The short version of what joining Maharaja Parivaar means, in plain language.
        </p>

        <div className="mt-8 space-y-4">
          {sections.map((s) => (
            <Card key={s.title} className="p-5 sm:p-6">
              <h2 className="text-[15px] font-semibold text-ink">{s.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.body}</p>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
