import Link from "next/link";

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
  searchParams?: Promise<{ class?: string }>;
}) {
  const [students, classrooms, resolvedSearchParams] = await Promise.all([
    getStudentsList(),
    getClassroomsList(),
    searchParams,
  ]);

  const selectedClass = resolvedSearchParams?.class ?? "";
  const visibleStudents = selectedClass
    ? students.filter((student) => slugify(student.classroomName) === selectedClass)
    : students;
  const published = visibleStudents.filter(
    (student) => student.status === "Published",
  ).length;
  const drafts = visibleStudents.length - published;
  const average = visibleStudents.length
    ? Math.round(
        visibleStudents.reduce((sum, student) => sum + student.grandTotal, 0) /
          visibleStudents.length,
      )
    : 0;
  const topStudent = visibleStudents[0];
  const selectedClassroomName =
    classrooms.find((classroom) => slugify(classroom.name) === selectedClass)?.name ??
    "All classes";

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        eyebrow="Students"
        title="Students"
        description={selectedClassroomName}
        action={{ label: "Add", href: "/reports/new" }}
      />

      <section className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
        <SectionCard title="Roster" tone="focus">
          <div className="mb-4 flex flex-wrap gap-2 sm:mb-5 sm:gap-3">
            <Link
              href="/students"
              className={`rounded-full px-3 py-2 text-center text-sm sm:px-4 ${
                !selectedClass ? "soft-action-tint" : "soft-action"
              }`}
            >
              All classes
            </Link>
            {classrooms.map((classroom) => (
              <Link
                key={classroom.id}
                href={`/students?class=${slugify(classroom.name)}`}
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
                "Open the report sheet, preview, or profile without losing your place in the roster.",
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
            emptyMessage="No students yet in this class."
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
                No students yet in this class.
              </div>
            ) : null}
          </div>
        </SectionCard>

        <div className="grid gap-4">
        <SectionCard title="Snapshot" tone="focus">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
              {[
                ["Students", String(visibleStudents.length)],
                ["Classes", String(classrooms.length)],
                ["Published", String(published)],
                ["Average", String(average)],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={`rounded-[22px] px-4 py-4 ${
                    index === 2
                      ? "mood-surface-success"
                      : index === 3
                        ? "mood-surface-focus"
                        : "surface-pocket"
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
