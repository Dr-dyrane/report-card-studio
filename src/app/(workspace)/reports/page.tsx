import Link from "next/link";

import { MobileBladeList } from "@/components/mobile/MobileBladeList";
import { getReportCards } from "@/lib/report-data";
import { getClassroomsList } from "@/lib/school-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: Promise<{ class?: string }>;
}) {
  const [reportCards, classrooms, resolvedSearchParams] = await Promise.all([
    getReportCards(),
    getClassroomsList(),
    searchParams,
  ]);
  const selectedClass = resolvedSearchParams?.class ?? "";
  const visibleReports = selectedClass
    ? reportCards.filter(
        (report) => slugify(report.classroom?.name ?? "") === selectedClass,
      )
    : reportCards;
  const drafts = visibleReports.filter((report) => report.status === "DRAFT").length;
  const published = visibleReports.filter(
    (report) => report.status === "PUBLISHED",
  ).length;
  const ready = visibleReports.filter((report) => report.grandTotal > 0).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        eyebrow="Reports"
        title="Reports"
        description={
          selectedClass
            ? classrooms.find((classroom) => slugify(classroom.name) === selectedClass)
                ?.name ?? "Current term"
            : "Current term"
        }
        action={{ label: "New", href: "/reports/new" }}
        secondaryAction={{ label: "Students", href: "/students" }}
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
            <Link
              href="/reports"
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                !selectedClass ? "soft-action-tint" : "soft-action"
              }`}
            >
              All classes
            </Link>
            {classrooms.map((classroom) => (
              <Link
                key={classroom.id}
                href={`/reports?class=${slugify(classroom.name)}`}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  selectedClass === slugify(classroom.name)
                    ? "soft-action-tint"
                    : "soft-action"
                }`}
              >
                {classroom.name}
              </Link>
            ))}
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {visibleReports.slice(0, 6).map((report) => (
              <Link
                key={`${report.id}-pill`}
                href={`/reports/${report.id}`}
                className="soft-action rounded-full px-4 py-2 text-sm font-medium"
              >
                {report.student.fullName}
              </Link>
            ))}
          </div>

          <MobileBladeList
            items={visibleReports.map((report) => ({
              id: report.id,
              title: report.student.fullName,
              subtitle: report.classroom?.name ?? "Class",
              eyebrow: "Report",
              badge: {
                label: `${report.status.slice(0, 1)}${report.status.slice(1).toLowerCase()}`,
                tone: report.status === "PUBLISHED" ? "success" : "default",
              },
              quickValue: String(report.grandTotal),
              quickHint: report.position ?? "--",
              summary:
                "Review the current total, then jump into entry or preview without losing your place in the list.",
              meta: [
                { label: "Total", value: String(report.grandTotal) },
                { label: "Position", value: report.position ?? "--" },
                { label: "Class", value: report.classroom?.name ?? "Class" },
                {
                  label: "Status",
                  value: `${report.status.slice(0, 1)}${report.status.slice(1).toLowerCase()}`,
                },
              ],
              actions: [
                { label: "Open sheet", href: `/reports/${report.id}`, tone: "accent" },
                { label: "Preview", href: `/reports/${report.id}/preview` },
              ],
            }))}
            emptyMessage="No reports yet in this class. Create a new student sheet to start."
          />

          <div className="hidden gap-3 sm:grid">
            {visibleReports.length ? (
              visibleReports.map((report) => (
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
                        {(report.classroom?.name ?? "Class") + " · " + report.status.toLowerCase()}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                      <div className="surface-chip rounded-[18px] px-3 py-2 text-center sm:min-w-[4.5rem] sm:text-right">
                        <p className="font-semibold text-[color:var(--text-strong)]">
                          {report.grandTotal}
                        </p>
                        <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                          {report.position ?? "--"}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
                        <Link
                          href={`/reports/${report.id}`}
                          className="soft-action-tint rounded-full px-3 py-2 text-center text-sm font-semibold"
                        >
                          Entry
                        </Link>
                        <Link
                          href={`/reports/${report.id}/preview`}
                          className="soft-action rounded-full px-3 py-2 text-center text-sm font-medium"
                        >
                          Preview
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="frost-panel-soft rounded-[24px] px-4 py-5 text-sm text-[color:var(--text-muted)]">
                No reports yet in this class. Create a new student sheet to start.
              </div>
            )}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
