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
import { UserAvatar } from "@/components/ui/UserAvatar";
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
  currentUser: {
    name?: string | null;
    email?: string | null;
    username?: string | null;
    image?: string | null;
  } | null;
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
      <aside className="frost-panel-strong absolute right-0 top-0 flex h-full w-[min(88vw,24rem)] flex-col rounded-l-[30px] px-3 pb-[calc(0.8rem+env(safe-area-inset-bottom))] pt-[max(0.85rem,env(safe-area-inset-top))] shadow-[0_28px_80px_rgba(13,20,32,0.24)]">
        <div className="flex items-start justify-end">
          <button
            type="button"
            onClick={onClose}
            className="soft-action inline-flex h-11 w-11 items-center justify-center rounded-full"
            aria-label="Close utility sheet"
          >
            <XMarkIcon className="h-5 w-5 text-[color:var(--text-strong)]" />
          </button>
        </div>

        <Link
          href="/profile"
          onClick={onClose}
          className="mt-3 rounded-[22px] premium-wash px-3.5 py-3 shadow-[var(--shadow-frost-strong)]"
        >
          <div className="flex items-center gap-3">
            <UserAvatar
              name={currentUser?.name}
              username={currentUser?.username}
              email={currentUser?.email}
              image={currentUser?.image}
              sizeClassName="h-14 w-14"
              textClassName="text-[1.3rem]"
              roundedClassName="rounded-[20px]"
              className="surface-chip-strong"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-[1.45rem] font-semibold leading-none text-[color:var(--text-strong)]">
                  {currentUser?.name ?? "Kradle"}
                </p>
                {currentUser?.username ? (
                  <p className="shrink-0 whitespace-nowrap text-sm font-medium text-[color:var(--accent-strong)]">
                    @{currentUser.username}
                  </p>
                ) : null}
              </div>
              {currentUser?.email ? (
                <p className="mt-1 truncate text-[15px] text-[color:var(--text-base)]">
                  {currentUser.email}
                </p>
              ) : null}
            </div>
            <ChevronRightIcon className="h-4.5 w-4.5 shrink-0 text-[color:var(--text-muted)]" />
          </div>
        </Link>

        <div className="mt-4 overflow-hidden rounded-[22px] premium-wash shadow-[var(--shadow-frost-strong)]">
          <Link
            href="/reports/new"
            onClick={onClose}
            className="soft-action-tint inline-flex w-full items-center justify-between rounded-t-[22px] px-4 py-3.5"
          >
            <span className="inline-flex items-center gap-3">
              <span className="surface-chip inline-flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--accent-strong)]">
                <PlusIcon className="h-4.5 w-4.5" />
              </span>
              <span className="font-semibold">New report</span>
            </span>
            <ChevronRightIcon className="h-4 w-4" />
          </Link>

          <div className="px-3">
            {utilityLinks.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`inline-flex w-full items-center justify-between px-1 py-3.5 ${
                index > 0 ? "border-t border-[color:var(--border-soft)]/40" : ""
              }`}
            >
              <span className="inline-flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--surface-glass)] text-[color:var(--text-muted)]">
                  <AppIcon name={item.icon} className="h-4.5 w-4.5" />
                </span>
                <span className="font-medium text-[color:var(--text-strong)]">{item.label}</span>
              </span>
              <ChevronRightIcon className="h-4 w-4 text-[color:var(--text-muted)]" />
            </Link>
            ))}
          </div>
        </div>

        <div className="mt-3 rounded-[22px] premium-wash px-3 py-3 shadow-[var(--shadow-frost)]">
          <p className="px-1 pb-2 text-sm font-semibold text-[color:var(--text-strong)]">Appearance</p>
          <ThemeToggleInline />
        </div>

        <div className="mt-auto pt-3">
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
            className="premium-wash inline-flex w-full items-center justify-between rounded-[22px] px-4 py-3.5 text-[color:var(--danger)] shadow-[var(--shadow-frost)]"
          >
            <span className="inline-flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--surface-glass)]">
                <ArrowRightStartOnRectangleIcon className="h-4.5 w-4.5" />
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
