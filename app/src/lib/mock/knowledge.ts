// Canned knowledge for USE_MOCKS=true. Each topic mirrors what the n8n `ask`
// workflow would return for a matching question (PRD section 11, WF-1).
import type { Category } from "../categories";
import type { Coverage } from "../types";

export interface LibraryDoc {
  id: string;
  title: string;
  path: string;
}

export const LIBRARY: Record<string, LibraryDoc> = {
  chunking: { id: "lib-chunking", title: "Chunking basics", path: "docs/rag/chunking.md" },
  embeddings: { id: "lib-embeddings", title: "Embeddings explained", path: "docs/rag/embeddings.md" },
  ragOverview: { id: "lib-rag", title: "What is RAG?", path: "docs/rag/overview.md" },
  reranking: { id: "lib-rerank", title: "Rerankers", path: "docs/rag/reranking.md" },
  latency: { id: "lib-latency", title: "Retrieval latency budget", path: "docs/rag/latency.md" },
  toolUse: { id: "lib-tools", title: "Tool use basics", path: "docs/agents/tool-use.md" },
  ragEvals: { id: "lib-evals", title: "Evaluating RAG", path: "docs/evaluation/rag-evals.md" },
  systemPrompts: { id: "lib-prompts", title: "Writing system prompts", path: "docs/prompting/system-prompts.md" },
  lora: { id: "lib-lora", title: "LoRA in one page", path: "docs/fine-tuning/lora.md" },
};

export const LIBRARY_REPO = "https://github.com/notehive/library/blob/main/";

/** A source in a topic: either a library doc key or a seeded note id. */
export type TopicSource = { lib: keyof typeof LIBRARY } | { note: string };

export interface Topic {
  keywords: RegExp;
  coverage: Exclude<Coverage, "none">;
  gap?: string;
  sources: TopicSource[];
  /** Summary sentences, each citing 1-based indexes into `sources`. */
  summary: [string, number[]][];
  keyPoints: [string, number[]][];
}

export const TOPICS: Topic[] = [
  {
    keywords: /chunk|pdf|overlap|split/i,
    coverage: "full",
    sources: [{ lib: "chunking" }, { note: "n-riya-chunk" }, { lib: "embeddings" }, { note: "n-neha-tables" }],
    summary: [
      ["For PDFs, split text into chunks of roughly 500–800 tokens with about 100 tokens of overlap", [2]],
      ["Overlap keeps a sentence that crosses a boundary retrievable from either side", [1]],
      ["Before counting tokens, split on the document's own structure (headings, sections and paragraphs) so each chunk covers one idea", [1]],
      ["Tables and figure captions lose meaning when cut, so keep each one whole", [4]],
      ["Chunk size also interacts with your embedding model: very long chunks blur several topics into one vector and match queries less precisely", [3]],
      ["Start in the 500–800 range, then check retrieval on real questions before tuning further", [2]],
    ],
    keyPoints: [
      ["Start at 500–800 tokens per chunk with about 100 tokens of overlap.", [2]],
      ["Split on headings and paragraphs first, then by token count.", [1]],
      ["Keep each table and figure caption whole in one chunk.", [4]],
      ["Very long chunks blur embeddings; test retrieval on real questions.", [3, 2]],
    ],
  },
  {
    keywords: /fine.?tun|lora|rag vs|difference between rag/i,
    coverage: "partial",
    gap: "The library explains RAG well but has little on fine-tuning.",
    sources: [{ lib: "ragOverview" }, { note: "n-aman-lora" }, { lib: "lora" }],
    summary: [
      ["RAG leaves the model unchanged and gives it relevant passages at question time, so answers can cite sources and stay current as documents change", [1]],
      ["Fine-tuning changes the model's weights on example data, which suits style and format more than new facts", [2]],
      ["LoRA is a cheaper way to fine-tune: it trains small adapter matrices instead of the whole model, and the rank sets how large those adapters are", [3]],
      ["Your own note flags that rank 16 was slower than rank 8 without being clearly better, which is worth testing on one eval set", [2]],
    ],
    keyPoints: [
      ["RAG adds knowledge at question time; the model itself does not change.", [1]],
      ["Fine-tuning changes weights and suits style or format more than facts.", [2, 3]],
      ["LoRA trains small adapters; rank controls their size.", [3]],
    ],
  },
  {
    keywords: /tool|function.?call/i,
    coverage: "full",
    sources: [{ lib: "toolUse" }, { note: "n-riya-tools" }],
    summary: [
      ["A tool-calling model picks a tool by reading each tool's name, description and parameter schema alongside the conversation", [1]],
      ["In practice the description carries most of the weight: Riya's note found that rewriting each one as \"use this when…\" fixed most wrong-tool calls", [2]],
      ["Keep tools few and clearly separated, because overlapping descriptions make the choice ambiguous", [1]],
      ["When the model is unsure, it should ask a clarifying question rather than guess", [1]],
    ],
    keyPoints: [
      ["The model reads tool names, descriptions and schemas to choose.", [1]],
      ["Write descriptions as \"use this when…\" to cut wrong-tool calls.", [2]],
      ["Avoid tools whose descriptions overlap.", [1]],
    ],
  },
  {
    keywords: /rerank|latency/i,
    coverage: "full",
    sources: [{ lib: "reranking" }, { lib: "latency" }],
    summary: [
      ["A reranker re-scores the top retrieved chunks with a slower, more accurate model, which usually lifts the best chunk into the first few results", [1]],
      ["It is worth the extra latency when first-stage retrieval returns the right chunk but ranks it too low, which is common with short or ambiguous questions", [1]],
      ["Budget for roughly 100–300 ms per rerank of 20–50 candidates, and skip it when answers must stream instantly", [2]],
    ],
    keyPoints: [
      ["Rerankers reorder candidates; they cannot fix chunks that were never retrieved.", [1]],
      ["Use one when the right chunk is found but ranked low.", [1]],
      ["Expect about 100–300 ms for 20–50 candidates.", [2]],
    ],
  },
  {
    keywords: /eval|golden|test|metric/i,
    coverage: "full",
    sources: [{ lib: "ragEvals" }, { note: "n-neha-evals" }],
    summary: [
      ["Evaluate a RAG pipeline in two parts: retrieval (did the right chunk come back?) and generation (is the answer faithful to it?)", [1]],
      ["Neha's note suggests starting with about 20 real questions from users, which caught more regressions than synthetic ones", [2]],
      ["Record the expected source for each question and re-run the set after every change to prompts, chunking or models", [1]],
    ],
    keyPoints: [
      ["Measure retrieval and generation separately.", [1]],
      ["Start with ~20 real questions and their expected sources.", [2, 1]],
      ["Re-run the set after every pipeline change.", [1]],
    ],
  },
  {
    keywords: /prompt|hallucinat|system message/i,
    coverage: "full",
    sources: [{ lib: "systemPrompts" }, { note: "n-neha-prompt" }],
    summary: [
      ["A good system prompt states the role, the task, the rules and the output format, in that order, in plain sentences", [1]],
      ["Neha's note found that asking the model to quote the supporting passage before answering cut made-up facts in their tests", [2]],
      ["Keep examples short and put anything the model must never do in its own clearly marked section", [1]],
    ],
    keyPoints: [
      ["State role, task, rules and format.", [1]],
      ["Ask for a supporting quote before the answer to reduce hallucinations.", [2]],
      ["Mark hard rules clearly and keep examples short.", [1]],
    ],
  },
  {
    keywords: /embedding|vector/i,
    coverage: "full",
    sources: [{ lib: "embeddings" }, { lib: "chunking" }],
    summary: [
      ["An embedding is a list of numbers that places a piece of text in space so that texts with similar meaning land close together", [1]],
      ["Search compares the question's embedding with each chunk's embedding and returns the closest ones", [1]],
      ["Because one chunk becomes one vector, chunks that mix several topics match questions less precisely", [2]],
    ],
    keyPoints: [
      ["Embeddings turn text into vectors; similar meaning means nearby vectors.", [1]],
      ["Retrieval returns the chunks nearest to the question.", [1]],
      ["Keep each chunk to one idea for sharper matches.", [2]],
    ],
  },
];

