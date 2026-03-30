import Link from "next/link";

import { MobileBladeList } from "@/components/mobile/MobileBladeList";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { getReportCards } from "@/lib/report-data";
import { getClassroomsList } from "@/lib/school-data";

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

      <section className="grid gap-4 xl:grid-cols-[1.24fr_0.76fr]">
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

          <div className="frost-panel-soft hidden overflow-hidden rounded-[22px] sm:block">
            {visibleReports.length ? (
              <table className="min-w-full border-separate border-spacing-0">
                <thead className="table-head text-left text-sm text-[color:var(--text-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Student</th>
                    <th className="px-4 py-3 font-medium">Class</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                    <th className="px-4 py-3 text-right font-medium">Position</th>
                    <th className="px-4 py-3 text-right font-medium">Open</th>
                  </tr>
                </thead>
                <tbody className="bg-[color:var(--surface)] text-sm">
                  {visibleReports.map((report, index) => (
                    <tr
                      key={report.id}
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? "var(--table-row-odd)" : undefined,
                      }}
                    >
                      <td className="px-4 py-4 font-semibold text-[color:var(--text-strong)]">
                        {report.student.fullName}
                      </td>
                      <td className="px-4 py-4 text-[color:var(--text-muted)]">
                        {report.classroom?.name ?? "Class"}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            report.status === "PUBLISHED"
                              ? "bg-[color:var(--success-soft)] text-[color:var(--success)]"
                              : "soft-action text-[color:var(--text-base)]"
                          }`}
                        >
                          {`${report.status.slice(0, 1)}${report.status
                            .slice(1)
                            .toLowerCase()}`}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-[color:var(--text-strong)]">
                        {report.grandTotal}
                      </td>
                      <td className="px-4 py-4 text-right text-[color:var(--text-base)]">
                        {report.position ?? "--"}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/reports/${report.id}`}
                            className="soft-action-tint inline-flex rounded-full px-3 py-1.5 text-sm font-semibold"
                          >
                            Entry
                          </Link>
                          <Link
                            href={`/reports/${report.id}/preview`}
                            className="soft-action inline-flex rounded-full px-3 py-1.5 text-sm font-medium"
                          >
                            Preview
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="m-4 rounded-[22px] px-4 py-5 text-sm text-[color:var(--text-muted)] soft-action">
                No reports yet in this class. Create a new student sheet to start.
              </div>
            )}
          </div>
        </SectionCard>

        <div className="hidden xl:grid xl:gap-4">
          <SectionCard title="Snapshot">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Visible", String(visibleReports.length)],
                ["Published", String(published)],
                ["Drafts", String(drafts)],
                ["Ready", String(ready)],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={`rounded-[22px] px-4 py-4 ${
                    index === 1 ? "soft-action-tint" : "surface-pocket"
                  }`}
                >
                  <p className="text-sm text-[color:var(--text-muted)]">{label}</p>
                  <p className="mt-2 text-3xl font-semibold text-[color:var(--text-strong)]">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Top ready">
            {visibleReports.slice(0, 4).length ? (
              <div className="grid gap-3">
                {visibleReports.slice(0, 4).map((report) => (
                  <Link
                    key={`${report.id}-side`}
                    href={`/reports/${report.id}`}
                    className="surface-pocket surface-hover block rounded-[22px] px-4 py-4 transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[color:var(--text-strong)]">
                          {report.student.fullName}
                        </p>
                        <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                          {report.classroom?.name ?? "Class"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[color:var(--text-strong)]">
                          {report.grandTotal}
                        </p>
                        <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                          {report.position ?? "--"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="soft-action rounded-[22px] px-4 py-4 text-sm text-[color:var(--text-muted)]">
                No reports yet in this class.
              </div>
            )}
          </SectionCard>
        </div>
      </section>
    </div>
  );
}
