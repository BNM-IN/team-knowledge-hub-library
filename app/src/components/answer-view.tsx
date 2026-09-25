"use client";

import Link from "next/link";
import { useRef } from "react";
import { askedLabel } from "@/lib/format";
import type { Answer, Group, Note } from "@/lib/types";
import { ScopeChip } from "./chips";
import { Citation, CitationScope, CitedText } from "./citations";
import { NoteComposer } from "./note-composer";
import { MyNoteCard } from "./note-card";
import { OrganisePoller } from "./retry-organise";
import { useToast } from "./toast";
import { btn, Icon } from "./ui";

function askAgainHref(a: Pick<Answer, "question" | "scopeGroupId">) {
  const p = new URLSearchParams({ q: a.question });
  if (a.scopeGroupId) p.set("scope", a.scopeGroupId);
  return `/ask/new?${p}`;
}

/** FR-ASK-12: summary and key points as plain text with the source list. */
function plainText(a: Answer) {
  const lines = [a.question, "", a.summary.replace(/\[(\d+)\]/g, " [$1]"), "", "Key points"];
  a.keyPoints.forEach((k, i) => lines.push(`${i + 1}. ${k.text} ${k.sourceRefs.map((r) => `[${r}]`).join("")}`));
  lines.push("", "Sources");
  a.sources.forEach((s) =>
    lines.push(s.type === "library" ? `[${s.ref}] ${s.title} — ${s.url}` : `[${s.ref}] ${s.title} — from ${s.authorName}${s.groupName ? ` · ${s.groupName}` : ""}`),
  );
  return lines.join("\n");
}

export function AnswerHeader({ question, scopeName, scopeGroupId, createdAt, actions }: { question: string; scopeName: string; scopeGroupId: string | null; createdAt?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-2.5 text-[13px] text-ink-3">
        <ScopeChip name={scopeName} isGroup={!!scopeGroupId} />
        {createdAt && <span suppressHydrationWarning>{askedLabel(createdAt)}</span>}
      </div>
      <h1 className="m-0 text-[28px] font-semibold leading-9 tracking-[-0.025em] md:text-[34px] md:leading-[42px]">{question}</h1>
      {actions}
    </div>
  );
}

export function AnswerView({ answer, groups, notes, defaultGroupId }: { answer: Answer; groups: Group[]; notes: Note[]; defaultGroupId: string | null }) {
  const toast = useToast();
  const composer = useRef<HTMLDivElement>(null);
  const focusComposer = () => {
    composer.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    composer.current?.querySelector("textarea")?.focus({ preventScroll: true });
  };

  const none = answer.coverage === "none";

  return (
    <CitationScope>
      <article className="flex w-full max-w-[720px] flex-col gap-9">
        <AnswerHeader
          question={answer.question}
          scopeName={answer.scopeName}
          scopeGroupId={answer.scopeGroupId}
          createdAt={answer.createdAt}
          actions={
            !none && (
              <div className="flex gap-2">
                <button
                  type="button"
                  className={btn("secondary", "sm")}
                  onClick={async () => {
                    await navigator.clipboard.writeText(plainText(answer)).catch(() => {});
                    toast({ icon: "content_copy", message: "Answer copied" });
                  }}
                >
                  <Icon name="content_copy" size={16} />
                  Copy
                </button>
                <Link href={askAgainHref(answer)} className={btn("secondary", "sm")}>
                  <Icon name="refresh" size={16} />
                  Ask again
                </Link>
              </div>
            )
          }
        />

        {none ? (
          <NoCoverage answer={answer} />
        ) : (
          <>
            {answer.coverage === "partial" && (
              <div role="note" className="flex flex-wrap items-start gap-2.5 rounded-card bg-warning-soft px-3.5 py-3 text-sm leading-5">
                <Icon name="contrast" size={18} className="text-warning" />
                <span className="min-w-0 flex-1">
                  <strong className="font-semibold">Only partly covered by the knowledge base.</strong>{" "}
                  {answer.gap && <span className="text-ink-2">{answer.gap}</span>}
                </span>
                <button type="button" onClick={focusComposer} className="cursor-pointer whitespace-nowrap text-[13px] font-semibold text-ink underline">
                  Add a note on the gap
                </button>
              </div>
            )}

            <p className="m-0 text-pretty font-read text-[18px] leading-[31px] md:text-[19px] md:leading-8">
              <CitedText text={answer.summary} sources={answer.sources} idPrefix="s" />
            </p>

            <section className="flex flex-col gap-3.5" aria-labelledby="kp-h">
              <h2 id="kp-h" className="m-0 text-lg font-semibold">
                Key points
              </h2>
              <ol className="m-0 flex list-none flex-col border-t border-line p-0">
                {answer.keyPoints.map((k, i) => (
                  <li key={i} className="grid grid-cols-[32px_1fr] gap-2 border-b border-line py-3 text-[15px] leading-[22px]">
                    <span className="pt-0.5 font-mono text-xs text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      {k.text}{" "}
                      {k.sourceRefs.map((r, j) => (
                        <Citation key={j} small id={`p${i}-${j}`} source={answer.sources.find((s) => s.ref === r)} />
                      ))}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          </>
        )}

        {notes.length > 0 && (
          <section className="flex flex-col gap-3" aria-labelledby="yn-h">
            <h2 id="yn-h" className="m-0 text-base font-semibold">
              Your notes on this answer
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {notes.map((n) => (
                <MyNoteCard key={n.id} note={{ ...n, answerQuestion: null }} />
              ))}
            </div>
            <OrganisePoller active={notes.some((n) => n.organiseStatus === "pending")} />
          </section>
        )}

        {!none && (
          <NoteComposer ref={composer} groups={groups} defaultGroupId={defaultGroupId} answerId={answer.id} draftKey={`nh-draft:answer:${answer.id}`} linked />
        )}
      </article>
    </CitationScope>
  );
}

function NoCoverage({ answer }: { answer: Answer }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-[14px] border border-dashed border-line-strong px-7 py-8">
      <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-surface-2 text-ink-2">
        <Icon name="travel_explore" size={22} />
      </span>
      <div className="text-lg font-semibold">The knowledge base doesn&apos;t cover this yet</div>
      <div className="max-w-[440px] text-sm leading-[21px] text-ink-2">No library topics or group notes match this question, so there are no key points or sources to show.</div>
      <div className="mt-1.5 flex flex-wrap gap-2">
        <Link href={`/notes/new?answer=${answer.id}`} className={btn("primary")}>
          <Icon name="edit_note" />
          Write the first note on this
        </Link>
        {answer.scopeGroupId && (
          <Link href={`/ask/new?q=${encodeURIComponent(answer.question)}`} className={btn("secondary")}>
            Ask in All knowledge
          </Link>
        )}
      </div>
    </div>
  );
}
