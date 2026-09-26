"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { CATEGORIES } from "./categories";
import { DEMO_COOKIE, USE_MOCKS } from "./config";
import { getData } from "./data";
import type { Group, Note, NoteInput } from "./types";

export type ActionResult<T> = { ok: true; value: T } | { ok: false; error: string };

function fail(err: unknown): { ok: false; error: string } {
  console.error(err);
  const msg = err instanceof Error ? err.message : "";
  if (/row-level security|FORBIDDEN|groups you belong|Join the group/i.test(msg)) return { ok: false, error: "You can only post to groups you're a member of." };
  if (/UNAUTHENTICATED/.test(msg)) return { ok: false, error: "Your session ended. Sign in again." };
  return { ok: false, error: msg && msg.length < 120 ? msg : "Something went wrong. Try again." };
}

// Auth --------------------------------------------------------------------

/** Mock-mode stand-in for returning from Google (S1 · A2). */
export async function demoSignIn(): Promise<void> {
  if (!USE_MOCKS) throw new Error("Demo sign-in is only available with USE_MOCKS");
  (await cookies()).set(DEMO_COOKIE, "1", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
}

export async function signOut(): Promise<void> {
  if (USE_MOCKS) {
    (await cookies()).delete(DEMO_COOKIE);
  } else {
    const { createSupabaseServer } = await import("./supabase/server");
    await (await createSupabaseServer()).auth.signOut();
  }
  redirect("/");
}

// Notes -------------------------------------------------------------------

const noteSchema = z.object({
  body: z.string().trim().min(1, "Write something before saving.").max(10_000, "Notes can be up to 10,000 characters."),
  visibility: z.enum(["private", "group"]),
  groupId: z.string().nullable(),
  answerId: z.string().nullable().optional(),
  title: z.string().trim().min(1, "Give the note a title.").max(120).nullable().optional(),
  category: z.enum(CATEGORIES).nullable().optional(),
  tags: z
    .array(z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9-]*$/, "Tags use lowercase letters, numbers and dashes."))
    .max(4, "Use up to 4 tags.")
    .optional(),
});

export async function createNoteAction(input: NoteInput): Promise<ActionResult<Note>> {
  const parsed = noteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  if (parsed.data.visibility === "group" && !parsed.data.groupId) return { ok: false, error: "Pick a group to post to." };
  try {
    const data = await getData();
    const note = await data.createNote(parsed.data);
    // Notes are saved before organising, so a failed AI call never loses the note (NFR-04).
    await data.organiseNote(note.id).catch((e) => console.error("[organise]", e));
    revalidatePath("/", "layout");
    return { ok: true, value: note };
  } catch (err) {
    return fail(err);
  }
}

export async function updateNoteAction(id: string, patch: Partial<NoteInput>): Promise<ActionResult<Note>> {
  const parsed = noteSchema.partial().safeParse(patch);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  try {
    const data = await getData();
    const before = await data.note(id);
    const bodyChanged = parsed.data.body !== undefined && parsed.data.body !== before?.body;
    // The editor always resends `body` on every save (title/category/tag-only edits included).
    // data.updateNote's Supabase implementation flags organise_status "pending" purely on the
    // *presence* of a body key, not on whether the value actually changed — so a pure category
    // edit used to re-arm the "Organising…" spinner without ever queuing a real organise run,
    // leaving the note stuck forever. Only forward `body` here when it truly changed.
    const dbPatch = bodyChanged ? parsed.data : { ...parsed.data, body: undefined };
    const note = await data.updateNote(id, dbPatch);
    if (bodyChanged) {
      await data.organiseNote(id).catch((e) => console.error("[organise]", e));
    }
    revalidatePath("/", "layout");
    return { ok: true, value: note };
  } catch (err) {
    return fail(err);
  }
}

export async function retryOrganiseAction(id: string): Promise<ActionResult<null>> {
  try {
    await (await getData()).organiseNote(id);
    revalidatePath("/", "layout");
    return { ok: true, value: null };
  } catch (err) {
    return fail(err);
  }
}

export async function deleteNoteAction(id: string): Promise<ActionResult<null>> {
  try {
    await (await getData()).deleteNote(id);
    revalidatePath("/", "layout");
    return { ok: true, value: null };
  } catch (err) {
    return fail(err);
  }
}

// Groups ------------------------------------------------------------------

export async function joinGroupAction(groupId: string): Promise<ActionResult<{ group: Group; alreadyMember: boolean }>> {
  try {
    const res = await (await getData()).joinGroup(groupId);
    revalidatePath("/", "layout");
    return { ok: true, value: res };
  } catch (err) {
    return fail(err);
  }
}

export async function joinByCodeAction(code: string): Promise<ActionResult<{ group: Group; alreadyMember: boolean }>> {
  const clean = code.trim().toUpperCase();
  if (!/^[A-HJ-NP-Z2-9]{6}$/.test(clean)) return { ok: false, error: "That code doesn't match a group. Check it and try again." };
  try {
    const res = await (await getData()).joinByCode(clean);
    if (!res) return { ok: false, error: "That code doesn't match a group. Check it and try again." };
    revalidatePath("/", "layout");
    return { ok: true, value: res };
  } catch (err) {
    return fail(err);
  }
}

const groupSchema = z.object({
  name: z.string().trim().min(3, "Use at least 3 characters.").max(50, "Use at most 50 characters."),
  topic: z.string().trim().max(60, "Use at most 60 characters.").optional(),
  description: z.string().trim().max(280, "Use at most 280 characters.").optional(),
});

export async function createGroupAction(input: { name: string; topic?: string; description?: string }): Promise<ActionResult<Group>> {
  const parsed = groupSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  try {
    const group = await (await getData()).createGroup(parsed.data);
    revalidatePath("/", "layout");
    return { ok: true, value: group };
  } catch (err) {
    return fail(err);
  }
}

// Profile -----------------------------------------------------------------

export async function updateDisplayNameAction(name: string): Promise<ActionResult<null>> {
  const clean = name.trim();
  if (clean.length < 2 || clean.length > 40) return { ok: false, error: "Use 2–40 characters." };
  try {
    await (await getData()).updateDisplayName(clean);
    revalidatePath("/", "layout");
    return { ok: true, value: null };
  } catch (err) {
    return fail(err);
  }
}
