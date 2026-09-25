"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { Markdown } from "./markdown";
import { cn, Icon } from "./ui";

export const MAX_NOTE = 10_000;
const COUNTER_FROM = 9_000;

type Tool = { icon: string; label: string; wrap?: [string, string]; line?: string; block?: boolean };
const TOOLS: Tool[] = [
  { icon: "format_bold", label: "Bold", wrap: ["**", "**"] },
  { icon: "format_italic", label: "Italic", wrap: ["_", "_"] },
  { icon: "title", label: "Heading", line: "## " },
  { icon: "format_list_bulleted", label: "Bulleted list", line: "- " },
  { icon: "link", label: "Link", wrap: ["[", "](https://)"] },
  { icon: "code", label: "Inline code", wrap: ["`", "`"] },
  { icon: "data_object", label: "Code block", wrap: ["```\n", "\n```"], block: true },
];

export function noteBodyError(body: string, attempted: boolean): string | null {
  if (body.length > MAX_NOTE) return `Shorten by ${(body.length - MAX_NOTE).toLocaleString("en-GB")} characters to save.`;
  if (attempted && !body.trim()) return "Write something before saving.";
  return null;
}

/**
 * Bounded Markdown editor from S4: Write/Preview, toolbar and counter inside one box (FR-NOTE-02).
 * `compact` is the inline "Add a note" variant under an answer.
 */
export function MarkdownEditor({
  value,
  onChange,
  error,
  compact,
  header,
  footerLeft,
  placeholder = "What did you learn? Write it in your own words.",
  autoFocus,
  label = "Note",
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  compact?: boolean;
  header?: ReactNode;
  footerLeft?: ReactNode;
  placeholder?: string;
  autoFocus?: boolean;
  label?: string;
}) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const ref = useRef<HTMLTextAreaElement>(null);
  const errId = useId();
  const len = value.length;
  const showCounter = !compact || len >= COUNTER_FROM;
  const counterTone = len > MAX_NOTE ? "text-error" : len >= COUNTER_FROM ? "text-warning" : "text-ink-3";
  const tools = compact ? TOOLS.filter((t) => ["Bold", "Italic", "Bulleted list", "Link", "Inline code"].includes(t.label)) : TOOLS;

  function apply(tool: Tool) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    let next: string;
    let cursor: [number, number];
    if (tool.line) {
      const lineStart = value.lastIndexOf("\n", s - 1) + 1;
      next = value.slice(0, lineStart) + tool.line + value.slice(lineStart);
      cursor = [s + tool.line.length, e + tool.line.length];
    } else {
      const [a, b] = tool.wrap!;
      const pre = tool.block && s > 0 && value[s - 1] !== "\n" ? "\n" : "";
      next = value.slice(0, s) + pre + a + value.slice(s, e) + b + value.slice(e);
      cursor = [s + pre.length + a.length, e + pre.length + a.length];
    }
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(...cursor);
    });
  }

  const tabBtn = (id: "write" | "preview", text: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === id}
      onClick={() => setTab(id)}
      className={cn(
        "cursor-pointer rounded-[7px] border-0",
        compact ? "h-7 px-2.5 text-xs" : "h-[30px] px-3 text-[13px]",
        tab === id ? "bg-surface font-semibold text-ink shadow-[0_0_0_1px_var(--border-strong)]" : "bg-transparent font-medium text-ink-2 hover:text-ink",
      )}
    >
      {text}
    </button>
  );

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden border bg-surface",
        compact ? "rounded-[14px]" : "rounded-card",
        error ? "border-error shadow-[0_0_0_3px_var(--error-soft)]" : "border-line-strong focus-within:shadow-[0_0_0_3px_var(--accent-soft)]",
      )}
    >
      {header}
      <div role="toolbar" aria-label="Formatting" className={cn("flex items-center gap-0.5 overflow-x-auto border-b border-line bg-surface-2", compact ? "px-2.5 py-1.5" : "px-2.5 py-1.5")}>
        <div role="tablist" aria-label="Editor mode" className="flex gap-0.5">
          {tabBtn("write", "Write")}
          {tabBtn("preview", "Preview")}
        </div>
        <span className={cn("h-[18px] w-px shrink-0 bg-line", compact ? "mx-2" : "mx-2.5")} />
        {tools.map((t) => (
          <button
            key={t.label}
            type="button"
            aria-label={t.label}
            title={t.label}
            disabled={tab === "preview"}
            onClick={() => apply(t)}
            className={cn("flex shrink-0 cursor-pointer items-center justify-center rounded-[7px] text-ink-2 hover:bg-surface hover:text-ink disabled:opacity-40", compact ? "h-7 w-7" : "h-[30px] w-[30px]")}
          >
            <Icon name={t.icon} size={compact ? 18 : 19} />
          </button>
        ))}
        {!compact && (
          <>
            <span className="flex-1" />
            <span className="hidden shrink-0 text-xs text-ink-3 sm:inline">Markdown supported</span>
          </>
        )}
      </div>
      {tab === "write" ? (
        <textarea
          ref={ref}
          value={value}
          autoFocus={autoFocus}
          aria-label={label}
          aria-invalid={!!error}
          aria-describedby={error ? errId : undefined}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && (e.key === "b" || e.key === "i")) {
              e.preventDefault();
              apply(TOOLS[e.key === "b" ? 0 : 1]);
            }
          }}
          className={cn(
            "w-full resize-y bg-transparent text-ink outline-none placeholder:text-ink-3",
            compact ? "min-h-24 px-4 py-4 font-read text-base leading-[26px]" : "min-h-[340px] px-[26px] py-[22px] font-mono text-[15px] leading-[27px]",
          )}
        />
      ) : (
        <div className={cn(compact ? "min-h-24 px-4 py-4 text-base leading-[26px]" : "min-h-[340px] px-[26px] py-[22px] text-[17px] leading-7")}>
          {value.trim() ? <Markdown>{value}</Markdown> : <p className="m-0 font-read text-ink-3">Nothing to preview yet.</p>}
        </div>
      )}
      {(showCounter || error || footerLeft) && (
        <div className={cn("flex min-h-[18px] items-center justify-between gap-3 text-xs", compact ? "px-3.5 pb-2" : "border-t border-line px-3.5 py-2")}>
          <span id={errId} className={cn("flex items-center gap-1", error ? "text-error" : "text-ink-3")}>
            {error ? (
              <>
                <Icon name="error" size={14} />
                {error}
              </>
            ) : (
              footerLeft
            )}
          </span>
          {showCounter && (
            <span className={cn("font-mono text-[11px]", counterTone)} aria-live="polite">
              {len.toLocaleString("en-GB")} / {MAX_NOTE.toLocaleString("en-GB")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
