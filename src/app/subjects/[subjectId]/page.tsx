import Link from "next/link";

import { Field, InputShell } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const name = subjectId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Subjects"
        title={name}
        description="Rule and class assignment."
        action="Save"
        secondaryAction="Back"
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_0.55fr]">
        <SectionCard title="Rule">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Name">
              <InputShell value={name} />
            </Field>
            <Field label="Category">
              <InputShell value="Core" />
            </Field>
            <Field label="Mode">
              <InputShell value="A1 + A2 + Exam" />
            </Field>
            <Field label="Order">
              <InputShell value="1" compact />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Classes">
          <div className="space-y-3">
            {["Primary 5 Lavender", "Primary 5 Rose", "Primary 4 Iris"].map(
              (item) => (
                <div
                  key={item}
                  className="frost-panel-soft flex items-center justify-between rounded-[20px] px-4 py-4"
                >
                  <span className="font-medium text-[color:var(--text-strong)]">
                    {item}
                  </span>
                  <span className="text-sm text-[color:var(--text-muted)]">
                    Active
                  </span>
                </div>
              ),
            )}
          </div>
        </SectionCard>
      </div>

      <div className="frost-panel rounded-[24px] px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-[color:var(--text-muted)]">Last used this term.</p>
          <div className="flex flex-wrap gap-3">
            <button className="soft-action rounded-full px-4 py-2 text-sm font-medium">
              Archive
            </button>
            <Link
              href="/subjects"
              className="soft-action rounded-full px-4 py-2 text-sm font-medium"
            >
              Back
            </Link>
            <button className="soft-action-tint rounded-full px-4 py-2 text-sm font-semibold">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
