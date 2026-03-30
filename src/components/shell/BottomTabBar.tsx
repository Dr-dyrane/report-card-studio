"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "@/lib/navigation";

const mobileNav = navItems.filter((item) =>
  ["/dashboard", "/students", "/reports", "/analytics", "/settings"].includes(
    item.href,
  ),
);

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="frost-panel-strong fixed inset-x-3 bottom-3 z-30 rounded-[28px] px-2 py-2 lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {mobileNav.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-[22px] px-2 py-2 text-center transition ${
                isActive ? "bg-[color:rgba(47,111,237,0.14)]" : "bg-transparent"
              }`}
            >
              <div
                className={`mx-auto inline-flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-semibold ${
                  isActive
                    ? "bg-[color:var(--accent)] text-white"
                    : "bg-white/55 text-[color:var(--text-muted)]"
                }`}
              >
                {item.shortLabel}
              </div>
              <p
                className={`mt-1 text-[11px] font-medium ${
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
    </nav>
  );
}
