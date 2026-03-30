import { Suspense } from "react";

import { AuthFrame } from "@/components/auth/AuthFrame";
import { ResetPasswordFlow } from "@/components/auth/ResetPasswordFlow";

function ResetPasswordFallback() {
  return (
    <AuthFrame eyebrow="Password" title="Reset">
      <div className="space-y-4">
        <div className="surface-chip rounded-[20px] px-4 py-4 text-sm text-[color:var(--text-muted)]">
          Loading...
        </div>
      </div>
    </AuthFrame>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordFlow />
    </Suspense>
  );
}
