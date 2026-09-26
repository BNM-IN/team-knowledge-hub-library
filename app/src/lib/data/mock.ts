// In-memory data for USE_MOCKS=true. Seeded from the Claude Design screens
// (viewer Aman Verma; Riya's and Neha's notes; Community / RAG study group / Agents deep-dive).
// State lives on globalThis so it survives hot reloads in `next dev`.
import { isCategory, type Category } from "../categories";
import { organiseHeuristic } from "../mock/knowledge";
import type { Answer, Group, GroupMember, Note, Profile, Role, Source } from "../types";
import type { DataSource, GroupDetail } from "./types";

interface GroupRow {
  id: string;
  name: string;
  topic: string | null;
  description: string | null;
  joinCode: string;
  isDefault: boolean;
  ownerId: string | null;
  /** Members other than the seeded users, so counts match the designs. */
  extraMembers: number;
  createdAt: string;
}

interface Store {
  profiles: Profile[];
  groups: GroupRow[];
  members: { groupId: string; userId: string; role: Role }[];
  notes: Omit<Note, "authorName" | "groupName" | "answerQuestion">[];
  answers: Answer[];
}

export const DEMO_USER_ID = "u-aman";

const H = 3600_000;
const D = 24 * H;

function seed(): Store {
  const now = Date.now();
  const at = (ms: number) => new Date(now - ms).toISOString();
  const todayAt = (h: number, m: number) => {
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return (d.getTime() > now ? new Date(now - 10 * 60000) : d).toISOString();
  };

  const profiles: Profile[] = [
    { id: "u-aman", displayName: "Aman Verma", email: "aman@example.com" },
    { id: "u-riya", displayName: "Riya Sharma", email: "riya@example.com" },
    { id: "u-neha", displayName: "Neha Kapoor", email: "neha@example.com" },
  ];

  const groups: GroupRow[] = [
    { id: "g-community", name: "Community", topic: "Everyone, every topic", description: "The group every NoteHive member starts in.", joinCode: "CMTY42", isDefault: true, ownerId: null, extraMembers: 145, createdAt: at(90 * D) },
    { id: "g-rag", name: "RAG study group", topic: "Retrieval-augmented generation", description: "Notes on chunking, embeddings, retrieval and rerankers.", joinCode: "K7Q2MX", isDefault: false, ownerId: "u-riya", extraMembers: 21, createdAt: at(40 * D) },
    { id: "g-agents", name: "Agents deep-dive", topic: "Tool use and planning", description: "How tool-calling agents plan, act and recover.", joinCode: "AGNT7P", isDefault: false, ownerId: "u-neha", extraMembers: 8, createdAt: at(20 * D) },
  ];

  const members: Store["members"] = [
    { groupId: "g-community", userId: "u-aman", role: "member" },
    { groupId: "g-community", userId: "u-riya", role: "member" },
    { groupId: "g-community", userId: "u-neha", role: "member" },
    { groupId: "g-rag", userId: "u-riya", role: "owner" },
    { groupId: "g-rag", userId: "u-neha", role: "member" },
    { groupId: "g-agents", userId: "u-neha", role: "owner" },
    { groupId: "g-agents", userId: "u-aman", role: "member" },
    { groupId: "g-agents", userId: "u-riya", role: "member" },
  ];

  const note = (n: Partial<Store["notes"][number]> & Pick<Store["notes"][number], "id" | "ownerId" | "body">): Store["notes"][number] => ({
    groupId: null, visibility: "private", title: null, category: null, tags: [], answerId: null,
    metaLocked: false, organiseStatus: "done", createdAt: n.updatedAt ?? at(D), updatedAt: at(D), ...n,
  });

  const notes: Store["notes"] = [
    note({ id: "n-riya-chunk", ownerId: "u-riya", groupId: "g-rag", visibility: "group", title: "Chunk size for PDFs", body: "500–800 token chunks with ~100 overlap worked best for our PDFs.", category: "RAG", tags: ["chunking", "pdf"], updatedAt: at(2 * D + 3 * H), answerId: "a-pdf-riya" }),
    note({ id: "n-neha-tables", ownerId: "u-neha", groupId: "g-community", visibility: "group", title: "Keep tables in one chunk", body: "Splitting a table across chunks made every row lose its header.", category: "RAG", tags: ["tables", "chunking"], updatedAt: at(5 * D) }),
    note({ id: "n-neha-prompt", ownerId: "u-neha", groupId: "g-community", visibility: "group", title: "Prompt templates that reduced hallucinations", body: "Asking the model to quote the passage before answering cut made-up facts in our tests.", category: "Prompting", tags: ["hallucinations", "templates"], updatedAt: at(2 * H) }),
    note({ id: "n-riya-tools", ownerId: "u-riya", groupId: "g-agents", visibility: "group", title: "Tool descriptions matter more than names", body: "Rewriting each tool description as \"use this when…\" fixed most wrong-tool calls.", category: "Agents", tags: ["tools", "descriptions"], updatedAt: at(D + 2 * H) }),
    note({ id: "n-neha-evals", ownerId: "u-neha", groupId: "g-community", visibility: "group", title: "Start evals with 20 real questions", body: "A small golden set from real users caught more regressions than synthetic ones.", category: "Evaluation", tags: ["golden-set", "evals"], updatedAt: at(3 * D) }),
    note({ id: "n-aman-lora", ownerId: "u-aman", visibility: "private", title: "My doubts on LoRA", body: "## Why does rank matter?\n\nStill unclear why rank 8 vs 16 matters.\n\n- Rank 8 is the default in most guides\n- Our run at rank 16 was slower but not **clearly** better\n- Does it depend on dataset size?\n\nNext: compare `r=8` and `r=16` on the same eval set.", category: "Fine-tuning", tags: ["lora", "rank"], answerId: "a-rag-ft", metaLocked: true, updatedAt: at(2 * D) }),
    note({ id: "n-aman-rerank", ownerId: "u-aman", groupId: "g-community", visibility: "group", body: "Rerankers helped more than bigger chunks\n\nOn our docs, adding a reranker over the top 30 fixed more misses than doubling chunk size.", organiseStatus: "failed", updatedAt: at(6 * D) }),
  ];

  const src = {
    chunking: { ref: 0, type: "library", title: "Chunking basics", path: "docs/rag/chunking.md", url: "https://github.com/notehive/library/blob/main/docs/rag/chunking.md" },
    ragOverview: { ref: 0, type: "library", title: "What is RAG?", path: "docs/rag/overview.md", url: "https://github.com/notehive/library/blob/main/docs/rag/overview.md" },
    toolUse: { ref: 0, type: "library", title: "Tool use basics", path: "docs/agents/tool-use.md", url: "https://github.com/notehive/library/blob/main/docs/agents/tool-use.md" },
    reranking: { ref: 0, type: "library", title: "Rerankers", path: "docs/rag/reranking.md", url: "https://github.com/notehive/library/blob/main/docs/rag/reranking.md" },
    latency: { ref: 0, type: "library", title: "Retrieval latency budget", path: "docs/rag/latency.md", url: "https://github.com/notehive/library/blob/main/docs/rag/latency.md" },
    embeddings: { ref: 0, type: "library", title: "Embeddings explained", path: "docs/rag/embeddings.md", url: "https://github.com/notehive/library/blob/main/docs/rag/embeddings.md" },
  } satisfies Record<string, Source>;
  const noteSrc = (id: string, excerpt: string): Source => {
    const n = notes.find((x) => x.id === id)!;
    const g = groups.find((x) => x.id === n.groupId);
    return { ref: 0, type: "note", title: n.title!, noteId: n.id, authorName: profiles.find((p) => p.id === n.ownerId)!.displayName, groupId: n.groupId, groupName: g?.name ?? null, excerpt, viewerIsMember: false, available: true };
  };
  const refs = (list: Source[]) => list.map((s, i) => ({ ...s, ref: i + 1 }));

  const answers: Answer[] = [
    {
      id: "a-pdf", userId: "u-aman", question: "How should I chunk PDFs for RAG?", scopeGroupId: null, scopeName: "All knowledge", coverage: "full", latencyMs: 5210, createdAt: todayAt(14, 2),
      summary: "For PDFs, split text into chunks of roughly 500–800 tokens with about 100 tokens of overlap[2]. Overlap keeps a sentence that crosses a boundary retrievable from either side[1]. Before counting tokens, split on the document's own structure (headings, sections and paragraphs) so each chunk covers one idea[1]. Tables and figure captions lose meaning when cut, so keep each one whole[4]. Chunk size also interacts with your embedding model: very long chunks blur several topics into one vector and match queries less precisely[3]. Start in the 500–800 range, then check retrieval on real questions before tuning further[2].",
      keyPoints: [
        { text: "Start at 500–800 tokens per chunk with about 100 tokens of overlap.", sourceRefs: [2] },
        { text: "Split on headings and paragraphs first, then by token count.", sourceRefs: [1] },
        { text: "Keep each table and figure caption whole in one chunk.", sourceRefs: [4] },
        { text: "Very long chunks blur embeddings; test retrieval on real questions.", sourceRefs: [3, 2] },
      ],
      sources: refs([src.chunking, noteSrc("n-riya-chunk", "“500–800 token chunks with ~100 overlap worked best for our PDFs.”"), src.embeddings, noteSrc("n-neha-tables", "“Splitting a table across chunks made every row lose its header.”")]),
    },
    {
      id: "a-rag-ft", userId: "u-aman", question: "What's the difference between RAG and fine-tuning?", scopeGroupId: null, scopeName: "All knowledge", coverage: "partial", gap: "The library explains RAG well but has little on fine-tuning.", latencyMs: 6120, createdAt: at(2 * D + 5 * H),
      summary: "RAG leaves the model unchanged and gives it relevant passages at question time, so answers can cite sources and stay current as documents change[1]. Fine-tuning changes the model's weights on example data, which suits style and format more than new facts[2].",
      keyPoints: [
        { text: "RAG adds knowledge at question time; the model itself does not change.", sourceRefs: [1] },
        { text: "Fine-tuning changes weights and suits style or format more than facts.", sourceRefs: [2] },
        { text: "Test LoRA rank on one eval set before choosing a larger rank.", sourceRefs: [2] },
      ],
      sources: refs([src.ragOverview, noteSrc("n-aman-lora", "“Still unclear why rank 8 vs 16 matters.”")]),
    },
    {
      id: "a-tools", userId: "u-aman", question: "How do tool-calling agents decide which tool to use?", scopeGroupId: "g-agents", scopeName: "Agents deep-dive", coverage: "full", latencyMs: 4870, createdAt: at(4 * D + 2 * H),
      summary: "A tool-calling model picks a tool by reading each tool's name, description and parameter schema alongside the conversation[1]. In practice the description carries most of the weight: Riya's note found that rewriting each one as \"use this when…\" fixed most wrong-tool calls[2]. Keep tools few and clearly separated, because overlapping descriptions make the choice ambiguous[1].",
      keyPoints: [
        { text: "The model reads tool names, descriptions and schemas to choose.", sourceRefs: [1] },
        { text: "Write descriptions as \"use this when…\" to cut wrong-tool calls.", sourceRefs: [2] },
        { text: "Avoid tools whose descriptions overlap.", sourceRefs: [1] },
      ],
      sources: refs([src.toolUse, noteSrc("n-riya-tools", "“Rewriting each tool description as \"use this when…\" fixed most wrong-tool calls.”")]),
    },
    {
      id: "a-rerank", userId: "u-aman", question: "When is a reranker worth the extra latency?", scopeGroupId: "g-community", scopeName: "Community", coverage: "full", latencyMs: 5530, createdAt: at(7 * D),
      summary: "A reranker re-scores the top retrieved chunks with a slower, more accurate model, which usually lifts the best chunk into the first few results[1]. It is worth the extra latency when first-stage retrieval returns the right chunk but ranks it too low[1]. Budget for roughly 100–300 ms per rerank of 20–50 candidates[2].",
      keyPoints: [
        { text: "Rerankers reorder candidates; they cannot fix chunks that were never retrieved.", sourceRefs: [1] },
        { text: "Use one when the right chunk is found but ranked low.", sourceRefs: [1] },
        { text: "Expect about 100–300 ms for 20–50 candidates.", sourceRefs: [2] },
      ],
      sources: refs([src.reranking, src.latency]),
    },
    // Riya's own history; only the question text is ever shown to others (FR-NOTE-09).
    { id: "a-pdf-riya", userId: "u-riya", question: "How should I chunk PDFs for RAG?", scopeGroupId: null, scopeName: "All knowledge", coverage: "partial", summary: "", keyPoints: [], sources: [refs([src.chunking])[0]], latencyMs: 4800, createdAt: at(2 * D + 4 * H) },
  ];

  return { profiles, groups, members, notes, answers };
}

