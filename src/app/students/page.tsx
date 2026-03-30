import Link from "next/link";

import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

const students = [
  ["Student 2", "Primary 5 Lavender", "825", "2nd", "Published"],
  ["Student 3", "Primary 5 Lavender", "733", "12th", "Published"],
  ["Student 4", "Primary 5 Lavender", "721", "13th", "Published"],
  ["Student 20", "Primary 5 Lavender", "530", "30th", "Published"],
];

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Students"
        title="Students"
        description="Primary 5 Lavender."
        action="Add"
        secondaryAction="Import"
      />

      <SectionCard title="All students">
        <div className="mb-4 flex flex-wrap gap-2 sm:mb-5 sm:gap-3">
          {[
            "Search students",
            "Class",
            "Term",
            "Status",
            "Performance band",
          ].map((filter) => (
            <div
              key={filter}
              className="frost-pill rounded-full px-3 py-2 text-sm text-[color:var(--text-muted)] sm:px-4"
            >
              {filter}
            </div>
          ))}
        </div>

        <div className="space-y-3 sm:hidden">
          {students.map(([name, className, total, position, status]) => (
            <Link
              key={name}
              href={`/students/${name.toLowerCase().replace(/\s+/g, "-")}`}
              className="frost-panel-soft block rounded-[22px] px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[color:var(--text-strong)]">
                    {name}
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                    {className}
                  </p>
                </div>
                <span className="rounded-full bg-[color:var(--success-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--success)]">
                  {status}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[color:var(--text-muted)]">Total</p>
                  <p className="mt-1 font-semibold text-[color:var(--text-strong)]">
                    {total}
                  </p>
                </div>
                <div>
                  <p className="text-[color:var(--text-muted)]">Position</p>
                  <p className="mt-1 font-semibold text-[color:var(--text-strong)]">
                    {position}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="frost-panel-soft hidden overflow-hidden rounded-[22px] sm:block">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="bg-white/40 text-left text-sm text-[color:var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Class</th>
                <th className="px-4 py-3 text-right font-medium">Last total</th>
                <th className="px-4 py-3 text-right font-medium">Position</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Open</th>
              </tr>
            </thead>
            <tbody className="bg-[color:var(--surface)] text-sm">
              {students.map(([name, className, total, position, status]) => (
                <tr key={name} className="odd:bg-white/10">
                  <td className="px-4 py-4 font-semibold text-[color:var(--text-strong)]">
                    {name}
                  </td>
                  <td className="px-4 py-4 text-[color:var(--text-muted)]">
                    {className}
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-[color:var(--text-strong)]">
                    {total}
                  </td>
                  <td className="px-4 py-4 text-right text-[color:var(--text-base)]">
                    {position}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-[color:var(--success-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--success)]">
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/students/${name.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-sm font-semibold text-[color:var(--accent-strong)]"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
