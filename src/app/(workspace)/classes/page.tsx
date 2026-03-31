import Link from "next/link";

import { MobileBladeList } from "@/components/mobile/MobileBladeList";
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
        <MobileBladeList
          items={classrooms.map((classroom) => ({
            id: classroom.id,
            title: classroom.name,
            subtitle: `${classroom.studentCount} students`,
            eyebrow: "Class",
            quickValue: String(classroom.activeReports),
            quickHint: "ready",
            summary:
              "Open the class workspace to manage the roster, subject setup, and report coverage.",
            meta: [
              { label: "Students", value: String(classroom.studentCount) },
              { label: "Ready reports", value: String(classroom.activeReports) },
            ],
            actions: [
              { label: "Open class", href: `/classes/${classroom.id}`, tone: "accent" },
            ],
          }))}
          emptyMessage="No classes yet."
        />

        <div className="grid gap-4 md:grid-cols-3">
          {classrooms.map((classroom) => (
            <Link
              key={classroom.id}
              href={`/classes/${classroom.id}`}
              className="frost-panel-soft surface-hover hidden rounded-[24px] px-5 py-5 transition sm:block"
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
