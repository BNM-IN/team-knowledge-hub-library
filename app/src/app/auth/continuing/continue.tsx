"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "@/components/ui";
import { demoSignIn } from "@/lib/actions";

export function Continue({ next, mock }: { next: string; mock: boolean }) {
  const router = useRouter();
  useEffect(() => {
    let live = true;
    (async () => {
      if (mock) await demoSignIn();
      // Brief pause so the interstitial reads as a step rather than a flash.
      await new Promise((r) => setTimeout(r, 700));
      if (live) router.replace(next);
    })().catch(() => router.replace(`/signin?reason=failed&next=${encodeURIComponent(next)}`));
    return () => {
      live = false;
    };
  }, [mock, next, router]);

  return (
    <span className="flex items-center gap-2 text-[17px] font-semibold">
      <Icon name="progress_activity" className="spin text-accent-text" />
      Signing you in…
    </span>
  );
}
