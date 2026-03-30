"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

import { navItems } from "@/lib/navigation";

function titleCaseSegment(segment: string) {
  return segment
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();

  const breadcrumb = useMemo(() => {
    const root =
      navItems.find(
        (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
      ) ?? navItems[0];

    const segments = pathname.split("/").filter(Boolean);
    const rootSegmentCount = root.href.split("/").filter(Boolean).length;
    const detailSegments = segments.slice(rootSegmentCount);
    const detailLabel = detailSegments.map(titleCaseSegment).join(" / ");
    const isRootPage = detailSegments.length === 0;

    return {
      root,
      detailLabel,
      isRootPage,
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-20 px-0 pt-0 sm:px-1 sm:pt-1 xl:px-0">
      <div className="frost-panel mx-0 flex items-center justify-between gap-3 rounded-none px-4 py-3 sm:flex-wrap sm:gap-4 sm:rounded-[28px] sm:px-4 sm:py-4 xl:px-8">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            {!breadcrumb.isRootPage ? (
              <button
                type="button"
                onClick={() => router.back()}
                className="soft-action inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base leading-none"
                aria-label="Go back"
              >
                ←
              </button>
            ) : null}
            <div className="min-w-0">
              <Link
                href={breadcrumb.root.href}
                className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]"
              >
                {breadcrumb.root.label}
              </Link>
              <p className="mt-1 truncate text-xs text-[color:var(--text-muted)] sm:text-sm">
                {breadcrumb.detailLabel
                  ? `${breadcrumb.detailLabel} · Second Term, 2024/2025`
                  : "Second Term, 2024/2025 · Primary 5 Lavender"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:flex-wrap sm:gap-3">
          <button className="soft-action-tint inline-flex items-center rounded-full px-3 py-2 text-sm font-semibold transition hover:bg-[rgba(231,240,255,0.96)] sm:px-4">
            New
          </button>
        </div>
      </div>
    </header>
  );
}
