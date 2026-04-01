"use client";

import Link from "next/link";
import { ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type BladeAction = {
  label: string;
  href: string;
  tone?: "default" | "accent";
  onClick?: () => void;
};

type BladeMeta = {
  label: string;
  value: string;
};

type BladeItem = {
  id: string;
  title: string;
  subtitle: string;
  eyebrow?: string;
  badge?: {
    label: string;
    tone?: "success" | "default";
  };
  quickValue?: string;
  quickHint?: string;
  summary?: string;
  meta: BladeMeta[];
  actions: BladeAction[];
};

export function MobileBladeList({
  items,
  emptyMessage,
}: {
  items: BladeItem[];
  emptyMessage: string;
}) {
  const [activeItem, setActiveItem] = useState<BladeItem | null>(null);

  useEffect(() => {
    if (!activeItem) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveItem(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeItem]);

  if (!items.length) {
    return (
      <div className="soft-action rounded-[22px] px-4 py-4 text-sm text-[color:var(--text-muted)] sm:hidden">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2.5 sm:hidden">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveItem(item)}
            className="frost-panel-soft relative block w-full rounded-[22px] px-4 py-3 text-left"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[0.95rem] font-semibold leading-5 text-[color:var(--text-strong)]">
                  {item.title}
                </p>
              </div>
              {item.quickValue ? (
                <span className="soft-action rounded-full px-3 py-1 text-[0.8rem] font-semibold">
                  {item.quickValue}
                </span>
              ) : null}
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-3 pr-10">
              <p className="min-w-0 truncate text-[0.79rem] leading-5 text-[color:var(--text-muted)]">
                {item.summary || item.subtitle}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                {item.badge ? (
                  <span
                    className={`rounded-full px-2.5 py-1 text-[0.72rem] font-semibold ${
                      item.badge.tone === "success"
                        ? "bg-[color:var(--success-soft)] text-[color:var(--success)]"
                        : "soft-action text-[color:var(--text-base)]"
                    }`}
                  >
                    {item.badge.label}
                  </span>
                ) : null}
                {item.quickHint ? (
                  <span className="text-[0.72rem] text-[color:var(--text-muted)]">
                    {item.quickHint}
                  </span>
                ) : null}
              </div>
            </div>
            <span className="surface-chip pointer-events-none absolute bottom-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-[color:var(--text-muted)]">
              <ChevronRightIcon className="h-4 w-4 stroke-[1.9]" />
            </span>
          </button>
        ))}
      </div>

      {typeof document !== "undefined" && activeItem
        ? createPortal(
            <div
              className="fixed inset-0 z-[var(--z-overlay)] flex items-end bg-[color:var(--overlay-backdrop)] px-2 pb-2 pt-10 sm:hidden"
              onClick={() => setActiveItem(null)}
            >
              <div
                role="dialog"
                aria-modal="true"
                className="frost-panel-strong relative z-[var(--z-dialog)] w-full rounded-[28px] rounded-b-[20px] px-5 py-5"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    {activeItem.eyebrow ? (
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                        {activeItem.eyebrow}
                      </p>
                    ) : null}
                    <h3 className="mt-2 text-2xl font-semibold text-[color:var(--text-strong)]">
                      {activeItem.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-[color:var(--text-muted)]">
                      {activeItem.subtitle}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveItem(null)}
                    className="surface-chip inline-flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--text-muted)]"
                    aria-label="Close detail"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {activeItem.meta.map((entry) => (
                    <div key={entry.label} className="surface-pocket rounded-[20px] px-4 py-4">
                      <p className="text-sm text-[color:var(--text-muted)]">{entry.label}</p>
                      <p className="mt-2 text-lg font-semibold text-[color:var(--text-strong)]">
                        {entry.value}
                      </p>
                    </div>
                  ))}
                </div>

                {activeItem.summary ? (
                  <p className="mt-4 text-sm leading-6 text-[color:var(--text-muted)]">
                    {activeItem.summary}
                  </p>
                ) : null}

                {activeItem.badge ? (
                  <div className="mt-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${
                        activeItem.badge.tone === "success"
                          ? "bg-[color:var(--success-soft)] text-[color:var(--success)]"
                          : "soft-action text-[color:var(--text-base)]"
                      }`}
                    >
                      {activeItem.badge.label}
                    </span>
                  </div>
                ) : null}

                <div className="mt-5 grid grid-cols-1 gap-2">
                  {activeItem.actions.map((action) =>
                    action.onClick ? (
                      <button
                        key={action.label}
                        type="button"
                        onClick={() => {
                          setActiveItem(null);
                          action.onClick?.();
                        }}
                        className={`rounded-full px-4 py-3 text-center text-sm font-semibold ${
                          action.tone === "accent" ? "soft-action-tint" : "soft-action"
                        }`}
                      >
                        {action.label}
                      </button>
                    ) : (
                      <Link
                        key={action.label}
                        href={action.href}
                        className={`rounded-full px-4 py-3 text-center text-sm font-semibold ${
                          action.tone === "accent" ? "soft-action-tint" : "soft-action"
                        }`}
                      >
                        {action.label}
                      </Link>
                    ),
                  )}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
