import Link from "next/link";

import { StudentEditorCard } from "@/components/students/StudentEditorCard";
import { getStudentProfileByRouteKey } from "@/lib/school-data";
import { getStudentEditorDetail } from "@/lib/school-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const [profile, studentEditor] = await Promise.all([
    getStudentProfileByRouteKey(studentId),
    getStudentEditorDetail(studentId),
  ]);

  if (!profile) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <PageHeader
          eyebrow="Student profile"
          title="Student"
          description="Not found"
          action={{ label: "New report", href: "/reports/new" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        eyebrow="Student profile"
        title={profile.fullName}
        description={profile.classroomName}
        action={{ label: "New report", href: "/reports/new" }}
        secondaryAction={{ label: "Export", href: "/reports" }}
      />

      <section className="grid gap-4 xl:grid-cols-[0.74fr_1.26fr]">
        <SectionCard title="Profile">
          <div className="grid gap-3">
            {[
              ["Class", profile.classroomName],
              ["Session", profile.sessionName],
              ["Term", profile.termName],
              ["Status", profile.status],
            ].map(([label, value]) => (
              <div key={label} className="surface-pocket rounded-[22px] px-4 py-4">
                <p className="text-sm text-[color:var(--text-muted)]">{label}</p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--text-strong)]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Current report">
          {profile.currentReport ? (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Grand total", String(profile.currentReport.total)],
                  ["Position", profile.currentReport.position],
                  ["Status", profile.currentReport.status],
                ].map(([labelText, value]) => (
                  <div
                    key={labelText}
                    className="surface-pocket rounded-[22px] px-4 py-4"
                  >
                    <p className="text-sm text-[color:var(--text-muted)]">{labelText}</p>
                    <p className="mt-2 text-2xl font-semibold text-[color:var(--text-strong)]">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="surface-pocket mt-4 rounded-[24px] px-4 py-4 sm:px-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                  Comment
                </p>
                <p className="mt-3 text-sm leading-6 text-[color:var(--text-base)]">
                  {profile.currentReport.teacherComment}
                </p>
              </div>
              <div className="surface-pocket mt-4 flex flex-wrap gap-2 rounded-[24px] p-2">
                <Link
                  href={profile.currentReport.href}
                  className="soft-action-tint rounded-full px-4 py-2 text-sm font-medium"
                >
                  Open report
                </Link>
                <Link
                  href={`${profile.currentReport.href}/preview`}
                  className="soft-action rounded-full px-4 py-2 text-sm font-medium"
                >
                  Preview
                </Link>
              </div>
            </>
          ) : (
            <div className="frost-panel-soft rounded-[24px] px-4 py-5 text-sm text-[color:var(--text-muted)]">
              No reports yet.
            </div>
          )}
        </SectionCard>
      </section>

      {studentEditor ? <StudentEditorCard student={{ ...studentEditor, routeKey: studentId }} /> : null}

      <SectionCard title="Report history">
        <div className="grid gap-3">
          {profile.reportHistory.map((report) => (
            <Link
              key={`${report.termName}-${report.total}`}
              href={report.href}
              className="frost-panel-soft block rounded-[24px] px-4 py-4 transition hover:bg-[color:var(--accent-soft)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[color:var(--text-strong)]">
                    {report.termName}
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                    Tap to open
                  </p>
                </div>
                <span className="rounded-full bg-[color:var(--success-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--success)]">
                  {report.status}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="surface-pocket rounded-[20px] px-4 py-4">
                  <p className="text-sm text-[color:var(--text-muted)]">Total</p>
                  <p className="mt-2 text-xl font-semibold text-[color:var(--text-strong)]">
                    {report.total}
                  </p>
                </div>
                <div className="surface-pocket rounded-[20px] px-4 py-4">
                  <p className="text-sm text-[color:var(--text-muted)]">Position</p>
                  <p className="mt-2 text-xl font-semibold text-[color:var(--text-strong)]">
                    {report.position}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
