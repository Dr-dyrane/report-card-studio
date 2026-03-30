import Link from "next/link";

import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

const subjects = [
  ["Mathematics", "Core", "A1 + A2 + Exam", "20 / 20 / 60", "Yes"],
  ["Grammar", "Language", "A1 + A2 + Exam", "20 / 20 / 60", "Yes"],
  ["Composition", "Language", "Exam only", "30", "Yes"],
  ["Social Studies", "Core", "A1 + A2 + Exam", "10 / 10 / 50", "Yes"],
  ["Quantitative Aptitude", "Aptitude", "A1 + A2 + Exam", "5 / 5 / 40", "Yes"],
  ["Fine Art", "Arts", "Exam only", "30", "Yes"],
];

export default function SubjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Subjects"
        title="Subjects"
        description="Scoring rules and order."
        action="Add"
        secondaryAction="Reorder"
      />

      <SectionCard title="Subject catalog">
        <div className="mb-4 flex flex-wrap gap-2 sm:mb-5 sm:gap-3">
          {["Search subjects", "Category", "Assessment mode", "Class", "Active"].map(
            (filter) => (
              <div
                key={filter}
                className="frost-pill rounded-full px-4 py-2 text-sm text-[color:var(--text-muted)]"
              >
                {filter}
              </div>
            ),
          )}
        </div>

        <div className="space-y-3 sm:hidden">
          {subjects.map(([subject, category, mode, maxScores, active]) => (
            <Link
              key={subject}
              href={`/subjects/${subject.toLowerCase().replace(/\s+/g, "-")}`}
              className="frost-panel-soft block rounded-[22px] px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[color:var(--text-strong)]">
                    {subject}
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                    {category}
                  </p>
                </div>
                <span className="rounded-full bg-[color:var(--success-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--success)]">
                  {active}
                </span>
              </div>
              <div className="mt-4 grid gap-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[color:var(--text-muted)]">Mode</span>
                  <span className="font-medium text-[color:var(--text-strong)]">
                    {mode}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[color:var(--text-muted)]">Max</span>
                  <span className="font-medium text-[color:var(--text-strong)]">
                    {maxScores}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="frost-panel-soft hidden overflow-hidden rounded-[22px] sm:block">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="bg-white/40 text-left text-sm text-[color:var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Mode</th>
                <th className="px-4 py-3 font-medium">Max scores</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3 text-right font-medium">Edit</th>
              </tr>
            </thead>
            <tbody className="bg-[color:var(--surface)] text-sm">
              {subjects.map(([subject, category, mode, maxScores, active]) => (
                <tr key={subject} className="odd:bg-white/10">
                  <td className="px-4 py-4 font-semibold text-[color:var(--text-strong)]">
                    {subject}
                  </td>
                  <td className="px-4 py-4 text-[color:var(--text-muted)]">
                    {category}
                  </td>
                  <td className="px-4 py-4">{mode}</td>
                  <td className="px-4 py-4 font-medium text-[color:var(--text-strong)]">
                    {maxScores}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-[color:var(--success-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--success)]">
                      {active}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/subjects/${subject.toLowerCase().replace(/\s+/g, "-")}`}
                      className="font-semibold text-[color:var(--accent-strong)]"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex justify-end">
          <Link
            href="/subjects/new"
            className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-frost)]"
          >
            New subject
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}
