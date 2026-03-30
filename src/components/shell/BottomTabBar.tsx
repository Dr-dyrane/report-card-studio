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
        <div className="grid grid-cols-5 gap-1">
          {mobileNav.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-[22px] px-1 py-1.5 text-center transition ${
                  isActive
                    ? "bg-[linear-gradient(180deg,rgba(231,240,255,0.98),rgba(221,233,255,0.88))] shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_10px_20px_rgba(47,111,237,0.12)]"
                    : "bg-transparent"
                }`}
              >
                <div
                  className={`mx-auto inline-flex h-8 w-8 items-center justify-center rounded-full ${
                    isActive
                      ? "bg-white/80 text-[color:var(--accent-strong)]"
                      : "bg-white/45 text-[color:var(--text-muted)]"
                  }`}
                >
                  <AppIcon name={item.icon} className="h-3.5 w-3.5" />
                </div>
                <p
                  className={`mt-1.5 text-[10px] font-semibold tracking-[0.01em] ${
                    isActive
                      ? "text-[color:var(--text-strong)]"
                      : "text-[color:var(--text-muted)]"
                  }`}
                >
                  {item.label}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
