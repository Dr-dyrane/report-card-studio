import { ClassEditorForm } from "@/components/classes/ClassEditorForm";
import { PageHeader } from "@/components/ui/PageHeader";

export default function NewClassPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Classes"
        title="New class"
        description="Set up a class before adding students."
        action={{ label: "Save", href: "/classes/new" }}
        secondaryAction={{ label: "Back", href: "/classes" }}
      />
      <ClassEditorForm mode="create" />
    </div>
  );
}
