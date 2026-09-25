import type { Metadata } from "next";
import { Logo } from "@/components/ui";
import { USE_MOCKS } from "@/lib/config";
import { getData } from "@/lib/data";
import { noteTitle } from "@/lib/format";
import { safeNext } from "@/lib/safe-next";
import { Continue } from "./continue";

export const metadata: Metadata = { title: "Signing you in" };

/** S1 · A2 "Signing you in… Taking you to <place>". */
export default async function ContinuingPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  let place = "Home";
  const noteId = next.match(/^\/notes\/([^/?#]+)$/)?.[1];
  if (noteId && noteId !== "new") {
    const preview = await (await getData()).notePreview(noteId);
    if (preview) place = noteTitle(preview);
  } else if (next.startsWith("/ask")) place = "your answer";
  else if (next.startsWith("/notes")) place = "My notes";
  else if (next.startsWith("/groups")) place = "the group";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-[18px] bg-bg text-ink">
      <Logo size={36} text={false} onBg="var(--bg)" />
      <div role="status" aria-live="polite" className="flex flex-col items-center gap-1.5">
        <Continue next={next} mock={USE_MOCKS} />
        <span className="text-sm text-ink-2">Taking you to {place}</span>
      </div>
    </main>
  );
}
