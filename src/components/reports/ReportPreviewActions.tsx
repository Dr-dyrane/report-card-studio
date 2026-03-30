"use client";

import { useRouter } from "next/navigation";

export function ReportPreviewActions() {
  const router = useRouter();

  return (
    <div className="print-actions flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => router.back()}
        className="soft-action rounded-full px-4 py-2 text-sm font-medium"
      >
        Back
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="soft-action-tint rounded-full px-4 py-2 text-sm font-semibold"
      >
        Print / PDF
      </button>
    </div>
  );
}
