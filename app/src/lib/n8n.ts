import "server-only";

// Webhook names in the team's "KH · core" n8n workflow; override per environment if they change.
const WEBHOOKS = {
  ask: process.env.N8N_ASK_WEBHOOK ?? "kh-ask",
  "organise-note": process.env.N8N_ORGANISE_WEBHOOK ?? "kh-organise-note",
} as const;

/** Calls an n8n webhook with the shared secret (PRD 8.1). The browser never calls n8n directly. */
export async function callN8n<T>(hook: keyof typeof WEBHOOKS, body: unknown, timeoutMs = 30_000): Promise<T> {
  const base = process.env.N8N_BASE_URL;
  if (!base) throw new Error("N8N_BASE_URL is not set");
  const res = await fetch(`${base.replace(/\/$/, "")}/webhook/${WEBHOOKS[hook]}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-webhook-secret": process.env.N8N_WEBHOOK_SECRET ?? "" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`n8n ${WEBHOOKS[hook]} responded ${res.status}`);
  return (await res.json()) as T;
}
