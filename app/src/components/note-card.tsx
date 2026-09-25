import Link from "next/link";
import { excerpt, initials, noteTitle, relativeDate } from "@/lib/format";
import type { Note } from "@/lib/types";
import { CategoryChip, StatusChip, Tags, VisibilityBadge } from "./chips";
import { RetryOrganise } from "./retry-organise";
import { Avatar, cn } from "./ui";

/** Group feed / "Latest in your groups" card: group, title, first lines, author · category · date. */
export function FeedNoteCard({ note, showGroup = true, highlight }: { note: Note; showGroup?: boolean; highlight?: boolean }) {
  return (
    <Link
      href={`/notes/${note.id}`}
      className={cn("flex flex-col gap-2.5 rounded-card border border-line bg-surface p-4 text-ink hover:border-line-strong", highlight && "flash")}
    >
      {showGroup && <VisibilityBadge visibility="group" groupName={note.groupName} size="sm" />}
      <span className="text-[15px] font-semibold leading-[21px]">{noteTitle(note)}</span>
      <span className="font-read text-sm leading-[21px] text-ink-2">{excerpt(note.title ? note.body : note.body.split("\n").slice(1).join("\n"), 140)}</span>
      <span className="mt-auto flex flex-wrap items-center gap-2 text-xs text-ink-3">
        <Avatar initials={initials(note.authorName)} size={20} />
        <span className="text-ink-2">{note.authorName}</span>
        {note.category && <span>· {note.category}</span>}
        <span>· {relativeDate(note.updatedAt)}</span>
      </span>
    </Link>
  );
}

/** My notes card (FR-LIB-01): visibility, date, title, first line, category, tags, "from: <question>", status. */
export function MyNoteCard({ note }: { note: Note }) {
  const pending = note.organiseStatus === "pending";
  const failed = note.organiseStatus === "failed";
  return (
    <div className="relative flex flex-col gap-2.5 rounded-card border border-line bg-surface p-4 hover:border-line-strong">
      <div className="flex items-center justify-between gap-2">
        <VisibilityBadge visibility={note.visibility} groupName={note.groupName} size="sm" />
        <span className="text-xs text-ink-3">{relativeDate(note.updatedAt)}</span>
      </div>
      <Link href={`/notes/${note.id}`} className={cn("text-[15px] font-semibold leading-[21px] after:absolute after:inset-0", !note.title && "text-ink-2")}>
        {noteTitle(note)}
      </Link>
      {pending ? (
        <>
          <div className="flex flex-col gap-1.5" aria-hidden>
            <div className="skeleton h-2.5 w-[90%]" />
            <div className="skeleton h-2.5 w-[60%]" />
          </div>
          <div>
            <StatusChip status="organising" size="sm" />
          </div>
        </>
      ) : failed ? (
        <>
          <div className="relative z-10 flex flex-wrap items-center gap-2">
            <StatusChip status="failed" size="sm" label="Couldn't organise this note" />
            <RetryOrganise noteId={note.id} />
          </div>
          <div className="text-xs text-ink-3">Saved. Not used in answers until organised.</div>
        </>
      ) : (
        <>
          <div className="font-read text-sm leading-[21px] text-ink-2">{excerpt(note.body, 140)}</div>
          <div className="flex flex-wrap items-center gap-2">
            {note.category && <CategoryChip category={note.category} size="sm" />}
            <Tags tags={note.tags} size="sm" />
          </div>
        </>
      )}
      {note.answerQuestion && <div className="border-t border-line pt-2.5 text-xs text-ink-3">from: {note.answerQuestion}</div>}
    </div>
  );
}