export function findTopic(question: string): Topic | null {
  return TOPICS.find((t) => t.keywords.test(question)) ?? null;
}

// Heuristics for mock organising (WF-2). The real workflow calls Claude Haiku.
const CATEGORY_HINTS: [RegExp, Category][] = [
  [/chunk|embedding|retriev|rerank|vector|rag\b/i, "RAG"],
  [/agent|tool|orchestrat|planner/i, "Agents"],
  [/lora|fine.?tun|adapter|rank \d|dataset/i, "Fine-tuning"],
  [/eval|golden|metric|test set|regression/i, "Evaluation"],
  [/prompt|system message|few.?shot|hallucinat/i, "Prompting"],
  [/token|context window|model choice|llm/i, "LLM Basics"],
  [/n8n|supabase|api|zapier|platform/i, "Tools & Platforms"],
];

const STOP = new Set(
  "the a an and or but for with from into onto that this these those what when why how which who our your my their its it's is are was were be been being to of in on at by as it i we you they he she not no yes do does did so if then than too very can could should would will just about more most less also only still until after before over under again keep keeping kept fix fixed fixing work worked works working use used using make made best better good really each every one two some".split(" "),
);

export function organiseHeuristic(body: string, question?: string | null) {
  const text = `${body}\n${question ?? ""}`;
  const category = CATEGORY_HINTS.find(([re]) => re.test(text))?.[1] ?? "Other";
  const firstLine = (body.split("\n").find((l) => l.trim()) ?? "").replace(/^#+\s*|[*_`>]/g, "").trim();
  const title = firstLine.split(/\s+/).slice(0, 8).join(" ").replace(/[.:;,]$/, "") || "Untitled note";
  const counts = new Map<string, number>();
  for (const w of text.toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) ?? []) {
    if (!STOP.has(w)) counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  const tags = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, 3)
    .map(([w]) => w);
  for (const fallback of [category.toLowerCase().replace(/[^a-z]+/g, "-"), "notes"]) {
    if (tags.length >= 2) break;
    if (!tags.includes(fallback)) tags.push(fallback);
  }
  return { title, category, tags };
}
