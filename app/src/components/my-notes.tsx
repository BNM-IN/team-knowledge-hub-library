"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import type { Group, Note } from "@/lib/types";
import { MyNoteCard } from "./note-card";
import { OrganisePoller } from "./retry-organise";
import { btn, cn, Icon } from "./ui";

type Tab = "all" | "private" | "group";
const PAGE = 20;

/** FR-LIB-01..04: filters combine; keyword search over title, body and tags; pages of 20. */
export function MyNotes({ notes, groups }: { notes: Note[]; groups: Group[] }) {
  const [tab, setTab] = useState<Tab>("all");
  const [category, setCategory] = useState("");
  const [group, setGroup] = useState("");
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(PAGE);
  const q = useDeferredValue(query.trim().toLowerCase());

  const counts = { all: notes.length, private: notes.filter((n) => n.visibility === "private").length, group: notes.filter((n) => n.visibility === "group").length };
  const filtered = useMemo(
    () =>
      notes.filter(
        (n) =>
          (tab === "all" || n.visibility === tab) &&
          (!category || n.category === category) &&
          (!group || n.groupId === group) &&
          (!q || [n.title ?? "", n.body, n.tags.join(" ")].some((f) => f.toLowerCase().includes(q))),
      ),
    [notes, tab, category, group, q],
  );
  const filtering = tab !== "all" || category || group || q;
  const clear = () => {
    setTab("all");
    setCategory("");
    setGroup("");
    setQuery("");
  };

  if (!notes.length) {
    return (
      <div className="mt-10 flex w-full max-w-[520px] flex-col items-center gap-2.5 rounded-card border border-dashed border-line-strong px-5 py-10 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-surface-2 text-ink-2">
          <Icon name="sticky_note_2" size={22} />
        </span>
        <div className="text-[15px] font-semibold">Your notes will live here.</div>
        <div className="max-w-[260px] text-[13px] text-ink-2">Ask a question and add a note under the answer.</div>
        <Link href="/" className={btn("primary", "sm")}>
          Ask a question
        </Link>
      </div>
    );
  }

  const select = "h-9 cursor-pointer rounded-control border border-line bg-surface px-2.5 text-sm text-ink";
  return (
    <div className="flex w-full max-w-[960px] flex-col gap-5">
      <OrganisePoller active={notes.some((n) => n.organiseStatus === "pending")} />
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex h-9 min-w-[240px] flex-1 items-center gap-2 rounded-control border border-line bg-surface px-2.5 text-sm text-ink-3 focus-within:border-line-strong">
          <Icon name="search" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShown(PAGE);
            }}
            placeholder="Search your notes"
            aria-label="Search your notes"
            className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-3"
          />
        </label>
        <select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)} className={select}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select aria-label="Group" value={group} onChange={(e) => setGroup(e.target.value)} className={select}>
          <option value="">All groups</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>
      <div role="tablist" aria-label="Visibility" className="flex gap-1 border-b border-line">
        {(
          [
            ["all", "All"],
            ["private", "Private"],
            ["group", "In groups"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn("h-9 cursor-pointer px-2.5 text-sm", tab === id ? "font-semibold text-ink shadow-[inset_0_-2px_0_var(--accent)]" : "font-medium text-ink-2 hover:text-ink")}
          >
            {label} <span className="font-normal text-ink-3">{counts[id]}</span>
          </button>
        ))}
      </div>
      {filtered.length ? (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
            {filtered.slice(0, shown).map((n) => (
              <MyNoteCard key={n.id} note={n} />
            ))}
          </div>
          {filtered.length > shown && (
            <button type="button" onClick={() => setShown((s) => s + PAGE)} className={btn("secondary", "md", "self-center")}>
              Show more
            </button>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-2.5 rounded-card border border-dashed border-line-strong px-5 py-10 text-center">
          <div className="text-[15px] font-semibold">No notes match</div>
          {filtering && (
            <button type="button" onClick={clear} className={btn("secondary", "sm")}>
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
