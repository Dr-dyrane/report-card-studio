"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

export function FocusSurface({
  open,
  title,
  subtitle,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="overlay-fade fixed inset-0 z-[var(--z-dialog)]">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-[color:var(--overlay-backdrop)]"
      />

      <div className="absolute inset-0 flex items-end justify-center px-3 pb-3 pt-10 sm:items-center sm:px-6 sm:py-8">
        <div
          role="dialog"
          aria-modal="true"
          className="surface-enter frost-panel-strong premium-sheen relative w-full max-w-2xl rounded-[30px] rounded-b-[22px] px-4 py-4 shadow-[0_24px_68px_rgba(16,24,40,0.18)] sm:rounded-[32px] sm:px-6 sm:py-6"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-[1.65rem] font-semibold tracking-tight text-[color:var(--text-strong)]">
                {title}
              </h2>
              {subtitle ? (
                <p className="mt-1.5 text-sm leading-6 text-[color:var(--text-muted)]">
                  {subtitle}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="soft-action inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5 text-[color:var(--text-strong)]" />
            </button>
          </div>

          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
