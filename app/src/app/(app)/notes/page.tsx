import type { Metadata } from "next";
import { TopBar } from "@/components/app-shell";
import { MyNotes } from "@/components/my-notes";
import { getData } from "@/lib/data";

export const metadata: Metadata = { title: "My notes" };

/** S5 · My notes (not yet designed; built from design-system parts). */
export default async function MyNotesPage() {
  const data = await getData();
  const [notes, groups] = await Promise.all([data.myNotes(), data.myGroups()]);
  return (
    <>
      <TopBar title="My notes" ask="Ask a question…" />
      <div className="flex justify-center px-4 pb-20 pt-8 md:px-8">
        <MyNotes notes={notes} groups={groups} />
      </div>
    </>
  );
}
