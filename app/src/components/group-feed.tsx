"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import type { Note } from "@/lib/types";
import { FeedNoteCard } from "./note-card";

/**
 * FR-GRP-06: newest first, filterable by category, updates live. With Supabase this would
 * subscribe to Realtime; here it refreshes periodically and highlights notes that arrive.
 */
export function GroupFeed({ notes }: { notes: Note[] }) {
  const [category, setCategory] = useState("");
  const router = useRouter();
  const seen = useRef<Set<string> | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = setInterval(() => router.refresh(), 15_000);
    return () => clearInterval(t);
  }, [router]);

  useEffect(() => {
    const ids = notes.map((n) => n.id);
    if (seen.current) {
      const arrived = ids.filter((id) => !seen.current!.has(id));
      // Highlight notes that arrived since the last refresh.
      if (arrived.length) setFresh(new Set(arrived));
    }
    seen.current = new Set(ids);
  }, [notes]);

  const shown = notes.filter((n) => !category || n.category === category);
  return (
    <section className="flex flex-col gap-3.5" aria-labelledby="feed-h">
      <div className="flex items-center justify-between gap-3">
        <h2 id="feed-h" className="m-0 text-base font-semibold">
          Notes
        </h2>
        <select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="h-8 cursor-pointer rounded-control border border-line bg-surface px-2 text-[13px] text-ink">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      {shown.length ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {shown.map((n) => (
            <FeedNoteCard key={n.id} note={n} showGroup={false} highlight={fresh.has(n.id)} />
          ))}
        </div>
      ) : (
        <div className="rounded-card border border-dashed border-line-strong px-5 py-8 text-center text-sm text-ink-2">
          {notes.length ? "No notes in this category yet." : "No notes yet. Be the first to post."}
        </div>
      )}
    </section>
  );
}
