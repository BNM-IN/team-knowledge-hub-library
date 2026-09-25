import type { Note } from "@/lib/types";
import { cn, Icon } from "./ui";

const pill = "inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap";

/** Visibility is always shown with an icon and a word, never colour alone (PRD 7.6). */
export function VisibilityBadge({ visibility, groupName, size = "md" }: { visibility: Note["visibility"]; groupName?: string | null; size?: "sm" | "md" }) {
  const dims = size === "sm" ? "h-[22px] pl-1.5 pr-2 text-[11px]" : "h-6 pl-[7px] pr-[9px] text-xs";
  const icon = size === "sm" ? 13 : 14;
  if (visibility === "private") {
    return (
      <span className={cn(pill, dims, "border border-dashed border-line-strong text-ink-2")}>
        <Icon name="lock" size={icon} />
        Private
      </span>
    );
  }
  return (
    <span className={cn(pill, dims, "border border-accent-border bg-accent-soft text-ink")}>
      <Icon name="hexagon" size={icon} className="text-accent-text" />
      {groupName ?? "Group"}
    </span>
  );
}

export function ScopeChip({ name, isGroup }: { name: string; isGroup: boolean }) {
  return (
    <span className={cn(pill, "h-6 pl-[7px] pr-[9px] text-xs border border-line text-ink-2")}>
      <Icon name={isGroup ? "hexagon" : "public"} size={14} />
      {name}
    </span>
  );
}

export function CategoryChip({ category, size = "md" }: { category: string; size?: "sm" | "md" }) {
  return (
    <span className={cn("inline-flex items-center rounded-chip bg-surface-3 font-medium text-ink", size === "sm" ? "h-[22px] px-2 text-[11px]" : "h-6 px-[9px] text-xs")}>
      {category}
    </span>
  );
}

export function Tags({ tags, size = "md" }: { tags: string[]; size?: "sm" | "md" }) {
  if (!tags.length) return null;
  return <span className={cn("font-mono font-medium text-ink-2", size === "sm" ? "text-[11px]" : "text-xs")}>{tags.map((t) => `#${t}`).join(" ")}</span>;
}

type Status = "organising" | "failed" | "member" | "partial" | "new";

export function StatusChip({ status, size = "md", label }: { status: Status; size?: "sm" | "md"; label?: string }) {
  const dims = size === "sm" ? "h-[22px] pl-1.5 pr-2 text-[11px]" : "h-6 pl-[7px] pr-[9px] text-xs";
  const icon = size === "sm" ? 13 : 14;
  switch (status) {
    case "organising":
      return (
        <span role="status" className={cn(pill, dims, "gap-[5px] border border-line bg-surface-2 text-ink-2")}>
          <Icon name="progress_activity" size={icon} className="spin" />
          {label ?? "Organising…"}
        </span>
      );
    case "failed":
      return (
        <span className={cn(pill, dims, "gap-[5px] bg-error-soft text-error")}>
          <Icon name="error" size={icon} />
          {label ?? "Couldn't organise"}
        </span>
      );
    case "member":
      return (
        <span className={cn(pill, dims, "gap-[5px] bg-success-soft text-success")}>
          <Icon name="check" size={icon} />
          {label ?? "Member"}
        </span>
      );
    case "partial":
      return (
        <span className={cn(pill, dims, "gap-[5px] bg-warning-soft text-warning")}>
          <Icon name="contrast" size={icon} />
          {label ?? "Partly covered"}
        </span>
      );
    case "new":
      return <span className={cn(pill, dims, "bg-accent px-2 font-semibold text-accent-ink")}>{label ?? "New"}</span>;
  }
}
