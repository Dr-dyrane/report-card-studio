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
    <nav className="fixed inset-x-0 bottom-0 z-30 px-2 pb-[calc(0.35rem+env(safe-area-inset-bottom))] pt-2 sm:px-3 lg:hidden">
      <div className="frost-panel-strong rounded-[28px] px-2 py-1.5">
        <div className="grid grid-cols-5 gap-1">
          {mobileNav.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-[20px] px-1.5 py-1.5 text-center transition ${
                  isActive ? "bg-[color:rgba(47,111,237,0.14)]" : "bg-transparent"
                }`}
              >
                <div
                  className={`mx-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold ${
                    isActive
                      ? "bg-[color:var(--accent)] text-white"
                      : "bg-white/55 text-[color:var(--text-muted)]"
                  }`}
                >
                  <AppIcon name={item.icon} className="h-3.5 w-3.5" />
                </div>
                <p
                  className={`mt-1 text-[10px] font-medium ${
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
