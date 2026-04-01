import Link from "next/link";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

import { MobileBladeList } from "@/components/mobile/MobileBladeList";
import { getClassroomsList, getStudentsList } from "@/lib/school-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ class?: string; filter?: string }>;
}) {
  const [students, classrooms, resolvedSearchParams] = await Promise.all([
    getStudentsList(),
    getClassroomsList(),
    searchParams,
  ]);

  const selectedClass = resolvedSearchParams?.class ?? "";
  const selectedFilter =
    resolvedSearchParams?.filter === "published" || resolvedSearchParams?.filter === "draft"
      ? resolvedSearchParams.filter
      : "";
  const classScopedStudents = selectedClass
    ? students.filter((student) => slugify(student.classroomName) === selectedClass)
    : students;
  const visibleStudents =
    selectedFilter === "published"
      ? classScopedStudents.filter((student) => student.status === "Published")
      : selectedFilter === "draft"
        ? classScopedStudents.filter((student) => student.status !== "Published")
        : classScopedStudents;
  const published = classScopedStudents.filter(
    (student) => student.status === "Published",
  ).length;
  const drafts = classScopedStudents.length - published;
  const average = classScopedStudents.length
    ? Math.round(
        classScopedStudents.reduce((sum, student) => sum + student.grandTotal, 0) /
          classScopedStudents.length,
      )
    : 0;
  const topStudent = visibleStudents[0];
  const selectedClassroomName =
    classrooms.find((classroom) => slugify(classroom.name) === selectedClass)?.name ??
    "All classes";
  const hasActiveListState = Boolean(selectedClass || selectedFilter);

  const filterHref = (classSlug?: string, filter?: string) => {
    const params = new URLSearchParams();
    if (classSlug) params.set("class", classSlug);
    if (filter) params.set("filter", filter);
    const query = params.toString();
    return query ? `/students?${query}` : "/students";
  };

  const kpiItems = [
    {
      label: "Students",
      value: String(classScopedStudents.length),
      toneClass: "",
      href:
        !selectedFilter
          ? filterHref(selectedClass || undefined)
          : filterHref(selectedClass || undefined),
      active: !selectedFilter,
    },
    {
      label: "Published",
      value: String(published),
      toneClass: "mood-surface-success",
      href:
        selectedFilter === "published"
          ? filterHref(selectedClass || undefined)
          : filterHref(selectedClass || undefined, "published"),
      active: selectedFilter === "published",
    },
    {
      label: "Drafts",
      value: String(drafts),
      toneClass: "mood-surface-warning",
      href:
        selectedFilter === "draft"
          ? filterHref(selectedClass || undefined)
          : filterHref(selectedClass || undefined, "draft"),
      active: selectedFilter === "draft",
    },
    {
      label: "Average",
      value: String(average),
      toneClass: "mood-surface-focus",
      href: filterHref(selectedClass || undefined),
      active: false,
    },
  ];
  const listTitle =
    selectedFilter === "published"
      ? "Published"
      : selectedFilter === "draft"
        ? "Drafts"
        : "Roster";
  const emptyMessage =
    selectedFilter === "published"
      ? "No published students yet in this class."
      : selectedFilter === "draft"
        ? "No draft students in this class."
        : "No students yet in this class.";

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        eyebrow="Students"
        title="Students"
        description={selectedClassroomName}
        action={{ label: "Add", href: "/reports/new" }}
      />

      <section className="grid grid-cols-4 gap-2 sm:gap-3">
        {kpiItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`frost-panel block rounded-[24px] px-4 py-4 transition hover:translate-y-[-1px] sm:px-5 sm:py-5 ${
              item.toneClass
            } ${item.active ? "ring-1 ring-[color:var(--accent-soft)]" : ""}`}
          >
            <p className="text-sm text-[color:var(--text-muted)]">{item.label}</p>
            <p className="mt-2 text-xl font-semibold text-[color:var(--text-strong)] sm:text-2xl md:text-3xl">
              {item.value}
            </p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
        <SectionCard
          title={listTitle}
          tone="focus"
          action={
            hasActiveListState ? (
              <Link
                href="/students"
                aria-label="Reset student filters"
                className="soft-action inline-flex h-10 w-10 items-center justify-center rounded-full"
              >
                <ArrowPathIcon className="h-4.5 w-4.5 stroke-[1.9]" />
              </Link>
            ) : null
          }
        >
          <div className="mb-4 flex flex-wrap gap-2 sm:mb-5 sm:gap-3">
            <Link
              href={filterHref(undefined, selectedFilter || undefined)}
              className={`rounded-full px-3 py-2 text-center text-sm sm:px-4 ${
                !selectedClass ? "soft-action-tint" : "soft-action"
              }`}
            >
              All classes
            </Link>
            {classrooms.map((classroom) => (
              <Link
                key={classroom.id}
                href={filterHref(slugify(classroom.name), selectedFilter || undefined)}
                className={`rounded-full px-3 py-2 text-center text-sm sm:px-4 ${
                  selectedClass === slugify(classroom.name)
                    ? "soft-action-tint"
                    : "soft-action"
                }`}
              >
                {classroom.name}
              </Link>
            ))}
          </div>

          <MobileBladeList
            items={visibleStudents.map((student) => ({
              id: student.id,
              title: student.fullName,
              subtitle: student.classroomName,
              eyebrow: "Student",
              badge: {
                label: student.status,
                tone: student.status === "Published" ? "success" : "default",
              },
              quickValue: String(student.grandTotal),
              quickHint: student.position,
              summary:
                `${student.status} / ${student.position} in class.`,
              meta: [
                { label: "Total", value: String(student.grandTotal) },
                { label: "Position", value: student.position },
                { label: "Class", value: student.classroomName },
                { label: "Status", value: student.status },
              ],
              actions: [
                { label: "Open sheet", href: student.reportHref, tone: "accent" },
                { label: "Preview", href: student.previewHref },
                { label: "Profile", href: `/students/${student.id}` },
              ],
            }))}
            emptyMessage={emptyMessage}
          />

          <div className="frost-panel-soft hidden overflow-hidden rounded-[20px] sm:block">
            <table className="min-w-full border-separate border-spacing-0">
              <thead className="table-head text-left text-sm text-[color:var(--text-muted)]">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Student</th>
                  <th className="px-4 py-2.5 font-medium">Class</th>
                  <th className="px-4 py-2.5 text-right font-medium">Total</th>
                  <th className="px-4 py-2.5 text-right font-medium">Position</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 text-right font-medium">Report</th>
                </tr>
              </thead>
              <tbody className="bg-[color:var(--surface)] text-sm">
                {visibleStudents.map((student, index) => (
                  <tr
                    key={student.id}
                    style={{
                      backgroundColor: index % 2 === 0 ? "var(--table-row-odd)" : undefined,
                    }}
                  >
                    <td className="px-4 py-3.5 font-semibold text-[color:var(--text-strong)]">
                      {student.fullName}
                    </td>
                    <td className="px-4 py-3.5 text-[color:var(--text-muted)]">
                      {student.classroomName}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-[color:var(--text-strong)]">
                      {student.grandTotal}
                    </td>
                    <td className="px-4 py-3.5 text-right text-[color:var(--text-base)]">
                      {student.position}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full bg-[color:var(--success-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--success)]">
                        {student.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={student.reportHref}
                          className="soft-action-tint inline-flex rounded-full px-3 py-1.5 text-sm font-semibold"
                        >
                          Entry
                        </Link>
                        <Link
                          href={student.previewHref}
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
            {!visibleStudents.length ? (
              <div className="empty-state m-4 rounded-[22px] px-4 py-4 text-sm text-[color:var(--text-muted)]">
                {emptyMessage}
              </div>
            ) : null}
          </div>
        </SectionCard>

        <div className="grid gap-4">
          <SectionCard title="Top student" tone="success">
            {topStudent ? (
              <Link
                href={topStudent.reportHref}
                className="frost-panel-soft block rounded-[24px] px-4 py-4 transition hover:bg-[color:var(--accent-soft)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[color:var(--text-strong)]">
                      {topStudent.fullName}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                      {topStudent.classroomName}
                    </p>
                  </div>
                  <span className="mood-badge-focus rounded-full px-3 py-1.5 text-sm font-semibold">
                    {topStudent.grandTotal}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="surface-pocket rounded-[20px] px-4 py-4">
                    <p className="text-sm text-[color:var(--text-muted)]">Position</p>
                    <p className="mt-2 text-xl font-semibold text-[color:var(--text-strong)]">
                      {topStudent.position}
                    </p>
                  </div>
                  <div className="surface-pocket rounded-[20px] px-4 py-4">
                    <p className="text-sm text-[color:var(--text-muted)]">Status</p>
                    <p className="mt-2 text-xl font-semibold text-[color:var(--text-strong)]">
                      {topStudent.status}
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
                <div className="empty-state rounded-[22px] px-4 py-4 text-sm text-[color:var(--text-muted)]">
                  No published totals yet in this class.
                </div>
            )}
          </SectionCard>

          <SectionCard title="Attention" tone="warning">
            <div className="grid gap-3">
              {visibleStudents
                .filter((student) => student.grandTotal > 0)
                .slice(-3)
                .map((student) => (
                  <Link
                    key={student.id}
                    href={student.reportHref}
                    className="surface-pocket surface-hover block rounded-[22px] px-4 py-4 transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[color:var(--text-strong)]">
                          {student.fullName}
                        </p>
                        <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                          Needs review
                        </p>
                      </div>
                      <span className="mood-badge-warning rounded-full px-3 py-1.5 text-sm font-semibold">
                        {student.grandTotal}
                      </span>
                    </div>
                  </Link>
                ))}
              {drafts ? (
                  <div className="quiet-note rounded-[22px] px-4 py-4 text-sm text-[color:var(--text-muted)]">
                    {drafts} draft records
                  </div>
              ) : null}
            </div>
          </SectionCard>
        </div>
      </section>
    </div>
  );
}
