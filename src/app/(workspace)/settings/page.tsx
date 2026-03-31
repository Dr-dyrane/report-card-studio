import { requireServerSession } from "@/lib/auth-session";
import { getDb } from "@/lib/db";
import { getOwnedSchool } from "@/lib/owned-school";
import { SettingsWorkspace } from "@/components/settings/SettingsWorkspace";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function SettingsPage() {
  await requireServerSession();
  const school = await getOwnedSchool();
  const db = await getDb();

  const activeSession = school
    ? await db.academicSession.findFirst({
        where: {
          schoolId: school.id,
          isActive: true,
        },
        include: {
          terms: {
            where: {
              isActive: true,
            },
            orderBy: [{ sequence: "asc" }],
            take: 1,
          },
        },
      })
    : null;

  const activeTerm = activeSession?.terms[0] ?? null;
  const [classroomsCount, subjectsCount, publishedReports] = school
    ? await Promise.all([
        db.classroom.count({
          where: {
            schoolId: school.id,
          },
        }),
        db.subject.count({
          where: {
            schoolId: school.id,
          },
        }),
        db.reportCard.count({
          where: {
            classroom: {
              schoolId: school.id,
            },
            status: "PUBLISHED",
            student: {
              isActive: true,
            },
          },
        }),
      ])
    : [0, 0, 0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Settings"
      />

      <SettingsWorkspace
        schoolName={school?.name ?? "No workspace"}
        activeSessionName={activeSession?.name ?? "Not set"}
        activeTermName={activeTerm?.name ?? "Not set"}
        classroomsCount={classroomsCount}
        subjectsCount={subjectsCount}
        publishedReports={publishedReports}
        preferredStudentExport={school?.preferredStudentExport ?? "PDF"}
        preferredClassExport={school?.preferredClassExport ?? "EXCEL"}
      />
    </div>
  );
}
