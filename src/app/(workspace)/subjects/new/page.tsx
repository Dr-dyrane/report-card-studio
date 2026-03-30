import { PageHeader } from "@/components/ui/PageHeader";
import { SubjectEditorForm } from "@/components/subjects/SubjectEditorForm";

export default function NewSubjectPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Subjects"
        title="New subject"
        description="Create a scoring rule."
        action={{ label: "Save", href: "/subjects/new" }}
        secondaryAction={{ label: "Back", href: "/subjects" }}
      />
      <SubjectEditorForm mode="create" />
    </div>
  );
}
