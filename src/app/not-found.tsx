import Link from "next/link";

import { AuthFrame, AuthFooterLinks } from "@/components/auth/AuthFrame";

export default function NotFound() {
  return (
    <AuthFrame
      eyebrow="Not found"
      title="Missing"
      footer={
        <AuthFooterLinks
          primaryHref="/students"
          primaryLabel="Open workspace"
          secondaryHref="/sign-in"
          secondaryLabel="Sign in"
        />
      }
    >
      <div className="space-y-4">
        <p className="rounded-[18px] bg-[color:var(--warning-soft)] px-4 py-3 text-sm text-[color:var(--warning)]">
          This page is not available.
        </p>
        <Link
          href="/students"
          className="soft-action inline-flex items-center rounded-full px-5 py-3 text-sm font-medium"
        >
          Students
        </Link>
      </div>
    </AuthFrame>
  );
}
