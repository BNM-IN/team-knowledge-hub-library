import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/app-shell";
import { getData } from "@/lib/data";

export const metadata: Metadata = { title: "Join group" };

/** S9 · /join/<code>: joins in one step and lands on the group page (FR-GRP-03). */
export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const res = await (await getData()).joinByCode(code);
  if (res) redirect(`/groups/${res.group.id}`);
  return (
    <>
      <TopBar title="Join group" ask="Ask a question…" />
      <div className="flex justify-center px-4 py-20">
        <div role="alert" className="max-w-[420px] text-center text-[15px]">
          That code doesn&apos;t match a group. Check it and try again.
        </div>
      </div>
    </>
  );
}
