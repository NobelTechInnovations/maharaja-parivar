import { redirect } from "next/navigation";
import { requirePageUser } from "@/lib/pageAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AdminClient } from "@/components/admin/AdminClient";
import { AutoApproveToggle } from "@/components/admin/AutoApproveToggle";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";

export default async function AdminPage() {
  const me = await requirePageUser();
  if (me.role !== "admin") redirect("/");

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[60vh] max-w-5xl px-6 py-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-[28px] text-ink">Verification queue</h1>
            <p className="mt-1.5 text-sm text-muted">
              Every new Maharajian waits here until approved.
            </p>
          </div>
          <Button href="/api/admin/export" variant="secondary" size="md">
            <Download size={16} />
            Export to Excel
          </Button>
        </div>
        <AutoApproveToggle />
        <AdminClient />
      </main>
      <Footer />
    </>
  );
}
