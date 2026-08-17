import Link from "next/link";
import { requirePageUser } from "@/lib/pageAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChangePasswordClient } from "@/components/me/ChangePasswordClient";

export default async function ChangePasswordPage() {
  await requirePageUser();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-md px-6 py-12">
        <Link href="/me/profile" className="text-sm text-muted hover:text-ink">
          ← Back to my profile
        </Link>

        <h1 className="mt-4 font-display text-[28px] text-ink">Change password</h1>
        <p className="mt-1.5 text-sm text-muted">
          If an admin gave you a temporary password, this is where you pick your own.
        </p>

        <ChangePasswordClient />
      </main>
      <Footer />
    </>
  );
}
