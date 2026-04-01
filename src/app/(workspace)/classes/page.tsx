import Link from "next/link";

import { MobileBladeList } from "@/components/mobile/MobileBladeList";
import { getClassroomsList } from "@/lib/school-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

export default async function ClassesPage() {
  const classrooms = await getClassroomsList();
  const classCount = classrooms.length;
  const studentCount = classrooms.reduce(
    (sum, classroom) => sum + classroom.studentCount,
    0,
  );
  const readyReports = classrooms.reduce(
    (sum, classroom) => sum + classroom.activeReports,
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Classes"
        title="Classes"
        description="Groups and coverage"
        action={{ label: "Add", href: "/classes/new" }}
      />

      <section className="grid gap-2 sm:gap-3 grid-cols-4">
        {[
          ["Classes", String(classCount), ""],
          ["Students", String(studentCount), "mood-surface-focus"],
          ["Ready reports", String(readyReports), "mood-surface-success"],
        ].map(([label, value, toneClass]) => (
          <div
            key={label}
            className={`frost-panel rounded-[24px] px-4 py-4 sm:px-5 sm:py-5 flex flex-col justify-between ${toneClass}`}
          >
            <p className="text-sm text-[color:var(--text-muted)]">{label}</p>
            <p className="mt-2 text-xl font-semibold text-[color:var(--text-strong)] sm:text-2xl md:text-3xl">
              {value}
            </p>
          </div>
        ))}
      </section>

      <SectionCard title="Current">
        <MobileBladeList
          items={classrooms.map((classroom) => ({
            id: classroom.id,
            title: classroom.name,
            subtitle: `${classroom.studentCount} students`,
            eyebrow: "Class",
            quickValue: String(classroom.activeReports),
            quickHint: "ready",
            summary: `${classroom.studentCount} students / ${classroom.activeReports} ready.`,
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

        <div className="grid gap-4 md:grid-cols-4">
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
                {classroom.activeReports} ready reports
              </p>
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
