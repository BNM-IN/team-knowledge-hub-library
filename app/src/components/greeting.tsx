"use client";

import { useSyncExternalStore } from "react";
import { firstName, greeting } from "@/lib/format";

const subscribe = () => () => {};

/** Uses the viewer's local time; the server render falls back to a neutral greeting. */
export function Greeting({ name }: { name: string }) {
  const hour = useSyncExternalStore(subscribe, () => new Date().getHours(), () => -1);
  return <>{hour < 0 ? `Hello, ${firstName(name)}` : greeting(hour, name)}</>;
}
