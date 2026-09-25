import type { Note } from "./types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : parts[0]?.[1] ?? "")).toUpperCase();
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

/** "Just now", "2 min ago", "2 h ago", "Yesterday", "24 Sep". */
export function relativeDate(iso: string, now = Date.now()): string {
  const t = new Date(iso).getTime();
  const diff = Math.max(0, now - t);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  const d = new Date(t);
  const today = new Date(now);
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) return h < 6 ? `${h} h ago` : "Today";
  const yesterday = new Date(now - 86400000);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** Recent-questions style: "Today", "24 Sep". */
export function dayLabel(iso: string, now = Date.now()): string {
  const d = new Date(iso);
  if (d.toDateString() === new Date(now).toDateString()) return "Today";
  if (d.toDateString() === new Date(now - 86400000).toDateString()) return "Yesterday";
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function timeLabel(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function askedLabel(iso: string, now = Date.now()): string {
  const day = dayLabel(iso, now);
  return `Asked ${day === "Today" || day === "Yesterday" ? day.toLowerCase() : day}, ${timeLabel(iso)}`;
}

export function greeting(hour: number, name: string): string {
  const part = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return `${part}, ${firstName(name)}`;
}

/** First non-empty line of a Markdown body, stripped of syntax. Used as a temporary title. */
export function firstLine(body: string): string {
  const line = body.split("\n").find((l) => l.trim()) ?? "";
  return line.replace(/^#+\s*|^[-*]\s+|[*_`>]/g, "").trim().slice(0, 120);
}

export function noteTitle(n: Pick<Note, "title" | "body">): string {
  return n.title || firstLine(n.body) || "Untitled note";
}

/** Body text after the title line, for card previews. */
export function excerpt(body: string, max = 160): string {
  const text = body
    .replace(/```[\s\S]*?```/g, "")
    .split("\n")
    .map((l) => l.replace(/^#+\s*|^[-*]\s+|[*_`>]/g, "").trim())
    .filter(Boolean)
    .join(" ");
  return text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
}

export function formatCount(n: number): string {
  return n.toLocaleString("en-GB");
}
