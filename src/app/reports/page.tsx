import Link from "next/link";

import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reports"
        title="Reports"
        description="Drafts, previews, exports."
        action="New"
        secondaryAction="Resume"
      />

      <SectionCard title="Current">
        <div className="space-y-4">
          <Link
            href="/reports/student-12"
            className="frost-panel-soft flex items-center justify-between rounded-[24px] px-5 py-5 transition hover:bg-[color:rgba(231,240,255,0.72)]"
          >
            <div>
              <p className="text-lg font-semibold text-[color:var(--text-strong)]">
                Student 12 report
              </p>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">In progress</p>
            </div>
            <span className="text-sm font-semibold text-[color:var(--accent-strong)]">
              Open
            </span>
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}
