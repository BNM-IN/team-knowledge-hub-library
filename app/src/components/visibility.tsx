"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import type { Group, Visibility } from "@/lib/types";
import { useDismiss } from "./overlay";
import { cn, Icon } from "./ui";

export const GROUP_HELP = "Anyone can read this and it can appear in others' answers, credited to you.";
export const PRIVATE_HELP = "Only you can see this.";

/**
 * FR-NOTE-03: exactly two options. Group (preselects the current group, picker lists only
 * groups the user belongs to) or Private.
 */
export function VisibilitySegmented({
  visibility,
  groupId,
  groups,
  onChange,
  size = "md",
  pickerAlign = "left",
}: {
  visibility: Visibility;
  groupId: string | null;
  groups: Group[];
  onChange: (visibility: Visibility, groupId: string | null) => void;
  size?: "sm" | "md";
  pickerAlign?: "left" | "right";
}) {
  const [picker, setPicker] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setPicker(false), []);
  useDismiss(ref, picker, close);
  const noGroups = groups.length === 0;
  const isGroup = visibility === "group" && !noGroups;
  const group = groups.find((g) => g.id === groupId) ?? groups.find((g) => g.isDefault) ?? groups[0];

  const seg = (on: boolean) =>
    cn(
      "inline-flex cursor-pointer items-center gap-1.5 rounded-[7px] border px-2.5 text-[13px] disabled:cursor-not-allowed",
      size === "sm" ? "h-[30px]" : "h-8",
      on ? "border-line-strong bg-surface font-semibold text-ink shadow-[0_1px_2px_oklch(0_0_0/0.08)]" : "border-transparent bg-transparent font-medium text-ink-2 hover:text-ink",
    );

  return (
    <div ref={ref} className="relative inline-flex">
      <div role="radiogroup" aria-label="Visibility" className="inline-flex gap-0.5 rounded-[10px] border border-line bg-surface-2 p-[3px]">
        <button
          type="button"
          role="radio"
          aria-checked={isGroup}
          title={isGroup ? "Choose a group" : undefined}
          disabled={noGroups}
          onClick={() => (isGroup ? setPicker((p) => !p) : onChange("group", group?.id ?? null))}
          className={cn(seg(isGroup), noGroups && "opacity-70")}
        >
          <Icon name="hexagon" size={16} className={isGroup ? "text-accent-text" : undefined} />
          <span className="max-w-[180px] truncate">{noGroups ? "Group" : `Group: ${group?.name}`}</span>
          {!noGroups && <Icon name="expand_more" size={16} className="text-ink-3" />}
        </button>
        <button type="button" role="radio" aria-checked={!isGroup} onClick={() => onChange("private", null)} className={seg(!isGroup)}>
          <Icon name="lock" size={16} />
          Private
        </button>
      </div>
      {picker && (
        <div role="listbox" aria-label="Post to" className={cn("absolute top-11 z-30 w-[260px] rounded-card border border-line bg-surface p-1.5 text-sm shadow-card", pickerAlign === "right" ? "right-0" : "left-0")}>
          <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">Post to</div>
          {groups.map((g) => {
            const sel = g.id === group?.id;
            return (
              <button
                key={g.id}
                type="button"
                role="option"
                aria-selected={sel}
                onClick={() => {
                  onChange("group", g.id);
                  setPicker(false);
                }}
                className={cn("flex w-full cursor-pointer items-center gap-2 rounded-control px-2.5 py-2 text-left", sel ? "bg-surface-2" : "hover:bg-surface-2")}
              >
                <Icon name="hexagon" size={16} className={sel ? "text-accent-text" : "text-ink-3"} />
                <span className="flex-1 truncate">{g.name}</span>
                {sel && <Icon name="check" size={16} />}
              </button>
            );
          })}
          <div className="mt-1 border-t border-line px-2.5 pb-1 pt-2 text-xs text-ink-3">Only groups you&apos;re a member of</div>
        </div>
      )}
    </div>
  );
}

export function VisibilityHelper({ visibility, noGroups, className }: { visibility: Visibility; noGroups?: boolean; className?: string }) {
  if (noGroups) {
    return (
      <span className={cn("text-xs text-ink-2", className)}>
        Join a group to post. Only you can see this for now. ·{" "}
        <Link href="/" className="text-accent-text underline">
          Browse Community
        </Link>
      </span>
    );
  }
  return <span className={cn("text-xs text-ink-2", className)}>{visibility === "group" ? GROUP_HELP : PRIVATE_HELP}</span>;
}
