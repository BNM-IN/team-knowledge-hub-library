import "server-only";
import { z } from "zod";
import { LIBRARY, LIBRARY_REPO, findTopic } from "./mock/knowledge";
import { callN8n } from "./n8n";
import type { DataSource } from "./data";
import type { Answer, Coverage, Source } from "./types";

export type GeneratedAnswer = Omit<Answer, "id" | "userId" | "createdAt">;

// Contract for n8n `ask` (PRD section 10). Validated before anything is stored.
const n8nAnswer = z.object({
  coverage: z.enum(["full", "partial", "none"]),
  summary: z.string(),
  gap: z.string().nullish(),
  key_points: z.array(z.object({ text: z.string(), source_refs: z.array(z.number().int()) })),
  sources: z.array(
    z.union([
      z.object({ ref: z.number().int(), type: z.literal("library"), title: z.string(), url: z.string(), path: z.string().optional() }),
      z.object({
        ref: z.number().int(), type: z.literal("note"), title: z.string(), note_id: z.string(), author_name: z.string(),
        group_id: z.string().nullable(), group_name: z.string().nullable(), excerpt: z.string().optional(),
      }),
    ]),
  ),
  latency_ms: z.number().optional(),
});

export async function generateAnswer(
  data: DataSource,
  input: { question: string; scopeGroupId: string | null; scopeName: string; userId: string },
): Promise<GeneratedAnswer> {
  if (process.env.N8N_BASE_URL && process.env.USE_MOCKS === "false") {
    const started = Date.now();
    const raw = await callN8n("ask", { question: input.question, user_id: input.userId, scope_group_id: input.scopeGroupId });
    const parsed = n8nAnswer.parse(raw);
    return {
      question: input.question, scopeGroupId: input.scopeGroupId, scopeName: input.scopeName,
      coverage: parsed.coverage, summary: parsed.summary, gap: parsed.gap ?? null,
      keyPoints: parsed.key_points.map((k) => ({ text: k.text, sourceRefs: k.source_refs })),
      sources: parsed.sources.map((s): Source =>
        s.type === "library"
          ? { ref: s.ref, type: "library", title: s.title, url: s.url, path: s.path ?? s.url }
          : { ref: s.ref, type: "note", title: s.title, noteId: s.note_id, authorName: s.author_name, groupId: s.group_id, groupName: s.group_name, excerpt: s.excerpt ?? "", viewerIsMember: false, available: true },
      ),
      latencyMs: parsed.latency_ms ?? Date.now() - started,
    };
  }
  return mockAnswer(data, input);
}

/** Mock of WF-1: retrieve from the canned topics, honour scope and read rules, never invent sources. */
async function mockAnswer(
  data: DataSource,
  input: { question: string; scopeGroupId: string | null; scopeName: string },
): Promise<GeneratedAnswer> {
  const started = Date.now();
  await new Promise((r) => setTimeout(r, 2200 + Math.random() * 900));
  const none: GeneratedAnswer = {
    question: input.question, scopeGroupId: input.scopeGroupId, scopeName: input.scopeName,
    coverage: "none", summary: "", keyPoints: [], sources: [], latencyMs: 0,
  };
  const topic = findTopic(input.question);
  if (!topic) return { ...none, latencyMs: Date.now() - started };

  // Resolve each topic source; drop any the asker may not read or that fall outside the scope.
  const resolved: (Source | null)[] = await Promise.all(
    topic.sources.map(async (ts): Promise<Source | null> => {
      if ("lib" in ts) {
        const doc = LIBRARY[ts.lib];
        return { ref: 0, type: "library", title: doc.title, path: doc.path, url: LIBRARY_REPO + doc.path };
      }
      const n = await data.note(ts.note);
      if (!n || n.organiseStatus !== "done") return null;
      if (input.scopeGroupId ? n.groupId !== input.scopeGroupId : false) return null;
      return {
        ref: 0, type: "note", title: n.title ?? "", noteId: n.id, authorName: n.authorName, groupId: n.groupId, groupName: n.groupName,
        excerpt: `“${n.body.split("\n").find((l) => l.trim() && !l.startsWith("#")) ?? n.body}”`, viewerIsMember: false, available: true,
      };
    }),
  );

  // Renumber the surviving sources 1..n and keep only sentences whose citations all survived.
  const remap = new Map<number, number>();
  const sources: Source[] = [];
  resolved.forEach((s, i) => {
    if (!s) return;
    remap.set(i + 1, sources.length + 1);
    sources.push({ ...s, ref: sources.length + 1 });
  });
  const cite = (refs: number[]) => (refs.every((r) => remap.has(r)) ? refs.map((r) => remap.get(r)!) : null);

  const sentences = topic.summary.flatMap(([text, refs]) => {
    const c = cite(refs);
    return c ? [`${text}${c.map((n) => `[${n}]`).join("")}.`] : [];
  });
  const keyPoints = topic.keyPoints.flatMap(([text, refs]) => {
    const c = cite(refs);
    return c ? [{ text, sourceRefs: c }] : [];
  });
  if (!sentences.length || !keyPoints.length) return { ...none, latencyMs: Date.now() - started };

  // Losing sources to scope or access rules means the answer is only partly covered.
  const coverage: Coverage = sources.length < topic.sources.length ? "partial" : topic.coverage;
  return {
    question: input.question, scopeGroupId: input.scopeGroupId, scopeName: input.scopeName,
    coverage, gap: coverage === "partial" ? topic.gap ?? "Some of this question isn't covered in this scope yet." : null,
    summary: sentences.join(" "), keyPoints, sources, latencyMs: Date.now() - started,
  };
}
