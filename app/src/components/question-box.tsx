"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import type { Group } from "@/lib/types";
import { useDismiss } from "./overlay";
import { cn, Icon, SectionLabel } from "./ui";

export function ScopeSelector({ groups, value, onChange, disabled }: { groups: Group[]; value: string | null; onChange: (id: string | null) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);
  const current = groups.find((g) => g.id === value);
  const options = [{ id: null, name: "All knowledge", icon: "public" }, ...groups.map((g) => ({ id: g.id, name: g.name, icon: "hexagon" }))];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Search in: ${current?.name ?? "All knowledge"}`}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex h-8 max-w-[220px] cursor-pointer items-center gap-1.5 rounded-full border border-line pl-2 pr-2.5 text-[13px] font-medium",
          disabled ? "bg-surface text-ink-2" : "bg-surface-2 text-ink",
        )}
      >
        <Icon name={current ? "hexagon" : "public"} size={16} />
        <span className="truncate">{current?.name ?? "All knowledge"}</span>
        <Icon name="expand_more" size={16} className="text-ink-3" />
      </button>
      {open && (
        <div role="listbox" aria-label="Search in" className="absolute left-0 top-10 z-30 flex w-60 flex-col rounded-card border border-line bg-surface p-1.5 text-sm shadow-card">
          <SectionLabel>Search in</SectionLabel>
          {options.map((o) => {
            const selected = o.id === value;
            return (
              <button
                key={o.id ?? "all"}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(o.id);
                  setOpen(false);
                }}
                className={cn("flex cursor-pointer items-center gap-2 rounded-control px-2.5 py-2 text-left", selected ? "bg-surface-2" : "hover:bg-surface-2")}
              >
                <Icon name={o.icon} size={16} className={selected ? "" : "text-ink-3"} />
                <span className="flex-1 truncate">{o.name}</span>
                {selected && <Icon name="check" size={16} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** S2 question box: 3–500 characters, Enter to ask, Shift+Enter for a new line (FR-ASK-01). */
export function QuestionBox({
  groups,
  initialScope = null,
  initialQuestion = "",
  blockedUntil,
  autoFocus,
}: {
  groups: Group[];
  initialScope?: string | null;
  initialQuestion?: string;
  /** Rate-limited: Ask is disabled until this time label. */
  blockedUntil?: string | null;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuestion);
  const [scope, setScope] = useState<string | null>(initialScope);
  const ref = useRef<HTMLTextAreaElement>(null);
  const trimmed = q.trim();
  const blocked = !!blockedUntil;
  const canAsk = !blocked && trimmed.length >= 3 && trimmed.length <= 500;

  const submit = () => {
    if (!canAsk) return;
    const params = new URLSearchParams({ q: trimmed });
    if (scope) params.set("scope", scope);
    router.push(`/ask/new?${params}`);
  };

  const grow = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      onClick={(e) => e.target === e.currentTarget && ref.current?.focus()}
      className={cn(
        "flex flex-col gap-5 rounded-[18px] border px-5 pb-3.5 pt-5 transition-shadow",
        blocked ? "border-line bg-surface-2" : "border-line-strong bg-surface shadow-card focus-within:shadow-[var(--shadow),0_0_0_3px_var(--accent-soft)]",
      )}
    >
      <textarea
        ref={ref}
        value={q}
        rows={1}
        autoFocus={autoFocus}
        disabled={blocked}
        maxLength={600}
        aria-label="What do you want to learn?"
        placeholder="What do you want to learn?"
        onChange={(e) => {
          setQ(e.target.value);
          grow(e.target);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        className="min-h-[30px] w-full resize-none bg-transparent text-[21px] leading-[30px] text-ink outline-none placeholder:text-ink-3 disabled:cursor-not-allowed"
      />
      <div className="flex items-center gap-2.5">
        <ScopeSelector groups={groups} value={scope} onChange={setScope} disabled={blocked} />
        <span className="hidden flex-1 text-xs text-ink-3 sm:block">
          {trimmed.length > 500 ? <span className="text-error">{trimmed.length} / 500 characters</span> : "Enter to ask · Shift+Enter for a new line"}
        </span>
        <span className="flex-1 sm:hidden" />
        <button
          type="submit"
          disabled={blocked}
          aria-disabled={!canAsk}
          aria-label={blocked ? `Ask, unavailable until ${blockedUntil}` : "Ask"}
          className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-[10px] bg-accent text-accent-ink disabled:cursor-not-allowed disabled:bg-surface-3 disabled:text-ink-3"
        >
          <Icon name="arrow_upward" />
        </button>
      </div>
    </form>
  );
}
