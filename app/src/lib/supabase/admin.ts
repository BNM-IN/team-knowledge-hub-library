import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Service-role client for server-only writes that RLS reserves for the app (answers insert). */
export function createSupabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required to store answers");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, { auth: { persistSession: false } });
}
