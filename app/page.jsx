import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { getSession } from "@/lib/auth";
import { ensureDatabaseConnected } from "@/lib/db";
import AlumniProfile from "@/models/AlumniProfile";
import Follow from "@/models/Follow";
import {
  MapPin,
  ShieldCheck,
  Users,
  MessageCircle,
  Search,
  UserCheck,
  Handshake,
} from "lucide-react";

const pillars = [
  {
    icon: ShieldCheck,
    title: "You're never really a stranger here",
    body: "Every profile is read and checked by hand before it goes live, so the person you find is exactly who they say they are.",
  },
  {
    icon: Search,
    title: "Search the way you'd ask a friend",
    body: "By city, by batch, by what someone does today — not just a name you might not remember after twenty years.",
  },
  {
    icon: MessageCircle,
    title: "Your number stays yours",
    body: "Nothing personal goes anywhere until you say so. Connect first, message, and decide later what to share.",
  },
  {
    icon: Users,
    title: "A family that keeps in touch",
    body: "Photos, updates and everyday moments from Maharajians — shared just among us, not the whole internet.",
  },
];

const steps = [
  {
    icon: UserCheck,
    title: "Sign up, then tell us your story",
    body: "A minute to create an account, a little longer to add your batch, course and where you are today.",
  },
  {
    icon: Search,
    title: "Search and discover",
    body: "Filter by city, batch or profession to find fellow Maharajians near you, right now.",
  },
  {
    icon: Handshake,
    title: "Connect and meet",
    body: "Send a request, message once connected, and share contact details only when you're ready to.",
  },
];

const faqs = [
  {
    q: "Is Maharaja Parivar official?",
    a: "No — it's an independent, alumni-run community project. It isn't operated by Maharaja College or the University of Rajasthan.",
  },
  {
    q: "Who can join?",
    a: "Anyone who has studied at Maharaja College — any course, any batch, any year.",
  },
  {
    q: "Is it free?",
    a: "Yes. Joining and using Maharaja Parivar doesn't cost anything.",
  },
  {
    q: "How does verification actually work?",
    a: "Our team checks the college details you provide before your profile becomes visible to anyone else.",
  },
  {
    q: "Will my phone number or address be public?",
    a: "No. They stay private by default and are only shared with someone once you've connected and you've chosen to share them.",
  },
];

async function getFeaturedAlumni(excludeUserId) {
  try {
    await ensureDatabaseConnected();
  } catch {
    return [];
  }

  const profiles = await AlumniProfile.find({ isPublic: { $ne: false } })
    .populate({ path: "userId", select: "name photoUrl verificationStatus" })
    .sort({ createdAt: -1 })
    .limit(24)
    .lean();

  const candidates = profiles.filter(
    (p) =>
      p.userId &&
      p.userId.verificationStatus === "verified" &&
      String(p.userId._id) !== String(excludeUserId)
  );

  const ranked = await Promise.all(
    candidates.map(async (p) => ({
      id: p.userId._id,
      name: p.userId.name,
      photoUrl: p.userId.photoUrl,
      passingYear: p.passingYear,
      course: p.course,
      currentCity: p.currentCity,
      currentState: p.currentState,
      profession: p.profession,
      organization: p.organization,
      followerCount: await Follow.countDocuments({ followingId: p.userId._id }),
    }))
  );

  ranked.sort((a, b) => b.followerCount - a.followerCount);
  return ranked.slice(0, 4);
}

