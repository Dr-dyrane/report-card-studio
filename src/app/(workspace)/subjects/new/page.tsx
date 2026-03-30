import Link from "next/link";

import { Field, InputShell } from "@/components/ui/Field";
import { FeedbackButton } from "@/components/ui/FeedbackButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

export default function NewSubjectPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Subjects"
        title="New subject"
        description="Create a scoring rule."
        action={{ label: "Save", href: "/subjects" }}
        secondaryAction={{ label: "Back", href: "/subjects" }}
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_0.55fr]">
        <SectionCard title="Details">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Name">
              <InputShell value="Mathematics" />
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

        <SectionCard title="Scoring">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="A1">
              <InputShell value="20" compact />
            </Field>
            <Field label="A2">
              <InputShell value="20" compact />
            </Field>
            <Field label="Exam">
              <InputShell value="60" compact />
            </Field>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {["Primary 5 Lavender", "Primary 5 Rose", "Primary 4 Iris"].map(
              (item) => (
                <span
                  key={item}
                  className="frost-pill rounded-full px-4 py-2 text-sm text-[color:var(--text-base)]"
                >
                  {item}
                </span>
              ),
            )}
          </div>
        </SectionCard>
      </div>

      <div className="frost-panel rounded-[24px] px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-[color:var(--text-muted)]">
            Ready to save.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/subjects"
              className="soft-action rounded-full px-4 py-2 text-sm font-medium"
            >
              Cancel
            </Link>
            <FeedbackButton
              message="Subject save is next."
              className="soft-action-tint rounded-full px-4 py-2 text-sm font-semibold"
            >
              Save
            </FeedbackButton>
          </div>
        </div>
      </div>
    </div>
  );
}