const g = globalThis as unknown as { __notehive?: Store };
function store(): Store {
  return (g.__notehive ??= seed());
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function genCode(existing: string[]): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (;;) {
    let c = "";
    for (let i = 0; i < 6; i++) c += alphabet[Math.floor(Math.random() * alphabet.length)];
    if (!existing.includes(c)) return c;
  }
}

class NotFound extends Error {
  code = "NOT_FOUND";
}
class Forbidden extends Error {
  code = "FORBIDDEN";
}

export function createMockData(viewerId: string | null): DataSource {
  const s = store();
  const me = () => {
    if (!viewerId) throw new Forbidden("UNAUTHENTICATED");
    return viewerId;
  };
  const isMember = (groupId: string, userId = viewerId) => s.members.some((m) => m.groupId === groupId && m.userId === userId);
  const memberCount = (row: GroupRow) => row.extraMembers + s.members.filter((m) => m.groupId === row.id).length;

  const toGroup = (row: GroupRow): Group => {
    const membership = s.members.find((m) => m.groupId === row.id && m.userId === viewerId);
    return {
      id: row.id, name: row.name, topic: row.topic, description: row.description, isDefault: row.isDefault,
      memberCount: memberCount(row),
      ownerName: s.profiles.find((p) => p.id === row.ownerId)?.displayName ?? null,
      role: membership?.role ?? null,
      joinCode: membership ? row.joinCode : null,
    };
  };

  const hydrate = (n: Store["notes"][number]): Note => ({
    ...n,
    authorName: s.profiles.find((p) => p.id === n.ownerId)?.displayName ?? "Unknown",
    groupName: s.groups.find((x) => x.id === n.groupId)?.name ?? null,
    answerQuestion: s.answers.find((a) => a.id === n.answerId)?.question ?? null,
  });

  const canRead = (n: Store["notes"][number]) => !!viewerId && (n.ownerId === viewerId || n.visibility === "group");
  const byUpdated = (a: { updatedAt: string }, b: { updatedAt: string }) => b.updatedAt.localeCompare(a.updatedAt);

  /** Re-check note sources at read time: membership changes and later deletes/privacy (PRD section 15). */
  const refreshSources = (a: Answer): Answer => ({
    ...a,
    sources: a.sources.map((src) => {
      if (src.type !== "note") return src;
      const n = s.notes.find((x) => x.id === src.noteId);
      return {
        ...src,
        available: !!n && canRead(n),
        viewerIsMember: src.groupId ? isMember(src.groupId) : false,
      };
    }),
  });

  return {
    async viewer() {
      return s.profiles.find((p) => p.id === viewerId) ?? null;
    },
    async updateDisplayName(name) {
      const p = s.profiles.find((x) => x.id === me());
      if (p) p.displayName = name;
    },

    async myGroups() {
      if (!viewerId) return [];
      return s.groups
        .filter((row) => isMember(row.id))
        .map(toGroup)
        .sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.name.localeCompare(b.name));
    },
    async group(id) {
      const row = s.groups.find((x) => x.id === id);
      return row ? ({ ...toGroup(row), isMember: isMember(id) } satisfies GroupDetail) : null;
    },
    async groupNotes(groupId) {
      return s.notes.filter((n) => n.groupId === groupId && n.visibility === "group").sort(byUpdated).map(hydrate);
    },
    async createGroup({ name, topic, description }) {
      const row: GroupRow = {
        id: uid("g"), name, topic: topic || null, description: description || null,
        joinCode: genCode(s.groups.map((x) => x.joinCode)), isDefault: false, ownerId: me(), extraMembers: 0, createdAt: new Date().toISOString(),
      };
      s.groups.push(row);
      s.members.push({ groupId: row.id, userId: me(), role: "owner" });
      return toGroup(row);
    },
    async joinGroup(groupId) {
      const row = s.groups.find((x) => x.id === groupId);
      if (!row) throw new NotFound("Group not found");
      const alreadyMember = isMember(groupId);
      if (!alreadyMember) s.members.push({ groupId, userId: me(), role: "member" });
      return { group: toGroup(row), alreadyMember };
    },
    async groupMembers(groupId) {
      return s.members
        .filter((m) => m.groupId === groupId)
        .map((m): GroupMember => {
          const p = s.profiles.find((x) => x.id === m.userId);
          return { userId: m.userId, displayName: p?.displayName ?? "Unknown", avatarUrl: p?.avatarUrl ?? null, role: m.role, joinedAt: new Date().toISOString() };
        })
        .sort((a, b) => (a.role === "owner" ? -1 : b.role === "owner" ? 1 : 0));
    },
    async joinByCode(code) {
      const row = s.groups.find((x) => x.joinCode === code.trim().toUpperCase());
      if (!row) return null;
      return this.joinGroup(row.id);
    },

    async recentAnswers(limit = 20) {
      return s.answers.filter((a) => a.userId === viewerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
    },
    async answer(id) {
      const a = s.answers.find((x) => x.id === id && x.userId === viewerId);
      return a ? refreshSources(a) : null;
    },
    async saveAnswer(input) {
      const a: Answer = { ...input, id: uid("a"), userId: me(), createdAt: new Date().toISOString() };
      s.answers.push(a);
      return refreshSources(a);
    },
    async askTimesSince(sinceIso) {
      return s.answers.filter((a) => a.userId === viewerId && a.createdAt >= sinceIso).map((a) => a.createdAt).sort();
    },

    async latestGroupNotes(limit = 3) {
      if (!viewerId) return [];
      return s.notes
        .filter((n) => n.visibility === "group" && n.groupId && isMember(n.groupId) && n.ownerId !== viewerId && n.organiseStatus === "done")
        .sort(byUpdated)
        .slice(0, limit)
        .map(hydrate);
    },
    async myNotes() {
      return s.notes.filter((n) => n.ownerId === viewerId).sort(byUpdated).map(hydrate);
    },
    async note(id) {
      const n = s.notes.find((x) => x.id === id);
      return n && canRead(n) ? hydrate(n) : null;
    },
    async notePreview(id) {
      const n = s.notes.find((x) => x.id === id);
      if (!n || n.visibility !== "group") return null;
      const h = hydrate(n);
      return { id: h.id, title: h.title, authorName: h.authorName, groupName: h.groupName, category: h.category, updatedAt: h.updatedAt, body: "" };
    },
    async notesForAnswer(answerId) {
      return s.notes.filter((n) => n.answerId === answerId && n.ownerId === viewerId).sort(byUpdated).map(hydrate);
    },
    async createNote(input) {
      const owner = me();
      if (input.visibility === "group" && (!input.groupId || !isMember(input.groupId))) throw new Forbidden("Join the group to post here.");
      const now = new Date().toISOString();
      const row: Store["notes"][number] = {
        id: uid("n"), ownerId: owner, groupId: input.visibility === "group" ? input.groupId : null, visibility: input.visibility,
        title: null, body: input.body, category: null, tags: [], answerId: input.answerId ?? null,
        metaLocked: false, organiseStatus: "pending", createdAt: now, updatedAt: now,
      };
      s.notes.push(row);
      return hydrate(row);
    },
    async updateNote(id, patch) {
      const n = s.notes.find((x) => x.id === id);
      if (!n) throw new NotFound("This note is private or no longer exists.");
      if (n.ownerId !== me()) throw new Forbidden("Only the owner can change this note.");
      if (patch.visibility) {
        const groupId = patch.visibility === "group" ? patch.groupId ?? n.groupId : null;
        if (patch.visibility === "group" && (!groupId || !isMember(groupId))) throw new Forbidden("You can only post to groups you belong to.");
        n.visibility = patch.visibility;
        n.groupId = groupId;
      }
      const metaEdited =
        (patch.title !== undefined && patch.title !== n.title) ||
        (patch.category !== undefined && patch.category !== n.category) ||
        (patch.tags !== undefined && patch.tags.join() !== n.tags.join());
      if (patch.title !== undefined) n.title = patch.title;
      if (patch.category !== undefined) n.category = patch.category;
      if (patch.tags !== undefined) n.tags = patch.tags;
      if (metaEdited) n.metaLocked = true;
      if (patch.body !== undefined && patch.body !== n.body) {
        n.body = patch.body;
        n.organiseStatus = "pending";
      }
      n.updatedAt = new Date().toISOString();
      return hydrate(n);
    },
    async deleteNote(id) {
      const i = s.notes.findIndex((x) => x.id === id);
      if (i < 0) return;
      if (s.notes[i].ownerId !== me()) throw new Forbidden("Only the owner can delete this note.");
      s.notes.splice(i, 1);
    },
    async organiseNote(id) {
      const n = s.notes.find((x) => x.id === id);
      if (!n || n.ownerId !== me()) throw new NotFound("Note not found");
      n.organiseStatus = "pending";
      const stamp = n.updatedAt;
      const question = s.answers.find((a) => a.id === n.answerId)?.question;
      // WF-2 runs in the background; mimic a ~2 s Claude Haiku call.
      setTimeout(() => {
        const cur = s.notes.find((x) => x.id === id);
        if (!cur || cur.updatedAt !== stamp) return; // stale run: a newer save wins
        if (!cur.metaLocked) {
          const meta = organiseHeuristic(cur.body, question);
          cur.title = meta.title;
          cur.category = isCategory(meta.category) ? (meta.category as Category) : "Other";
          cur.tags = meta.tags;
        }
        cur.organiseStatus = "done";
      }, 2000);
    },
  };
}
