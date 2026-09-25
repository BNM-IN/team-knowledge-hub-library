"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ApiError } from "@/lib/types";
import { AnswerHeader } from "./answer-view";
import { btn, cn, Icon } from "./ui";

type Phase =
  | { kind: "searching" }
  | { kind: "writing" }
  | { kind: "cancelled" }
  | { kind: "error"; message: string }
  | { kind: "limited"; message: string };

/** S3 loading: two-stage progress with skeleton and Cancel (FR-ASK-08), then hands off to /ask/<id>. */
export function AskRunner({ question, scopeGroupId, scopeName }: { question: string; scopeGroupId: string | null; scopeName: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>({ kind: "searching" });
  const [attempt, setAttempt] = useState(0);
  const controller = useRef<AbortController | null>(null);
  const started = useRef(-1);

  useEffect(() => {
    // Strict Mode runs effects twice in dev; only send one request per attempt.
    if (started.current === attempt) return;
    started.current = attempt;
    const ctrl = new AbortController();
    controller.current = ctrl;
    const stage = setTimeout(() => setPhase((p) => (p.kind === "searching" ? { kind: "writing" } : p)), 1200);

    fetch("/api/ask", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question, scope_group_id: scopeGroupId }),
      signal: ctrl.signal,
    })
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (res.ok && body?.answer_id) {
          router.replace(`/ask/${body.answer_id}`);
          router.refresh();
          return;
        }
        const err = (body as ApiError | null)?.error;
        if (err?.code === "UNAUTHENTICATED") return router.replace(`/signin?reason=ended&next=${encodeURIComponent(location.pathname + location.search)}`);
        if (err?.code === "RATE_LIMITED") return setPhase({ kind: "limited", message: err.message });
        setPhase({ kind: "error", message: err?.code === "VALIDATION_ERROR" ? err.message : "Couldn't get an answer. Try again." });
      })
      .catch((e) => {
        if (e?.name !== "AbortError") setPhase({ kind: "error", message: "Couldn't get an answer. Try again." });
      })
      .finally(() => clearTimeout(stage));
  }, [attempt, question, scopeGroupId, router]);

  const retry = () => {
    setPhase({ kind: "searching" });
    setAttempt((a) => a + 1);
  };

  const loading = phase.kind === "searching" || phase.kind === "writing";

  return (
    <div className="flex w-full max-w-[720px] flex-col gap-7">
      <AnswerHeader question={question} scopeName={scopeName} scopeGroupId={scopeGroupId} />

      {loading && (
        <>
          <div role="status" aria-live="polite" className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-card border border-line bg-surface px-3.5 py-3 text-sm">
            <span className={cn("flex items-center gap-1.5", phase.kind === "writing" ? "text-ink-2" : "font-semibold")}>
              <Icon
                name={phase.kind === "writing" ? "check_circle" : "progress_activity"}
                className={phase.kind === "writing" ? "text-success" : "spin text-accent-text"}
              />
              Searching knowledge…
            </span>
            <span className="hidden h-px w-6 bg-line-strong sm:block" />
            <span className={cn("flex items-center gap-1.5", phase.kind === "writing" ? "font-semibold" : "text-ink-3")}>
              <Icon name={phase.kind === "writing" ? "progress_activity" : "radio_button_unchecked"} className={phase.kind === "writing" ? "spin text-accent-text" : ""} />
              Writing answer…
            </span>
            <span className="flex-1" />
            <button
              type="button"
              className={btn("secondary", "sm", "h-[30px]")}
              onClick={() => {
                controller.current?.abort();
                setPhase({ kind: "cancelled" });
              }}
            >
              Cancel
            </button>
          </div>
          <div aria-hidden className="flex flex-col gap-3">
            <div className="skeleton h-3.5 w-full" />
            <div className="skeleton h-3.5 w-[94%]" />
            <div className="skeleton h-3.5 w-[97%]" />
            <div className="skeleton h-3.5 w-[62%]" />
          </div>
          <div aria-hidden className="flex flex-col gap-3">
            <div className="skeleton h-4 w-[120px]" />
            <div className="h-3 w-[80%] rounded-[5px] bg-surface-2" />
            <div className="h-3 w-[72%] rounded-[5px] bg-surface-2" />
          </div>
        </>
      )}

      {phase.kind === "cancelled" && (
        <div role="status" className="flex flex-wrap items-center gap-3 rounded-card border border-line bg-surface px-4 py-3.5">
          <Icon name="block" size={20} className="text-ink-2" />
          <span className="flex-1 text-sm font-semibold">Stopped. Nothing was saved.</span>
          <button type="button" onClick={retry} className={btn("secondary", "sm")}>
            <Icon name="refresh" size={16} />
            Ask again
          </button>
        </div>
      )}

      {phase.kind === "error" && (
        <>
          <div role="alert" className="flex flex-wrap items-center gap-3 rounded-card bg-error-soft px-4 py-3.5">
            <Icon name="error" size={20} className="text-error" />
            <span className="flex-1 text-sm font-semibold">{phase.message}</span>
            <button type="button" onClick={retry} className={btn("secondary", "sm", "font-semibold")}>
              <Icon name="refresh" size={16} />
              Retry
            </button>
          </div>
          <div className="text-[13px] text-ink-2">
            Your question is kept. You can also{" "}
            <Link href="/notes/new" className="text-accent-text underline">
              write a note
            </Link>{" "}
            while you wait.
          </div>
        </>
      )}

      {phase.kind === "limited" && (
        <div role="status" className="flex flex-wrap items-start gap-3 rounded-card bg-warning-soft px-4 py-3.5">
          <Icon name="schedule" size={20} className="text-warning" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-sm font-semibold">{phase.message}</span>
            <span className="text-[13px] leading-[19px] text-ink-2">You&apos;ve reached the hourly question limit. Your recent answers and notes are still open.</span>
          </div>
          <Link href="/notes/new" className={btn("secondary", "sm")}>
            Write a note
          </Link>
        </div>
      )}
    </div>
  );
}
