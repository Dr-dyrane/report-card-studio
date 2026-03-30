"use client";

import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useFeedback } from "@/components/feedback/FeedbackProvider";
import { BrandMark } from "@/components/ui/BrandMark";
import { authClient } from "@/lib/auth-client";
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
  const { notify } = useFeedback();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const session = authClient.useSession();
  const currentUser = session.data?.user;

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
    <header className="app-topbar sticky top-0 z-[var(--z-topbar)] px-0 pt-0 sm:px-1 sm:pt-1 xl:px-0">
      <div className="frost-panel mx-0 flex items-center justify-between gap-3 rounded-none px-2 py-3 sm:flex-wrap sm:gap-4 sm:rounded-[28px] sm:px-4 sm:py-4 xl:px-8">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            {!breadcrumb.isRootPage ? (
              <button
                type="button"
                onClick={() => router.back()}
                className="soft-action inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                aria-label="Go back"
              >
                <ChevronLeftIcon className="h-4.5 w-4.5 text-[color:var(--text-strong)]" />
              </button>
            ) : null}
            <div className="min-w-0">
              <Link href={breadcrumb.root.href} className="inline-flex max-w-full items-center">
                {breadcrumb.isRootPage ? (
                  <BrandMark compact />
                ) : (
                  <span className="truncate text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                    {breadcrumb.root.label}
                  </span>
                )}
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
          {currentUser ? (
            <div className="hidden items-center gap-2 rounded-full surface-chip px-3 py-2 sm:flex">
              <p className="max-w-[220px] truncate text-sm font-semibold text-[color:var(--text-strong)]">
                {currentUser.email}
              </p>
              <button
                type="button"
                onClick={async () => {
                  setIsSigningOut(true);
                  try {
                    const result = await authClient.signOut();

                    if (result.error) {
                      throw result.error;
                    }

                    notify("Signed out.", "success");
                    router.push("/sign-in");
                    router.refresh();
                  } catch {
                    notify("Could not sign out.", "error");
                  } finally {
                    setIsSigningOut(false);
                  }
                }}
                className="soft-action inline-flex items-center rounded-full px-3 py-2 text-sm font-medium"
              >
                {isSigningOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          ) : null}

          <Link
            href="/reports/new"
            className="soft-action-tint inline-flex items-center rounded-full px-3 py-2 text-sm font-semibold transition sm:px-4"
          >
            New
          </Link>
        </div>
      </div>
    </header>
  );
}
