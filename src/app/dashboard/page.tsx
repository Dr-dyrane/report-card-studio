import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatCard } from "@/components/ui/StatCard";

const stats = [
  {
    label: "Total students",
    value: "30",
    hint: "Primary 5 Lavender",
  },
  {
    label: "Reports complete",
    value: "20",
    hint: "Ready this term",
  },
  {
    label: "Average total",
    value: "664",
    hint: "Class average",
  },
  {
    label: "At risk students",
    value: "6",
    hint: "Needs attention",
  },
];

const topPerformers = [
  ["Student 2", "825"],
  ["Student 3", "733"],
  ["Student 1", "730"],
];

const activity = [
  "Student 20 was added to the converted workbook.",
  "Report preview and export blueprint are ready.",
  "Subject and report-entry architecture is locked for MVP.",
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="Overview"
        description="Second Term, 2024/2025."
        action="New report"
        secondaryAction="Export"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Completion by class">
          <div className="space-y-4">
            {[
              ["Primary 5 Lavender", "20 / 30", "67% complete"],
              ["Primary 5 Rose", "26 / 30", "87% complete"],
              ["Primary 4 Iris", "30 / 30", "100% complete"],
            ].map(([name, count, note]) => (
              <div
                key={name}
                className="frost-panel-soft rounded-[22px] px-4 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[color:var(--text-strong)]">
                      {name}
                    </p>
                    <p className="text-sm text-[color:var(--text-muted)]">
                      {note}
                    </p>
                  </div>
                  <span className="text-lg font-semibold text-[color:var(--text-strong)]">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Top performers">
          <div className="space-y-4">
            {topPerformers.map(([student, total], index) => (
              <div
                key={student}
                className="frost-panel-soft flex items-center justify-between rounded-[22px] px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--accent-soft)] text-sm font-semibold text-[color:var(--accent-strong)]">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-[color:var(--text-strong)]">
                      {student}
                    </p>
                    <p className="text-sm text-[color:var(--text-muted)]">This term</p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-[color:var(--text-strong)]">
                  {total}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Needs attention">
          <div className="frost-panel-soft overflow-hidden rounded-[22px]">
            <table className="min-w-full border-separate border-spacing-0">
              <thead className="bg-white/40 text-left text-sm text-[color:var(--text-muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Weak subjects</th>
                  <th className="px-4 py-3 text-right font-medium">Last total</th>
                </tr>
              </thead>
              <tbody className="bg-[color:var(--surface)] text-sm">
                {[
                  ["Student 17", "Comprehension, Dictation, Health", "599"],
                  ["Student 19", "Poetry, Quantitative, French", "585"],
                  ["Student 20", "Dictation, Oral Reading, Aptitude", "530"],
                ].map(([student, subjects, total]) => (
                  <tr key={student} className="odd:bg-white/10">
                    <td className="px-4 py-4 font-semibold text-[color:var(--text-strong)]">
                      {student}
                    </td>
                    <td className="px-4 py-4 text-[color:var(--text-muted)]">
                      {subjects}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-[color:var(--text-strong)]">
                      {total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Recent">
          <div className="space-y-4">
            {activity.map((item) => (
              <div
                key={item}
                className="frost-panel-soft rounded-[22px] px-4 py-4 text-sm leading-6 text-[color:var(--text-base)]"
              >
                {item}
              </div>
            ))}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
