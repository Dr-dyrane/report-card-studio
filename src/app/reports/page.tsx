import Link from "next/link";

import { getReportCards } from "@/lib/report-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

export default async function ReportsPage() {
  const reportCards = await getReportCards();
  const drafts = reportCards.filter((report) => report.status === "DRAFT").length;
  const published = reportCards.filter(
    (report) => report.status === "PUBLISHED",
  ).length;
  const ready = reportCards.filter((report) => report.grandTotal > 0).length;

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
              ["Drafts", String(drafts)],
              ["Published", String(published)],
              ["Ready", String(ready)],
              ["Exported", "0"],
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
            {reportCards.length ? (
              reportCards.map((report) => {
                const hrefStudent = report.student.fullName
                  .toLowerCase()
                  .replace(/\s+/g, "-");

                return (
                  <Link
                    key={report.id}
                    href={`/reports/${hrefStudent}`}
                    className="frost-panel-soft flex items-center justify-between rounded-[24px] px-4 py-4 transition hover:bg-[color:rgba(231,240,255,0.72)]"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-[color:var(--text-strong)]">
                        {report.student.fullName}
                      </p>
                      <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                        {report.status.toLowerCase()}
                      </p>
                    </div>
                    <div className="rounded-[18px] bg-white/55 px-3 py-2 text-right shadow-[var(--shadow-frost)]">
                      <p className="font-semibold text-[color:var(--text-strong)]">
                        {report.grandTotal}
                      </p>
                      <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                        {report.position ?? "--"}
                      </p>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="frost-panel-soft rounded-[24px] px-4 py-5 text-sm text-[color:var(--text-muted)]">
                No reports yet. Seed or create a report to start.
              </div>
            )}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
