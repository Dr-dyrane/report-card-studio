import Link from "next/link";

import { getClassroomsList } from "@/lib/school-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

export default async function ClassesPage() {
  const classrooms = await getClassroomsList();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Classes"
        title="Classes"
        description="Groups, teachers, progress."
        action={{ label: "Add", href: "/classes/new" }}
        secondaryAction={{ label: "Assign", href: "/subjects" }}
      />

      <SectionCard title="Class overview">
        <div className="grid gap-4 md:grid-cols-3">
          {classrooms.map((classroom) => (
            <Link
              key={classroom.id}
              href={`/classes/${classroom.id}`}
              className="frost-panel-soft surface-hover block rounded-[24px] px-5 py-5 transition"
            >
              <p className="text-lg font-semibold text-[color:var(--text-strong)]">
                {classroom.name}
              </p>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                {classroom.studentCount} students
              </p>
              <p className="mt-4 text-sm font-medium text-[color:var(--text-base)]">
                {classroom.activeReports} reports complete
              </p>
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
