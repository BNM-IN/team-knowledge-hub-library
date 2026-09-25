import type { Metadata } from "next";
import { NoteEditor } from "@/components/note-editor";
import { getData } from "@/lib/data";

export const metadata: Metadata = { title: "New note" };

/** S4 · /notes/new. `?answer=` links the note to an answer ("Write the first note on this"); `?group=` preselects a group. */
export default async function NewNotePage({ searchParams }: { searchParams: Promise<{ answer?: string; group?: string }> }) {
  const { answer: answerId, group } = await searchParams;
  const data = await getData();
  const [groups, answer] = await Promise.all([data.myGroups(), answerId ? data.answer(answerId) : null]);
  const defaultGroupId =
    (group && groups.find((g) => g.id === group)?.id) ||
    (answer?.scopeGroupId && groups.find((g) => g.id === answer.scopeGroupId)?.id) ||
    groups.find((g) => g.isDefault)?.id ||
    groups[0]?.id ||
    null;
  return <NoteEditor groups={groups} defaultGroupId={defaultGroupId} context={answer ? { answerId: answer.id, question: answer.question } : null} />;
}
