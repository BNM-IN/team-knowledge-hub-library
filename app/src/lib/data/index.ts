import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { DEMO_COOKIE, USE_MOCKS } from "../config";
import { createSupabaseServer } from "../supabase/server";
import { createMockData, DEMO_USER_ID } from "./mock";
import type { DataSource } from "./types";

export type { DataSource, GroupDetail } from "./types";

/** One DataSource per request: the in-memory mock or Supabase with the user's session (RLS enforced). */
export const getData = cache(async (): Promise<DataSource> => {
  if (USE_MOCKS) {
    const jar = await cookies();
    return createMockData(jar.get(DEMO_COOKIE)?.value === "1" ? DEMO_USER_ID : null);
  }
  return (await import("./supabase")).createSupabaseData(await createSupabaseServer());
});

export const getViewer = cache(async () => (await getData()).viewer());
