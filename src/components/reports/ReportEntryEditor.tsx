"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  publishReportCard,
  removeReportCard,
  updateReportScores,
} from "@/app/(workspace)/reports/actions";
import { useFeedback } from "@/components/feedback/FeedbackProvider";
import { ConfirmSurface } from "@/components/ui/ConfirmSurface";
import { SectionCard } from "@/components/ui/SectionCard";

type ScoreRow = {
  id: string;
  subject: string;
  a1: string;
  a2: string;
  exam: string;
  total: number;
};

type ReportEntryEditorProps = {
  reportCardId: string;
  reportId: string;
  rows: ScoreRow[];
  teacherComment: string;
  teacherName: string;
  position: string;
  initialAssessment1Total: number;
  initialAssessment2Total: number;
  initialExamTotal: number;
  initialGrandTotal: number;
  previousReport?: {
    href: string;
    label: string;
  } | null;
  nextReport?: {
    href: string;
    label: string;
  } | null;
};

function parseScore(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function computeRowTotal(row: ScoreRow) {
  return (
    (parseScore(row.a1) ?? 0) +
    (parseScore(row.a2) ?? 0) +
    (parseScore(row.exam) ?? 0)
  );
}

function createSnapshot(rows: ScoreRow[], comment: string, teacher: string) {
  return JSON.stringify({
    comment,
    teacher,
    rows: rows.map((row) => ({
      id: row.id,
      a1: row.a1,
      a2: row.a2,
      exam: row.exam,
    })),
  });
}

export function ReportEntryEditor({
  reportCardId,
  reportId,
  rows: initialRows,
  teacherComment,
  teacherName,
  position,
  initialAssessment1Total,
  initialAssessment2Total,
  initialExamTotal,
  initialGrandTotal,
  previousReport,
  nextReport,
}: ReportEntryEditorProps) {
  const router = useRouter();
  const { notify } = useFeedback();
  const [rows, setRows] = useState(initialRows);
  const [comment, setComment] = useState(teacherComment);
  const [teacher, setTeacher] = useState(teacherName);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"Saved" | "Saving" | "Unsaved" | "Retry">(
    "Saved",
  );
  const [isPending, startTransition] = useTransition();
  const lastSavedSnapshotRef = useRef(
    createSnapshot(initialRows, teacherComment, teacherName),
  );
  const hasEnteredScores = useMemo(
    () =>
      rows.some(
        (row) =>
          parseScore(row.a1) !== null ||
          parseScore(row.a2) !== null ||
          parseScore(row.exam) !== null,
      ),
    [rows],
  );

  const summary = useMemo(() => {
    const assessment1Total = rows.reduce(
      (sum, row) => sum + (parseScore(row.a1) ?? 0),
      0,
    );
    const assessment2Total = rows.reduce(
      (sum, row) => sum + (parseScore(row.a2) ?? 0),
      0,
    );
    const examTotal = rows.reduce(
      (sum, row) => sum + (parseScore(row.exam) ?? 0),
      0,
    );
    const grandTotal = rows.reduce((sum, row) => sum + computeRowTotal(row), 0);

    return {
      assessment1Total: hasEnteredScores ? assessment1Total : initialAssessment1Total,
      assessment2Total: hasEnteredScores ? assessment2Total : initialAssessment2Total,
      examTotal: hasEnteredScores ? examTotal : initialExamTotal,
      grandTotal: hasEnteredScores ? grandTotal : initialGrandTotal,
    };
  }, [
    hasEnteredScores,
    initialAssessment1Total,
    initialAssessment2Total,
    initialExamTotal,
    initialGrandTotal,
    rows,
  ]);

  function saveIfNeeded(announce = false) {
    const snapshot = createSnapshot(rows, comment, teacher);

    if (snapshot === lastSavedSnapshotRef.current) {
      setSaveState("Saved");
      if (announce) {
        notify("Nothing new to save.");
      }
      return;
    }

    if (isPending) {
      return;
    }

    setSaveState("Saving");
    startTransition(async () => {
      const result = await updateReportScores({
        reportCardId,
        routeKey: reportId,
        teacherComment: comment,
        teacherName: teacher,
        scores: rows.map((row) => ({
          id: row.id,
          a1: row.a1,
          a2: row.a2,
          exam: row.exam,
        })),
      });

      if (result.ok) {
        lastSavedSnapshotRef.current = snapshot;
        setSaveState("Saved");
        if (announce) {
          notify("Saved.", "success");
        }
        return;
      }

      setSaveState("Retry");
      if (announce) {
        notify("Save didn't complete.", "error");
      }
    });
  }

  function handlePublish() {
    startTransition(async () => {
      const saveSnapshot = createSnapshot(rows, comment, teacher);

      if (saveSnapshot !== lastSavedSnapshotRef.current) {
        const saveResult = await updateReportScores({
          reportCardId,
          routeKey: reportId,
          teacherComment: comment,
          teacherName: teacher,
          scores: rows.map((row) => ({
            id: row.id,
            a1: row.a1,
            a2: row.a2,
            exam: row.exam,
          })),
        });

        if (!saveResult.ok) {
          setSaveState("Retry");
          notify("Save didn't complete.", "error");
          return;
        }

        lastSavedSnapshotRef.current = saveSnapshot;
        setSaveState("Saved");
      }

      const publishResult = await publishReportCard({
        reportCardId,
        routeKey: reportId,
      });

      if (!publishResult.ok) {
        notify("Publish didn't complete.", "error");
        return;
      }

      notify("Published.", "success");
      router.refresh();
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeReportCard({
        reportCardId,
        routeKey: reportId,
      });

      if (!result.ok) {
        notify(result.message, "error");
        return;
      }

      notify(result.message, "success");
      router.push("/reports");
      router.refresh();
    });
  }

  function updateCell(rowId: string, field: "a1" | "a2" | "exam", value: string) {
    setRows((current) =>
      current.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    );
    setSaveState("Unsaved");
  }

  function renderScoreInput(
    rowId: string,
    field: "a1" | "a2" | "exam",
    value: string,
    mobile = false,
  ) {
    return (
      <input
        value={value}
        onChange={(event) => updateCell(rowId, field, event.target.value)}
        onBlur={() => saveIfNeeded()}
        onFocus={() => setActiveRowId(rowId)}
        inputMode="numeric"
        placeholder="--"
        className={`surface-input rounded-[18px] px-3 py-3 font-semibold text-[color:var(--text-strong)] outline-none transition focus:shadow-[0_0_0_1px_var(--accent-border),var(--shadow-frost)] ${
          mobile ? "w-full text-center text-lg" : "w-20 text-right"
        }`}
      />
    );
  }

  function renderSaveMessage() {
    if (isPending) return "Saving...";
    if (!hasEnteredScores) return "Saved totals stay in view until subject entry begins.";
    if (saveState === "Saved") return "All changes saved.";
    if (saveState === "Unsaved") return "Changes not saved yet.";
    if (saveState === "Retry") return "Save didn't complete. Try again.";
    return "Saving...";
  }

  return (
    <div className="grid gap-3 sm:gap-6 xl:grid-cols-[1.25fr_0.42fr]">
      <SectionCard title="Entry">
        {hasEnteredScores ? (
          <>
            <form className="space-y-3 sm:hidden">
              {rows.map((row) => {
                const rowTotal = computeRowTotal(row);
                const rowIsActive = activeRowId === row.id;

                return (
                  <div
                    key={row.id}
                    className={`rounded-[24px] px-4 py-4 transition ${
                      rowIsActive ? "soft-action-tint" : "frost-panel-soft"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-[color:var(--text-strong)]">
                          {row.subject}
                        </p>
                        <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                          Live totals
                        </p>
                      </div>
                      <span className="soft-action-tint inline-flex min-w-14 items-center justify-center rounded-full px-3 py-1.5 text-sm font-semibold">
                        {rowTotal}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <label className="block">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
                          A1
                        </p>
                        <div className="mt-2">{renderScoreInput(row.id, "a1", row.a1, true)}</div>
                      </label>
                      <label className="block">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
                          A2
                        </p>
                        <div className="mt-2">{renderScoreInput(row.id, "a2", row.a2, true)}</div>
                      </label>
                      <label className="block">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
                          Exam
                        </p>
                        <div className="mt-2">
                          {renderScoreInput(row.id, "exam", row.exam, true)}
                        </div>
                      </label>
                    </div>
                  </div>
                );
              })}
            </form>

            <div className="surface-pocket hidden overflow-hidden rounded-[24px] sm:block">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead className="table-head text-left text-sm text-[color:var(--text-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Subject</th>
                    <th className="px-4 py-3 text-right font-medium">A1</th>
                    <th className="px-4 py-3 text-right font-medium">A2</th>
                    <th className="px-4 py-3 text-right font-medium">Exam</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-[color:var(--surface)] text-sm">
                  {rows.map((row, index) => {
                    const rowTotal = computeRowTotal(row);
                    const rowIsActive = activeRowId === row.id;

                    return (
                      <tr
                        key={row.id}
                        className={`${index % 2 === 0 ? "table-row-odd" : ""} transition`}
                        style={{
                          backgroundColor: rowIsActive
                            ? "var(--surface-raised)"
                            : index % 2 === 0
                              ? "var(--table-row-odd)"
                              : undefined,
                        }}
                      >
                        <td className="px-4 py-4 font-semibold text-[color:var(--text-strong)]">
                          {row.subject}
                        </td>
                        <td className="px-4 py-4">{renderScoreInput(row.id, "a1", row.a1)}</td>
                        <td className="px-4 py-4">{renderScoreInput(row.id, "a2", row.a2)}</td>
                        <td className="px-4 py-4">{renderScoreInput(row.id, "exam", row.exam)}</td>
                        <td className="px-4 py-4 text-right">
                          <span className="soft-action-tint inline-flex min-w-12 items-center justify-center rounded-full px-3 py-1 font-semibold">
                            {rowTotal}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="surface-pocket rounded-[24px] p-4 sm:p-5">
            <div className="soft-action rounded-[24px] px-5 py-6 sm:px-6 sm:py-7">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                Entry
              </p>
              <h3 className="mt-3 text-xl font-semibold text-[color:var(--text-strong)]">
                Subject scores are still empty
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--text-muted)]">
                This report already has saved term totals, but the subject-by-subject
                score grid has not been captured yet. Add scores from the image when you
                are ready and the live review totals will take over automatically.
              </p>
            </div>
          </div>
        )}

        <div className="surface-pocket mt-4 grid gap-3 rounded-[24px] p-3 sm:mt-5 sm:grid-cols-[1fr_0.42fr] sm:gap-4 sm:p-4">
          <div className="soft-action rounded-[22px] px-4 py-4 sm:px-5 sm:py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
              Comment
            </p>
            <textarea
              value={comment}
              onChange={(event) => {
                setComment(event.target.value);
                setSaveState("Unsaved");
              }}
              onFocus={() => setActiveRowId(null)}
              onBlur={() => saveIfNeeded()}
              className="surface-input mt-3 min-h-24 w-full rounded-[18px] px-4 py-3 text-sm leading-6 text-[color:var(--text-base)] outline-none transition focus:shadow-[0_0_0_1px_var(--accent-border),var(--shadow-frost)]"
            />
          </div>

          <div className="soft-action rounded-[22px] px-4 py-4 sm:px-5 sm:py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
              Teacher
            </p>
            <input
              value={teacher}
              onChange={(event) => {
                setTeacher(event.target.value);
                setSaveState("Unsaved");
              }}
              onFocus={() => setActiveRowId(null)}
              onBlur={() => saveIfNeeded()}
              className="surface-input mt-3 w-full rounded-[18px] px-4 py-3 text-sm leading-6 text-[color:var(--text-base)] outline-none transition focus:shadow-[0_0_0_1px_var(--accent-border),var(--shadow-frost)]"
            />
          </div>
        </div>

        <div className="surface-pocket mt-3 rounded-[24px] px-4 py-4 sm:mt-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <p className="text-sm text-[color:var(--text-muted)]">{renderSaveMessage()}</p>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
              <button
                type="button"
                onClick={() => saveIfNeeded(true)}
                disabled={isPending}
                className="soft-action rounded-full px-4 py-2 text-sm font-medium"
              >
                Save
              </button>
              <Link
                href={`/reports/${reportId}/preview`}
                className="soft-action rounded-full px-4 py-2 text-center text-sm font-medium"
              >
                Preview
              </Link>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPending}
                className="soft-action-tint col-span-2 rounded-full px-4 py-2 text-sm font-semibold sm:col-span-1"
              >
                Publish
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="rounded-full bg-[color:var(--danger-soft)] px-4 py-2 text-sm font-medium text-[color:var(--danger)]"
              >
                Remove
              </button>
            </div>
            {(previousReport || nextReport) ? null : (
              <Link
                href="/students"
                className="text-sm font-medium text-[color:var(--text-muted)] transition hover:text-[color:var(--text-strong)]"
              >
                Back to students
              </Link>
            )}
          </div>

          {previousReport || nextReport ? (
            <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {previousReport ? (
                  <Link
                    href={previousReport.href}
                    className="soft-action rounded-full px-4 py-2 text-sm font-medium"
                  >
                    Previous: {previousReport.label}
                  </Link>
                ) : null}
                {nextReport ? (
                  <Link
                    href={nextReport.href}
                    className="soft-action rounded-full px-4 py-2 text-sm font-medium"
                  >
                    Next: {nextReport.label}
                  </Link>
                ) : null}
              </div>
              <Link
                href="/students"
                className="text-sm font-medium text-[color:var(--text-muted)] transition hover:text-[color:var(--text-strong)]"
              >
                Back to students
              </Link>
            </div>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard title="Review">
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:sticky xl:top-28 xl:grid-cols-1">
          {[
            ["A1 total", String(summary.assessment1Total)],
            ["A2 total", String(summary.assessment2Total)],
            ["Exam total", String(summary.examTotal)],
            ["Grand total", String(summary.grandTotal)],
            ["Position", position],
          ].map(([label, value], index) => (
            <div
              key={label}
              className={`rounded-[20px] px-4 py-4 shadow-[var(--shadow-frost)] sm:rounded-[22px] ${
                index === 3 ? "soft-action-tint" : "surface-pocket"
              }`}
            >
              <p className="text-sm text-[color:var(--text-muted)]">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-[color:var(--text-strong)]">
                {value}
              </p>
            </div>
          ))}

          <div className="rounded-[22px] bg-[color:var(--success-soft)] px-4 py-4 text-sm leading-6 text-[color:var(--success)] shadow-[var(--shadow-frost)]">
            {hasEnteredScores
              ? "Totals update live."
              : "Saved report totals stay visible until subject entry begins."}
          </div>
        </div>
      </SectionCard>

      <ConfirmSurface
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleRemove}
        busy={isPending}
        title="Remove report"
        description="Kradle deletes empty draft sheets. If this report already carries saved work or has been published, it will archive the sheet instead."
        confirmLabel="Remove"
        supportingContent={
          <div className="rounded-[22px] surface-pocket px-4 py-4">
            <p className="text-sm font-semibold text-[color:var(--text-strong)]">
              {summary.grandTotal} total
            </p>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">
              Position {position}
            </p>
          </div>
        }
      />
    </div>
  );
}
