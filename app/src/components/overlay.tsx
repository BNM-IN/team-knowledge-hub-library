"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { cn, Icon } from "./ui";

/** Close on Escape or a pointer-down outside `ref` (popovers, menus). */
export function useDismiss(ref: RefObject<HTMLElement | null>, open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const down = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", down);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", down);
    };
  }, [open, onClose, ref]);
}

/** Modal built on <dialog>: focus trap, Esc and backdrop come from the platform. */
export function Dialog({
  open,
  onClose,
  title,
  children,
  role = "dialog",
  width = 440,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  role?: "dialog" | "alertdialog";
  width?: number;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      role={role}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={cn(
        "m-auto w-[calc(100%-32px)] rounded-dialog border border-line bg-surface p-0 text-ink shadow-overlay",
        "backdrop:bg-[oklch(0.2_0.02_255/0.35)]",
      )}
      style={{ maxWidth: width }}
    >
      {open && (
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-start gap-3">
            <h2 className="m-0 flex-1 text-base font-semibold">{title}</h2>
            <button type="button" aria-label="Close" onClick={onClose} className="-mr-1.5 -mt-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-control text-ink-2 hover:bg-surface-2">
              <Icon name="close" size={18} />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
