import Link from "next/link";

import { MobileBladeList } from "@/components/mobile/MobileBladeList";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { getReportCardsWithOptions } from "@/lib/report-data";
import { getClassroomsList } from "@/lib/school-data";

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function toStatusLabel(value: string) {
  if (value === "LOCKED") return "Archived";
  return `${value.slice(0, 1)}${value.slice(1).toLowerCase()}`;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: Promise<{ class?: string; view?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const selectedClass = resolvedSearchParams?.class ?? "";
  const selectedView = resolvedSearchParams?.view === "archived" ? "archived" : "current";

  const [reportCards, classrooms] = await Promise.all([
    getReportCardsWithOptions({ archived: selectedView === "archived" }),
    getClassroomsList(),
  ]);

  const visibleReports = selectedClass
    ? reportCards.filter(
        (report) => slugify(report.classroom?.name ?? "") === selectedClass,
      )
    : reportCards;

  const drafts = visibleReports.filter((report) => report.status === "DRAFT").length;
  const published = visibleReports.filter(
    (report) => report.status === "PUBLISHED",
  ).length;
  const archived = visibleReports.filter((report) => report.status === "LOCKED").length;
  const ready = visibleReports.filter((report) => report.grandTotal > 0).length;
  const selectedClassName =
    classrooms.find((classroom) => slugify(classroom.name) === selectedClass)?.name ??
    "All classes";

  const filterHref = (view: string, classSlug?: string) => {
    const params = new URLSearchParams();
    if (view === "archived") params.set("view", "archived");
    if (classSlug) params.set("class", classSlug);
    const query = params.toString();
    return query ? `/reports?${query}` : "/reports";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        eyebrow="Reports"
        title={selectedView === "archived" ? "Archive" : "Reports"}
        description={
          selectedView === "archived"
            ? `${selectedClassName} archived sheets`
            : selectedClass
              ? selectedClassName
              : "Current term"
        }
        action={{ label: "New", href: "/reports/new" }}
        secondaryAction={{
          label: selectedView === "archived" ? "Current" : "Archive",
          href: selectedView === "archived" ? "/reports" : "/reports?view=archived",
        }}
      />

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          ["Drafts", String(drafts), ""],
          ["Published", String(published), "mood-surface-success"],
          ["Ready", String(ready), "mood-surface-focus"],
          ["Archived", String(archived), ""],
        ].map(([label, value, toneClass]) => (
          <div
            key={label}
            className={`frost-panel rounded-[24px] px-4 py-4 sm:px-5 sm:py-5 ${toneClass}`}
          >
            <p className="text-sm text-[color:var(--text-muted)]">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-[color:var(--text-strong)]">
              {value}
            </p>
          </div>
        ))}
      </section>

      <section>
        <SectionCard
          title={selectedView === "archived" ? "Archived" : "Current"}
          tone={selectedView === "archived" ? "warning" : "default"}
        >
          <div className="mb-4 flex flex-wrap gap-2">
            <Link
              href={filterHref("current", selectedClass || undefined)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                selectedView === "current" ? "soft-action-tint" : "soft-action"
              }`}
            >
              Current
            </Link>
            <Link
              href={filterHref("archived", selectedClass || undefined)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                selectedView === "archived" ? "soft-action-tint" : "soft-action"
              }`}
            >
              Archived
            </Link>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <Link
              href={filterHref(selectedView)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                !selectedClass ? "soft-action-tint" : "soft-action"
              }`}
            >
              All classes
            </Link>
            {classrooms.map((classroom) => {
              const classSlug = slugify(classroom.name);
              return (
                <Link
                  key={classroom.id}
                  href={filterHref(selectedView, classSlug)}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    selectedClass === classSlug ? "soft-action-tint" : "soft-action"
                  }`}
                >
                  {classroom.name}
                </Link>
              );
            })}
          </div>

          <div className="mb-4 rounded-[18px] quiet-note px-4 py-3 text-sm text-[color:var(--text-muted)]">
            {selectedView === "archived"
              ? "Archived reports stay readable and can be restored from the sheet."
              : "Positions and totals refresh after saved edits and publish."}
          </div>

          <div className="mb-4 flex flex-wrap gap-2 xl:hidden">
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
              eyebrow: selectedView === "archived" ? "Archived report" : "Report",
              badge: {
                label: toStatusLabel(report.status),
                tone:
                  report.status === "PUBLISHED"
                    ? "success"
                    : report.status === "LOCKED"
                      ? "default"
                      : "default",
              },
              quickValue: String(report.grandTotal),
              quickHint: report.position ?? "--",
              summary:
                selectedView === "archived"
                  ? "Open the archived sheet to review or restore it."
                  : "Review the current total, then jump into entry or preview without losing your place in the list.",
              meta: [
                { label: "Total", value: String(report.grandTotal) },
                { label: "Position", value: report.position ?? "--" },
                { label: "Class", value: report.classroom?.name ?? "Class" },
                { label: "Status", value: toStatusLabel(report.status) },
              ],
              actions: [
                {
                  label: selectedView === "archived" ? "Open archived sheet" : "Open sheet",
                  href: `/reports/${report.id}`,
                  tone: "accent",
                },
                { label: "Preview", href: `/reports/${report.id}/preview` },
              ],
            }))}
            emptyMessage={
              selectedView === "archived"
                ? "No archived reports yet in this class."
                : "No reports yet in this class. Create a new student sheet to start."
            }
          />

          <div className="frost-panel-soft hidden overflow-hidden rounded-[20px] sm:block">
            {visibleReports.length ? (
              <table className="min-w-full border-separate border-spacing-0">
                <thead className="table-head text-left text-sm text-[color:var(--text-muted)]">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Student</th>
                    <th className="px-4 py-2.5 font-medium">Class</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 text-right font-medium">Total</th>
                    <th className="px-4 py-2.5 text-right font-medium">Position</th>
                    <th className="px-4 py-2.5 text-right font-medium">Open</th>
                  </tr>
                </thead>
                <tbody className="bg-[color:var(--surface)] text-sm">
                  {visibleReports.map((report, index) => (
                    <tr
                      key={report.id}
                      className="transition hover:bg-[color:var(--surface-muted)]/70"
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? "var(--table-row-odd)" : undefined,
                      }}
                    >
                      <td className="px-4 py-3 font-semibold text-[color:var(--text-strong)]">
                        {report.student.fullName}
                      </td>
                      <td className="px-4 py-3 text-[color:var(--text-muted)]">
                        {report.classroom?.name ?? "Class"}
                      </td>
                      <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          report.status === "PUBLISHED"
                              ? "mood-badge-success"
                              : report.status === "LOCKED"
                                ? "mood-badge-warning"
                              : "surface-chip text-[color:var(--text-base)]"
                          }`}
                        >
                          {toStatusLabel(report.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[color:var(--text-strong)]">
                        {report.grandTotal}
                      </td>
                      <td className="px-4 py-3 text-right text-[color:var(--text-base)]">
                        {report.position ?? "--"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/reports/${report.id}`}
                            className="soft-action-tint inline-flex rounded-full px-3 py-1.5 text-sm font-semibold"
                          >
                            {selectedView === "archived" ? "Open" : "Entry"}
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
              <div className="empty-state m-4 rounded-[22px] px-4 py-5 text-sm text-[color:var(--text-muted)]">
                {selectedView === "archived"
                  ? "No archived reports yet in this class."
                  : "No reports yet in this class. Create a new student sheet to start."}
              </div>
            )}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
