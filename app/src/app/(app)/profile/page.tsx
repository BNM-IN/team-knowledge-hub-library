import type { Metadata } from "next";
import Link from "next/link";
import { TopBar } from "@/components/app-shell";
import { ProfileName } from "@/components/profile-name";
import { btn, Icon } from "@/components/ui";
import { signOut } from "@/lib/actions";
import { getData } from "@/lib/data";

export const metadata: Metadata = { title: "Profile" };

/** S10 · Profile (FR-PRO-01). */
export default async function ProfilePage() {
  const data = await getData();
  const [viewer, groups, notes] = await Promise.all([data.viewer(), data.myGroups(), data.myNotes()]);
  if (!viewer) return null;
  const priv = notes.filter((n) => n.visibility === "private").length;

  return (
    <>
      <TopBar title="Profile" ask="Ask a question…" />
      <div className="flex justify-center px-4 pb-20 pt-8 md:px-8">
        <div className="flex w-full max-w-[560px] flex-col gap-8">
          <section className="flex flex-col gap-4 rounded-dialog border border-line bg-surface p-5">
            <ProfileName name={viewer.displayName} />
            <div className="flex flex-col gap-1.5 text-[13px] font-medium">
              Email
              <span className="flex h-[38px] items-center rounded-control border border-line bg-surface-2 px-3 text-sm font-normal text-ink-2">{viewer.email}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-card bg-surface-2 p-3">
                <div className="text-xl font-semibold">{priv}</div>
                <div className="flex items-center gap-1 text-[13px] text-ink-2">
                  <Icon name="lock" size={14} />
                  Private notes
                </div>
              </div>
              <div className="rounded-card bg-surface-2 p-3">
                <div className="text-xl font-semibold">{notes.length - priv}</div>
                <div className="flex items-center gap-1 text-[13px] text-ink-2">
                  <Icon name="hexagon" size={14} />
                  In groups
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-2.5" aria-labelledby="groups-h">
            <h2 id="groups-h" className="m-0 text-base font-semibold">
              My groups
            </h2>
            <div className="flex flex-col border-t border-line">
              {groups.map((g) => (
                <Link key={g.id} href={`/groups/${g.id}`} className="flex items-center gap-3 border-b border-line px-1 py-3 hover:bg-surface-2">
                  <Icon name="hexagon" size={18} className="text-accent-text" />
                  <span className="flex-1 text-[15px]">{g.name}</span>
                  <span className="text-[13px] capitalize text-ink-3">{g.role}</span>
                </Link>
              ))}
            </div>
          </section>

          <form action={signOut}>
            <button type="submit" className={btn("secondary")}>
              <Icon name="logout" size={16} />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
