import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { apiError } from "@/lib/api-error";
import { generateAnswer } from "@/lib/ask";
import { USE_MOCKS } from "@/lib/config";
import { getData } from "@/lib/data";
import { timeLabel } from "@/lib/format";
import { askBlockedUntil } from "@/lib/rate-limit";
import type { Answer } from "@/lib/types";

export const maxDuration = 30;

const body = z.object({
  question: z.string().trim().min(3, "Ask with at least 3 characters.").max(500, "Keep questions under 500 characters."),
  scope_group_id: z.string().min(1).nullable().default(null),
});

export async function POST(req: Request) {
  const data = await getData();
  const viewer = await data.viewer();
  if (!viewer) return apiError("UNAUTHENTICATED", "Sign in to ask a question.");

  const parsed = body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return apiError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid question.");
  const { question, scope_group_id } = parsed.data;

  let scopeName = "All knowledge";
  if (scope_group_id) {
    const group = await data.group(scope_group_id);
    if (!group) return apiError("NOT_FOUND", "That group doesn't exist.");
    scopeName = group.name;
  }

  // FR-ASK-11 · 30 questions per user per hour
  const blockedUntil = await askBlockedUntil(data);
  if (blockedUntil) {
    return apiError("RATE_LIMITED", `You can ask again at ${timeLabel(blockedUntil.toISOString())}.`, {
      retry_after_s: Math.max(1, Math.ceil((blockedUntil.getTime() - Date.now()) / 1000)),
    });
  }

  let generated;
  try {
    generated = await generateAnswer(data, { question, scopeGroupId: scope_group_id, scopeName, userId: viewer.id });
  } catch (err) {
    console.error("[ask] generation failed", err);
    if (err instanceof ZodError) return apiError("AI_BAD_OUTPUT", "Couldn't get an answer. Try again.");
    if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) return apiError("AI_TIMEOUT", "Couldn't get an answer. Try again.");
    return apiError("INTERNAL", "Couldn't get an answer. Try again.");
  }

  let answer: Answer;
  if (USE_MOCKS) {
    answer = await data.saveAnswer(generated);
  } else {
    // RLS allows answer inserts only from this server path (service role).
    const { createSupabaseAdmin } = await import("@/lib/supabase/admin");
    const { data: row, error } = await createSupabaseAdmin()
      .from("answers")
      .insert({
        user_id: viewer.id, question, scope_group_id, summary: generated.summary, coverage: generated.coverage, latency_ms: generated.latencyMs,
        key_points: generated.keyPoints.map((k) => ({ text: k.text, source_refs: k.sourceRefs })),
        sources: generated.sources.map((s) =>
          s.type === "library"
            ? { ref: s.ref, type: s.type, title: s.title, url: s.url, path: s.path }
            : { ref: s.ref, type: s.type, title: s.title, note_id: s.noteId, author_name: s.authorName, group_id: s.groupId, group_name: s.groupName, excerpt: s.excerpt },
        ),
      })
      .select("id")
      .single();
    if (error || !row) {
      console.error("[ask] store failed", error);
      return apiError("INTERNAL", "Couldn't get an answer. Try again.");
    }
    answer = (await data.answer(row.id))!;
  }

  return NextResponse.json({ answer_id: answer.id, coverage: answer.coverage, latency_ms: answer.latencyMs });
}
