"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AppIcon } from "@/components/ui/AppIcon";
import { navItems } from "@/lib/navigation";

const mobileNav = navItems.filter((item) =>
  ["/dashboard", "/students", "/reports", "/analytics"].includes(
    item.href,
  ),
);

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="app-bottomtab fixed bottom-0 left-0 z-[var(--z-bottomtab)] w-[calc(100%-5.75rem)] px-3 pb-[calc(0.85rem+env(safe-area-inset-bottom))] pt-2 sm:px-3 lg:hidden">
      <div className="frost-panel-strong w-fit max-w-full rounded-[30px] px-1.5 py-1.5 shadow-[0_22px_48px_rgba(17,24,39,0.12)]">
        <div className="flex items-center justify-start gap-1.5">
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
                    ? "soft-action-tint min-w-[4.65rem] max-w-[9rem] gap-2 pr-3"
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
                  <AppIcon name={item.icon} className="h-3.5 w-3.5 stroke-[1.75]" />
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
