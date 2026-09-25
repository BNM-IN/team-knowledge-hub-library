"use client";

import { useRouter } from "next/navigation";
import { forwardRef, useState, useTransition } from "react";
import { createNoteAction } from "@/lib/actions";
import type { Group, Visibility } from "@/lib/types";
import { useDraft } from "@/lib/use-draft";
import { MAX_NOTE, MarkdownEditor, noteBodyError } from "./markdown-editor";
import { useToast } from "./toast";
import { btn, Icon } from "./ui";
import { VisibilityHelper, VisibilitySegmented } from "./visibility";

export function DraftBanner({ from, onDiscard }: { from: string; onDiscard: () => void }) {
  return (
    <div role="status" className="flex items-center gap-2.5 rounded-[10px] border border-line bg-surface-2 px-3 py-2.5 text-[13px]">
      <Icon name="history" size={18} className="text-accent-text" />
      <span className="flex-1">
        <strong className="font-semibold">Restored unsaved draft</strong> <span className="text-ink-2">from {from}</span>
      </span>
      <button type="button" onClick={onDiscard} className={btn("ghost", "sm", "h-7 text-xs")}>
        Discard
      </button>
    </div>
  );
}

/** Inline note composer: "Add a note" under an answer (FR-NOTE-01a) or "Post a note" on a group page. */
export const NoteComposer = forwardRef<HTMLDivElement, {
  groups: Group[];
  defaultGroupId: string | null;
  answerId?: string | null;
  draftKey: string;
  title?: string;
  linked?: boolean;
  lockGroup?: boolean;
}>(function NoteComposer({ groups, defaultGroupId, answerId = null, draftKey, title = "Add a note", linked, lockGroup }, ref) {
  const draft = useDraft(draftKey, "");
  const [visibility, setVisibility] = useState<Visibility>(groups.length ? "group" : "private");
  const [groupId, setGroupId] = useState<string | null>(defaultGroupId ?? groups[0]?.id ?? null);
  const [attempted, setAttempted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, start] = useTransition();
  const router = useRouter();
  const toast = useToast();

  const error = serverError ?? noteBodyError(draft.value, attempted);
  const tooLong = draft.value.length > MAX_NOTE;

  const save = () => {
    setAttempted(true);
    if (!draft.value.trim() || tooLong) return;
    start(async () => {
      const res = await createNoteAction({ body: draft.value, visibility, groupId: visibility === "group" ? groupId : null, answerId });
      if (!res.ok) return setServerError(res.error);
      toast(res.value.visibility === "group" ? { icon: "hexagon", message: `Saved to ${res.value.groupName}` } : { icon: "lock", message: "Saved as private" });
      draft.clear();
      draft.setValue("");
      setAttempted(false);
      router.refresh();
    });
  };

  return (
    <div ref={ref} className="flex flex-col gap-3">
      {draft.restoredFrom && <DraftBanner from={draft.restoredFrom} onDiscard={draft.discard} />}
      <MarkdownEditor
        compact
        value={draft.value}
        onChange={(v) => {
          draft.setValue(v);
          setServerError(null);
        }}
        error={error}
        label={title}
        header={
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <span className="flex-1 text-sm font-semibold">{title}</span>
            {linked && (
              <span className="flex items-center gap-1 text-xs text-ink-3">
                <Icon name="link" size={14} />
                Linked to this answer
              </span>
            )}
          </div>
        }
      />
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          {lockGroup ? (
            <span className="inline-flex h-8 items-center gap-1.5 rounded-[10px] border border-line bg-surface-2 px-2.5 text-[13px] font-medium">
              <Icon name="hexagon" size={16} className="text-accent-text" />
              Posting to {groups.find((g) => g.id === groupId)?.name}
            </span>
          ) : (
            <VisibilitySegmented
              visibility={visibility}
              groupId={groupId}
              groups={groups}
              size="sm"
              onChange={(v, g) => {
                setVisibility(v);
                if (g) setGroupId(g);
              }}
            />
          )}
          <span className="flex-1" />
          {draft.value && (
            <button type="button" className={btn("ghost", "sm", "h-[34px]")} onClick={draft.discard}>
              Cancel
            </button>
          )}
          <button type="button" onClick={save} disabled={saving || tooLong} aria-busy={saving} className={btn("primary", "sm", "h-[34px] px-3.5")}>
            {saving && <Icon name="progress_activity" size={16} className="spin" />}
            {saving ? "Saving…" : lockGroup ? "Post note" : "Save note"}
          </button>
        </div>
        {!lockGroup && <VisibilityHelper visibility={visibility} noGroups={!groups.length} />}
      </div>
    </div>
  );
});
