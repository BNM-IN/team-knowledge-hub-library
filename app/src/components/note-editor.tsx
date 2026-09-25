"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createNoteAction, updateNoteAction } from "@/lib/actions";
import { CATEGORIES, type Category } from "@/lib/categories";
import type { Group, Note, Visibility } from "@/lib/types";
import { useDraft } from "@/lib/use-draft";
import { TopBar } from "./app-shell";
import { MAX_NOTE, MarkdownEditor, noteBodyError } from "./markdown-editor";
import { DraftBanner } from "./note-composer";
import { useToast } from "./toast";
import { btn, cn, Icon } from "./ui";
import { GROUP_HELP, PRIVATE_HELP, VisibilityHelper, VisibilitySegmented } from "./visibility";

function TagEditor({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const commit = () => {
    const t = text.trim().toLowerCase().replace(/^#/, "").replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
    if (t && !tags.includes(t) && tags.length < 4) onChange([...tags, t]);
    setText("");
    setAdding(false);
  };
  return (
    <>
      {tags.map((t) => (
        <span key={t} className="inline-flex h-7 items-center gap-0.5 rounded-chip bg-surface-3 pl-2 pr-1 font-mono text-xs font-medium">
          #{t}
          <button type="button" aria-label={`Remove tag ${t}`} onClick={() => onChange(tags.filter((x) => x !== t))} className="flex cursor-pointer items-center rounded text-ink-2 hover:text-ink">
            <Icon name="close" size={14} />
          </button>
        </span>
      ))}
      {adding ? (
        <input
          autoFocus
          value={text}
          aria-label="New tag"
          placeholder="tag"
          maxLength={30}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            }
            if (e.key === "Escape") {
              setText("");
              setAdding(false);
            }
          }}
          className="h-7 w-24 rounded-chip border border-line-strong bg-surface px-2 font-mono text-xs text-ink outline-none"
        />
      ) : (
        tags.length < 4 && (
          <button type="button" onClick={() => setAdding(true)} className="inline-flex h-7 cursor-pointer items-center gap-[3px] rounded-chip border border-dashed border-line-strong px-2 text-xs font-medium text-ink-2 hover:text-ink">
            <Icon name="add" size={14} />
            Tag
          </button>
        )
      )}
    </>
  );
}

