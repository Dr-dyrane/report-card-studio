import Link from "next/link";

import { Field, InputShell } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const name = classId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Classes"
        title={name}
        description="Students, subjects, teacher."
        action="Save"
        secondaryAction="Back"
      />

      <div className="grid gap-6 xl:grid-cols-[0.85fr_0.65fr]">
        <SectionCard title="Class">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Name">
              <InputShell value={name} />
            </Field>
            <Field label="Teacher">
              <InputShell value="Mrs. Class Teacher" />
            </Field>
            <Field label="Students">
              <InputShell value="30" compact />
            </Field>
            <Field label="Reports">
              <InputShell value="20 ready" compact />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Subjects">
          <div className="space-y-3">
            {["Mathematics", "Grammar", "Science", "Computer", "History"].map(
              (item) => (
                <div
                  key={item}
                  className="frost-panel-soft flex items-center justify-between rounded-[20px] px-4 py-4"
                >
                  <span className="font-medium text-[color:var(--text-strong)]">
                    {item}
                  </span>
                  <span className="text-sm text-[color:var(--text-muted)]">
                    Included
                  </span>
                </div>
              ),
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Students">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {["Student 1", "Student 2", "Student 3", "Student 4", "Student 5", "Student 6"].map(
            (item) => (
              <div
                key={item}
                className="frost-panel-soft rounded-[20px] px-4 py-4 text-sm font-medium text-[color:var(--text-strong)]"
              >
                {item}
              </div>
            ),
          )}
        </div>
      </SectionCard>

      <div className="frost-panel rounded-[24px] px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-[color:var(--text-muted)]">
            Ranking and report scope live here.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/classes"
              className="frost-pill rounded-full px-4 py-2 text-sm font-semibold"
            >
              Back
            </Link>
            <button className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-frost)]">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
