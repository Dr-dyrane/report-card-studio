"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { removeSubject, saveSubject } from "@/app/(workspace)/subjects/actions";
import { useFeedback } from "@/components/feedback/FeedbackProvider";
import { ConfirmSurface } from "@/components/ui/ConfirmSurface";
import { Field } from "@/components/ui/Field";

type ClassroomChip = {
  id: string;
  name: string;
};

type SubjectEditorFormProps = {
  subject?: {
    id: string;
    name: string;
    category: string;
    assessmentMode: "CONTINUOUS_AND_EXAM" | "EXAM_ONLY";
    a1Max: number | null;
    a2Max: number | null;
    examMax: number | null;
    displayOrder: number;
    isActive: boolean;
    classrooms: ClassroomChip[];
  } | null;
  mode: "create" | "edit";
};

export function SubjectEditorForm({ subject, mode }: SubjectEditorFormProps) {
  const router = useRouter();
  const { notify } = useFeedback();
  const [isSaving, startSave] = useTransition();
  const [isRemoving, startRemoving] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [name, setName] = useState(subject?.name ?? "");
  const [category, setCategory] = useState(subject?.category ?? "");
  const [assessmentMode, setAssessmentMode] = useState<
    "CONTINUOUS_AND_EXAM" | "EXAM_ONLY"
  >(subject?.assessmentMode ?? "CONTINUOUS_AND_EXAM");
  const [a1Max, setA1Max] = useState(subject?.a1Max?.toString() ?? "20");
  const [a2Max, setA2Max] = useState(subject?.a2Max?.toString() ?? "20");
  const [examMax, setExamMax] = useState(subject?.examMax?.toString() ?? "60");
  const [displayOrder, setDisplayOrder] = useState(
    subject?.displayOrder?.toString() ?? "0",
  );
  const [isActive, setIsActive] = useState(subject?.isActive ?? true);

  const save = () => {
    startSave(async () => {
      const result = await saveSubject({
        subjectId: subject?.id,
        name,
        category,
        assessmentMode,
        a1Max,
        a2Max,
        examMax,
        displayOrder,
        isActive,
      });

      if (!result.ok) {
        notify(result.message, "error");
        return;
      }

      notify(result.message, "success");
      router.push(result.subjectId ? `/subjects/${result.subjectId}` : "/subjects");
      router.refresh();
    });
  };

  const remove = () => {
    if (!subject?.id) return;
    startRemoving(async () => {
      const result = await removeSubject({ subjectId: subject.id });
      if (!result.ok) {
        notify(result.message, "error");
        return;
      }

      notify(result.message, "success");
      router.push("/subjects");
      router.refresh();
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[0.95fr_0.55fr]">
          <section className="frost-panel rounded-[24px] px-5 py-5 sm:rounded-[30px] sm:px-7 sm:py-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-[color:var(--text-strong)] sm:text-xl">
                Rule
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Name">
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="surface-input w-full rounded-[18px] px-4 py-3 text-sm text-[color:var(--text-base)] outline-none"
                  placeholder="Mathematics"
                />
              </Field>
              <Field label="Category">
                <input
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="surface-input w-full rounded-[18px] px-4 py-3 text-sm text-[color:var(--text-base)] outline-none"
                  placeholder="Core"
                />
              </Field>
              <Field label="Mode">
                <select
                  value={assessmentMode}
                  onChange={(event) =>
                    setAssessmentMode(
                      event.target.value as "CONTINUOUS_AND_EXAM" | "EXAM_ONLY",
                    )
                  }
                  className="surface-input w-full rounded-[18px] px-4 py-3 text-sm text-[color:var(--text-base)] outline-none"
                >
                  <option value="CONTINUOUS_AND_EXAM">A1 + A2 + Exam</option>
                  <option value="EXAM_ONLY">Exam only</option>
                </select>
              </Field>
              <Field label="Order">
                <input
                  value={displayOrder}
                  onChange={(event) => setDisplayOrder(event.target.value)}
                  className="surface-input w-full rounded-[18px] px-4 py-3 text-sm text-[color:var(--text-base)] outline-none"
                  inputMode="numeric"
                />
              </Field>
            </div>
          </section>

          <section className="frost-panel rounded-[24px] px-5 py-5 sm:rounded-[30px] sm:px-7 sm:py-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-[color:var(--text-strong)] sm:text-xl">
                Scoring
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="A1">
                <input
                  value={a1Max}
                  onChange={(event) => setA1Max(event.target.value)}
                  className="surface-input w-full rounded-[18px] px-4 py-3 text-sm text-[color:var(--text-base)] outline-none disabled:opacity-50"
                  inputMode="numeric"
                  disabled={assessmentMode === "EXAM_ONLY"}
                />
              </Field>
              <Field label="A2">
                <input
                  value={a2Max}
                  onChange={(event) => setA2Max(event.target.value)}
                  className="surface-input w-full rounded-[18px] px-4 py-3 text-sm text-[color:var(--text-base)] outline-none disabled:opacity-50"
                  inputMode="numeric"
                  disabled={assessmentMode === "EXAM_ONLY"}
                />
              </Field>
              <Field label="Exam">
                <input
                  value={examMax}
                  onChange={(event) => setExamMax(event.target.value)}
                  className="surface-input w-full rounded-[18px] px-4 py-3 text-sm text-[color:var(--text-base)] outline-none"
                  inputMode="numeric"
                />
              </Field>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 rounded-[22px] surface-pocket px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-[color:var(--text-strong)]">
                  Active
                </p>
                <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                  Keep this subject available in new sheets.
                </p>
              </div>
              <button
                type="button"
                className={`relative inline-flex h-8 w-14 rounded-full transition ${
                  isActive ? "bg-[color:var(--accent)]" : "bg-[color:var(--highlight-strong)]"
                }`}
                onClick={() => setIsActive((current) => !current)}
                aria-pressed={isActive}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-[color:var(--surface)] transition ${
                    isActive ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>

            {subject?.classrooms?.length ? (
              <div className="mt-6">
                <p className="text-sm font-semibold text-[color:var(--text-strong)]">
                  Classes
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {subject.classrooms.map((classroom) => (
                    <span
                      key={classroom.id}
                      className="soft-action rounded-full px-4 py-2 text-sm font-medium"
                    >
                      {classroom.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <div className="frost-panel rounded-[24px] px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-[color:var(--text-muted)]">
              {mode === "create" ? "Ready to add." : "Changes apply across future sheets."}
            </p>
            <div className="flex flex-wrap gap-3">
              {mode === "edit" ? (
                <button
                  type="button"
                  className="rounded-full bg-[color:var(--danger-soft)] px-4 py-2 text-sm font-medium text-[color:var(--danger)]"
                  onClick={() => setConfirmOpen(true)}
                >
                  Remove
                </button>
              ) : null}
              <button
                type="button"
                className="soft-action rounded-full px-4 py-2 text-sm font-medium"
                onClick={() => router.push("/subjects")}
              >
                Cancel
              </button>
              <button
                type="button"
                className="soft-action-tint rounded-full px-4 py-2 text-sm font-semibold"
                onClick={save}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmSurface
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={remove}
        busy={isRemoving}
        title="Remove subject"
        description="If this subject already appears in classes or report cards, Kradle will archive it instead of deleting history."
        confirmLabel="Remove"
        supportingContent={
          <div className="rounded-[22px] surface-pocket px-4 py-4">
            <p className="text-sm font-semibold text-[color:var(--text-strong)]">
              {subject?.name}
            </p>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">
              {subject?.assessmentMode === "EXAM_ONLY" ? "Exam only" : "A1 + A2 + Exam"}
            </p>
          </div>
        }
      />
    </>
  );
}
