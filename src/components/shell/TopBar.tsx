"use client";

import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useFeedback } from "@/components/feedback/FeedbackProvider";
import { MobileUtilitySheet } from "@/components/shell/MobileUtilitySheet";
import { useWorkspaceContext } from "@/components/shell/WorkspaceContext";
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
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const session = authClient.useSession();
  const currentUser = session.data?.user;
  const workspace = useWorkspaceContext();

  const workspaceLabel = useMemo(() => {
    return [workspace.termName, workspace.sessionName].filter(Boolean).join(", ");
  }, [workspace.sessionName, workspace.termName]);

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
    <header className="app-topbar sticky top-0 z-[var(--z-topbar)] px-0 pt-0 sm:px-1 pt-1 xl:px-0">
      <div className="frost-panel premium-wash premium-sheen mx-0 flex items-center justify-between gap-3 rounded-none px-2 py-3 sm:flex-wrap sm:gap-4 sm:rounded-[28px] sm:px-4 sm:py-4 xl:px-8">
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
              {breadcrumb.detailLabel || workspaceLabel ? (
                <p className="truncate text-xs text-[color:var(--text-muted)] sm:text-sm">
                  {[breadcrumb.detailLabel].filter(Boolean).join(" / ")}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:flex-wrap sm:gap-3">
          {currentUser ? (
            <button
              type="button"
              onClick={() => setIsAccountOpen(true)}
              className="surface-chip inline-flex h-11 w-11 items-center justify-center rounded-full sm:hidden"
              aria-label="Open account"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent-soft)] text-sm font-semibold text-[color:var(--accent-strong)]">
                {(currentUser.name ?? currentUser.email ?? "K").slice(0, 1).toUpperCase()}
              </span>
            </button>
          ) : null}

          {currentUser ? (
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setIsAccountOpen((current) => !current)}
                className="surface-chip inline-flex items-center gap-2 rounded-full px-3 py-2"
                aria-expanded={isAccountOpen}
                aria-haspopup="dialog"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent-soft)] text-sm font-semibold text-[color:var(--accent-strong)]">
                  {(currentUser.name ?? currentUser.email ?? "K").slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 text-left">
                  <span className="block max-w-[180px] truncate text-sm font-semibold text-[color:var(--text-strong)]">
                    {currentUser.name ?? currentUser.email}
                  </span>
                  <span className="block max-w-[180px] truncate text-xs text-[color:var(--text-muted)]">
                    {currentUser.email}
                  </span>
                </span>
              </button>

              {isAccountOpen ? (
                <div className="frost-panel-strong absolute right-0 top-[calc(100%+0.75rem)] z-[var(--z-overlay)] w-[280px] rounded-[24px] p-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                      Account
                    </p>
                    <p className="text-base font-semibold text-[color:var(--text-strong)]">
                      {currentUser.name ?? "Kradle"}
                    </p>
                    <p className="truncate text-sm text-[color:var(--text-muted)]">
                      {currentUser.email}
                    </p>
                    {currentUser.username ? (
                      <p className="text-sm text-[color:var(--text-muted)]">
                        @{currentUser.username}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Link
                      href="/settings"
                      onClick={() => setIsAccountOpen(false)}
                      className="soft-action inline-flex items-center rounded-full px-3 py-2 text-sm font-medium"
                    >
                      Settings
                    </Link>
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
                          setIsAccountOpen(false);
                          router.push("/sign-in");
                          router.refresh();
                        } catch {
                          notify("Could not sign out.", "error");
                        } finally {
                          setIsSigningOut(false);
                        }
                      }}
                      className="soft-action-tint inline-flex items-center rounded-full px-3 py-2 text-sm font-semibold"
                    >
                      {isSigningOut ? "Signing out..." : "Sign out"}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <Link
            href="/reports/new"
            className="soft-action-tint hidden items-center rounded-full px-3 py-2 text-sm font-semibold transition sm:inline-flex sm:px-4"
          >
            New
          </Link>
        </div>
      </div>

      <MobileUtilitySheet
        open={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        currentUser={currentUser ?? null}
      />
    </header>
  );
}
