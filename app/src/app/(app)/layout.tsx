import { AppShell } from "@/components/app-shell";
import { getData } from "@/lib/data";

/** Signed in: sidebar + top bar shell. Signed out: the page renders on its own (landing, shared-note gate). */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const data = await getData();
  const viewer = await data.viewer();
  if (!viewer) return children;
  const groups = await data.myGroups();
  return (
    <AppShell viewer={viewer} groups={groups}>
      {children}
    </AppShell>
  );
}
