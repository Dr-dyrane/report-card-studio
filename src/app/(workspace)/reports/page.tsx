import Link from "next/link";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

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

function getListTitle(view: "current" | "archived", filter: string) {
  if (view === "archived") return "Archived";
  if (filter === "draft") return "Drafts";
  if (filter === "published") return "Published";
  if (filter === "ready") return "Ready";
  return "Current";
}

function getEmptyMessage(view: "current" | "archived", filter: string) {
  if (view === "archived") {
    return "No archived reports yet in this class.";
  }
  if (filter === "draft") {
    return "No draft reports in this class.";
  }
  if (filter === "published") {
    return "No published reports in this class.";
  }
  if (filter === "ready") {
    return "No ready reports in this class.";
  }
  return "No reports yet in this class. Create a new student sheet to start.";
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: Promise<{ class?: string; view?: string; filter?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const selectedClass = resolvedSearchParams?.class ?? "";
  const selectedView = resolvedSearchParams?.view === "archived" ? "archived" : "current";
  const selectedFilter =
    resolvedSearchParams?.filter === "draft" ||
    resolvedSearchParams?.filter === "published" ||
    resolvedSearchParams?.filter === "ready"
      ? resolvedSearchParams.filter
      : "";

  const [reportCards, classrooms] = await Promise.all([
    getReportCardsWithOptions({ archived: selectedView === "archived" }),
    getClassroomsList(),
  ]);

  const classScopedReports = selectedClass
    ? reportCards.filter(
        (report) => slugify(report.classroom?.name ?? "") === selectedClass,
      )
    : reportCards;

  const visibleReports =
    selectedView === "archived"
      ? classScopedReports
      : selectedFilter === "draft"
        ? classScopedReports.filter((report) => report.status === "DRAFT")
        : selectedFilter === "published"
          ? classScopedReports.filter((report) => report.status === "PUBLISHED")
          : selectedFilter === "ready"
            ? classScopedReports.filter((report) => report.grandTotal > 0)
            : classScopedReports;

  const drafts = classScopedReports.filter((report) => report.status === "DRAFT").length;
  const published = classScopedReports.filter(
    (report) => report.status === "PUBLISHED",
  ).length;
  const archived = classScopedReports.filter((report) => report.status === "LOCKED").length;
  const ready = classScopedReports.filter((report) => report.grandTotal > 0).length;
  const selectedClassName =
    classrooms.find((classroom) => slugify(classroom.name) === selectedClass)?.name ??
    "All classes";
  const hasActiveListState = Boolean(selectedClass || selectedFilter || selectedView === "archived");

  const filterHref = (view: string, classSlug?: string, filter?: string) => {
    const params = new URLSearchParams();
    if (view === "archived") params.set("view", "archived");
    if (classSlug) params.set("class", classSlug);
    if (view !== "archived" && filter) params.set("filter", filter);
    const query = params.toString();
    return query ? `/reports?${query}` : "/reports";
  };

  const kpiItems = [
    {
      label: "Drafts",
      value: String(drafts),
      toneClass: "",
      href:
        selectedView === "current" && selectedFilter === "draft"
          ? filterHref("current", selectedClass || undefined)
          : filterHref("current", selectedClass || undefined, "draft"),
      active: selectedView === "current" && selectedFilter === "draft",
    },
    {
      label: "Published",
      value: String(published),
      toneClass: "mood-surface-success",
      href:
        selectedView === "current" && selectedFilter === "published"
          ? filterHref("current", selectedClass || undefined)
          : filterHref("current", selectedClass || undefined, "published"),
      active: selectedView === "current" && selectedFilter === "published",
    },
    {
      label: "Ready",
      value: String(ready),
      toneClass: "mood-surface-focus",
      href:
        selectedView === "current" && selectedFilter === "ready"
          ? filterHref("current", selectedClass || undefined)
          : filterHref("current", selectedClass || undefined, "ready"),
      active: selectedView === "current" && selectedFilter === "ready",
    },
    {
      label: "Archived",
      value: String(archived),
      toneClass: "mood-surface-warning",
      href:
        selectedView === "archived"
          ? filterHref("current", selectedClass || undefined)
          : filterHref("archived", selectedClass || undefined),
      active: selectedView === "archived",
    },
  ];
  const listTitle = getListTitle(selectedView, selectedFilter);
  const emptyMessage = getEmptyMessage(selectedView, selectedFilter);

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
      />

      <section className="grid gap-2 sm:gap-3 grid-cols-4">
        {kpiItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`frost-panel block rounded-[24px] px-4 py-4 transition hover:translate-y-[-1px] sm:px-5 sm:py-5 ${
              item.toneClass
            } ${item.active ? "ring-1 ring-[color:var(--accent-soft)]" : ""}`}
          >
            <p className="text-sm text-[color:var(--text-muted)]">{item.label}</p>
            <p className="mt-2 text-xl sm:text-2xl md:text-3xl font-semibold text-[color:var(--text-strong)]">
              {item.value}
            </p>
          </Link>
        ))}
      </section>

      <section>
        <SectionCard
          title={listTitle}
          tone={selectedView === "archived" ? "warning" : "default"}
          action={
            hasActiveListState ? (
              <Link
                href="/reports"
                aria-label="Reset report filters"
                className="soft-action inline-flex h-10 w-10 items-center justify-center rounded-full"
              >
                <ArrowPathIcon className="h-4.5 w-4.5 stroke-[1.9]" />
              </Link>
            ) : null
          }
        >
          <div className="mb-4 flex flex-wrap gap-2">
            <Link
              href={filterHref(selectedView, undefined, selectedView === "current" ? selectedFilter || undefined : undefined)}
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
                  href={filterHref(
                    selectedView,
                    classSlug,
                    selectedView === "current" ? selectedFilter || undefined : undefined,
                  )}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    selectedClass === classSlug ? "soft-action-tint" : "soft-action"
                  }`}
                >
                  {classroom.name}
                </Link>
              );
            })}
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
                  ? "Review or restore this archived sheet."
                  : `${toStatusLabel(report.status)} / ${report.position ?? "--"} in class.`,
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
            emptyMessage={emptyMessage}
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
                {emptyMessage}
              </div>
            )}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
