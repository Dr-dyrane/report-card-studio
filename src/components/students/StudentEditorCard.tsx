"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { removeStudent, saveStudent } from "@/app/(workspace)/students/actions";
import { useFeedback } from "@/components/feedback/FeedbackProvider";
import { ConfirmSurface } from "@/components/ui/ConfirmSurface";
import { Field } from "@/components/ui/Field";

type StudentEditorCardProps = {
  student: {
    id: string;
    routeKey: string;
    fullName: string;
    classroomId: string;
    isActive: boolean;
    classrooms: Array<{ id: string; name: string }>;
    reportCount: number;
  };
};

export function StudentEditorCard({ student }: StudentEditorCardProps) {
  const router = useRouter();
  const { notify } = useFeedback();
  const [isSaving, startSave] = useTransition();
  const [isRemoving, startRemoving] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [fullName, setFullName] = useState(student.fullName);
  const [classroomId, setClassroomId] = useState(student.classroomId);
  const [isActive, setIsActive] = useState(student.isActive);

  const save = () => {
    startSave(async () => {
      const result = await saveStudent({
        studentId: student.id,
        fullName,
        classroomId,
        isActive,
      });

      if (!result.ok) {
        notify(result.message, "error");
        return;
      }

      notify(result.message, "success");
      router.push(`/students/${result.routeKey}`);
      router.refresh();
    });
  };

  const remove = () => {
    startRemoving(async () => {
      const result = await removeStudent({
        studentId: student.id,
        routeKey: student.routeKey,
      });

      if (!result.ok) {
        notify(result.message, "error");
        return;
      }

      notify(result.message, "success");
      router.push("/students");
      router.refresh();
    });
  };

  return (
    <>
      <section className="frost-panel rounded-[24px] px-5 py-5 sm:rounded-[30px] sm:px-7 sm:py-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[color:var(--text-strong)] sm:text-xl">
            Edit student
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Full name">
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="surface-input w-full rounded-[18px] px-4 py-3 text-sm text-[color:var(--text-base)] outline-none"
            />
          </Field>
          <Field label="Class">
            <select
              value={classroomId}
              onChange={(event) => setClassroomId(event.target.value)}
              className="surface-input w-full rounded-[18px] px-4 py-3 text-sm text-[color:var(--text-base)] outline-none"
            >
              {student.classrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 rounded-[22px] surface-pocket px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-[color:var(--text-strong)]">
              Active
            </p>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">
              Archived students stay out of the active roster.
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

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-[color:var(--text-muted)]">
            {student.reportCount} report {student.reportCount === 1 ? "sheet" : "sheets"} linked.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full bg-[color:var(--danger-soft)] px-4 py-2 text-sm font-medium text-[color:var(--danger)]"
              onClick={() => setConfirmOpen(true)}
            >
              Remove
            </button>
            <button
              type="button"
              className="soft-action rounded-full px-4 py-2 text-sm font-medium"
              onClick={() => router.push("/students")}
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
      </section>

      <ConfirmSurface
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={remove}
        busy={isRemoving}
        title="Remove student"
        description="If this student already has report history, Kradle will archive the student instead of deleting those records."
        confirmLabel="Remove"
        supportingContent={
          <div className="rounded-[22px] surface-pocket px-4 py-4">
            <p className="text-sm font-semibold text-[color:var(--text-strong)]">
              {student.fullName}
            </p>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">
              {student.reportCount} report {student.reportCount === 1 ? "sheet" : "sheets"}
            </p>
          </div>
        }
      />
    </>
  );
}
