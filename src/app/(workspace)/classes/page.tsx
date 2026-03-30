import Link from "next/link";

import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

export default function ClassesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Classes"
        title="Classes"
        description="Groups, teachers, progress."
        action={{ label: "Add", href: "/classes" }}
        secondaryAction={{ label: "Assign", href: "/subjects" }}
      />

      <SectionCard title="Class overview">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Primary 5 Lavender", "30 students", "20 reports complete"],
            ["Primary 5 Rose", "30 students", "26 reports complete"],
            ["Primary 4 Iris", "30 students", "30 reports complete"],
          ].map(([name, students, status]) => (
            <Link
              key={name}
              href={`/classes/${name.toLowerCase().replace(/\s+/g, "-")}`}
              className="frost-panel-soft surface-hover block rounded-[24px] px-5 py-5 transition"
            >
              <p className="text-lg font-semibold text-[color:var(--text-strong)]">
                {name}
              </p>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                {students}
              </p>
              <p className="mt-4 text-sm font-medium text-[color:var(--text-base)]">
                {status}
              </p>
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
