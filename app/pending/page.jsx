import { redirect } from "next/navigation";
import { requirePageUser } from "@/lib/pageAuth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { Clock } from "lucide-react";

export default async function PendingPage() {
  const user = await requirePageUser();
  if (user.verificationStatus !== "pending") redirect("/");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <Card className="p-8 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-sandstone/20 text-[#7a5c22]">
          <Clock size={20} />
        </span>
        <h1 className="mt-4 text-lg font-semibold text-ink">Your account is under review</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Thanks for joining, {user.name.split(" ")[0]}. The founder reviews every new
          registration by hand to keep the directory genuinely Maharaja College alumni
          only — you&rsquo;ll be notified by email once your profile is verified.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button href="/" variant="secondary" size="md">
            Back to homepage
          </Button>
          <LogoutButton size="md" />
        </div>
      </Card>
    </main>
  );
}
