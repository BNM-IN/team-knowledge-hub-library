import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/app-shell";
import { StatusChip } from "@/components/chips";
import { JoinGroupButton } from "@/components/citations";
import { InviteBlock } from "@/components/group-dialogs";
import { GroupFeed } from "@/components/group-feed";
import { NoteComposer } from "@/components/note-composer";
import { btn, Icon } from "@/components/ui";
import { getData } from "@/lib/data";

export const metadata: Metadata = { title: "Group" };

/** S7 · group page (not yet designed; built from the design-system group header and invite block). */
export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getData();
  const [group, notes, groups] = await Promise.all([data.group(id), data.groupNotes(id), data.myGroups()]);
  if (!group) notFound();

  return (
    <>
      <TopBar title={group.name} ask="Ask a question…" />
      <div className="flex justify-center px-4 pb-20 pt-8 md:px-8">
        <div className="flex w-full max-w-[760px] flex-col gap-8">
          <div className="flex flex-col gap-[18px] rounded-dialog border border-line bg-surface p-5">
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card border border-accent-border bg-accent-soft">
                <Icon name="hexagon" size={24} className="text-accent-text" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="m-0 text-xl font-semibold tracking-[-0.01em]">{group.name}</h1>
                  {group.isMember && <StatusChip status="member" size="sm" label={group.role === "owner" ? "Owner" : "Member"} />}
                </div>
                <div className="text-[13px] text-ink-2">
                  {[group.topic, `${group.memberCount} members`, group.ownerName && `Owner ${group.ownerName}`].filter(Boolean).join(" · ")}
                </div>
                {group.description && <p className="m-0 mt-1 text-sm leading-5 text-ink-2">{group.description}</p>}
              </div>
              {!group.isMember && <JoinGroupButton groupId={group.id} groupName={group.name} variant="primary" />}
            </div>
            {group.isMember && group.joinCode && <InviteBlock code={group.joinCode} />}
            <div>
              <Link href={`/?scope=${group.id}`} className={btn("secondary", "sm")}>
                <Icon name="search" size={16} />
                Ask within this group
              </Link>
            </div>
          </div>

          {group.isMember ? (
            <NoteComposer groups={groups} defaultGroupId={group.id} draftKey={`nh-draft:group:${group.id}`} title="Post a note to this group" lockGroup />
          ) : (
            <div className="flex items-center gap-2.5 rounded-card border border-dashed border-line-strong px-4 py-3.5 text-sm text-ink-2">
              <Icon name="lock_open" />
              <span className="flex-1">Join to post here.</span>
              <JoinGroupButton groupId={group.id} groupName={group.name} />
            </div>
          )}

          <GroupFeed notes={notes} />
        </div>
      </div>
    </>
  );
}
