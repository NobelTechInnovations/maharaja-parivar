"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function GuestFollowButton({ profilePath }) {
  const router = useRouter();

  return (
    <Button
      variant="primary"
      size="md"
      onClick={() => router.push(`/login?next=${encodeURIComponent(profilePath)}`)}
    >
      Follow
    </Button>
  );
}
