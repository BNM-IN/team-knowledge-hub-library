import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NoteEditor } from "@/components/note-editor";
import { getData } from "@/lib/data";

export const metadata: Metadata = { title: "Edit note" };

export default async function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getData();
  const [note, viewer, groups] = await Promise.all([data.note(id), data.viewer(), data.myGroups()]);
  // Only the owner can edit (PRD section 6); anyone else gets the not-found state.
  if (!note || note.ownerId !== viewer?.id) notFound();
  return <NoteEditor note={note} groups={groups} defaultGroupId={note.groupId ?? groups.find((g) => g.isDefault)?.id ?? null} />;
}
