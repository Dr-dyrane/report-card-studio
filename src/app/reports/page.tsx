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

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          ["Drafts", String(drafts)],
          ["Published", String(published)],
          ["Ready", String(ready)],
          ["Exported", "0"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="frost-panel rounded-[24px] px-4 py-4 sm:px-5 sm:py-5"
          >
            <p className="text-sm text-[color:var(--text-muted)]">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-[color:var(--text-strong)]">
              {value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-3">
        <SectionCard title="Current">
          <div className="mb-4 flex flex-wrap gap-2">
            {reportCards.slice(0, 6).map((report) => {
              const hrefStudent = report.student.fullName
                .toLowerCase()
                .replace(/\s+/g, "-");

              return (
                <Link
                  key={`${report.id}-pill`}
                  href={`/reports/${hrefStudent}`}
                  className="soft-action rounded-full px-4 py-2 text-sm font-medium"
                >
                  {report.student.fullName}
                </Link>
              );
            })}
          </div>

          <div className="grid gap-3">
            {reportCards.length ? (
              reportCards.map((report) => {
                const hrefStudent = report.student.fullName
                  .toLowerCase()
                  .replace(/\s+/g, "-");

                return (
                  <div
                    key={report.id}
                    className="frost-panel-soft rounded-[24px] px-4 py-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-[color:var(--text-strong)]">
                          {report.student.fullName}
                        </p>
                        <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                          {report.status.toLowerCase()}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                        <div className="rounded-[18px] bg-white/55 px-3 py-2 text-center shadow-[var(--shadow-frost)] sm:min-w-[4.5rem] sm:text-right">
                          <p className="font-semibold text-[color:var(--text-strong)]">
                            {report.grandTotal}
                          </p>
                          <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                            {report.position ?? "--"}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
                          <Link
                            href={`/reports/${hrefStudent}`}
                            className="soft-action-tint rounded-full px-3 py-2 text-center text-sm font-semibold"
                          >
                            Entry
                          </Link>
                          <Link
                            href={`/reports/${hrefStudent}/preview`}
                            className="soft-action rounded-full px-3 py-2 text-center text-sm font-medium"
                          >
                            Preview
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
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
