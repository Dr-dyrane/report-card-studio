"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { removeClassroom, saveClassroom } from "@/app/(workspace)/classes/actions";
import { useFeedback } from "@/components/feedback/FeedbackProvider";
import { ConfirmSurface } from "@/components/ui/ConfirmSurface";
import { Field } from "@/components/ui/Field";

type ClassEditorFormProps = {
  mode: "create" | "edit";
  classroom?: {
    id: string;
    name: string;
    teacherName: string;
    displayOrder: number;
    studentCount: number;
    activeReports: number;
    students: Array<{ id: string; fullName: string }>;
    subjects: Array<{ id: string; name: string }>;
  } | null;
};

export function ClassEditorForm({ mode, classroom }: ClassEditorFormProps) {
  const router = useRouter();
  const { notify } = useFeedback();
  const [isSaving, startSave] = useTransition();
  const [isRemoving, startRemoving] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [name, setName] = useState(classroom?.name ?? "");
  const [teacherName, setTeacherName] = useState(classroom?.teacherName ?? "");
  const [displayOrder, setDisplayOrder] = useState(
    classroom?.displayOrder?.toString() ?? "0",
  );

  const save = () => {
    startSave(async () => {
      const result = await saveClassroom({
        classroomId: classroom?.id,
        name,
        teacherName,
        displayOrder,
      });

      if (!result.ok) {
        notify(result.message, "error");
        return;
      }

      notify(result.message, "success");
      router.push(result.classroomId ? `/classes/${result.classroomId}` : "/classes");
      router.refresh();
    });
  };

  const remove = () => {
    if (!classroom?.id) return;
    startRemoving(async () => {
      const result = await removeClassroom({ classroomId: classroom.id });
      if (!result.ok) {
        notify(result.message, "error");
        return;
      }

      notify(result.message, "success");
      router.push("/classes");
      router.refresh();
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[0.85fr_0.65fr]">
          <section className="frost-panel rounded-[24px] px-5 py-5 sm:rounded-[30px] sm:px-7 sm:py-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-[color:var(--text-strong)] sm:text-xl">
                Class
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Name">
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="surface-input w-full rounded-[18px] px-4 py-3 text-sm text-[color:var(--text-base)] outline-none"
                  placeholder="Primary 5 Lavender"
                />
              </Field>
              <Field label="Teacher">
                <input
                  value={teacherName}
                  onChange={(event) => setTeacherName(event.target.value)}
                  className="surface-input w-full rounded-[18px] px-4 py-3 text-sm text-[color:var(--text-base)] outline-none"
                  placeholder="Mrs. Class Teacher"
                />
              </Field>
              <Field label="Order">
                <input
                  value={displayOrder}
                  onChange={(event) => setDisplayOrder(event.target.value)}
                  className="surface-input w-full rounded-[18px] px-4 py-3 text-sm text-[color:var(--text-base)] outline-none"
                  inputMode="numeric"
                />
              </Field>
              <Field label="Students">
                <div className="surface-pocket rounded-[18px] px-4 py-3 text-sm text-[color:var(--text-base)]">
                  {classroom?.studentCount ?? 0}
                </div>
              </Field>
            </div>
          </section>

          <section className="frost-panel rounded-[24px] px-5 py-5 sm:rounded-[30px] sm:px-7 sm:py-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-[color:var(--text-strong)] sm:text-xl">
                Scope
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Reports", String(classroom?.activeReports ?? 0)],
                ["Subjects", String(classroom?.subjects.length ?? 0)],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={`rounded-[22px] px-4 py-4 ${
                    index === 0 ? "soft-action-tint" : "surface-pocket"
                  }`}
                >
                  <p className="text-sm text-[color:var(--text-muted)]">{label}</p>
                  <p className="mt-2 text-3xl font-semibold text-[color:var(--text-strong)]">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {classroom?.subjects.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {classroom.subjects.map((subject) => (
                  <span
                    key={subject.id}
                    className="soft-action rounded-full px-4 py-2 text-sm font-medium"
                  >
                    {subject.name}
                  </span>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-[22px] px-4 py-4 text-sm text-[color:var(--text-muted)] surface-pocket">
                No subjects assigned yet.
              </div>
            )}
          </section>
        </div>

        {classroom?.students?.length ? (
          <section className="frost-panel rounded-[24px] px-5 py-5 sm:rounded-[30px] sm:px-7 sm:py-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-[color:var(--text-strong)] sm:text-xl">
                Students
              </h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {classroom.students.map((student) => (
                <div
                  key={student.id}
                  className="surface-pocket rounded-[20px] px-4 py-4 text-sm font-medium text-[color:var(--text-strong)]"
                >
                  {student.fullName}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className="frost-panel rounded-[24px] px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-[color:var(--text-muted)]">
              {mode === "create"
                ? "Create a class before assigning students."
                : "Keep this class clean before removing it."}
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
                onClick={() => router.push("/classes")}
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
        title="Remove class"
        description="Kradle only removes empty classes. Move students and clear report sheets first if this class is still active."
        confirmLabel="Remove"
        supportingContent={
          <div className="rounded-[22px] surface-pocket px-4 py-4">
            <p className="text-sm font-semibold text-[color:var(--text-strong)]">
              {classroom?.name}
            </p>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">
              {classroom?.studentCount ?? 0} students · {classroom?.activeReports ?? 0} reports
            </p>
          </div>
        }
      />
    </>
  );
}
