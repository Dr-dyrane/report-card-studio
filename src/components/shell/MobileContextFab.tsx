"use client";

import { EllipsisHorizontalIcon, EyeIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

type FabAction = {
  label: string;
  href: string;
  icon: "plus" | "eye";
};

function iconFor(name: FabAction["icon"]) {
  if (name === "eye") return <EyeIcon className="h-5 w-5" />;
  return <PlusIcon className="h-5 w-5" />;
}

export function MobileContextFab() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const actions = useMemo<FabAction[]>(() => {
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
      return [{ label: "New term", href: "/terms", icon: "plus" }];
    }
    if (pathname.startsWith("/reports/") && !pathname.endsWith("/preview") && pathname !== "/reports/new") {
      return [{ label: "Preview", href: `${pathname}/preview`, icon: "eye" }];
    }
    return [{ label: "New report", href: "/reports/new", icon: "plus" }];
  }, [pathname]);

  if (actions.length === 1) {
    const action = actions[0];

    return (
      <Link
        href={action.href}
        className="app-fab frost-panel-strong fixed bottom-[calc(0.85rem+env(safe-area-inset-bottom))] right-3 z-[var(--z-fab)] inline-flex h-[59px] w-[59px] items-center justify-center rounded-full shadow-[0_18px_40px_rgba(13,20,32,0.18)] lg:hidden"
        aria-label={action.label}
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]">
          {iconFor(action.icon)}
        </span>
      </Link>
    );
  }

  return (
    <>
      {open ? (
        <div className="fixed inset-0 z-[var(--z-dialog)] lg:hidden">
          <button
            type="button"
            aria-label="Close quick actions"
            className="absolute inset-0 bg-[color:var(--overlay-backdrop)]"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-[calc(5.2rem+env(safe-area-inset-bottom))] right-3 grid gap-2">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                onClick={() => setOpen(false)}
                className="frost-panel-strong inline-flex min-w-[10rem] items-center gap-3 rounded-[22px] px-4 py-3 shadow-[0_18px_40px_rgba(13,20,32,0.18)]"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]">
                  {iconFor(action.icon)}
                </span>
                <span className="text-sm font-semibold text-[color:var(--text-strong)]">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="app-fab frost-panel-strong fixed bottom-[calc(0.85rem+env(safe-area-inset-bottom))] right-3 z-[var(--z-fab)] inline-flex h-[59px] w-[59px] items-center justify-center rounded-full shadow-[0_18px_40px_rgba(13,20,32,0.18)] lg:hidden"
        aria-expanded={open}
        aria-label="Open quick actions"
      >
        <EllipsisHorizontalIcon className="h-6 w-6 text-[color:var(--text-strong)]" />
      </button>
    </>
  );
}
