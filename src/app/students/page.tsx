import Link from "next/link";

import { getStudentsList } from "@/lib/school-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

export default async function StudentsPage() {
  const students = await getStudentsList();
  const published = students.filter((student) => student.status === "Published").length;
  const drafts = students.length - published;
  const average = students.length
    ? Math.round(
        students.reduce((sum, student) => sum + student.grandTotal, 0) / students.length,
      )
    : 0;
  const topStudent = students[0];

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        eyebrow="Students"
        title="Students"
        description="Primary 5 Lavender"
        action="Add"
        secondaryAction="Import"
      />

      <section className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
        <SectionCard title="Roster">
          <div className="mb-4 grid grid-cols-2 gap-2 sm:mb-5 sm:flex sm:flex-wrap sm:gap-3">
            {[
              "Search students",
              "Class",
              "Term",
              "Status",
              "Performance band",
            ].map((filter) => (
              <div
                key={filter}
                className="soft-action rounded-full px-3 py-2 text-center text-sm text-[color:var(--text-muted)] sm:px-4"
              >
                {filter}
              </div>
            ))}
          </div>

          <div className="space-y-3 sm:hidden">
            {students.map((student) => (
              <div
                key={student.id}
                className="frost-panel-soft rounded-[24px] px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[color:var(--text-strong)]">
                      {student.fullName}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                      {student.classroomName}
                    </p>
                  </div>
                  <span className="rounded-full bg-[color:var(--success-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--success)]">
                    {student.status}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="surface-pocket rounded-[18px] px-3 py-3">
                    <p className="text-[color:var(--text-muted)]">Total</p>
                    <p className="mt-1 font-semibold text-[color:var(--text-strong)]">
                      {student.grandTotal}
                    </p>
                  </div>
                  <div className="surface-pocket rounded-[18px] px-3 py-3">
                    <p className="text-[color:var(--text-muted)]">Position</p>
                    <p className="mt-1 font-semibold text-[color:var(--text-strong)]">
                      {student.position}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Link
                    href={student.reportHref}
                    className="soft-action-tint rounded-full px-3 py-2 text-center text-sm font-semibold"
                  >
                    Entry
                  </Link>
                  <Link
                    href={student.previewHref}
                    className="soft-action rounded-full px-3 py-2 text-center text-sm font-medium"
                  >
                    Preview
                  </Link>
                  <Link
                    href={`/students/${student.id}`}
                    className="soft-action rounded-full px-3 py-2 text-center text-sm font-medium"
                  >
                    Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="frost-panel-soft hidden overflow-hidden rounded-[22px] sm:block">
            <table className="min-w-full border-separate border-spacing-0">
              <thead className="bg-white/40 text-left text-sm text-[color:var(--text-muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Class</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                  <th className="px-4 py-3 text-right font-medium">Position</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Report</th>
                </tr>
              </thead>
              <tbody className="bg-[color:var(--surface)] text-sm">
                {students.map((student) => (
                  <tr key={student.id} className="odd:bg-white/10">
                    <td className="px-4 py-4 font-semibold text-[color:var(--text-strong)]">
                      {student.fullName}
                    </td>
                    <td className="px-4 py-4 text-[color:var(--text-muted)]">
                      {student.classroomName}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-[color:var(--text-strong)]">
                      {student.grandTotal}
                    </td>
                    <td className="px-4 py-4 text-right text-[color:var(--text-base)]">
                      {student.position}
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-[color:var(--success-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--success)]">
                        {student.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
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
          </div>
        </SectionCard>

        <div className="grid gap-4">
          <SectionCard title="Snapshot">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {[
                ["Students", String(students.length)],
                ["Published", String(published)],
                ["Average", String(average)],
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

          <SectionCard title="Top student">
            {topStudent ? (
              <Link
                href={topStudent.reportHref}
                className="frost-panel-soft block rounded-[24px] px-4 py-4 transition hover:bg-[color:rgba(231,240,255,0.44)]"
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
                  <span className="soft-action-tint rounded-full px-3 py-1.5 text-sm font-semibold">
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
            ) : null}
          </SectionCard>

          <SectionCard title="Attention">
            <div className="grid gap-3">
              {students
                .filter((student) => student.grandTotal > 0)
                .slice(-3)
                .map((student) => (
                  <Link
                    key={student.id}
                    href={student.reportHref}
                    className="surface-pocket block rounded-[22px] px-4 py-4 transition hover:bg-white/78"
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
                      <span className="soft-action rounded-full px-3 py-1.5 text-sm font-semibold">
                        {student.grandTotal}
                      </span>
                    </div>
                  </Link>
                ))}
              {drafts ? (
                <div className="soft-action rounded-[22px] px-4 py-4 text-sm text-[color:var(--text-muted)]">
                  {drafts} student records are still draft-only.
                </div>
              ) : null}
            </div>
          </SectionCard>
        </div>
      </section>
    </div>
  );
}
