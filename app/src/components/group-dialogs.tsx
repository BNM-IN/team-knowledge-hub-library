"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createGroupAction, joinByCodeAction } from "@/lib/actions";
import type { Group } from "@/lib/types";
import { Dialog } from "./overlay";
import { useToast } from "./toast";
import { btn, cn, Icon } from "./ui";

function Field({ label, value, onChange, max, optional, error, multiline, autoFocus }: {
  label: string; value: string; onChange: (v: string) => void; max: number; optional?: boolean; error?: string | null; multiline?: boolean; autoFocus?: boolean;
}) {
  const cls = cn("w-full rounded-control border bg-surface px-3 text-sm text-ink placeholder:text-ink-3", error ? "border-error" : "border-line-strong");
  return (
    <label className="flex flex-col gap-1.5 text-[13px] font-medium">
      <span className="flex items-baseline justify-between">
        <span>
          {label} {optional && <span className="font-normal text-ink-3">optional</span>}
        </span>
        <span className={cn("font-mono text-[11px]", value.length > max ? "text-error" : "text-ink-3")}>
          {value.length}/{max}
        </span>
      </span>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={cn(cls, "py-2 leading-5")} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} autoFocus={autoFocus} className={cn(cls, "h-[38px]")} />
      )}
      {error && (
        <span className="flex items-center gap-1 text-xs font-normal text-error">
          <Icon name="error" size={14} />
          {error}
        </span>
      )}
    </label>
  );
}

export function InviteBlock({ code, compact }: { code: string; compact?: boolean }) {
  const toast = useToast();
  const copy = async (text: string, what: string) => {
    await navigator.clipboard.writeText(text).catch(() => {});
    toast({ icon: "content_copy", message: `${what} copied` });
  };
  return (
    <div className={cn("flex flex-wrap items-center gap-3.5 rounded-card bg-surface-2", compact ? "px-3 py-2.5" : "px-3.5 py-3")}>
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">Invite code</span>
        <span className="font-mono text-[22px] font-medium tracking-[0.18em]">{code}</span>
      </div>
      <span className="flex-1" />
      <button type="button" className={btn("secondary", "sm")} onClick={() => copy(code, "Invite code")}>
        <Icon name="content_copy" size={16} />
        Copy code
      </button>
      <button type="button" className={btn("secondary", "sm")} onClick={() => copy(`${location.origin}/join/${code}`, "Join link")}>
        <Icon name="link" size={16} />
        Copy link
      </button>
    </div>
  );
}

/** S8 · Create group */
export function CreateGroupDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Group | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const close = () => {
    onClose();
    setTimeout(() => {
      setName("");
      setTopic("");
      setDescription("");
      setError(null);
      setCreated(null);
    }, 150);
  };

  const nameError = name.length > 0 && name.trim().length < 3 ? "Use at least 3 characters." : name.length > 50 ? "Use at most 50 characters." : null;
  const invalid = name.trim().length < 3 || name.length > 50 || topic.length > 60 || description.length > 280;

  return (
    <Dialog open={open} onClose={close} title={created ? `${created.name} is ready` : "Create a group"}>
      {created ? (
        <div className="flex flex-col gap-4">
          <p className="m-0 text-sm leading-5 text-ink-2">Share the invite code or link. Anyone signed in can read the group and join it.</p>
          {created.joinCode && <InviteBlock code={created.joinCode} compact />}
          <div className="flex justify-end">
            <Link href={`/groups/${created.id}`} onClick={close} className={btn("primary")}>
              Go to group
            </Link>
          </div>
        </div>
      ) : (
        <form
          className="flex flex-col gap-3.5"
          onSubmit={(e) => {
            e.preventDefault();
            if (invalid) return;
            start(async () => {
              const res = await createGroupAction({ name, topic, description });
              if (!res.ok) return setError(res.error);
              setCreated(res.value);
              router.refresh();
            });
          }}
        >
          <Field label="Name" value={name} onChange={setName} max={50} error={nameError} autoFocus />
          <Field label="Topic" value={topic} onChange={setTopic} max={60} optional />
          <Field label="Description" value={description} onChange={setDescription} max={280} optional multiline />
          {error && (
            <div role="alert" className="flex items-center gap-2 rounded-control bg-error-soft px-3 py-2 text-[13px] text-error">
              <Icon name="error" size={16} />
              <span className="flex-1">{error}</span>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" className={btn("ghost")} onClick={close}>
              Cancel
            </button>
            <button type="submit" disabled={invalid || pending} className={btn("primary")}>
              {pending && <Icon name="progress_activity" size={16} className="spin" />}
              {error ? "Retry" : "Create group"}
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
}

/** S9 · Join with code */
export function JoinCodeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [already, setAlready] = useState<Group | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();

  const close = () => {
    onClose();
    setTimeout(() => {
      setCode("");
      setError(null);
      setAlready(null);
    }, 150);
  };

  return (
    <Dialog open={open} onClose={close} title="Join with code" width={400}>
      {already ? (
        <div className="flex flex-col gap-4">
          <p className="m-0 text-sm text-ink-2">You&apos;re already in {already.name}.</p>
          <div className="flex justify-end">
            <Link href={`/groups/${already.id}`} onClick={close} className={btn("primary")}>
              Go to group
            </Link>
          </div>
        </div>
      ) : (
        <form
          className="flex flex-col gap-3.5"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const res = await joinByCodeAction(code);
              if (!res.ok) return setError(res.error);
              if (res.value.alreadyMember) return setAlready(res.value.group);
              toast({ icon: "hexagon", message: `Joined ${res.value.group.name}` });
              close();
              router.push(`/groups/${res.value.group.id}`);
              router.refresh();
            });
          }}
        >
          <label className="flex flex-col gap-1.5 text-[13px] font-medium">
            Invite code
            <input
              value={code}
              autoFocus
              maxLength={6}
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
                setError(null);
              }}
              placeholder="K7Q2MX"
              aria-invalid={!!error}
              className={cn(
                "h-12 rounded-control border bg-surface px-3 font-mono text-[22px] font-medium tracking-[0.18em] text-ink placeholder:text-ink-3/60",
                error ? "border-error" : "border-line-strong",
              )}
            />
            {error && (
              <span className="flex items-center gap-1 text-xs font-normal text-error">
                <Icon name="error" size={14} />
                {error}
              </span>
            )}
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" className={btn("ghost")} onClick={close}>
              Cancel
            </button>
            <button type="submit" disabled={code.length !== 6 || pending} className={btn("primary")}>
              {pending && <Icon name="progress_activity" size={16} className="spin" />}
              Join
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
