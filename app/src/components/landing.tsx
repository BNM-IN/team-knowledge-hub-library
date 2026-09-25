import Link from "next/link";
import { GoogleButton } from "./google-button";
import { ThemeToggle } from "./theme-toggle";
import { Avatar, Icon, Logo } from "./ui";

const STEPS = [
  { n: "01", title: "Ask", body: "Type what you want to learn. Search everything, or only one group." },
  { n: "02", title: "Read a cited answer", body: "A short summary and key points. Click any number to see the source and who wrote it." },
  { n: "03", title: "Add your note", body: "Write what you learned under the answer. NoteHive gives it a title, category and tags." },
];

function Marker({ n, note }: { n: number; note?: boolean }) {
  return (
    <span
      className={
        note
          ? "mx-0.5 inline-flex h-[19px] min-w-[19px] items-center justify-center rounded-[5px] bg-accent px-[5px] align-[2px] font-mono text-[10px] font-semibold text-accent-ink"
          : "mx-0.5 inline-flex h-[19px] min-w-[19px] items-center justify-center rounded-[5px] border border-line-strong bg-surface-2 px-[5px] align-[2px] font-mono text-[10px] font-semibold"
      }
    >
      {n}
    </span>
  );
}

export function Landing({ groups }: { groups: { name: string; topic: string; members: number }[] }) {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="mx-auto flex max-w-[1200px] items-center gap-6 px-4 py-5 sm:px-8">
        <Link href="/">
          <Logo textClass="text-lg" onBg="var(--bg)" />
        </Link>
        <nav className="hidden flex-1 gap-5 text-sm sm:flex">
          <a href="#how" className="text-ink-2 hover:text-ink">
            How it works
          </a>
          <a href="#groups" className="text-ink-2 hover:text-ink">
            Groups
          </a>
        </nav>
        <span className="flex-1 sm:hidden" />
        <ThemeToggle />
        <Link href="/signin" title="Opens Google sign-in" className="inline-flex h-9 items-center rounded-control border border-line-strong bg-surface px-3.5 text-sm font-medium hover:bg-surface-2">
          Sign in
        </Link>
      </header>

      <section className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] items-center gap-16 px-4 pb-24 pt-12 sm:px-8 sm:pt-[72px]">
        <div className="flex flex-col gap-6">
          <span className="inline-flex h-7 items-center gap-1.5 self-start rounded-full border border-accent-border bg-accent-soft pl-2.5 pr-3 text-[13px] font-medium">
            <Icon name="hexagon" size={15} className="text-accent-text" />
            For people learning together
          </span>
          <h1 className="m-0 text-balance text-[clamp(40px,5vw,60px)] font-semibold leading-[1.05] tracking-[-0.035em]">Learn from what your group already knows.</h1>
          <p className="m-0 max-w-[520px] text-pretty text-[19px] leading-[29px] text-ink-2">
            Ask a question and get a short answer from a shared library and your peers&apos; notes. Every point is cited, and every peer is credited.
          </p>
          <div className="mt-2 flex flex-col items-start gap-2.5">
            <GoogleButton />
            <span className="text-[13px] text-ink-3">No new password. NoteHive only uses your name and email.</span>
          </div>
        </div>

        <div aria-hidden className="relative">
          <div className="flex flex-col gap-[18px] rounded-[18px] border border-line bg-surface p-7 shadow-card">
            <div className="flex items-center gap-2 text-xs text-ink-3">
              <span className="inline-flex h-[22px] items-center gap-1 rounded-full border border-line pl-1.5 pr-2 text-[11px] font-medium text-ink-2">
                <Icon name="public" size={13} />
                All knowledge
              </span>
            </div>
            <div className="text-[22px] font-semibold leading-[29px] tracking-[-0.02em]">How should I chunk PDFs for RAG?</div>
            <div className="font-read text-base leading-[27px]">
              Split text into chunks of roughly 500–800 tokens with about 100 tokens of overlap
              <Marker n={2} note />. Split on headings and paragraphs before counting tokens
              <Marker n={1} />.
            </div>
            <div className="h-2.5 w-[86%] rounded bg-surface-3" />
            <div className="h-2.5 w-[64%] rounded bg-surface-3" />
          </div>
          <div className="absolute left-[clamp(12px,14%,90px)] top-44 flex w-[300px] max-w-[calc(100%-24px)] flex-col gap-2 rounded-card border border-line bg-surface p-3.5 shadow-card">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink-3">
              <Icon name="sticky_note_2" size={14} />
              Peer note · Source 2
            </span>
            <span className="text-sm font-semibold">Chunk size for PDFs</span>
            <span className="flex items-center gap-2.5 rounded-control bg-accent-soft py-2 pl-2.5 pr-2">
              <Avatar initials="RS" />
              <span className="flex-1 text-[13px]">
                From <strong className="font-semibold">Riya</strong> · RAG study group
              </span>
              <span className="inline-flex h-[26px] items-center gap-[3px] rounded-[7px] border border-line-strong bg-surface px-[9px] text-[11px] font-semibold">
                <Icon name="add" size={14} />
                Join
              </span>
            </span>
          </div>
          <div className="h-[60px]" />
        </div>
      </section>

      <section id="how" className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 py-20 sm:px-8">
          <h2 className="m-0 text-[32px] font-semibold leading-10 tracking-[-0.025em]">How it works</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-10">
            {STEPS.map((s) => (
              <div key={s.n} className="flex flex-col gap-2.5 border-t-2 border-ink pt-[18px]">
                <span className="font-mono text-[13px] font-medium text-ink-3">{s.n}</span>
                <span className="text-[19px] font-semibold">{s.title}</span>
                <span className="text-[15px] leading-[23px] text-ink-2">{s.body}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-12 px-4 py-20 sm:px-8">
          <div className="flex flex-col gap-3.5">
            <h2 className="m-0 text-[32px] font-semibold leading-10 tracking-[-0.025em]">You choose who sees each note</h2>
            <p className="m-0 max-w-[460px] text-[17px] leading-[26px] text-ink-2">
              There are two options and the choice is shown on every note. Private notes are only ever used in your own answers.
            </p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-3.5">
            <div className="flex flex-col gap-2.5 rounded-[14px] border border-accent-border bg-surface p-5">
              <span className="inline-flex h-[26px] items-center gap-[5px] self-start rounded-full border border-accent-border bg-accent-soft pl-2 pr-2.5 text-[13px] font-medium">
                <Icon name="hexagon" size={15} className="text-accent-text" />
                Group
              </span>
              <span className="text-[15px] leading-[22px]">Anyone can read this and it can appear in others&apos; answers, credited to you.</span>
            </div>
            <div className="flex flex-col gap-2.5 rounded-[14px] border border-dashed border-line-strong bg-surface p-5">
              <span className="inline-flex h-[26px] items-center gap-[5px] self-start rounded-full border border-dashed border-line-strong pl-2 pr-2.5 text-[13px] font-medium text-ink-2">
                <Icon name="lock" size={15} />
                Private
              </span>
              <span className="text-[15px] leading-[22px]">Only you can see this.</span>
            </div>
          </div>
        </div>
      </section>

      <section id="groups" className="border-t border-line bg-surface">
        <div className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-12 px-4 py-20 sm:px-8">
          <div className="flex flex-col gap-3.5">
            <h2 className="m-0 text-[32px] font-semibold leading-10 tracking-[-0.025em]">Groups are open</h2>
            <p className="m-0 max-w-[460px] text-[17px] leading-[26px] text-ink-2">
              Anyone signed in can read a group and join it in one click. Everyone starts in Community. Start your own group and share its invite code.
            </p>
          </div>
          <div className="flex flex-col border-t border-line">
            {groups.map((g) => (
              <div key={g.name} className="flex items-center gap-3.5 border-b border-line py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-accent-border bg-accent-soft">
                  <Icon name="hexagon" size={22} className="text-accent-text" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-base font-semibold">{g.name}</span>
                  <span className="text-[13px] text-ink-2">{g.topic}</span>
                </span>
                <span className="text-[13px] text-ink-3">{g.members} members</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-5 px-4 py-[88px] text-center sm:px-8">
          <h2 className="m-0 text-4xl font-semibold leading-[44px] tracking-[-0.025em]">What do you want to learn?</h2>
          <p className="m-0 text-[17px] text-ink-2">Sign in with Google to ask your first question.</p>
          <GoogleButton />
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] items-center gap-2.5 px-4 py-6 text-[13px] text-ink-3 sm:px-8">
          <Logo size={16} text={false} onBg="var(--bg)" />
          <span className="flex-1">NoteHive</span>
        </div>
      </footer>
    </div>
  );
}
