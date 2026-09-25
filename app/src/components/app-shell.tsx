"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { initials } from "@/lib/format";
import type { Group, Profile } from "@/lib/types";
import { CreateGroupDialog, JoinCodeDialog } from "./group-dialogs";
import { ThemeToggle } from "./theme-toggle";
import { Avatar, btn, cn, Icon, Logo, SectionLabel } from "./ui";

const ShellContext = createContext<{ openDrawer: () => void }>({ openDrawer: () => {} });

function Sidebar({ viewer, groups, onNavigate }: { viewer: Profile; groups: Group[]; onNavigate?: () => void }) {
  const path = usePathname();
  const [dialog, setDialog] = useState<"create" | "join" | null>(null);
  const nav = (href: string, icon: string, label: string, active: boolean) => (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-control px-2.5 py-2 text-sm",
        active ? "bg-surface-2 font-semibold text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
      )}
    >
      <Icon name={icon} />
      {label}
    </Link>
  );

  return (
    <div className="flex h-full flex-col gap-[22px] px-3 py-[18px]">
      <Link href="/" onClick={onNavigate} className="px-2.5 py-1">
        <Logo />
      </Link>
      <nav aria-label="Main" className="flex flex-col gap-0.5">
        {nav("/", "search", "Ask", path === "/" || path.startsWith("/ask"))}
        {nav("/notes", "sticky_note_2", "My notes", path.startsWith("/notes"))}
      </nav>
      <nav aria-label="Groups" className="flex flex-col gap-0.5 text-sm">
        <SectionLabel>Groups</SectionLabel>
        {groups.map((g) => {
          const active = path === `/groups/${g.id}`;
          return (
            <Link
              key={g.id}
              href={`/groups/${g.id}`}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-control px-2.5 py-[7px] text-ink",
                active ? "bg-accent-soft font-semibold shadow-[inset_0_0_0_1px_var(--accent-border)]" : "hover:bg-surface-2",
              )}
            >
              <Icon name="hexagon" size={16} className={active ? "text-accent-text" : "text-ink-3"} />
              <span className="flex-1 truncate">{g.name}</span>
              <span className={cn("text-xs font-normal", active ? "text-ink-2" : "text-ink-3")}>{g.memberCount}</span>
            </Link>
          );
        })}
        <button type="button" onClick={() => setDialog("create")} className="flex cursor-pointer items-center gap-2.5 rounded-control px-2.5 py-[7px] text-left text-ink-2 hover:bg-surface-2 hover:text-ink">
          <Icon name="add" size={16} />
          Create group
        </button>
        <button type="button" onClick={() => setDialog("join")} className="flex cursor-pointer items-center gap-2.5 rounded-control px-2.5 py-[7px] text-left text-ink-2 hover:bg-surface-2 hover:text-ink">
          <Icon name="key" size={16} />
          Join with code
        </button>
      </nav>
      <span className="flex-1" />
      <Link
        href="/profile"
        onClick={onNavigate}
        aria-current={path === "/profile" ? "page" : undefined}
        className="flex items-center gap-2.5 rounded-control border-t border-line px-2.5 pb-2 pt-3.5 text-ink hover:bg-surface-2"
      >
        <Avatar initials={initials(viewer.displayName)} size={30} tone="neutral" />
        <span className="flex flex-col leading-[18px]">
          <span className="text-sm font-medium">{viewer.displayName}</span>
          <span className="text-xs text-ink-3">Profile</span>
        </span>
      </Link>
      <CreateGroupDialog open={dialog === "create"} onClose={() => setDialog(null)} />
      <JoinCodeDialog open={dialog === "join"} onClose={() => setDialog(null)} />
    </div>
  );
}

export function AppShell({ viewer, groups, children }: { viewer: Profile; groups: Group[]; children: ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  const path = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!drawer) return;
    drawerRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    const key = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [drawer]);

  return (
    <ShellContext.Provider value={{ openDrawer: () => setDrawer(true) }}>
      <div className="min-h-screen md:grid md:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-screen overflow-y-auto border-r border-line bg-surface md:block">
          <Sidebar viewer={viewer} groups={groups} />
        </aside>
        {/* Mobile menu drawer (PRD 7.3) */}
        {drawer && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-[oklch(0.2_0.02_255/0.35)]" onClick={() => setDrawer(false)} />
            <div ref={drawerRef} role="dialog" aria-modal="true" aria-label="Menu" className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] overflow-y-auto border-r border-line bg-surface shadow-overlay">
              <Sidebar viewer={viewer} groups={groups} onNavigate={() => setDrawer(false)} />
            </div>
          </div>
        )}
        <main className="flex min-w-0 flex-col">{children}</main>
      </div>
      {/* New note becomes a floating button on mobile */}
      {!path.startsWith("/notes/new") && !path.endsWith("/edit") && (
        <Link href="/notes/new" aria-label="New note" className="fixed bottom-5 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-ink shadow-overlay md:hidden">
          <Icon name="edit_note" size={26} />
        </Link>
      )}
    </ShellContext.Provider>
  );
}

/** Compact Ask box for pages other than Home. "/" focuses it. */
function CompactAsk({ placeholder = "Ask a question…" }: { placeholder?: string }) {
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
  return (
    <form
      role="search"
      className="hidden h-9 w-[340px] min-w-0 items-center gap-2 rounded-control border border-line bg-surface px-2.5 text-sm text-ink-3 focus-within:border-line-strong lg:flex"
      onSubmit={(e) => {
        e.preventDefault();
        const q = ref.current?.value.trim() ?? "";
        if (q.length >= 3) router.push(`/ask/new?q=${encodeURIComponent(q)}`);
      }}
    >
      <Icon name="search" />
      <input ref={ref} aria-label="Ask a question" placeholder={placeholder} maxLength={500} className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-3" />
      <kbd className="rounded border border-line px-[5px] py-px font-mono text-[11px]">/</kbd>
    </form>
  );
}

export function TopBar({
  title,
  ask,
  actions,
  trailing,
  hideNewNote,
}: {
  title: ReactNode;
  /** Compact Ask box placeholder; omit on Home. */
  ask?: string;
  actions?: ReactNode;
  /** Rendered after the theme toggle (e.g. Cancel / Save on the editor). */
  trailing?: ReactNode;
  hideNewNote?: boolean;
}) {
  const { openDrawer } = useContext(ShellContext);
  return (
    <header className="sticky top-0 z-20 flex h-[60px] items-center gap-3 border-b border-line bg-bg/90 px-4 backdrop-blur md:px-8">
      <button type="button" aria-label="Open menu" onClick={openDrawer} className="-ml-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-control text-ink-2 hover:bg-surface-2 md:hidden">
        <Icon name="menu" size={22} />
      </button>
      <div className="min-w-0 flex-1 truncate text-[15px] font-semibold">{title}</div>
      {ask && <CompactAsk placeholder={ask} />}
      {actions}
      <ThemeToggle />
      {trailing}
      {!hideNewNote && (
        <Link href="/notes/new" className={btn("primary", "md", "hidden md:inline-flex")}>
          <Icon name="edit_note" />
          New note
        </Link>
      )}
    </header>
  );
}
