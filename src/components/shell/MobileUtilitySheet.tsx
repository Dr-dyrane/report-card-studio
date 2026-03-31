"use client";

import {
  ArrowRightStartOnRectangleIcon,
  ChevronRightIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useFeedback } from "@/components/feedback/FeedbackProvider";
import { ThemeToggleInline } from "@/components/theme/ThemeToggleInline";
import { AppIcon } from "@/components/ui/AppIcon";
import { authClient } from "@/lib/auth-client";

type UtilityLink = {
  href: string;
  label: string;
  icon:
    | "classes"
    | "terms"
    | "exports"
    | "settings"
    | "students"
    | "reports";
};

const utilityLinks: UtilityLink[] = [
  { href: "/classes", label: "Classes", icon: "classes" },
  { href: "/terms", label: "Terms", icon: "terms" },
  { href: "/exports", label: "Exports", icon: "exports" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export function MobileUtilitySheet({
  open,
  onClose,
  currentUser,
}: {
  open: boolean;
  onClose: () => void;
  currentUser: { name?: string | null; email?: string | null; username?: string | null } | null;
}) {
  const router = useRouter();
  const { notify } = useFeedback();

  useEffect(() => {
    const body = document.body;

    if (open) {
      body.dataset.mobileUtilitySheet = "open";
    } else {
      delete body.dataset.mobileUtilitySheet;
    }

    return () => {
      delete body.dataset.mobileUtilitySheet;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-dialog)] lg:hidden">
      <button
        type="button"
        aria-label="Close utility sheet"
        className="absolute inset-0 bg-[color:var(--overlay-backdrop)]"
        onClick={onClose}
      />
      <aside className="frost-panel-strong absolute right-0 top-0 flex h-full w-[min(88vw,24rem)] flex-col rounded-l-[30px] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] shadow-[0_28px_80px_rgba(13,20,32,0.24)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="surface-chip-strong inline-flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold text-[color:var(--accent-strong)]">
              {(currentUser?.name ?? currentUser?.email ?? "K").slice(0, 1).toUpperCase()}
            </div>
            <p className="mt-3 truncate text-base font-semibold text-[color:var(--text-strong)]">
              {currentUser?.name ?? "Kradle"}
            </p>
            <p className="truncate text-sm text-[color:var(--text-muted)]">
              {currentUser?.email ?? ""}
            </p>
            {currentUser?.username ? (
              <p className="truncate text-sm text-[color:var(--text-muted)]">
                @{currentUser.username}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="soft-action inline-flex h-11 w-11 items-center justify-center rounded-full"
            aria-label="Close utility sheet"
          >
            <XMarkIcon className="h-5 w-5 text-[color:var(--text-strong)]" />
          </button>
        </div>

        <div className="mt-5 grid gap-2">
          <Link
            href="/reports/new"
            onClick={onClose}
            className="soft-action-tint inline-flex items-center justify-between rounded-[22px] px-4 py-4"
          >
            <span className="inline-flex items-center gap-3">
              <span className="surface-chip inline-flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--accent-strong)]">
                <PlusIcon className="h-5 w-5" />
              </span>
              <span className="font-semibold">New report</span>
            </span>
            <ChevronRightIcon className="h-4 w-4" />
          </Link>

          {utilityLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="soft-action inline-flex items-center justify-between rounded-[22px] px-4 py-4"
            >
              <span className="inline-flex items-center gap-3">
                <span className="surface-chip inline-flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--text-muted)]">
                  <AppIcon name={item.icon} className="h-4.5 w-4.5" />
                </span>
                <span className="font-medium text-[color:var(--text-strong)]">{item.label}</span>
              </span>
              <ChevronRightIcon className="h-4 w-4 text-[color:var(--text-muted)]" />
            </Link>
          ))}
        </div>

        <div className="mt-5 rounded-[22px] surface-pocket px-4 py-4">
          <p className="text-sm font-semibold text-[color:var(--text-strong)]">Appearance</p>
          <div className="mt-3">
            <ThemeToggleInline />
          </div>
        </div>

        <div className="mt-auto pt-4">
          <button
            type="button"
            onClick={async () => {
              try {
                const result = await authClient.signOut();
                if (result.error) throw result.error;
                notify("Signed out.", "success");
                onClose();
                router.push("/sign-in");
                router.refresh();
              } catch {
                notify("Could not sign out.", "error");
              }
            }}
            className="soft-action inline-flex w-full items-center justify-between rounded-[22px] px-4 py-4 text-[color:var(--danger)]"
          >
            <span className="inline-flex items-center gap-3">
              <span className="surface-chip inline-flex h-10 w-10 items-center justify-center rounded-full">
                <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
              </span>
              <span className="font-semibold">Sign out</span>
            </span>
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </div>
  );
}
