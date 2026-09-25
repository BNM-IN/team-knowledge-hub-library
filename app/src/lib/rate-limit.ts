import "server-only";
import { ASK_RATE_LIMIT_PER_HOUR } from "./config";
import type { DataSource } from "./data";

/** FR-ASK-11: returns when the viewer can ask again, or null if they are under the hourly limit. */
export async function askBlockedUntil(data: DataSource): Promise<Date | null> {
  const now = Date.now();
  const times = await data.askTimesSince(new Date(now - 3600_000).toISOString());
  if (times.length < ASK_RATE_LIMIT_PER_HOUR) return null;
  return new Date(new Date(times[times.length - ASK_RATE_LIMIT_PER_HOUR]).getTime() + 3600_000);
}
