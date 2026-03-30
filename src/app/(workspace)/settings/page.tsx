import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { Field, InputShell } from "@/components/ui/Field";
import { ThemeToggleCard } from "@/components/theme/ThemeToggleCard";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Settings"
        description="School, grading, template."
        action={{ label: "Save", href: "/settings" }}
        secondaryAction={{ label: "School", href: "/settings" }}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="School profile">
          <div className="grid gap-5">
            <Field label="Name">
              <InputShell value="Report Card Studio Demo School" />
            </Field>
            <Field label="Session">
              <InputShell value="2024/2025" />
            </Field>
            <Field label="Active term">
              <InputShell value="Second Term" />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Grading defaults">
          <div className="grid gap-5">
            <Field label="Mode">
              <InputShell value="Subject configured totals" />
            </Field>
            <Field label="Preview">
              <InputShell value="HTML print layout" />
            </Field>
            <Field label="Exports">
              <InputShell value="PDF, Excel, CSV" />
            </Field>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Appearance">
        <ThemeToggleCard />
      </SectionCard>
    </div>
  );
}
