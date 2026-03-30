import type { SVGProps } from "react";

type BrandMarkProps = {
  compact?: boolean;
  subtitle?: string;
  textOnly?: boolean;
};

export function BrandMark({
  compact = false,
  subtitle = "Enter. Review. Export.",
  textOnly = false,
}: BrandMarkProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <LogoCap className="surface-chip-strong h-11 w-11 rounded-[16px] p-2.5 text-[color:var(--accent)]" />
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
            Kradle
          </p>
          <p className="truncate text-sm font-semibold text-[color:var(--text-strong)]">
            School reports
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-wash rounded-[28px] px-5 py-5">
      <div className={`flex items-start ${textOnly ? "" : "gap-4"}`}>
        {!textOnly ? (
          <div className="surface-chip-strong flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] text-[color:var(--accent)]">
            <LogoCap className="h-8 w-8" />
          </div>
        ) : null}
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
            Kradle
          </p>
          <h1 className="mt-3 font-display text-3xl leading-none text-[color:var(--text-strong)]">
            School reports
          </h1>
          <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

function LogoCap(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="m2.75 9.75 9.25-4.5 9.25 4.5-9.25 4.5-9.25-4.5Z"
        fill="currentColor"
        fillOpacity="0.16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path
        d="M6.25 11.45v3.05c0 .86 2.6 2.45 5.75 2.45s5.75-1.59 5.75-2.45v-3.05"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path
        d="M20 10.4v4.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
      <path
        d="M20 15.2c.82.54 1.25 1.08 1.25 1.6 0 .86-1.12 1.55-2.5 1.55s-2.5-.69-2.5-1.55c0-.52.43-1.06 1.25-1.6"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}
