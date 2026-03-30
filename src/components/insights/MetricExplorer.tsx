"use client";

import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type MetricDetail = {
  title: string;
  value: string;
  hint: string;
  tone?: "default" | "accent";
  details: {
    summary: string;
    points: string[];
    actionLabel?: string;
    actionHref?: string;
  };
};

export function MetricExplorer({
  title,
  metrics,
}: {
  title?: string;
  metrics: MetricDetail[];
}) {
  const [activeMetric, setActiveMetric] = useState<MetricDetail | null>(null);
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const sync = () => setDesktop(media.matches);

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!activeMetric) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveMetric(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeMetric]);

  const surfaceLabel = useMemo(() => (desktop ? "dialog" : "sheet"), [desktop]);
  const canPortal = typeof document !== "undefined";

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {metrics.map((metric) => (
          <button
            key={metric.title}
            type="button"
            onClick={() => setActiveMetric(metric)}
            className={`frost-panel-soft rounded-[22px] px-4 py-4 text-left transition hover:translate-y-[-1px] hover:shadow-[var(--shadow-frost-strong)] sm:px-5 sm:py-5 ${
              metric.tone === "accent" ? "soft-action-tint" : ""
            }`}
          >
            <p className="text-sm text-[color:var(--text-muted)]">{metric.title}</p>
            <p className="mt-2 text-2xl font-semibold text-[color:var(--text-strong)] sm:text-3xl">
              {metric.value}
            </p>
            <p className="mt-2 text-sm leading-5 text-[color:var(--text-muted)]">
              {metric.hint}
            </p>
          </button>
        ))}
      </div>

      {canPortal && activeMetric
        ? createPortal(
        <div
          className="fixed inset-0 z-[var(--z-overlay)] flex items-end bg-[color:var(--overlay-backdrop)] px-2 pb-2 pt-10 md:items-center md:justify-center md:p-8"
          onClick={() => setActiveMetric(null)}
        >
          <div
            role={surfaceLabel === "dialog" ? "dialog" : "region"}
            aria-modal="true"
            className={`frost-panel-strong relative z-[var(--z-dialog)] w-full max-w-2xl overflow-hidden ${
              desktop
                ? "rounded-[32px] px-6 py-6 md:px-7 md:py-7"
                : "rounded-[28px] rounded-b-[20px] px-5 py-5"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                {title ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                    {title}
                  </p>
                ) : null}
                <h3 className="mt-2 text-2xl font-semibold text-[color:var(--text-strong)]">
                  {activeMetric.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">
                  {activeMetric.details.summary}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveMetric(null)}
                className="surface-chip inline-flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--text-muted)]"
                aria-label="Close detail"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-[0.44fr_0.56fr]">
              <div className="surface-pocket rounded-[24px] px-5 py-5">
                <p className="text-sm text-[color:var(--text-muted)]">Value</p>
                <p className="mt-2 text-4xl font-semibold text-[color:var(--text-strong)]">
                  {activeMetric.value}
                </p>
                <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
                  {activeMetric.hint}
                </p>
              </div>

              <div className="grid gap-3">
                {activeMetric.details.points.map((point) => (
                  <div key={point} className="surface-pocket rounded-[20px] px-4 py-4">
                    <p className="text-sm leading-6 text-[color:var(--text-base)]">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {activeMetric.details.actionHref && activeMetric.details.actionLabel ? (
                <Link
                  href={activeMetric.details.actionHref}
                  className="soft-action-tint rounded-full px-4 py-2 text-sm font-semibold"
                >
                  {activeMetric.details.actionLabel}
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => setActiveMetric(null)}
                className="soft-action rounded-full px-4 py-2 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )
        : null}
    </>
  );
}
