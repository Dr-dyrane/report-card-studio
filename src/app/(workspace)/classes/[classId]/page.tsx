import { notFound } from "next/navigation";

import { ClassEditorForm } from "@/components/classes/ClassEditorForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { getClassroomDetail } from "@/lib/school-data";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const classroom = await getClassroomDetail(classId);

  if (!classroom) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Classes"
        title={classroom.name}
        description="Students, subjects, teacher."
        action={{ label: "Save", href: `/classes/${classroom.id}` }}
        secondaryAction={{ label: "Back", href: "/classes" }}
      />
      <ClassEditorForm mode="edit" classroom={classroom} />
    </div>
  );
}
