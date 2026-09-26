"use client";

import { useState } from "react";
import type { GroupMember } from "@/lib/types";
import { StatusChip } from "./chips";
import { InviteBlock } from "./group-dialogs";
import { cn, Icon } from "./ui";

function MemberAvatar({ name, avatarUrl, size = 32 }: { name: string; avatarUrl: string | null; size?: number }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink font-semibold"
      style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.38)) }}
    >
      {initials}
    </span>
  );
}

type Tab = "members" | "invite";

export function MembersPanel({ members, joinCode }: { members: GroupMember[]; joinCode?: string | null }) {
  const [tab, setTab] = useState<Tab>("members");

  return (
    <div className="flex flex-col rounded-dialog border border-line bg-surface">
      {/* Tab bar */}
      <div className="flex border-b border-line">
        <button
          type="button"
          onClick={() => setTab("members")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium transition-colors",
            tab === "members" ? "border-b-2 border-accent text-accent-text" : "text-ink-2 hover:text-ink",
          )}
        >
          <Icon name="group" size={16} />
          Members
          <span className="ml-0.5 rounded-full bg-surface-2 px-1.5 py-0.5 text-[11px] font-semibold text-ink-2">{members.length}</span>
        </button>
        {joinCode && (
          <button
            type="button"
            onClick={() => setTab("invite")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium transition-colors",
              tab === "invite" ? "border-b-2 border-accent text-accent-text" : "text-ink-2 hover:text-ink",
            )}
          >
            <Icon name="person_add" size={16} />
            Invite
          </button>
        )}
      </div>

      {/* Tab content */}
      <div className="p-4">
        {tab === "members" ? (
          <ul className="flex flex-col gap-1">
            {members.map((m) => (
              <li key={m.userId} className="flex items-center gap-3 rounded-card px-2 py-2 hover:bg-surface-2 transition-colors">
                <MemberAvatar name={m.displayName} avatarUrl={m.avatarUrl} />
                <span className="flex-1 min-w-0 text-sm font-medium text-ink truncate">{m.displayName}</span>
                <StatusChip status="member" size="sm" label={m.role === "owner" ? "Owner" : "Member"} />
              </li>
            ))}
          </ul>
        ) : (
          joinCode && <InviteBlock code={joinCode} />
        )}
      </div>
    </div>
  );
}
