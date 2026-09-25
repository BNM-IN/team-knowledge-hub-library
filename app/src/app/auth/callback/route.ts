import { NextResponse } from "next/server";
import { safeNext } from "@/lib/safe-next";
import { createSupabaseServer } from "@/lib/supabase/server";

/** Google → Supabase → here. Exchange the code, then show the "Signing you in…" interstitial (S1 · A2). */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next"));
  const back = (reason: string) => NextResponse.redirect(new URL(`/signin?reason=${reason}&next=${encodeURIComponent(next)}`, url.origin));

  const oauthError = url.searchParams.get("error");
  if (oauthError) return back(oauthError === "access_denied" ? "cancelled" : "failed");

  const code = url.searchParams.get("code");
  if (!code) return back("failed");
  const { error } = await (await createSupabaseServer()).auth.exchangeCodeForSession(code);
  if (error) return back("failed");
  return NextResponse.redirect(new URL(`/auth/continuing?next=${encodeURIComponent(next)}`, url.origin));
}
