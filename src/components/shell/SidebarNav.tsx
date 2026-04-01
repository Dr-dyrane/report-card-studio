"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { ThemeToggleInline } from "@/components/theme/ThemeToggleInline";
import { AppIcon } from "@/components/ui/AppIcon";
import { BrandMark } from "@/components/ui/BrandMark";
import { navGroups } from "@/lib/navigation";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export function SidebarNav() {
  const pathname = usePathname();
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

  return (
    <aside className="app-sidebar frost-panel-strong sticky top-3 z-[var(--z-sidebar)] hidden h-[calc(100vh-1.5rem)] w-[276px] shrink-0 overflow-hidden rounded-[34px] lg:flex lg:flex-col">
      <div className="flex h-full min-h-0 flex-col gap-4 px-5 py-5">
        <BrandMark textOnly />

        <nav className="scrollbar-hidden flex flex-1 flex-col gap-2.5 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {navGroups.map((group) => {
            const isOpen = openGroupId === group.id;
            const hasActiveItem = group.items.some(
              (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
            );

            return (
              <section key={group.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() =>
                    setOpenGroupId((prev) => (prev === group.id ? "" : group.id))
                  }
                  className={`flex w-full items-center justify-between rounded-[16px] px-3 py-1.5 text-left transition ${isOpen || hasActiveItem ? "surface-pocket" : "surface-hover-soft"
                    }`}
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                    {group.label}
                  </span>
                  <ChevronDownIcon
                    className={`h-4 w-4 text-[color:var(--text-muted)] transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"
                      }`}
                  />
                </button>

                {isOpen ? (
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive =
                        pathname === item.href || pathname.startsWith(`${item.href}/`);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`group block w-full rounded-[18px] px-3.5 py-2.5 transition ${isActive
                            ? "soft-action-tint text-[color:var(--text-strong)]"
                            : "text-[color:var(--text-base)] surface-hover-soft"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${isActive
                                ? "bg-[color:var(--accent)] text-[color:var(--surface)]"
                                : "bg-[color:var(--highlight)] text-[color:var(--text-muted)]"
                                }`}
                            >
                              <AppIcon name={item.icon} className="h-3.5 w-3.5 stroke-[1.75]" />
                            </span>
                            <div>
                              <p className="text-[0.94rem] font-semibold">{item.label}</p>
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

        <div className="surface-pocket rounded-[18px] px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[color:var(--text-strong)]">Appearance</p>
          </div>
          <div className="mt-2">
            <ThemeToggleInline />
          </div>
        </div>
      </div>
    </aside>
  );
}
