import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/app-shell";
import { AnswerView } from "@/components/answer-view";
import { getData } from "@/lib/data";

export const metadata: Metadata = { title: "Answer" };

/** S3 · stored answer from ask history, shown without a new AI call (FR-ASK-10). */
export default async function AnswerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getData();
  const [answer, groups] = await Promise.all([data.answer(id), data.myGroups()]);
  if (!answer) notFound();
  const notes = await data.notesForAnswer(id);
  // Default the note to the answer's group scope, else the default group (FR-NOTE-03).
  const defaultGroupId = (answer.scopeGroupId && groups.find((g) => g.id === answer.scopeGroupId)?.id) || groups.find((g) => g.isDefault)?.id || groups[0]?.id || null;

  return (
    <>
      <TopBar title="Answer" ask="Ask another question…" />
      <div className="flex justify-center px-4 pb-20 pt-10 md:px-8 md:pt-14">
        <AnswerView answer={answer} groups={groups} notes={notes} defaultGroupId={defaultGroupId} />
      </div>
    </>
  );
}
