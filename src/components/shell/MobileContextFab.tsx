"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

type FabAction = {
  label: string;
  href: string;
  icon: "plus" | "eye";
};

function fabIconFor(name: FabAction["icon"]) {
  if (name === "eye") return <EyeIcon className="h-[22px] w-[22px]" />;
  return <PlusIcon className="h-[22px] w-[22px]" />;
}

function getActions(pathname: string): FabAction[] {
  if (pathname === "/students") {
    return [{ label: "Add student", href: "/reports/new?mode=manual", icon: "plus" }];
  }

  if (pathname === "/reports") {
    return [{ label: "New report", href: "/reports/new", icon: "plus" }];
  }

  if (pathname === "/subjects") {
    return [{ label: "Add subject", href: "/subjects/new", icon: "plus" }];
  }

  if (pathname === "/classes") {
    return [{ label: "Add class", href: "/classes/new", icon: "plus" }];
  }

  if (pathname === "/terms") {
    return [{ label: "Manage terms", href: "/terms", icon: "plus" }];
  }

  if (
    pathname.startsWith("/reports/") &&
    !pathname.endsWith("/preview") &&
    pathname !== "/reports/new"
  ) {
    return [{ label: "Preview", href: `${pathname}/preview`, icon: "eye" }];
  }

  return [{ label: "New report", href: "/reports/new", icon: "plus" }];
}

export function MobileContextFab() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const actions = useMemo(() => getActions(pathname), [pathname]);

  const fabBaseClass =
    "app-fab fixed bottom-[calc(0.85rem+env(safe-area-inset-bottom))] right-3 z-[var(--z-fab)] inline-flex h-[59px] w-[59px] items-center justify-center rounded-full shadow-[0_18px_40px_rgba(13,20,32,0.18)] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden";

  if (actions.length === 1) {
    const action = actions[0];

    return (
      <Link
        href={action.href}
        aria-label={action.label}
        className={`${fabBaseClass} bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]`}
      >
        {fabIconFor(action.icon)}
      </Link>
    );
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-[var(--z-dialog)] lg:hidden transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Close quick actions"
          className="absolute inset-0 bg-[color:var(--overlay-backdrop)]"
          onClick={() => setOpen(false)}
        />

        <div className="absolute bottom-[calc(5.2rem+env(safe-area-inset-bottom))] right-3 flex flex-col items-end gap-2">
          {actions.map((action, index) => (
            <Link
              key={action.href}
              href={action.href}
              onClick={() => setOpen(false)}
              className={`frost-panel-strong inline-flex min-w-[11rem] items-center gap-3 rounded-[22px] px-4 py-3 text-[color:var(--text-strong)] shadow-[0_18px_40px_rgba(13,20,32,0.18)] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${open
                  ? "translate-y-0 scale-100 opacity-100"
                  : "translate-y-2 scale-[0.985] opacity-0"
                }`}
              style={{
                transitionDelay: open ? `${index * 28}ms` : "0ms",
              }}
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]">
                {fabIconFor(action.icon)}
              </span>
              <span className="text-sm font-semibold">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={open ? "Close quick actions" : "Open quick actions"}
        className={`${fabBaseClass} ${open
            ? "bg-[color:var(--accent)] text-[color:var(--surface)]"
            : "bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]"
          }`}
      >
        <EllipsisHorizontalIcon
          className={`h-6 w-6 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "rotate-90 scale-105" : "rotate-0 scale-100"
            }`}
        />
      </button>
    </>
  );
}