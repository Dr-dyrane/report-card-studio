"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { useWorkspaceContext } from "@/components/shell/WorkspaceContext";
import { ThemeToggleInline } from "@/components/theme/ThemeToggleInline";
import { AppIcon } from "@/components/ui/AppIcon";
import { BrandMark } from "@/components/ui/BrandMark";
import { navGroups } from "@/lib/navigation";

export function SidebarNav() {
  const pathname = usePathname();
  const workspace = useWorkspaceContext();
  const activeGroupId = useMemo(
    () =>
      navGroups.find((group) =>
        group.items.some(
          (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
        ),
      )?.id ?? navGroups[0].id,
    [pathname],
  );
  const [openGroupId, setOpenGroupId] = useState(activeGroupId);

  useEffect(() => {
    setOpenGroupId(activeGroupId);
  }, [activeGroupId]);

  const contextRows = useMemo(
    () =>
      [
        workspace.sessionName
          ? { label: "Session", value: workspace.sessionName }
          : null,
        workspace.termName ? { label: "Term", value: workspace.termName } : null,
      ].filter(Boolean) as Array<{ label: string; value: string }>,
    [workspace.sessionName, workspace.termName],
  );

  return (
    <aside className="app-sidebar frost-panel-strong sticky top-3 z-[var(--z-sidebar)] hidden h-[calc(100vh-1.5rem)] w-[276px] shrink-0 overflow-hidden rounded-[34px] lg:flex lg:flex-col">
      <div className="flex h-full min-h-0 flex-col gap-6 px-5 py-6">
        <BrandMark textOnly />

        <nav className="scrollbar-hidden flex flex-1 flex-col gap-3 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {navGroups.map((group) => {
            const isOpen = openGroupId === group.id;
            const hasActiveItem = group.items.some(
              (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
            );

            return (
              <section key={group.id} className="space-y-2">
                <button
                  type="button"
                  onClick={() => setOpenGroupId(group.id)}
                  className={`flex w-full items-center justify-between rounded-[20px] px-3 py-2 text-left transition ${
                    isOpen || hasActiveItem ? "surface-pocket" : "surface-hover-soft"
                  }`}
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                    {group.label}
                  </span>
                  <span className="text-sm text-[color:var(--text-muted)]">
                    {isOpen ? "-" : "+"}
                  </span>
                </button>

                {isOpen ? (
                  <div className="space-y-2">
                    {group.items.map((item) => {
                      const isActive =
                        pathname === item.href || pathname.startsWith(`${item.href}/`);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`group block rounded-[22px] px-4 py-4 transition ${
                            isActive
                              ? "soft-action-tint text-[color:var(--text-strong)]"
                              : "text-[color:var(--text-base)] surface-hover-soft"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                                isActive
                                  ? "bg-[color:var(--accent)] text-[color:var(--surface)]"
                                  : "bg-[color:var(--highlight)] text-[color:var(--text-muted)]"
                              }`}
                            >
                              <AppIcon name={item.icon} className="h-4.5 w-4.5" />
                            </span>
                            <div>
                              <p className="text-sm font-semibold">{item.label}</p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </section>
            );
          })}
        </nav>

        {contextRows.length > 0 ? (
          <div className="frost-panel-soft rounded-[24px] px-4 py-4">
            <p className="text-sm font-semibold text-[color:var(--text-strong)]">Context</p>
            <dl className="mt-3 space-y-2 text-sm text-[color:var(--text-muted)]">
              {contextRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        <div className="frost-panel-soft rounded-[24px] px-4 py-4">
          <p className="text-sm font-semibold text-[color:var(--text-strong)]">Appearance</p>
          <div className="mt-3">
            <ThemeToggleInline />
          </div>
        </div>
      </div>
    </aside>
  );
}
