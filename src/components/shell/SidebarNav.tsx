"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "@/lib/navigation";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="frost-panel-strong hidden w-[276px] shrink-0 rounded-[34px] px-5 py-6 lg:flex lg:flex-col lg:gap-6">
      <div className="surface-wash rounded-[28px] px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
          Kradle
        </p>
        <h1 className="mt-3 font-display text-3xl leading-none text-[color:var(--text-strong)]">
          School reports
        </h1>
        <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
          Enter. Review. Export.
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group rounded-[22px] px-4 py-4 transition ${
                isActive
                  ? "frost-panel bg-[color:rgba(231,240,255,0.86)] text-[color:var(--text-strong)]"
                  : "text-[color:var(--text-base)] hover:bg-white/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    isActive
                      ? "bg-[color:var(--accent)] text-white"
                      : "bg-[color:var(--highlight)] text-[color:var(--text-muted)]"
                  }`}
                >
                  {item.shortLabel}
                </span>
                <div>
                  <p className="text-sm font-semibold">{item.label}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="frost-panel-soft rounded-[24px] px-4 py-4">
        <p className="text-sm font-semibold text-[color:var(--text-strong)]">
          Context
        </p>
        <dl className="mt-3 space-y-2 text-sm text-[color:var(--text-muted)]">
          <div className="flex items-center justify-between gap-3">
            <dt>Session</dt>
            <dd>2024/2025</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt>Term</dt>
            <dd>Second Term</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt>Class</dt>
            <dd>Primary 5 Lavender</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}
