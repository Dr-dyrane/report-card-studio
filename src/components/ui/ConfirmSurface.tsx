"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ConfirmSurfaceProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  dangerLabel?: string;
  supportingContent?: ReactNode;
  busy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmSurface({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  dangerLabel = "This can't be undone.",
  supportingContent,
  busy = false,
  onClose,
  onConfirm,
}: ConfirmSurfaceProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [busy, onClose, open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="overlay-fade fixed inset-0 z-[var(--z-overlay)]">
      <button
        type="button"
        aria-label="Close confirmation"
        className="absolute inset-0 bg-[color:var(--backdrop)]/70 backdrop-blur-md"
        onClick={() => {
          if (!busy) onClose();
        }}
      />

      {isMobile ? (
        <div className="absolute inset-x-0 bottom-0 z-[calc(var(--z-overlay)+1)] px-2 pb-2">
          <div className="surface-enter frost-panel-strong rounded-[30px] px-5 py-5 shadow-[var(--shadow-frost)]">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[color:var(--highlight-strong)]" />
            <span className="mood-badge-danger inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
              {dangerLabel}
            </span>
            <h3 className="mt-3 text-2xl font-semibold text-[color:var(--text-strong)]">
              {title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
              {description}
            </p>
            {supportingContent ? <div className="mt-4">{supportingContent}</div> : null}
            <div className="mt-6 grid gap-2">
              <button
                type="button"
                className="mood-surface-danger rounded-full px-4 py-3 text-sm font-semibold text-[color:var(--danger)] transition disabled:opacity-60"
                onClick={onConfirm}
                disabled={busy}
              >
                {busy ? "Working..." : confirmLabel}
              </button>
              <button
                type="button"
                className="soft-action rounded-full px-4 py-3 text-sm font-medium"
                onClick={onClose}
                disabled={busy}
              >
                {cancelLabel}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 z-[calc(var(--z-overlay)+1)] grid place-items-center px-6">
          <div className="surface-enter frost-panel-strong w-full max-w-xl rounded-[34px] px-7 py-7 shadow-[var(--shadow-frost)]">
            <span className="mood-badge-danger inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
              {dangerLabel}
            </span>
            <h3 className="mt-3 text-3xl font-semibold text-[color:var(--text-strong)]">
              {title}
            </h3>
            <p className="mt-3 max-w-lg text-sm leading-7 text-[color:var(--text-muted)]">
              {description}
            </p>
            {supportingContent ? <div className="mt-5">{supportingContent}</div> : null}
            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                className="soft-action rounded-full px-4 py-2 text-sm font-medium"
                onClick={onClose}
                disabled={busy}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                className="mood-surface-danger rounded-full px-4 py-2 text-sm font-semibold text-[color:var(--danger)] transition disabled:opacity-60"
                onClick={onConfirm}
                disabled={busy}
              >
                {busy ? "Working..." : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
