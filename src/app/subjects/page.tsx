import Link from "next/link";

import { getSubjectsList } from "@/lib/school-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

export default async function SubjectsPage() {
  const subjects = await getSubjectsList();

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        eyebrow="Subjects"
        title="Subjects"
        description="Scoring rules and order"
        action={{ label: "Add", href: "/subjects/new" }}
        secondaryAction={{ label: "Reorder", href: "/subjects" }}
      />

      <SectionCard title="Subject catalog">
        <div className="mb-4 grid grid-cols-2 gap-2 sm:mb-5 sm:flex sm:flex-wrap sm:gap-3">
          {["Search subjects", "Category", "Assessment mode", "Class", "Active"].map(
            (filter) => (
              <div
                key={filter}
                className="frost-pill rounded-full px-4 py-2 text-center text-sm text-[color:var(--text-muted)]"
              >
                {filter}
              </div>
            ),
          )}
        </div>

        <div className="space-y-3 sm:hidden">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/subjects/${subject.id}`}
              className="frost-panel-soft block rounded-[24px] px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[color:var(--text-strong)]">
                    {subject.name}
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                    {subject.category}
                  </p>
                </div>
                <span className="rounded-full bg-[color:var(--success-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--success)]">
                  {subject.activeLabel}
                </span>
              </div>
              <div className="mt-4 grid gap-2 text-sm">
                <div className="surface-chip rounded-[18px] px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[color:var(--text-muted)]">Mode</span>
                    <span className="font-medium text-[color:var(--text-strong)]">
                      {subject.modeLabel}
                    </span>
                  </div>
                </div>
                <div className="surface-chip rounded-[18px] px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[color:var(--text-muted)]">Max</span>
                    <span className="font-medium text-[color:var(--text-strong)]">
                      {subject.maxLabel}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="frost-panel-soft hidden overflow-hidden rounded-[22px] sm:block">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="table-head text-left text-sm text-[color:var(--text-muted)]">
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
              {subjects.map((subject, index) => (
                <tr
                  key={subject.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? "var(--table-row-odd)" : undefined,
                  }}
                >
                  <td className="px-4 py-4 font-semibold text-[color:var(--text-strong)]">
                    {subject.name}
                  </td>
                  <td className="px-4 py-4 text-[color:var(--text-muted)]">
                    {subject.category}
                  </td>
                  <td className="px-4 py-4">{subject.modeLabel}</td>
                  <td className="px-4 py-4 font-medium text-[color:var(--text-strong)]">
                    {subject.maxLabel}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-[color:var(--success-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--success)]">
                      {subject.activeLabel}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/subjects/${subject.id}`}
                      className="soft-action inline-flex rounded-full px-3 py-1.5 font-medium"
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
            className="soft-action-tint rounded-full px-4 py-2 text-sm font-semibold"
          >
            New subject
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}
