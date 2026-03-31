import Link from "next/link";

import { MetricExplorer } from "@/components/insights/MetricExplorer";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

const stats = [
  {
    title: "Students",
    value: "30",
    hint: "Primary 5 Lavender",
    details: {
      summary: "Class roster coverage for the active term.",
      points: [
        "20 students already have working report sheets.",
        "10 student records still need sheets created or reviewed.",
        "Use the roster to jump straight into entry or preview.",
      ],
      actionLabel: "Open students",
      actionHref: "/students",
    },
  },
  {
    title: "Done",
    value: "20",
    hint: "This term",
    tone: "accent" as const,
    details: {
      summary: "Reports that are already ready for review or publication.",
      points: [
        "Published reports are available for print and PDF.",
        "Draft reports can still be edited inline with live totals.",
        "Use Reports to move quickly between active student sheets.",
      ],
      actionLabel: "Open reports",
      actionHref: "/reports",
    },
  },
  {
    title: "Average",
    value: "664",
    hint: "Class total",
    details: {
      summary: "Current class average based on saved grand totals.",
      points: [
        "Top score is 825 and the lowest score is 530.",
        "The spread suggests a healthy middle with a few students needing attention.",
        "Open Insights for a fuller class-performance read.",
      ],
      actionLabel: "Open insights",
      actionHref: "/analytics",
    },
  },
  {
    title: "At risk",
    value: "6",
    hint: "Needs review",
    details: {
      summary: "Students with weaker totals or incomplete score coverage.",
      points: [
        "Comprehension, dictation, and oral-reading areas still need attention.",
        "These reports should be reviewed before final export.",
        "Use the attention list to jump straight into the student sheet.",
      ],
      actionLabel: "Review students",
      actionHref: "/students",
    },
  },
];

const quickFlow = [
  ["Capture", "Card image to data"],
  ["Enter", "Fast score entry"],
  ["Check", "Totals and rank"],
  ["Export", "Print and PDF"],
];

const classRows = [
  ["Primary 5 Lavender", "20 / 30", "67%"],
  ["Primary 5 Rose", "26 / 30", "87%"],
  ["Primary 4 Iris", "30 / 30", "100%"],
];

const topPerformers = [
  ["Student 2", "825"],
  ["Student 3", "733"],
  ["Student 1", "730"],
];

const attentionRows = [
  ["Student 17", "Comprehension, Dictation, Health", "599"],
  ["Student 19", "Poetry, Quantitative, French", "585"],
  ["Student 20", "Dictation, Oral Reading, Aptitude", "530"],
];

export default function DashboardPage() {
  return (
    <div className="w-full space-y-3 sm:space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="Overview"
        action={{ label: "Students", href: "/students" }}
        secondaryAction={{ label: "Reports", href: "/reports" }}
      />

      <div className="grid w-full gap-3 md:grid-cols-[0.92fr_1.08fr]">
        <section>
          <MetricExplorer title="Class performance" metrics={stats} />
        </section>

        <SectionCard title="Flow">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {quickFlow.map(([label, hint]) => (
              <div
                key={label}
                className="frost-panel-soft rounded-[20px] px-3 py-3 sm:rounded-[22px] sm:px-4 sm:py-4"
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

          <div className="surface-pocket mt-4 grid grid-cols-2 gap-2 rounded-[24px] p-2">
            <Link
              href="/students"
              className="soft-action-tint rounded-full px-4 py-2 text-center text-sm font-medium"
            >
              Open roster
            </Link>
            <Link
              href="/reports"
              className="soft-action rounded-full px-4 py-2 text-center text-sm font-medium"
            >
              Reports
            </Link>
          </div>
        </SectionCard>
      </div>

      <div className="grid w-full gap-3 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="Classes">
          <div className="grid gap-3 md:grid-cols-3">
            {classRows.map(([name, count, note]) => (
              <div
                key={name}
                className="frost-panel-soft rounded-[22px] px-4 py-4"
              >
                <p className="font-semibold text-[color:var(--text-strong)]">{name}</p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--text-strong)]">
                  {count}
                </p>
                <p className="mt-1 text-sm text-[color:var(--text-muted)]">{note}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Top">
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
            {topPerformers.map(([student, total], index) => (
              <Link
                key={student}
                href={`/reports/${student.toLowerCase().replace(/\s+/g, "-")}`}
                className="frost-panel-soft flex items-center justify-between rounded-[22px] px-4 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent-soft)] text-sm font-semibold text-[color:var(--accent-strong)]">
                    {index + 1}
                  </span>
                  <p className="truncate font-semibold text-[color:var(--text-strong)]">
                    {student}
                  </p>
                </div>
                <span className="text-lg font-semibold text-[color:var(--text-strong)]">
                  {total}
                </span>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid w-full gap-3 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Attention">
          <div className="grid gap-3">
            {attentionRows.map(([student, subjects, total]) => (
              <Link
                key={student}
                href={`/reports/${student.toLowerCase().replace(/\s+/g, "-")}`}
                className="frost-panel-soft flex items-start justify-between gap-4 rounded-[22px] px-4 py-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-[color:var(--text-strong)]">
                    {student}
                  </p>
                  <p className="mt-2 text-sm leading-5 text-[color:var(--text-muted)]">
                    {subjects}
                  </p>
                </div>
                    <span className="surface-chip shrink-0 rounded-full px-3 py-1 text-sm font-semibold text-[color:var(--text-strong)]">
                  {total}
                </span>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Next">
          <div className="grid gap-3">
            <div className="surface-pocket rounded-[24px] px-4 py-4">
              <p className="text-sm font-medium text-[color:var(--text-base)]">
                Continue report entry
              </p>
              <p className="mt-2 text-sm leading-5 text-[color:var(--text-muted)]">
                Move from captured scores to checked totals and preview.
              </p>
              <div className="mt-4 flex gap-2">
                <Link
                  href="/students"
                  className="soft-action-tint rounded-full px-4 py-2 text-sm font-medium"
                >
                  Open students
                </Link>
                <Link
                  href="/reports"
                  className="soft-action rounded-full px-4 py-2 text-sm font-medium text-[color:var(--text-base)]"
                >
                  Open reports
                </Link>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
