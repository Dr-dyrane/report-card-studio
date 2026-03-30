import Link from "next/link";

import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

const reportStates = [
  ["Student 12", "Draft", "678", "21st"],
  ["Student 3", "Published", "733", "12th"],
  ["Student 2", "Published", "825", "2nd"],
  ["Student 20", "Published", "530", "30th"],
];

export default function ReportsPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        eyebrow="Reports"
        title="Reports"
        description="Entry, review, export"
        action="New"
        secondaryAction="Resume"
      />

      <section className="grid gap-3 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Queue">
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Drafts", "1"],
              ["Published", "19"],
              ["Ready", "4"],
              ["Exported", "12"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="frost-panel-soft rounded-[22px] px-4 py-4"
              >
                <p className="text-sm text-[color:var(--text-muted)]">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-[color:var(--text-strong)]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Current">
          <div className="grid gap-3">
            {reportStates.map(([student, status, total, position]) => (
              <Link
                key={student}
                href={`/reports/${student.toLowerCase().replace(/\s+/g, "-")}`}
                className="frost-panel-soft flex items-center justify-between rounded-[24px] px-4 py-4 transition hover:bg-[color:rgba(231,240,255,0.72)]"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-[color:var(--text-strong)]">
                    {student}
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                    {status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[color:var(--text-strong)]">
                    {total}
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                    {position}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
