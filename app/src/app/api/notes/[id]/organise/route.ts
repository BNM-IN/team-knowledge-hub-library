import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getData } from "@/lib/data";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getData();
  const viewer = await data.viewer();
  if (!viewer) return apiError("UNAUTHENTICATED", "Sign in first.");
  const note = await data.note(id);
  if (!note) return apiError("NOT_FOUND", "This note is private or no longer exists.");
  if (note.ownerId !== viewer.id) return apiError("FORBIDDEN", "Only the owner can organise this note.");
  try {
    await data.organiseNote(id);
  } catch (err) {
    console.error("[organise] failed to start", err);
    return apiError("INTERNAL", "Couldn't organise this note.");
  }
  return NextResponse.json({ note_id: id, organise_status: "pending" }, { status: 202 });
}
