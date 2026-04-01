"use client";

import Link from "next/link";
import { ReactNode } from "react";

import { BrandMark } from "@/components/ui/BrandMark";

type AuthFrameProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthFrame({ eyebrow, title, children, footer }: AuthFrameProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1120px] items-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <section className="frost-panel-strong rounded-[32px] px-5 py-6 sm:px-8 sm:py-8">
          <div className="max-w-xl">
            <div className="flex items-center justify-between gap-3">
              <BrandMark compact />
              <Link
                href="/"
                className="soft-action rounded-full px-4 py-2 text-sm font-medium"
              >
                Home
              </Link>
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--text-muted)]">
              {eyebrow}
            </p>
            <h1 className="mt-3 font-display text-5xl leading-none text-[color:var(--text-strong)] sm:text-6xl">
              {title}
            </h1>
          </div>
        </section>

        <section className="frost-panel rounded-[32px] px-5 py-6 sm:px-8 sm:py-8">
          {children}
          {footer ? <div className="mt-6">{footer}</div> : null}
        </section>
      </div>
    </div>
  );
}

export function AuthFooterLinks({
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href={primaryHref}
        className="soft-action inline-flex items-center rounded-full px-5 py-3 text-sm font-medium"
      >
        {primaryLabel}
      </Link>
      {secondaryHref && secondaryLabel ? (
        <Link
          href={secondaryHref}
          className="text-sm font-medium text-[color:var(--text-muted)] transition hover:text-[color:var(--text-strong)]"
        >
          {secondaryLabel}
        </Link>
      ) : null}
    </div>
  );
}
