import { GrandSheetEditor } from "@/components/reports/GrandSheetEditor";
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
  const preferredTermId =
    terms.find(
      (term) =>
        term.session.name === "2025/2026" &&
        term.name.toLowerCase().includes("third"),
    )?.id ?? "";

  return (
    <div>
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
        defaultTermId={preferredTermId}
      />
    </div>
  );
}
