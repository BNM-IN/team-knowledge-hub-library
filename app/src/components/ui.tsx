import type { CSSProperties, ReactNode } from "react";

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/** Material Symbols Rounded glyph, as used throughout the designs. */
export function Icon({ name, size = 18, className, style, label }: { name: string; size?: number; className?: string; style?: CSSProperties; label?: string }) {
  return (
    <span
      className={cn("material-symbols-rounded shrink-0", className)}
      style={{ fontSize: size, width: size, height: size, overflow: "hidden", ...style }}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    >
      {name}
    </span>
  );
}

const base = "inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer disabled:cursor-not-allowed transition-colors";
const sizes = {
  sm: "h-8 px-2.5 text-[13px] rounded-control",
  md: "h-9 px-3.5 text-sm rounded-control",
  lg: "h-12 px-5 text-[15px] rounded-[10px]",
} as const;
const variants = {
  primary: "bg-accent text-accent-ink font-semibold hover:brightness-[1.03] disabled:bg-surface-3 disabled:text-ink-3",
  secondary: "border border-line-strong bg-surface text-ink font-medium hover:bg-surface-2 disabled:text-ink-3",
  ghost: "bg-transparent text-ink-2 font-medium hover:bg-surface-2 hover:text-ink disabled:text-ink-3",
  danger: "bg-error text-surface font-semibold hover:brightness-105",
} as const;

export function btn(variant: keyof typeof variants = "secondary", size: keyof typeof sizes = "md", extra?: string) {
  return cn(base, sizes[size], variants[variant], extra);
}

export function Logo({ size = 20, text = true, textClass = "text-[17px]", onBg = "var(--surface)" }: { size?: number; text?: boolean; textClass?: string; onBg?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width={size} height={Math.round(size * 1.1)} viewBox="0 0 22 24" aria-hidden={text} aria-label={text ? undefined : "NoteHive"} role={text ? undefined : "img"}>
        <polygon points="11,1 21,6.5 21,17.5 11,23 1,17.5 1,6.5" fill="var(--accent)" />
        <polygon points="11,8 15.5,10.5 15.5,15.5 11,18 6.5,15.5 6.5,10.5" fill={onBg} />
      </svg>
      {text && <span className={cn("font-semibold tracking-[-0.02em] text-ink", textClass)}>NoteHive</span>}
    </span>
  );
}

export function Avatar({ initials, size = 24, tone = "accent" }: { initials: string; size?: number; tone?: "accent" | "neutral" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        tone === "accent" ? "bg-accent text-accent-ink" : "bg-surface-3 text-ink",
      )}
      style={{ width: size, height: size, fontSize: Math.max(9, Math.round(size * 0.4)) }}
    >
      {initials}
    </span>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">{children}</div>;
}
