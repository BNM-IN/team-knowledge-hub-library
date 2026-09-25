"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { timeLabel, dayLabel } from "./format";

interface Draft {
  body: string;
  at: string;
}

function read(key: string): Draft | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

/**
 * FR-NOTE-10: unsaved editor text is kept locally and restored after a reload.
 * Returns the value, a setter, a "restored from" label (when a draft was restored), and helpers.
 */
export function useDraft(key: string, initial: string) {
  const [value, setValue] = useState(initial);
  const [restoredFrom, setRestoredFrom] = useState<string | null>(null);
  const initialRef = useRef(initial);
  const skipSave = useRef(true);

  useEffect(() => {
    const d = read(key);
    if (d && d.body.trim() && d.body !== initialRef.current) {
      // localStorage is only readable after mount.
      setValue(d.body);
      const day = dayLabel(d.at);
      setRestoredFrom(`${day === "Today" ? "today" : day}, ${timeLabel(d.at)}`);
    }
  }, [key]);

  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    const t = setTimeout(() => {
      try {
        if (value.trim() && value !== initialRef.current) localStorage.setItem(key, JSON.stringify({ body: value, at: new Date().toISOString() }));
        else localStorage.removeItem(key);
      } catch {
        // Storage unavailable (private mode): drafts just aren't kept.
      }
    }, 300);
    return () => clearTimeout(t);
  }, [key, value]);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {}
    setRestoredFrom(null);
  }, [key]);

  const discard = useCallback(() => {
    clear();
    setValue(initialRef.current);
  }, [clear]);

  return { value, setValue, restoredFrom, clear, discard, dismissBanner: () => setRestoredFrom(null) };
}
