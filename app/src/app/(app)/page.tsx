import Link from "next/link";
import { TopBar } from "@/components/app-shell";
import { Greeting } from "@/components/greeting";
import { Landing } from "@/components/landing";
import { FeedNoteCard } from "@/components/note-card";
import { QuestionBox } from "@/components/question-box";
import { btn, Icon } from "@/components/ui";
import { ASK_RATE_LIMIT_PER_HOUR } from "@/lib/config";
import { getData } from "@/lib/data";
import { askBlockedUntil } from "@/lib/rate-limit";
import { dayLabel, firstName, timeLabel } from "@/lib/format";

const SUGGESTIONS = [
  { cat: "Evaluation", q: "How do I evaluate a RAG pipeline?" },
  { cat: "Fine-tuning", q: "What is LoRA and when should I use it?" },
  { cat: "Prompting", q: "How do I write a good system prompt?" },
  { cat: "LLM Basics", q: "What are embeddings, in plain terms?" },
];

const LANDING_GROUPS = [
  { name: "Community", topic: "Everyone, every topic", members: 148 },
  { name: "RAG study group", topic: "Retrieval-augmented generation", members: 23 },
  { name: "Agents deep-dive", topic: "Tool use and planning", members: 11 },
];

function Suggestions() {
  return (
    <div className="flex flex-wrap gap-2">
      {SUGGESTIONS.map((s) => (
        <Link
          key={s.q}
          href={`/ask/new?q=${encodeURIComponent(s.q)}`}
          className="inline-flex min-h-[34px] items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[13px] font-medium text-ink hover:border-line-strong hover:bg-surface-2"
        >
          <span className="text-[11px] font-medium text-ink-3">{s.cat}</span>
          {s.q}
        </Link>
      ))}
    </div>
  );
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ scope?: string }> }) {
  const data = await getData();
  const viewer = await data.viewer();
  if (!viewer) return <Landing groups={LANDING_GROUPS} />;

  const { scope } = await searchParams;
  const [groups, recent, latest, blockedAt] = await Promise.all([data.myGroups(), data.recentAnswers(20), data.latestGroupNotes(3), askBlockedUntil(data)]);
  const firstVisit = recent.length === 0;
  const blockedUntil = blockedAt ? timeLabel(blockedAt.toISOString()) : null;
  const defaultGroup = groups.find((g) => g.isDefault) ?? groups[0];
  const initialScope = scope && groups.some((g) => g.id === scope) ? scope : null;

  return (
    <>
      <TopBar title="Ask" />
      <div className="flex justify-center px-4 pb-16 pt-10 md:px-8 md:pt-[72px]">
        <div className="flex w-full max-w-[760px] flex-col gap-12">
          <div className="flex flex-col gap-5">
            <h1 className="m-0 text-[28px] font-semibold leading-9 tracking-[-0.025em] md:text-[32px] md:leading-10">
              {firstVisit ? `Welcome, ${firstName(viewer.displayName)}` : <Greeting name={viewer.displayName} />}
            </h1>
            <QuestionBox groups={groups} initialScope={initialScope} blockedUntil={blockedUntil} autoFocus={!blockedUntil} />
            {blockedUntil && (
              <div role="status" className="flex flex-wrap items-start gap-3 rounded-card bg-warning-soft px-4 py-3.5">
                <Icon name="schedule" size={20} className="text-warning" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-sm font-semibold">You can ask again at {blockedUntil}.</span>
                  <span className="text-[13px] leading-[19px] text-ink-2">
                    You&apos;ve reached {ASK_RATE_LIMIT_PER_HOUR} questions this hour. Your recent answers and notes are still open.
                  </span>
                </div>
                <Link href="/notes/new" className={btn("secondary", "sm")}>
                  Write a note
                </Link>
              </div>
            )}
            {!firstVisit && !blockedUntil && <Suggestions />}
          </div>

          {firstVisit && (
            <>
              <div className="grid grid-cols-1 gap-5 border-y border-line py-5 sm:grid-cols-3">
                {[
                  ["01", "You ask", "NoteHive searches the shared library and your groups' notes."],
                  ["02", "You get a short answer", "Every point is numbered to its source. Peers whose notes helped are credited."],
                  ["03", "You add what you learned", "Keep a note private, or post it to a group so it helps the next person."],
                ].map(([n, t, b]) => (
                  <div key={n} className="flex flex-col gap-1.5">
                    <span className="font-mono text-xs font-medium text-ink-3">{n}</span>
                    <span className="text-sm font-semibold">{t}</span>
                    <span className="text-[13px] leading-[19px] text-ink-2">{b}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="text-[13px] font-semibold text-ink-2">Try one of these</div>
                <Suggestions />
              </div>
            </>
          )}

          {!firstVisit && (
            <section className="flex flex-col gap-2.5" aria-labelledby="recent-h">
              <h2 id="recent-h" className="m-0 text-base font-semibold">
                Recent questions
              </h2>
              <div className="flex flex-col border-t border-line">
                {recent.map((r) => (
                  <Link
                    key={r.id}
                    href={`/ask/${r.id}`}
                    className="grid grid-cols-[minmax(0,1fr)_auto_20px] items-center gap-4 border-b border-line px-1 py-[13px] text-[15px] text-ink hover:bg-surface-2 sm:grid-cols-[minmax(0,1fr)_auto_72px_20px]"
                  >
                    <span className="truncate">{r.question}</span>
                    <span className="inline-flex h-[22px] items-center gap-1 rounded-full border border-line pl-1.5 pr-2 text-[11px] font-medium text-ink-2">
                      <Icon name={r.scopeGroupId ? "hexagon" : "public"} size={13} />
                      <span className="max-w-[120px] truncate">{r.scopeName}</span>
                    </span>
                    <span className="hidden text-right text-[13px] text-ink-3 sm:block">{dayLabel(r.createdAt)}</span>
                    <Icon name="chevron_right" className="text-ink-3" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {latest.length > 0 && (
            <section className="flex flex-col gap-3.5" aria-labelledby="latest-h">
              <div className="flex items-baseline justify-between">
                <h2 id="latest-h" className="m-0 text-base font-semibold">
                  Latest in your groups
                </h2>
                {defaultGroup && (
                  <Link href={`/groups/${defaultGroup.id}`} className="text-[13px] font-medium text-accent-text hover:underline">
                    Open {defaultGroup.name}
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {latest.map((n) => (
                  <FeedNoteCard key={n.id} note={n} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
