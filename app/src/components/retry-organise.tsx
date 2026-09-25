"use client";

import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { retryOrganiseAction } from "@/lib/actions";
import { useToast } from "./toast";
import { cn, Icon } from "./ui";

export function RetryOrganise({ noteId }: { noteId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await retryOrganiseAction(noteId);
          if (!res.ok) toast({ icon: "error", message: res.error });
          router.refresh();
        })
      }
      className="inline-flex h-6 cursor-pointer items-center gap-[3px] rounded-chip border border-line-strong bg-surface px-2 text-[11px] font-semibold text-ink hover:bg-surface-2"
    >
      <Icon name="refresh" size={14} className={cn(pending && "spin")} />
      Retry
    </button>
  );
}

/** Re-renders the page while any note is organising, so titles appear without a manual refresh. */
export function OrganisePoller({ active }: { active: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => router.refresh(), 1500);
    return () => clearInterval(t);
  }, [active, router]);
  return null;
}
