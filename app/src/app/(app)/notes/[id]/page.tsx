import type { Metadata } from "next";
import Link from "next/link";
import { TopBar } from "@/components/app-shell";
import { CategoryChip, VisibilityBadge } from "@/components/chips";
import { GoogleButton } from "@/components/google-button";
import { NoteView } from "@/components/note-view";
import { Avatar, Icon, Logo } from "@/components/ui";
import { getData } from "@/lib/data";
import { dayLabel, initials, noteTitle } from "@/lib/format";

export const metadata: Metadata = { title: "Note" };

/** S6 · note page. Signed out: the shared-link gate from S1 · B1 / B4. */
export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getData();
  const viewer = await data.viewer();
  if (!viewer) return <SignedOutGate id={id} preview={await data.notePreview(id)} />;

  const [note, groups] = await Promise.all([data.note(id), data.myGroups()]);
  if (!note) {
    return (
      <>
        <TopBar title="Note" ask="Ask a question…" />
        <div className="flex justify-center px-4 py-20">
          <div className="flex max-w-[420px] flex-col gap-2 text-center">
            <span className="text-lg font-semibold">This note is private or no longer exists.</span>
            <Link href="/" className="text-sm font-medium text-accent-text hover:underline">
              Ask a question instead
            </Link>
          </div>
        </div>
      </>
    );
  }
  const group = note.groupId ? await data.group(note.groupId) : null;
  const answer = note.answerId && note.ownerId === viewer.id ? await data.answer(note.answerId) : null;

  return (
    <>
      <TopBar title="Note" ask="Ask a question…" />
      <div className="flex justify-center px-4 pb-20 pt-8 md:px-8">
        <NoteView note={note} isOwner={note.ownerId === viewer.id} groups={groups} group={group} linkedAnswer={answer} />
      </div>
    </>
  );
}

function SignedOutGate({ id, preview }: { id: string; preview: Awaited<ReturnType<Awaited<ReturnType<typeof getData>>["notePreview"]>> }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <header className="flex h-16 items-center gap-4 border-b border-line px-4 sm:px-8">
        <Link href="/" className="flex-1">
          <Logo onBg="var(--bg)" />
        </Link>
        <Link href="/" className="text-sm text-ink-2 hover:text-ink">
          What is NoteHive?
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center p-8">
        {preview ? (
          <div className="flex w-full max-w-[520px] flex-col gap-6">
            <span className="text-[13px] font-medium text-ink-2">Someone shared a note with you</span>
            <div className="flex flex-col gap-3.5 rounded-dialog border border-line bg-surface p-6 shadow-card">
              <div className="flex flex-wrap items-center gap-2">
                <VisibilityBadge visibility="group" groupName={preview.groupName} />
                {preview.category && <CategoryChip category={preview.category} />}
              </div>
              <div className="text-[26px] font-semibold leading-[33px] tracking-[-0.02em]">{noteTitle(preview)}</div>
              <div className="flex items-center gap-2.5 text-sm text-ink-2">
                <Avatar initials={initials(preview.authorName)} size={28} />
                <span>
                  <strong className="font-semibold text-ink">{preview.authorName}</strong> · updated {dayLabel(preview.updatedAt)}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-[10px] bg-surface-2 px-3.5 py-3 text-[13px] leading-[19px] text-ink-2">
                <Icon name="lock_open" />
                Sign in to read it. Anyone on NoteHive can read notes in open groups.
              </div>
            </div>
            <div className="flex flex-col items-start gap-2.5">
              <GoogleButton next={`/notes/${id}`} />
              <span className="text-[13px] text-ink-3">New to NoteHive? This creates your account. You&apos;ll join Community automatically.</span>
            </div>
          </div>
        ) : (
          // Private, deleted or unknown: nothing about the note is shown until sign-in (B4).
          <div className="flex max-w-[420px] flex-col gap-3.5">
            <span className="text-[22px] font-semibold tracking-[-0.015em]">Sign in to view this note</span>
            <span className="text-sm leading-[21px] text-ink-2">Nothing about the note is shown until you sign in, so private notes stay private.</span>
            <div>
              <GoogleButton next={`/notes/${id}`} size="md" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