export default async function HomePage() {
  const session = await getSession();
  const featured = await getFeaturedAlumni(session?.sub);

  return (
    <>
      <Navbar />

      <main>
        {/* Hero */}
        <section
          className="relative overflow-hidden"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(33,28,20,0.6) 0%, rgba(33,28,20,0.78) 100%), radial-gradient(1100px 480px at 15% -10%, rgba(138,46,42,0.3), transparent 60%), radial-gradient(900px 420px at 100% 0%, rgba(31,58,92,0.3), transparent 55%), url('/images/campus-hero1.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Monogram watermark — stands in for the college crest until a
              real campus photo is dropped into public/images/campus-hero.jpg */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 top-1/2 hidden -translate-y-1/2 select-none font-display text-[420px] leading-none text-white/[0.06] sm:block"
          >
            M
          </span>

          <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-16 sm:pb-32 sm:pt-24">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-wide text-white/70">
                University Maharaja&rsquo;s College, Jaipur
              </p>
              <h1 className="mt-4 font-display text-[clamp(2.4rem,6vw,3.6rem)] leading-[1.08] text-white text-balance">
                Maharaja Parivar
              </h1>
              <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-white/85">
                Once a Maharajian, always family. Find your batch, your city, your
                people — wherever life has taken you.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button href="/register" size="lg">
                  Join the Parivar
                </Button>
                <Button href="/login" variant="secondary" size="lg">
                  Already a member? Log in
                </Button>
              </div>

              <div className="mt-6 flex items-center gap-2 text-sm text-white/70">
                <MapPin size={15} />
                Every new member is welcomed in personally — registrations are
                reviewed before an account goes live.
              </div>
            </div>
          </div>

          {/* Arcade-arch frieze, echoing the college's own arched corridors */}
          <svg
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-10 w-full opacity-[0.12]"
            viewBox="0 0 400 40"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern id="arches" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M0,40 L0,22 A20,20 0 0 1 40,22 L40,40"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                />
              </pattern>
            </defs>
            <rect width="400" height="40" fill="url(#arches)" />
          </svg>
        </section>

        {/* Featured alumni — real, public, verified profiles only; hidden
            entirely until there's at least one to show */}
        {featured.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-display text-[28px] text-ink">Meet some Maharajians</h2>
                <p className="mt-1.5 max-w-xl text-[15px] text-muted">
                  A few verified members of the Parivar, publicly listed in the directory.
                </p>
              </div>
              <Link
                href="/discover"
                className="hidden shrink-0 text-sm font-medium text-maroon hover:underline sm:inline"
              >
                Search the full directory →
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((person) => (
                <Card key={person.id} className="p-5">
                  <div className="flex items-center gap-3">
                    <Avatar name={person.name} photoUrl={person.photoUrl} size={44} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-ink">{person.name}</div>
                      <div className="truncate text-xs text-muted">
                        {person.course || "Maharaja College"}
                        {person.passingYear ? ` · Batch ${person.passingYear}` : ""}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-0.5 text-sm text-muted">
                    {person.profession && <div className="truncate">{person.profession}</div>}
                    {person.currentCity && (
                      <div className="truncate">
                        {person.currentCity}
                        {person.currentState ? `, ${person.currentState}` : ""}
                      </div>
                    )}
                    <div className="text-xs text-muted/80">
                      {person.followerCount} {person.followerCount === 1 ? "follower" : "followers"}
                    </div>
                  </div>
                  <Link
                    href={`/alumni/${person.id}`}
                    className="mt-4 inline-block text-sm font-medium text-maroon hover:underline"
                  >
                    View profile →
                  </Link>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Pillars */}
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map(({ icon: Icon, title, body }) => (
              <Card key={title} className="p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-maroon-soft text-maroon">
                  <Icon size={18} />
                </span>
                <h3 className="mt-4 text-[15px] font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-y border-line/70 bg-panel-soft">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <h2 className="font-display text-[28px] text-ink">How it works</h2>
            <p className="mt-2 max-w-xl text-[15px] text-muted">
              Three steps between signing up and meeting a fellow Maharajian in your city.
            </p>

            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {steps.map(({ icon: Icon, title, body }, i) => (
                <div key={title} className="relative">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-white">
                      <Icon size={16} />
                    </span>
                    <span className="font-display text-2xl text-line">0{i + 1}</span>
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold text-ink">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why we built this */}
        <section id="about" className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-start">
            <div className="lg:sticky lg:top-24">
              <p className="text-xs font-medium uppercase tracking-wide text-maroon-soft">
                From the Association
              </p>
              <h2 className="mt-2 font-display text-[28px] text-ink text-balance">
                Why we built Maharaja Parivar
              </h2>
              <div className="mt-6 flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-maroon font-display text-sm text-white">
                  MCBS
                </span>
                <div>
                  <div className="text-sm font-medium text-ink">Maharaja College Buddies Samiti</div>
                  <div className="text-sm text-muted">Founder &amp; steward of Maharaja Parivar</div>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-[15px] leading-relaxed text-muted">
              <p>
                Maharaja College gave a lot of us the same thing, whatever year we
                passed out in: a few years in those corridors, and then a few
                thousand people scattered across the country who all shared them.
                After that, most of us lost touch — not because we wanted to, just
                because there was never a proper way to find each other again.
              </p>
              <p>
                As the Maharaja College Buddies Samiti, we hear the same story constantly:
                a Maharajian meeting another one by pure chance, usually in a city far
                from Jaipur, and both of them thinking it should have been easier than
                luck. That&rsquo;s the whole idea behind this platform — if you studied
                at Maharaja College, there should be a simple way to find out who else
                from your college is near you today, and to trust that the person you
                find is genuinely who they say they are.
              </p>
              <p>
                That&rsquo;s why every account here is checked before it goes live, and
                why nobody&rsquo;s phone number or address is ever shared without their
                say-so. We want this to stay small enough to feel like family, even as
                it grows. If you&rsquo;re a Maharajian, this is yours as much as it is
                ours — come find your people.
              </p>
              <p className="pt-1 font-display text-base text-ink">
                — Maharaja College Buddies Samiti
              </p>
            </div>
          </div>
        </section>

        {/* Gokhale Hostel */}
        <section className="border-y border-line/70 bg-panel-soft">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <p className="text-xs font-medium uppercase tracking-wide text-maroon-soft">
              Campus life
            </p>
            <h2 className="mt-2 font-display text-[28px] text-ink">
              Gokhale Hostel, Maharaja College
            </h2>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
              <div className="aspect-video overflow-hidden rounded-xl border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/gokhale-hostel.avif"
                  alt="Gokhale Hostel, Maharaja College"
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <p className="text-[15px] leading-relaxed text-muted">
                  For generations of Maharajians who came to Jaipur from outside the
                  city, Gokhale Hostel was home. Built on the college campus decades
                  ago, it&rsquo;s a two-storey residence of single- and double-occupancy
                  rooms that has housed thousands of students over the years — a place
                  as many alumni remember as vividly as their classrooms.
                </p>
                <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted">Capacity</dt>
                    <dd className="mt-0.5 text-ink">~220 students</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted">Rooms</dt>
                    <dd className="mt-0.5 text-ink">45 double · 70 single</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted">Dining</dt>
                    <dd className="mt-0.5 text-ink">Cooperative mess hall</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted">Recreation</dt>
                    <dd className="mt-0.5 text-ink">Reading room, TV lounge, volleyball court</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* What Maharaja College means to us */}
        <section className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-20">
          <p className="text-xs font-medium uppercase tracking-wide text-maroon-soft">
            Our college
          </p>
          <h2 className="mt-2 font-display text-[28px] text-ink">
            What Maharaja College means to us
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
            Maharaja College isn&rsquo;t just where many of us studied — it&rsquo;s one
            of Rajasthan&rsquo;s oldest institutions, tracing back to 1844, and its
            classrooms have shaped doctors, judges, civil servants, scholars, and even
            a former Vice President of India. That history is part of why Maharajians
            feel a pull toward each other decades after graduating: we didn&rsquo;t
            just share a college, we share what it stood for — rigour, service, and a
            particular kind of belonging that&rsquo;s hard to explain to anyone who
            wasn&rsquo;t there.
          </p>
        </section>

        {/* Mission & Vision */}
        <section className="mx-auto max-w-6xl px-6 pb-16 sm:pb-20">
          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="p-7">
              <h3 className="font-display text-lg text-ink">Our mission</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-muted">
                To help every Maharaja College alumnus find, trust, and reconnect
                with fellow Maharajians — wherever they are — through a verified,
                privacy-first community built and stewarded by the Maharaja Alumni
                Association.
              </p>
            </Card>
            <Card className="p-7">
              <h3 className="font-display text-lg text-ink">Our vision</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-muted">
                A Maharaja Parivar large enough to have a Maharajian in every city
                worth visiting, and small enough that every single one of them is
                genuinely who they say they are.
              </p>
            </Card>
          </div>
        </section>

        {/* Why it exists */}
        <section className="border-y border-line/70 bg-panel-soft">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <div className="max-w-2xl">
              <h2 className="font-display text-[28px] text-ink">What this is, and isn&rsquo;t</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                Maharaja Parivar isn&rsquo;t trying to be another social network —
                it&rsquo;s trying to be a smaller, more trustworthy room inside one.
                Three things guide how it&rsquo;s built:
              </p>
            </div>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              <div>
                <h3 className="font-display text-lg text-ink">Verified, not viral</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  No growth hacks, no open sign-up. Every member is a real Maharajian,
                  checked before they can be found.
                </p>
              </div>
              <div>
                <h3 className="font-display text-lg text-ink">Meeting, not metrics</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Following and connecting exist to help you find people, not to turn
                  the Parivar into a numbers game.
                </p>
              </div>
              <div>
                <h3 className="font-display text-lg text-ink">Privacy, always first</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Your details are yours. Nothing personal is visible or shared
                  without your explicit choice.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <h2 className="font-display text-[28px] text-ink">A few questions</h2>
          <div className="mt-8 space-y-4">
            {faqs.map(({ q, a }) => (
              <Card key={q} className="p-5 sm:p-6">
                <h3 className="text-[15px] font-semibold text-ink">{q}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{a}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <Card className="flex flex-col items-start gap-5 bg-navy p-8 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <h2 className="font-display text-[24px]">Are you a Maharajian?</h2>
              <p className="mt-1.5 text-[15px] text-white/80">
                Join the founding cohort and help build the Parivar from the first entry.
              </p>
            </div>
            <Button href="/register" size="lg" variant="invert">
              Join the Parivar
            </Button>
          </Card>
        </section>
      </main>

      <Footer />
    </>
  );
}
