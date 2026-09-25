import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isCategory } from "../categories";
import { callN8n } from "../n8n";
import type { Answer, Group, Note, NoteInput, Profile, Source } from "../types";
import type { DataSource } from "./types";

// Row shapes returned by the selects below.
type NoteRow = {
  id: string; owner_id: string; group_id: string | null; visibility: "private" | "group"; title: string | null; body: string;
  category: string | null; tags: string[]; answer_id: string | null; meta_locked: boolean; organise_status: Note["organiseStatus"];
  created_at: string; updated_at: string;
  owner: { display_name: string } | null; group: { name: string } | null;
};
type AnswerRow = {
  id: string; user_id: string; question: string; scope_group_id: string | null; summary: string;
  key_points: { text: string; source_refs: number[] }[];
  sources: (Record<string, unknown> & { ref: number; type: "library" | "note" })[];
  coverage: Answer["coverage"]; latency_ms: number | null; created_at: string; scope: { name: string } | null;
};

const NOTE_SELECT = "*, owner:profiles!notes_owner_id_fkey(display_name), group:groups(name)";
const ANSWER_SELECT = "*, scope:groups(name)";

function toNote(r: NoteRow, answerQuestion: string | null = null): Note {
  return {
    id: r.id, ownerId: r.owner_id, authorName: r.owner?.display_name ?? "Unknown", groupId: r.group_id, groupName: r.group?.name ?? null,
    visibility: r.visibility, title: r.title, body: r.body, category: isCategory(r.category) ? r.category : null, tags: r.tags ?? [],
    answerId: r.answer_id, answerQuestion, metaLocked: r.meta_locked, organiseStatus: r.organise_status,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function toSource(s: AnswerRow["sources"][number]): Source {
  if (s.type === "library") {
    const url = String(s.url ?? "");
    return { ref: s.ref, type: "library", title: String(s.title ?? ""), url, path: String(s.path ?? url.split("/blob/")[1]?.split("/").slice(1).join("/") ?? url) };
  }
  return {
    ref: s.ref, type: "note", title: String(s.title ?? ""), noteId: String(s.note_id ?? ""), authorName: String(s.author_name ?? ""),
    groupId: (s.group_id as string) ?? null, groupName: (s.group_name as string) ?? null, excerpt: String(s.excerpt ?? ""),
    viewerIsMember: false, available: true,
  };
}

export function createSupabaseData(sb: SupabaseClient): DataSource {
  let cachedUser: Promise<string | null> | null = null;
  const userId = () => (cachedUser ??= sb.auth.getUser().then(({ data }) => data.user?.id ?? null));
  const must = async () => {
    const id = await userId();
    if (!id) throw Object.assign(new Error("UNAUTHENTICATED"), { code: "UNAUTHENTICATED" });
    return id;
  };

  let groupsCache: Promise<Group[]> | null = null;
  const myGroups = (): Promise<Group[]> =>
    (groupsCache ??= (async () => {
      const { data, error } = await sb.rpc("my_groups");
      if (error) throw error;
      return (data ?? []).map((g: { group_id: string; name: string; role: Group["role"]; is_default: boolean; member_count: number; join_code: string }) => ({
        id: g.group_id, name: g.name, role: g.role, isDefault: g.is_default, memberCount: Number(g.member_count), joinCode: g.join_code,
      }));
    })());

  const questionFor = async (noteId: string) => {
    const { data } = await sb.rpc("note_answer_question", { p_note_id: noteId });
    return (data as string | null) ?? null;
  };

  const toAnswer = async (r: AnswerRow): Promise<Answer> => {
    const mine = new Set((await myGroups()).map((g) => g.id));
    const noteIds = r.sources.filter((s) => s.type === "note").map((s) => String(s.note_id));
    const { data: readable } = noteIds.length ? await sb.from("notes").select("id").in("id", noteIds) : { data: [] as { id: string }[] };
    const ok = new Set((readable ?? []).map((n) => n.id));
    return {
      id: r.id, userId: r.user_id, question: r.question, scopeGroupId: r.scope_group_id, scopeName: r.scope?.name ?? "All knowledge",
      summary: r.summary, coverage: r.coverage, latencyMs: r.latency_ms ?? 0, createdAt: r.created_at,
      keyPoints: r.key_points.map((k) => ({ text: k.text, sourceRefs: k.source_refs })),
      sources: r.sources.map(toSource).map((s) =>
        s.type === "note" ? { ...s, available: ok.has(s.noteId), viewerIsMember: !!s.groupId && mine.has(s.groupId) } : s,
      ),
    };
  };

  const notesToInsert = (input: Partial<NoteInput>) => {
    const row: Record<string, unknown> = {};
    if (input.body !== undefined) row.body = input.body;
    if (input.visibility !== undefined) {
      row.visibility = input.visibility;
      row.group_id = input.visibility === "group" ? input.groupId : null;
    }
    if (input.answerId !== undefined) row.answer_id = input.answerId;
    if (input.title !== undefined) row.title = input.title;
    if (input.category !== undefined) row.category = input.category;
    if (input.tags !== undefined) row.tags = input.tags;
    return row;
  };

  return {
    async viewer() {
      const id = await userId();
      if (!id) return null;
      const { data } = await sb.from("profiles").select("id, display_name, email, avatar_url").eq("id", id).single();
      return data ? ({ id: data.id, displayName: data.display_name, email: data.email, avatarUrl: data.avatar_url } satisfies Profile) : null;
    },
    async updateDisplayName(name) {
      const { error } = await sb.from("profiles").update({ display_name: name }).eq("id", await must());
      if (error) throw error;
    },

    myGroups,
    async group(id) {
      const { data } = await sb.from("groups").select("id, name, topic, description, is_default, created_by, owner:profiles!groups_created_by_fkey(display_name)").eq("id", id).single();
      if (!data) return null;
      const { count } = await sb.from("group_members").select("*", { count: "exact", head: true }).eq("group_id", id);
      const mine = (await myGroups()).find((g) => g.id === id);
      const owner = data.owner as unknown as { display_name: string } | null;
      return {
        id: data.id, name: data.name, topic: data.topic, description: data.description, isDefault: data.is_default,
        memberCount: count ?? 0, ownerName: owner?.display_name ?? null, role: mine?.role ?? null, joinCode: mine?.joinCode ?? null, isMember: !!mine,
      };
    },
    async groupNotes(groupId) {
      const { data } = await sb.from("notes").select(NOTE_SELECT).eq("group_id", groupId).eq("visibility", "group").order("updated_at", { ascending: false }).limit(50);
      return ((data ?? []) as NoteRow[]).map((r) => toNote(r));
    },
    async createGroup({ name, topic, description }) {
      const { data, error } = await sb.rpc("create_group", { p_name: name, p_topic: topic ?? null, p_description: description ?? null });
      if (error) throw error;
      groupsCache = null;
      const row = (data as { group_id: string; join_code: string }[])[0];
      return { id: row.group_id, name, topic, description, isDefault: false, memberCount: 1, role: "owner", joinCode: row.join_code };
    },
    async joinGroup(groupId) {
      const { data, error } = await sb.rpc("join_group_by_id", { p_group_id: groupId });
      if (error) throw error;
      groupsCache = null;
      const row = (data as { group_id: string; name: string; already_member: boolean }[])[0];
      const group = (await myGroups()).find((g) => g.id === row.group_id)!;
      return { group, alreadyMember: row.already_member };
    },
    async joinByCode(code) {
      const { data, error } = await sb.rpc("join_group", { p_code: code.trim().toUpperCase() });
      if (error) {
        if (error.message.includes("INVALID_CODE")) return null;
        throw error;
      }
      groupsCache = null;
      const row = (data as { group_id: string; name: string; already_member: boolean }[])[0];
      const group = (await myGroups()).find((g) => g.id === row.group_id)!;
      return { group, alreadyMember: row.already_member };
    },

    async recentAnswers(limit = 20) {
      const { data } = await sb.from("answers").select(ANSWER_SELECT).order("created_at", { ascending: false }).limit(limit);
      return ((data ?? []) as AnswerRow[]).map((r) => ({
        id: r.id, userId: r.user_id, question: r.question, scopeGroupId: r.scope_group_id, scopeName: r.scope?.name ?? "All knowledge",
        summary: "", keyPoints: [], sources: [], coverage: r.coverage, latencyMs: r.latency_ms ?? 0, createdAt: r.created_at,
      }));
    },
    async answer(id) {
      const { data } = await sb.from("answers").select(ANSWER_SELECT).eq("id", id).single();
      return data ? toAnswer(data as AnswerRow) : null;
    },
    async saveAnswer() {
      // Answers are inserted by /api/ask with the service role (RLS: INSERT via server path only).
      throw new Error("saveAnswer is handled by the /api/ask server route in Supabase mode");
    },
    async askTimesSince(sinceIso) {
      const { data } = await sb.from("answers").select("created_at").gte("created_at", sinceIso).order("created_at");
      return (data ?? []).map((r) => r.created_at as string);
    },

    async latestGroupNotes(limit = 3) {
      const me = await userId();
      const ids = (await myGroups()).map((g) => g.id);
      if (!me || !ids.length) return [];
      const { data } = await sb.from("notes").select(NOTE_SELECT).eq("visibility", "group").in("group_id", ids).neq("owner_id", me)
        .eq("organise_status", "done").order("updated_at", { ascending: false }).limit(limit);
      return ((data ?? []) as NoteRow[]).map((r) => toNote(r));
    },
    async myNotes() {
      const me = await must();
      const { data } = await sb.from("notes").select(`${NOTE_SELECT}, answer:answers(question)`).eq("owner_id", me).order("updated_at", { ascending: false }).limit(200);
      return ((data ?? []) as (NoteRow & { answer: { question: string } | null })[]).map((r) => toNote(r, r.answer?.question ?? null));
    },
    async note(id) {
      const { data } = await sb.from("notes").select(NOTE_SELECT).eq("id", id).maybeSingle();
      if (!data) return null;
      const r = data as NoteRow;
      return toNote(r, r.answer_id ? await questionFor(r.id) : null);
    },
    async notePreview() {
      // Signed-out visitors have no Supabase session, and RLS hides every note: show the generic gate.
      return null;
    },
    async notesForAnswer(answerId) {
      const me = await must();
      const { data } = await sb.from("notes").select(NOTE_SELECT).eq("answer_id", answerId).eq("owner_id", me).order("updated_at", { ascending: false });
      return ((data ?? []) as NoteRow[]).map((r) => toNote(r));
    },
    async createNote(input) {
      const owner = await must();
      const { data, error } = await sb.from("notes").insert({ owner_id: owner, ...notesToInsert(input) }).select(NOTE_SELECT).single();
      if (error) throw error;
      return toNote(data as NoteRow);
    },
    async updateNote(id, patch) {
      const row = notesToInsert(patch);
      if (patch.body !== undefined) row.organise_status = "pending";
      const { data, error } = await sb.from("notes").update(row).eq("id", id).select(NOTE_SELECT).single();
      if (error) throw error;
      return toNote(data as NoteRow);
    },
    async deleteNote(id) {
      const { error } = await sb.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    async organiseNote(id) {
      const { error } = await sb.from("notes").update({ organise_status: "pending" }).eq("id", id);
      if (error) throw error;
      const question = await questionFor(id);
      // n8n writes title/category/tags/status back with the service role (WF-2).
      try {
        await callN8n("organise-note", { note_id: id, question, user_id: await must() }, 10_000);
      } catch (err) {
        // n8n unavailable: the note stays saved and shows "Couldn't organise" with Retry (PRD section 15).
        await sb.from("notes").update({ organise_status: "failed" }).eq("id", id);
        throw err;
      }
    },
  };
}
