"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteNoteAction, updateNoteAction } from "@/lib/actions";
import { dayLabel, initials, noteTitle } from "@/lib/format";
import type { Answer, Group, Note, Visibility } from "@/lib/types";
import { CategoryChip, StatusChip, Tags, VisibilityBadge } from "./chips";
import { JoinGroupButton } from "./citations";
import { Markdown } from "./markdown";
import { Dialog } from "./overlay";
import { OrganisePoller, RetryOrganise } from "./retry-organise";
import { useToast } from "./toast";
import { Avatar, btn, Icon } from "./ui";
import { VisibilitySegmented } from "./visibility";
import type { GroupDetail } from "@/lib/data/types";

/** S6 · note page body. The user's words lead; AI content (linked answer) is secondary and collapsible. */
export function NoteView({ note, isOwner, groups, group, linkedAnswer }: { note: Note; isOwner: boolean; groups: Group[]; group: GroupDetail | null; linkedAnswer: Answer | null }) {
  const [confirm, setConfirm] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();

  const setVisibility = (v: Visibility, g: string | null, undo = true) =>
    start(async () => {
      const prev = { visibility: note.visibility, groupId: note.groupId };
      const res = await updateNoteAction(note.id, { visibility: v, groupId: g });
      if (!res.ok) return toast({ icon: "error", message: res.error });
      router.refresh();
      toast({
        icon: v === "private" ? "lock" : "hexagon",
        message: v === "private" ? "Moved to Private" : `Moved to ${res.value.groupName}`,
        undo: undo ? () => setVisibility(prev.visibility, prev.groupId, false) : undefined,
      });
    });

  return (
    <div className="flex w-full max-w-[740px] flex-col gap-7">
      <OrganisePoller active={note.organiseStatus === "pending"} />
      <div className="flex flex-col gap-4">
        <h1 className="m-0 text-[28px] font-semibold leading-9 tracking-[-0.025em] md:text-[34px] md:leading-[42px]">{noteTitle(note)}</h1>
        <div className="flex flex-wrap items-center gap-2.5 text-[13px] text-ink-2">
          <span className="flex items-center gap-2">
            <Avatar initials={initials(note.authorName)} size={26} />
            <strong className="font-semibold text-ink">{isOwner ? "You" : note.authorName}</strong>
          </span>
          <VisibilityBadge visibility={note.visibility} groupName={note.groupName} />
          {note.organiseStatus === "pending" && <StatusChip status="organising" />}
          {note.organiseStatus === "failed" && (
            <>
              <StatusChip status="failed" label="Couldn't organise this note" />
              {isOwner && <RetryOrganise noteId={note.id} />}
            </>
          )}
          {note.category && <CategoryChip category={note.category} />}
          <Tags tags={note.tags} />
          <span suppressHydrationWarning>· Updated {dayLabel(note.updatedAt)}</span>
        </div>
      </div>

      {isOwner && (
        <div className="flex flex-wrap items-center gap-2.5">
          <VisibilitySegmented visibility={note.visibility} groupId={note.groupId} groups={groups} size="sm" onChange={(v, g) => setVisibility(v, g)} />
          <span className="flex-1" />
          <Link href={`/notes/${note.id}/edit`} className={btn("secondary", "sm")}>
            <Icon name="edit" size={16} />
            Edit
          </Link>
          <button type="button" onClick={() => setConfirm(true)} className={btn("ghost", "sm", "text-error hover:text-error")}>
            <Icon name="delete" size={16} />
            Delete
          </button>
        </div>
      )}

      <Markdown className="text-[19px] leading-8">{note.body}</Markdown>

      {note.answerQuestion && (
        <div className="flex flex-col gap-3 border-t border-line pt-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-ink-2">
            <Icon name="forum" size={16} />
            Written under: <span className="text-ink">{note.answerQuestion}</span>
            {linkedAnswer && (
              <>
                <span className="flex-1" />
                <button type="button" aria-expanded={showAnswer} onClick={() => setShowAnswer((s) => !s)} className={btn("ghost", "sm")}>
                  {showAnswer ? "Hide answer" : "Show answer"}
                  <Icon name={showAnswer ? "expand_less" : "expand_more"} size={16} />
                </button>
              </>
            )}
          </div>
          {linkedAnswer && showAnswer && (
            <div className="flex flex-col gap-2 rounded-card border border-line bg-surface-2 p-4">
              <p className="m-0 font-read text-[15px] leading-6 text-ink-2">{linkedAnswer.summary.replace(/\[\d+\]/g, "") || "No answer text was stored."}</p>
              <Link href={`/ask/${linkedAnswer.id}`} className="text-[13px] font-medium text-accent-text hover:underline">
                Open the full answer
              </Link>
            </div>
          )}
        </div>
      )}

      {!isOwner && group && (
        <div className="flex flex-wrap items-center gap-3.5 rounded-card border border-accent-border bg-accent-soft p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-accent-border bg-surface">
            <Icon name="hexagon" size={22} className="text-accent-text" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <Link href={`/groups/${group.id}`} className="text-[15px] font-semibold text-ink hover:underline">
              {group.name}
            </Link>
            <span className="text-[13px] text-ink-2">
              {group.topic ? `${group.topic} · ` : ""}
              {group.memberCount} members
            </span>
          </span>
          {group.isMember ? <StatusChip status="member" /> : <JoinGroupButton groupId={group.id} groupName={group.name} variant="primary" />}
        </div>
      )}

      <Dialog open={confirm} onClose={() => setConfirm(false)} title="Delete this note?" role="alertdialog" width={420}>
        <p className="m-0 text-sm leading-5 text-ink-2">It will also be removed from answers. This can&apos;t be undone.</p>
        <div className="mt-1.5 flex justify-end gap-2">
          <button type="button" className={btn("secondary", "sm", "h-[34px]")} onClick={() => setConfirm(false)} autoFocus>
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            className={btn("danger", "sm", "h-[34px]")}
            onClick={() =>
              start(async () => {
                const res = await deleteNoteAction(note.id);
                if (!res.ok) return toast({ icon: "error", message: res.error });
                setConfirm(false);
                toast({ icon: "delete", message: "Note deleted" });
                router.push("/notes");
                router.refresh();
              })
            }
          >
            Delete note
          </button>
        </div>
      </Dialog>
    </div>
  );
}
