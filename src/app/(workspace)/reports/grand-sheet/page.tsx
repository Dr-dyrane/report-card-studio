import Link from "next/link";

import { GrandSheetEditor } from "@/components/reports/GrandSheetEditor";
import { PageHeader } from "@/components/ui/PageHeader";
import { getDb } from "@/lib/db";
import { requireOwnedSchool } from "@/lib/owned-school";
import { getClassroomsList } from "@/lib/school-data";

export default async function GrandSheetPage() {
  const [classrooms, school] = await Promise.all([
    getClassroomsList(),
    requireOwnedSchool(),
  ]);
  const db = await getDb();
  const terms = await db.term.findMany({
    where: {
      session: {
        schoolId: school.id,
      },
    },
    include: {
      session: {
        select: { name: true },
      },
    },
    orderBy: [
      { session: { createdAt: "desc" } },
      { sequence: "asc" },
    ],
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        eyebrow="Reports · Working draft"
        title="Grand sheet"
        description="Review and correct Primary 3 Grey in one place before anything is added to the database."
        secondaryAction={{ label: "Back to reports", href: "/reports" }}
      />
      <GrandSheetEditor
        classrooms={classrooms.map((classroom) => ({
          id: classroom.id,
          name: classroom.name,
          studentCount: classroom.studentCount,
        }))}
        terms={terms.map((term) => ({
          id: term.id,
          name: term.name,
          sessionName: term.session.name,
          isActive: term.isActive,
        }))}
      />
      <div className="flex justify-end">
        <Link
          href="/reports"
          className="soft-action rounded-full px-4 py-2 text-sm font-medium"
        >
          Back to reports
        </Link>
      </div>
    </div>
  );
}
