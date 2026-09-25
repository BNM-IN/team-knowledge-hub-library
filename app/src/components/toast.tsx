"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Icon } from "./ui";

interface ToastInput {
  message: string;
  icon?: string;
  /** Shown for reversible actions such as a visibility change (PRD 7.3). */
  undo?: () => void;
}
interface ToastItem extends ToastInput {
  id: number;
}

const ToastContext = createContext<(t: ToastInput) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => setItems((xs) => xs.filter((x) => x.id !== id)), []);
  const push = useCallback(
    (t: ToastInput) => {
      const id = ++seq.current;
      setItems((xs) => [...xs.slice(-2), { ...t, id }]);
      setTimeout(() => dismiss(id), t.undo ? 7000 : 4500);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={push}>
      {children}
      {/* Announced to screen readers (PRD 7.6) */}
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex w-full max-w-[360px] items-center gap-2.5 rounded-card bg-inverse py-2.5 pl-3.5 pr-2.5 text-sm text-inverse-text shadow-card"
          >
            <Icon name={t.icon ?? "check"} size={18} />
            <span className="flex-1">{t.message}</span>
            {t.undo && (
              <button
                type="button"
                className="h-[30px] cursor-pointer rounded-[7px] px-2.5 text-[13px] font-semibold text-inverse-accent"
                onClick={() => {
                  t.undo?.();
                  dismiss(t.id);
                }}
              >
                Undo
              </button>
            )}
            <button type="button" aria-label="Dismiss" className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center opacity-70" onClick={() => dismiss(t.id)}>
              <Icon name="close" size={18} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