/** S4 · /notes/new and /notes/<id>/edit. Document layout with the bounded Markdown editor. */
export function NoteEditor({
  note,
  groups,
  defaultGroupId,
  context,
}: {
  note?: Note;
  groups: Group[];
  defaultGroupId: string | null;
  /** Question the note is written under (from an answer). */
  context?: { answerId: string; question: string } | null;
}) {
  const edit = !!note;
  const draft = useDraft(`nh-draft:${edit ? `note:${note.id}` : `new:${context?.answerId ?? defaultGroupId ?? ""}`}`, note?.body ?? "");
  const [visibility, setVisibility] = useState<Visibility>(note?.visibility ?? (groups.length ? "group" : "private"));
  const [groupId, setGroupId] = useState<string | null>(note?.groupId ?? defaultGroupId ?? groups[0]?.id ?? null);
  const [title, setTitle] = useState(note?.title ?? "");
  const [category, setCategory] = useState<Category | "">(note?.category ?? "");
  const [tags, setTags] = useState<string[]>(note?.tags ?? []);
  const [attempted, setAttempted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, start] = useTransition();
  const router = useRouter();
  const toast = useToast();

  const bodyError = serverError ?? noteBodyError(draft.value, attempted);
  const tooLong = draft.value.length > MAX_NOTE;
  const organised = note?.organiseStatus === "done";
  const writtenUnder = context?.question ?? note?.answerQuestion ?? null;
  const backHref = edit ? `/notes/${note.id}` : context ? `/ask/${context.answerId}` : "/notes";

  const cancel = () => {
    draft.clear();
    router.push(backHref);
  };

  const save = () => {
    setAttempted(true);
    if (!draft.value.trim() || tooLong) return;
    if (edit && organised && !title.trim()) return setServerError("Give the note a title.");
    start(async () => {
      const g = visibility === "group" ? groupId : null;
      const res = edit
        ? await updateNoteAction(note.id, {
            body: draft.value,
            visibility,
            groupId: g,
            ...(organised && title.trim() !== (note.title ?? "") ? { title: title.trim() } : {}),
            ...(organised && category && category !== note.category ? { category } : {}),
            ...(organised && tags.join() !== note.tags.join() ? { tags } : {}),
          })
        : await createNoteAction({ body: draft.value, visibility, groupId: g, answerId: context?.answerId ?? null });
      if (!res.ok) return setServerError(res.error);
      draft.clear();
      toast(
        edit
          ? { icon: "check", message: "Changes saved" }
          : res.value.visibility === "group"
            ? { icon: "hexagon", message: `Saved to ${res.value.groupName}` }
            : { icon: "lock", message: "Saved as private" },
      );
      router.push(`/notes/${res.value.id}`);
      router.refresh();
    });
  };

  const visibilityControl = (
    <VisibilitySegmented
      visibility={visibility}
      groupId={groupId}
      groups={groups}
      pickerAlign="right"
      size="sm"
      onChange={(v, g) => {
        setVisibility(v);
        if (g) setGroupId(g);
        setServerError(null);
      }}
    />
  );

  return (
    <>
      <TopBar
        hideNewNote
        title={
          <span className="flex items-center gap-1.5 text-[15px]">
            <Link href="/notes" className="font-normal text-ink-2 hover:text-ink">
              My notes
            </Link>
            <Icon name="chevron_right" size={16} className="text-ink-3" />
            <span className="font-semibold">{edit ? "Edit note" : "New note"}</span>
          </span>
        }
        actions={
          <>
            <div className="hidden md:flex">{visibilityControl}</div>
            <span className="hidden h-6 w-px bg-line md:block" />
          </>
        }
        trailing={
          <div className="hidden items-center gap-2 md:flex">
              <button type="button" onClick={cancel} className={btn("ghost")}>
                Cancel
              </button>
              <button type="button" onClick={save} disabled={saving || tooLong} aria-busy={saving} className={cn(btn("primary"), "px-4")}>
                {saving && <Icon name="progress_activity" size={16} className="spin" />}
                {saving ? "Saving…" : edit ? "Save changes" : "Save note"}
              </button>
          </div>
        }
      />
      <div className="flex justify-center px-4 pb-24 pt-8 md:px-8 md:pt-11">
        <div className="flex w-full max-w-[740px] flex-col gap-5">
          {draft.restoredFrom && <DraftBanner from={draft.restoredFrom} onDiscard={draft.discard} />}

          <div className="flex flex-col gap-2 md:hidden">
            {visibilityControl}
          </div>
          <div className="flex items-center gap-1.5 text-[13px] text-ink-2">
            {groups.length === 0 ? (
              <VisibilityHelper visibility="private" noGroups />
            ) : (
              <>
                <Icon name={visibility === "group" ? "visibility" : "lock"} size={16} />
                {visibility === "group" ? `${groups.find((g) => g.id === groupId)?.name ?? "Group"} · ${GROUP_HELP}` : `Private · ${PRIVATE_HELP}`}
              </>
            )}
          </div>

          {edit && (
            <>
              {organised ? (
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  aria-label="Title"
                  placeholder="Title"
                  className="w-full border-b border-line bg-transparent pb-1 text-[28px] font-semibold leading-9 tracking-[-0.025em] text-ink outline-none placeholder:text-ink-3 focus:border-line-strong md:text-[34px] md:leading-[42px]"
                />
              ) : (
                <div className="border-b border-line pb-1 text-[28px] font-semibold leading-9 tracking-[-0.025em] text-ink-2 md:text-[34px] md:leading-[42px]">
                  {note.title ?? "Untitled note"}
                  <div className="mt-1 text-[13px] font-normal tracking-normal text-ink-3">
                    {note.organiseStatus === "pending" ? "Organising… title, category and tags will appear shortly." : "Title, category and tags can be edited once the note is organised."}
                  </div>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {organised && (
                  <label className="relative inline-flex h-7 items-center gap-1 rounded-chip border border-line-strong bg-surface pl-2.5 pr-1.5 text-xs font-medium text-ink">
                    <span className="text-ink-3">Category</span>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                      className="cursor-pointer appearance-none bg-transparent pr-5 text-ink outline-none"
                    >
                      {!category && <option value="">Choose</option>}
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <Icon name="expand_more" size={16} className="pointer-events-none absolute right-1.5 text-ink-3" />
                  </label>
                )}
                {organised && <TagEditor tags={tags} onChange={setTags} />}
                <span className="flex-1" />
                {writtenUnder && <span className="text-xs text-ink-3">Written under: {writtenUnder}</span>}
              </div>
            </>
          )}
          {!edit && writtenUnder && (
            <div className="flex items-center gap-2 text-[13px] text-ink-2">
              <Icon name="forum" size={16} />
              Written under: <span className="text-ink">{writtenUnder}</span>
            </div>
          )}

          <div className="mt-2">
            <MarkdownEditor
              value={draft.value}
              autoFocus={!edit}
              onChange={(v) => {
                draft.setValue(v);
                setServerError(null);
              }}
              error={bodyError}
              placeholder={writtenUnder ? `What do you know about “${writtenUnder}”? Write it in your own words.` : "What did you learn? Write it in your own words."}
              footerLeft={
                <span className="flex items-center gap-1">
                  <Icon name="cloud_done" size={14} />
                  Draft kept on this device
                </span>
              }
            />
          </div>

          <div className="flex items-center justify-end gap-2 md:hidden">
            <button type="button" onClick={cancel} className={btn("ghost")}>
              Cancel
            </button>
            <button type="button" onClick={save} disabled={saving || tooLong} aria-busy={saving} className={cn(btn("primary"), "px-4")}>
              {saving && <Icon name="progress_activity" size={16} className="spin" />}
              {saving ? "Saving…" : edit ? "Save changes" : "Save note"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
