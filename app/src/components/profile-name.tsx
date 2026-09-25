"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateDisplayNameAction } from "@/lib/actions";
import { useToast } from "./toast";
import { btn, cn, Icon } from "./ui";

export function ProfileName({ name }: { name: string }) {
  const [value, setValue] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();
  const dirty = value.trim() !== name;

  return (
    <form
      className="flex flex-col gap-1.5 text-[13px] font-medium"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await updateDisplayNameAction(value);
          if (!res.ok) return setError(res.error);
          setError(null);
          toast({ message: "Display name saved" });
          router.refresh();
        });
      }}
    >
      <label htmlFor="display-name">Display name</label>
      <div className="flex gap-2">
        <input
          id="display-name"
          value={value}
          maxLength={40}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={!!error}
          className={cn("h-[38px] min-w-0 flex-1 rounded-control border bg-surface px-3 text-sm font-normal text-ink", error ? "border-error" : "border-line-strong")}
        />
        {dirty && (
          <button type="submit" disabled={pending} className={btn("primary", "md", "h-[38px]")}>
            Save
          </button>
        )}
      </div>
      <span className="text-xs font-normal text-ink-3">Shown on your notes and when your notes are credited in answers.</span>
      {error && (
        <span className="flex items-center gap-1 text-xs font-normal text-error">
          <Icon name="error" size={14} />
          {error}
        </span>
      )}
    </form>
  );
}
