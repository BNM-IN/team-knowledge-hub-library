"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useRef, useState, useTransition, type ReactNode } from "react";
import { joinGroupAction } from "@/lib/actions";
import { firstName, initials } from "@/lib/format";
import type { Source } from "@/lib/types";
import { useDismiss } from "./overlay";
import { useToast } from "./toast";
import { Avatar, cn, Icon } from "./ui";

// Only one source popover is open at a time.
const OpenContext = createContext<{ open: string | null; setOpen: (k: string | null) => void }>({ open: null, setOpen: () => {} });

export function CitationScope({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<string | null>(null);
  return <OpenContext.Provider value={{ open, setOpen }}>{children}</OpenContext.Provider>;
}

export function JoinGroupButton({ groupId, groupName, variant = "small" }: { groupId: string; groupName: string | null; variant?: "small" | "primary" }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await joinGroupAction(groupId);
          if (!res.ok) return toast({ icon: "error", message: res.error });
          toast({ icon: "hexagon", message: res.value.alreadyMember ? "You're already a member" : `Joined ${res.value.group.name}` });
          router.refresh();
        })
      }
      aria-label={groupName ? `Join ${groupName}` : "Join group"}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap font-semibold",
        variant === "small"
          ? "h-7 rounded-[7px] border border-line-strong bg-surface px-2.5 text-xs text-ink hover:bg-surface-2"
          : "h-9 rounded-control bg-accent px-3.5 text-sm text-accent-ink",
      )}
    >
      <Icon name={pending ? "progress_activity" : "add"} size={variant === "small" ? 15 : 18} className={cn(pending && "spin")} />
      Join group
    </button>
  );
}

/** "From Riya · RAG study group" with Join group / Member (FR-ASK-05, 06). */
export function CreditRow({ authorName, groupName, groupId, isMember }: { authorName: string; groupName: string | null; groupId: string | null; isMember: boolean }) {
  return (
    <span className="flex items-center gap-2.5 rounded-control bg-accent-soft py-2 pl-2.5 pr-2">
      <Avatar initials={initials(authorName)} size={26} />
      <span className="min-w-0 flex-1 text-[13px]">
        From <strong className="font-semibold">{firstName(authorName)}</strong>
        {groupName && <> · {groupName}</>}
      </span>
      {groupId &&
        (isMember ? (
          <span className="flex items-center gap-[3px] text-xs text-success">
            <Icon name="check" size={14} />
            Member
          </span>
        ) : (
          <JoinGroupButton groupId={groupId} groupName={groupName} />
        ))}
    </span>
  );
}

function SourceCard({ source, onClose }: { source: Source; onClose: () => void }) {
  if (source.type === "note" && !source.available) {
    return (
      <>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-2">
          <Icon name="link_off" size={16} />
          <span className="flex-1">No longer available</span>
          <CloseBtn onClose={onClose} />
        </span>
        <span className="text-[13px] leading-[19px] text-ink-2">This note was deleted or made private after the answer was written.</span>
      </>
    );
  }
  const lib = source.type === "library";
  return (
    <>
      <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink-3">
        <Icon name={lib ? "menu_book" : "sticky_note_2"} size={14} />
        <span className="flex-1">
          {lib ? "Library" : "Peer note"} · Source {source.ref}
        </span>
        <CloseBtn onClose={onClose} />
      </span>
      {lib ? (
        <>
          <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-[15px] font-semibold text-ink hover:underline">
            {source.title}
          </a>
          <span className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-ink-2">{source.path}</span>
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-[13px] font-medium text-accent-text hover:underline">
              Open
              <Icon name="arrow_outward" size={16} />
            </a>
          </span>
        </>
      ) : (
        <>
          <Link href={`/notes/${source.noteId}`} className="text-[15px] font-semibold text-ink hover:underline">
            {source.title}
          </Link>
          {source.excerpt && <span className="font-read text-sm leading-[21px] text-ink-2">{source.excerpt}</span>}
          <CreditRow authorName={source.authorName} groupName={source.groupName} groupId={source.groupId} isMember={source.viewerIsMember} />
        </>
      )}
    </>
  );
}

function CloseBtn({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" aria-label="Close" onClick={onClose} className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-ink-2 hover:bg-surface-2">
      <Icon name="close" size={16} />
    </button>
  );
}

/**
 * Citation marker: a button named "Source n: Title" (PRD 7.6). Note sources use the tinted
 * marker, library sources the neutral one, unavailable sources a dashed one. Click opens the source.
 */
export function Citation({ source, id, small }: { source: Source | undefined; id: string; small?: boolean }) {
  const { open, setOpen } = useContext(OpenContext);
  const ref = useRef<HTMLSpanElement>(null);
  const isOpen = open === id;
  const close = useCallback(() => setOpen(null), [setOpen]);
  useDismiss(ref, isOpen, close);
  if (!source) return null;

  const note = source.type === "note";
  const gone = note && !source.available;
  const label = gone ? `Source ${source.ref}: no longer available` : `Source ${source.ref}: ${source.title}`;

  return (
    <span ref={ref} className="relative mx-0.5 inline-block">
      <button
        type="button"
        aria-label={label}
        aria-expanded={isOpen}
        onClick={() => setOpen(isOpen ? null : id)}
        className={cn(
          "cursor-pointer rounded-[5px] font-mono font-semibold",
          small ? "h-[18px] min-w-[18px] px-1 align-[1px] text-[10px]" : "h-5 min-w-5 px-[5px] align-[3px] text-[11px]",
          isOpen
            ? "border border-accent bg-accent text-accent-ink"
            : gone
              ? "border border-dashed border-line-strong bg-surface-2 text-ink-3"
              : note
                ? "border border-accent-border bg-accent-soft text-ink"
                : "border border-line-strong bg-surface-2 text-ink",
        )}
      >
        {source.ref}
      </button>
      {isOpen && (
        <span
          role="dialog"
          aria-label={label}
          className="absolute left-[-12px] top-[30px] z-30 flex w-[min(340px,calc(100vw-48px))] flex-col gap-2.5 rounded-card border border-line bg-surface p-3.5 text-left font-sans text-sm leading-5 text-ink shadow-card"
        >
          <SourceCard source={source} onClose={close} />
        </span>
      )}
    </span>
  );
}

/** Summary with inline [n] markers turned into citation buttons. */
export function CitedText({ text, sources, idPrefix }: { text: string; sources: Source[]; idPrefix: string }) {
  const parts = text.split(/(\[\d+\])/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^\[(\d+)\]$/);
        if (!m) return <span key={i}>{p}</span>;
        const n = Number(m[1]);
        return <Citation key={i} id={`${idPrefix}-${i}`} source={sources.find((s) => s.ref === n)} />;
      })}
    </>
  );
}
