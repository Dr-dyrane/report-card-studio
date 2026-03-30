import { PageHeader } from "@/components/ui/PageHeader";
import { SubjectEditorForm } from "@/components/subjects/SubjectEditorForm";
import { getSubjectDetail } from "@/lib/school-data";
import { notFound } from "next/navigation";

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const subject = await getSubjectDetail(subjectId);

  if (!subject) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Subjects"
        title={subject.name}
        description="Rule and class assignment."
        action={{ label: "Save", href: `/subjects/${subject.id}` }}
        secondaryAction={{ label: "Back", href: "/subjects" }}
      />
      <SubjectEditorForm mode="edit" subject={subject} />
    </div>
  );
}
