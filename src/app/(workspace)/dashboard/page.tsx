import Link from "next/link";

import { MetricExplorer } from "@/components/insights/MetricExplorer";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { getReportCards } from "@/lib/report-data";
import {
  getAnalyticsSnapshot,
  getClassroomsList,
  getStudentsList,
} from "@/lib/school-data";

const quickFlow = [
  ["Capture", "Card image to data"],
  ["Enter", "Fast score entry"],
  ["Check", "Totals and rank"],
  ["Export", "Print and PDF"],
];

export default async function DashboardPage() {
  const [students, classrooms, analytics, reportCards] = await Promise.all([
    getStudentsList(),
    getClassroomsList(),
    getAnalyticsSnapshot(),
    getReportCards(),
  ]);

  const publishedReports = reportCards.filter((report) => report.status === "PUBLISHED");
  const drafts = reportCards.filter((report) => report.status === "DRAFT");
  const topPerformers = students.filter((student) => student.grandTotal > 0).slice(0, 3);
  const attentionRows = [...students]
    .filter((student) => student.grandTotal > 0)
    .sort((left, right) => left.grandTotal - right.grandTotal)
    .slice(0, 3);
  const leadClassroom = classrooms[0];

  const stats = [
    {
      title: "Students",
      value: String(students.length),
      hint: leadClassroom?.name ?? "Workspace roster",
      details: {
        summary: "Class roster coverage for the active workspace.",
        points: [
          `${students.length} students are currently visible in the active workspace.`,
          `${reportCards.length} report sheets are active across the current term.`,
          "Use the roster to jump straight into entry, preview, or profile.",
        ],
        actionLabel: "Open students",
        actionHref: "/students",
      },
    },
    {
      title: "Done",
      value: String(publishedReports.length),
      hint: "Published now",
      tone: "focus" as const,
      details: {
        summary: "Reports already ready for preview, print, and export.",
        points: [
          `${publishedReports.length} sheets are published and print-ready.`,
          `${drafts.length} reports are still in draft and can be edited inline.`,
          "Use Reports to move quickly between active student sheets.",
        ],
        actionLabel: "Open reports",
        actionHref: "/reports",
      },
    },
    {
      title: "Average",
      value: String(analytics.metrics.classAverage),
      hint: "Current total mean",
      details: {
        summary: "Current class average based on saved grand totals.",
        points: [
          `Top score is ${analytics.metrics.topTotal} and the lowest is ${analytics.metrics.lowestTotal}.`,
          "This gives a quick read on spread before opening deeper analytics.",
          "Open Insights for the fuller class-performance story.",
        ],
        actionLabel: "Open insights",
        actionHref: "/analytics",
      },
    },
    {
      title: "At risk",
      value: String(attentionRows.length),
      hint: "Needs review",
      tone: "warning" as const,
      details: {
        summary: "The weakest saved totals that should be reviewed before final export.",
        points: [
          "These sheets are the best candidates for a row-by-row check.",
          "Use the attention list to jump directly into the report sheet.",
          "Published and draft totals both feed this signal from the live data.",
        ],
        actionLabel: "Review students",
        actionHref: "/students",
      },
    },
  ];

  return (
    <div className="w-full space-y-3 sm:space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="Overview"
        action={{ label: "Reports", href: "/reports" }}
      />

      <div className="grid w-full gap-3 md:grid-cols-[0.92fr_1.08fr]">
        <SectionCard title="" tone="default">
          <MetricExplorer title="Class performance" metrics={stats} />
        </SectionCard>

        <SectionCard title="Flow" tone="focus">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {quickFlow.map(([label, hint]) => (
              <div
                key={label}
                className="surface-pocket rounded-[20px] px-3 py-3 sm:rounded-[22px] sm:px-4 sm:py-4"
              >
                <p className="text-sm font-semibold text-[color:var(--text-strong)]">
                  {label}
                </p>
                <p className="mt-2 text-sm leading-5 text-[color:var(--text-muted)]">
                  {hint}
                </p>
              </div>
            ))}
          </div>

          <div className="quiet-note mt-4 rounded-[24px] p-2">
            <Link
              href="/reports"
              className="soft-action-tint flex items-center justify-center rounded-full px-4 py-2 text-center text-sm font-medium"
            >
              Open reports
            </Link>
          </div>
        </SectionCard>
      </div>

      <div className="grid w-full gap-3 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="Class">
          {leadClassroom ? (
            <Link
              href={`/students?class=${leadClassroom.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="surface-pocket block rounded-[24px] px-5 py-5 transition hover:translate-y-[-1px] hover:shadow-[var(--shadow-frost)]"
            >
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-[color:var(--text-strong)]">
                    {leadClassroom.name}
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                    {leadClassroom.activeReports} of {leadClassroom.studentCount} ready
                  </p>
                </div>
                <span className="text-2xl font-semibold text-[color:var(--text-strong)]">
                  {leadClassroom.studentCount
                    ? Math.round(
                        (leadClassroom.activeReports / leadClassroom.studentCount) * 100,
                      )
                    : 0}
                  %
                </span>
              </div>
            </Link>
          ) : (
            <div className="empty-state rounded-[24px] px-5 py-5 text-sm text-[color:var(--text-muted)]">
              No class yet.
            </div>
          )}
        </SectionCard>

        <SectionCard title="Top" tone="success">
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
            {topPerformers.map((student, index) => (
              <Link
                key={student.id}
                href={student.reportHref}
                className="surface-pocket flex items-center justify-between rounded-[22px] px-4 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="mood-badge-focus inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                    {index + 1}
                  </span>
                  <p className="truncate font-semibold text-[color:var(--text-strong)]">
                    {student.fullName}
                  </p>
                </div>
                <span className="text-lg font-semibold text-[color:var(--text-strong)]">
                  {student.grandTotal}
                </span>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid w-full gap-3">
        <SectionCard title="Attention" tone="warning">
          <div className="grid gap-3">
            {attentionRows.map((student) => (
              <Link
                key={student.id}
                href={student.reportHref}
                className="surface-pocket flex items-start justify-between gap-4 rounded-[22px] px-4 py-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-[color:var(--text-strong)]">
                    {student.fullName}
                  </p>
                  <p className="mt-2 text-sm leading-5 text-[color:var(--text-muted)]">
                    {student.classroomName} · Position {student.position}
                  </p>
                </div>
                <span className="mood-badge-warning shrink-0 rounded-full px-3 py-1 text-sm font-semibold">
                  {student.grandTotal}
                </span>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
