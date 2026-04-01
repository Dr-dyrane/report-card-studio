"use client";

import { ArrowRightStartOnRectangleIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

import { useFeedback } from "@/components/feedback/FeedbackProvider";
import { authClient } from "@/lib/auth-client";

export function AccountSignOutRow({
  compact = false,
}: {
  compact?: boolean;
}) {
  const router = useRouter();
  const { notify } = useFeedback();

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          const result = await authClient.signOut();
          if (result.error) throw result.error;
          notify("Signed out.", "success");
          router.push("/sign-in");
          router.refresh();
        } catch {
          notify("Could not sign out.", "error");
        }
      }}
      className={`w-full text-left ${
        compact
          ? "group frost-panel-soft flex items-center gap-3 rounded-[24px] px-4 py-4 transition hover:translate-y-[-1px]"
          : "premium-wash inline-flex items-center justify-between rounded-[22px] px-4 py-3.5 text-[color:var(--danger)] shadow-[var(--shadow-frost)]"
      }`}
    >
      <span className="inline-flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--surface-glass)]">
          <ArrowRightStartOnRectangleIcon className="h-4.5 w-4.5 stroke-[1.75]" />
        </span>
        <span className={compact ? "font-semibold text-[color:var(--text-strong)]" : "font-semibold"}>
          Sign out
        </span>
      </span>
      <ChevronRightIcon
        className={`h-4 w-4 shrink-0 stroke-[1.75] ${
          compact ? "text-[color:var(--text-muted)]" : ""
        }`}
      />
    </button>
  );
}
