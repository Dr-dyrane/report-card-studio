import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { Field, InputShell } from "@/components/ui/Field";

export default function TermsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Terms"
        title="Terms"
        description="Sessions and academic periods."
        action={{ label: "New term", href: "/terms" }}
        secondaryAction={{ label: "New session", href: "/terms" }}
      />

      <SectionCard title="Academic timeline">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["First Term", "Locked", "2024/2025"],
            ["Second Term", "Active", "2024/2025"],
            ["Third Term", "Upcoming", "2024/2025"],
          ].map(([name, status, session]) => (
            <div
              key={name}
              className="frost-panel-soft rounded-[24px] px-5 py-5"
            >
              <p className="text-lg font-semibold text-[color:var(--text-strong)]">
                {name}
              </p>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                {session}
              </p>
              <p className="mt-4 text-sm font-medium text-[color:var(--text-base)]">
                {status}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_0.8fr]">
        <SectionCard title="Session">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Name">
              <InputShell value="2024/2025" />
            </Field>
            <Field label="State">
              <InputShell value="Active" compact />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Term">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Name">
              <InputShell value="Second Term" />
            </Field>
            <Field label="Status">
              <InputShell value="Editable" compact />
            </Field>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
