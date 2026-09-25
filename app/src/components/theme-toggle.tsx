"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Icon } from "./ui";

const subscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // The theme is only known on the client; render a neutral button during SSR.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const dark = mounted && resolvedTheme === "dark";
  const label = dark ? "Switch to light theme" : "Switch to dark theme";
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-control border border-line bg-surface text-ink-2 hover:bg-surface-2"
    >
      <Icon name={mounted ? (dark ? "light_mode" : "dark_mode") : "contrast"} />
    </button>
  );
}
