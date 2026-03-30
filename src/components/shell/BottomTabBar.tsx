"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AppIcon } from "@/components/ui/AppIcon";
import { navItems } from "@/lib/navigation";

const mobileNav = navItems.filter((item) =>
  ["/dashboard", "/students", "/reports", "/analytics", "/settings"].includes(
    item.href,
  ),
);

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="app-bottomtab fixed inset-x-0 bottom-0 z-30 px-2 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-2 sm:px-3 lg:hidden">
      <div className="frost-panel-strong rounded-[30px] px-1.5 py-1.5 shadow-[0_26px_60px_rgba(17,24,39,0.14)]">
        <div className="flex items-center justify-between gap-1">
          {mobileNav.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className={`flex items-center justify-center rounded-[22px] px-2 py-2 transition ${
                  isActive
                    ? "soft-action-tint min-w-[4.65rem] gap-2 pr-3"
                    : "h-11 w-11 bg-transparent"
                }`}
              >
                <div
                  className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isActive
                    ? "surface-chip-strong text-[color:var(--accent-strong)]"
                    : "surface-chip text-[color:var(--text-muted)]"
                  }`}
                >
                  <AppIcon name={item.icon} className="h-3.5 w-3.5" />
                </div>
                {isActive ? (
                  <p className="truncate text-[11px] font-semibold tracking-[0.01em] text-[color:var(--text-strong)]">
                    {item.label}
                  </p>
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
