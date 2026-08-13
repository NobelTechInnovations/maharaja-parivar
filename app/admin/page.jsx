import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ensureDatabaseConnected } from "@/lib/db";
import User from "@/models/User";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AdminClient } from "@/components/admin/AdminClient";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await ensureDatabaseConnected();
  const me = await User.findById(session.sub);
  if (!me || me.role !== "admin") redirect("/");

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[60vh] max-w-5xl px-6 py-12">
        <h1 className="font-display text-[28px] text-ink">Verification queue</h1>
        <p className="mt-1.5 text-sm text-muted">
          Every new Maharajian waits here until you personally approve them.
        </p>
        <AdminClient />
      </main>
      <Footer />
    </>
  );
}
