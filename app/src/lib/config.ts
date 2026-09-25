/** Mocks are on unless USE_MOCKS=false and Supabase is configured. */
export const USE_MOCKS =
  process.env.USE_MOCKS !== "false" || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const ASK_RATE_LIMIT_PER_HOUR = Number(process.env.ASK_RATE_LIMIT_PER_HOUR ?? 30);
export const DEFAULT_GROUP_NAME = process.env.DEFAULT_GROUP_NAME ?? "Community";

/** Cookie that marks a signed-in demo session when USE_MOCKS is on. */
export const DEMO_COOKIE = "nh_demo_session";
