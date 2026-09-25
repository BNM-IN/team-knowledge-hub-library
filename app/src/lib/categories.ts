// PRD Appendix A · fixed category list
export const CATEGORIES = [
  "LLM Basics",
  "Prompting",
  "RAG",
  "Agents",
  "Fine-tuning",
  "Evaluation",
  "Tools & Platforms",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export function isCategory(v: unknown): v is Category {
  return typeof v === "string" && (CATEGORIES as readonly string[]).includes(v);
}
