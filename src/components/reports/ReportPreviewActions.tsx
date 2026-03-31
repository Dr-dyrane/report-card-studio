"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export function ReportPreviewActions() {
  const router = useRouter();
  const pathname = usePathname();
  const pdfHref = pathname
    ? pathname.replace("/reports/", "/api/exports/report/").replace(/\/preview$/, "/pdf")
    : "#";

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
      <a
        href={pdfHref}
        target="_blank"
        rel="noreferrer"
        className="soft-action rounded-full px-4 py-2 text-sm font-medium"
      >
        Download PDF
      </a>
    </div>
  );
}
