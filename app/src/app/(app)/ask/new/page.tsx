import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/app-shell";
import { AskRunner } from "@/components/ask-runner";
import { getData } from "@/lib/data";

export const metadata: Metadata = { title: "Asking" };

export default async function AskNewPage({ searchParams }: { searchParams: Promise<{ q?: string; scope?: string }> }) {
  const { q, scope } = await searchParams;
  const question = (q ?? "").trim();
  if (question.length < 3) redirect("/");
  const data = await getData();
  const group = scope ? await data.group(scope) : null;

  return (
    <>
      <TopBar title="Answer" ask="Ask another question…" />
      <div className="flex justify-center px-4 pb-20 pt-10 md:px-8 md:pt-14">
        {/* key: a new question remounts the runner and starts a fresh request */}
        <AskRunner key={`${question}|${group?.id ?? ""}`} question={question.slice(0, 500)} scopeGroupId={group?.id ?? null} scopeName={group?.name ?? "All knowledge"} />
      </div>
    </>
  );
}
