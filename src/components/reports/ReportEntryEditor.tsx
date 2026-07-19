"use client";

import Link from "next/link";
import { KeyboardEvent, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  deleteArchivedReportCard,
  publishReportCard,
  removeReportCard,
  restoreReportCard,
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
  a1Max: number | null;
  a2Max: number | null;
  examMax: number | null;
};

type ReportEntryEditorProps = {
  reportCardId: string;
  reportId: string;
  rows: ScoreRow[];
  teacherComment: string;
  teacherName: string;
  position: string;
  initialAssessmentEntryMode: "PER_SUBJECT" | "AGGREGATE_TOTALS";
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
  reportStatus?: string;
};

function parseScore(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function computeRowTotal(
  row: ScoreRow,
  assessmentEntryMode: "PER_SUBJECT" | "AGGREGATE_TOTALS",
) {
  return (
    (assessmentEntryMode === "PER_SUBJECT"
      ? (parseScore(row.a1) ?? 0) + (parseScore(row.a2) ?? 0)
      : 0) +
    (parseScore(row.exam) ?? 0)
  );
}

function createSnapshot(
  rows: ScoreRow[],
  comment: string,
  teacher: string,
  assessmentEntryMode: "PER_SUBJECT" | "AGGREGATE_TOTALS",
  assessment1Total: string,
  assessment2Total: string,
) {
  return JSON.stringify({
    comment,
    teacher,
    assessmentEntryMode,
    assessment1Total,
    assessment2Total,
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
  initialAssessmentEntryMode,
  initialAssessment1Total,
  initialAssessment2Total,
  initialExamTotal,
  initialGrandTotal,
  previousReport,
  nextReport,
  reportStatus = "DRAFT",
}: ReportEntryEditorProps) {
  const router = useRouter();
  const { notify } = useFeedback();
  const [rows, setRows] = useState(initialRows);
  const [comment, setComment] = useState(teacherComment);
  const [teacher, setTeacher] = useState(teacherName);
  const [assessmentEntryMode, setAssessmentEntryMode] = useState(
    initialAssessmentEntryMode,
  );
  const [aggregateAssessment1Total, setAggregateAssessment1Total] = useState(
    String(initialAssessment1Total),
  );
  const [aggregateAssessment2Total, setAggregateAssessment2Total] = useState(
    String(initialAssessment2Total),
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hardDeleteConfirmOpen, setHardDeleteConfirmOpen] = useState(false);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"Saved" | "Saving" | "Unsaved" | "Retry">(
    "Saved",
  );
  const [isPending, startTransition] = useTransition();
  const lastSavedSnapshotRef = useRef(
    createSnapshot(
      initialRows,
      teacherComment,
      teacherName,
      initialAssessmentEntryMode,
      String(initialAssessment1Total),
      String(initialAssessment2Total),
    ),
  );
  const hasEnteredScores = useMemo(
    () =>
      (assessmentEntryMode === "AGGREGATE_TOTALS" &&
        (parseScore(aggregateAssessment1Total) !== null ||
          parseScore(aggregateAssessment2Total) !== null)) ||
      rows.some(
        (row) =>
          (assessmentEntryMode === "PER_SUBJECT" &&
            (parseScore(row.a1) !== null ||
              parseScore(row.a2) !== null)) ||
          parseScore(row.exam) !== null,
      ),
    [
      aggregateAssessment1Total,
      aggregateAssessment2Total,
      assessmentEntryMode,
      rows,
    ],
  );
  const hasAssessment1Scores = useMemo(
    () => rows.some((row) => parseScore(row.a1) !== null),
    [rows],
  );
  const hasAssessment2Scores = useMemo(
    () => rows.some((row) => parseScore(row.a2) !== null),
    [rows],
  );
  const hasExamScores = useMemo(
    () => rows.some((row) => parseScore(row.exam) !== null),
    [rows],
  );

  const summary = useMemo(() => {
    const detailedAssessment1Total = rows.reduce(
      (sum, row) => sum + (parseScore(row.a1) ?? 0),
      0,
    );
    const detailedAssessment2Total = rows.reduce(
      (sum, row) => sum + (parseScore(row.a2) ?? 0),
      0,
    );
    const detailedExamTotal = rows.reduce(
      (sum, row) => sum + (parseScore(row.exam) ?? 0),
      0,
    );
    const assessment1Total =
      assessmentEntryMode === "AGGREGATE_TOTALS"
        ? parseScore(aggregateAssessment1Total) ?? 0
        : hasAssessment1Scores
          ? detailedAssessment1Total
          : 0;
    const assessment2Total =
      assessmentEntryMode === "AGGREGATE_TOTALS"
        ? parseScore(aggregateAssessment2Total) ?? 0
        : hasAssessment2Scores
          ? detailedAssessment2Total
          : 0;
    const examTotal = hasExamScores ? detailedExamTotal : initialExamTotal;
    const grandTotal = assessment1Total + assessment2Total + examTotal;

    return {
      assessment1Total,
      assessment2Total,
      examTotal,
      grandTotal: hasEnteredScores ? grandTotal : initialGrandTotal,
    };
  }, [
    aggregateAssessment1Total,
    aggregateAssessment2Total,
    assessmentEntryMode,
    hasAssessment1Scores,
    hasAssessment2Scores,
    hasExamScores,
    hasEnteredScores,
    initialExamTotal,
    initialGrandTotal,
    rows,
  ]);

  function saveIfNeeded(announce = false) {
    const snapshot = createSnapshot(
      rows,
      comment,
      teacher,
      assessmentEntryMode,
      aggregateAssessment1Total,
      aggregateAssessment2Total,
    );

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
        assessmentEntryMode,
        assessment1Total: summary.assessment1Total,
        assessment2Total: summary.assessment2Total,
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
      const saveSnapshot = createSnapshot(
        rows,
        comment,
        teacher,
        assessmentEntryMode,
        aggregateAssessment1Total,
        aggregateAssessment2Total,
      );

      if (saveSnapshot !== lastSavedSnapshotRef.current) {
        const saveResult = await updateReportScores({
          reportCardId,
          routeKey: reportId,
          teacherComment: comment,
          teacherName: teacher,
          assessmentEntryMode,
          assessment1Total: summary.assessment1Total,
          assessment2Total: summary.assessment2Total,
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

  function handleRestore() {
    startTransition(async () => {
      const result = await restoreReportCard({
        reportCardId,
        routeKey: reportId,
      });

      if (!result.ok) {
        notify(result.message, "error");
        return;
      }

      notify(result.message, "success");
      router.refresh();
    });
  }

  function handleDeleteArchived() {
    startTransition(async () => {
      const result = await deleteArchivedReportCard({
        reportCardId,
        routeKey: reportId,
      });

      if (!result.ok) {
        notify(result.message, "error");
        return;
      }

      notify(result.message, "success");
      router.push("/reports?view=archived");
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

  function changeAssessmentEntryMode(
    nextMode: "PER_SUBJECT" | "AGGREGATE_TOTALS",
  ) {
    if (nextMode === assessmentEntryMode) return;

    if (
      nextMode === "PER_SUBJECT" &&
      !window.confirm(
        "Switch to per-subject tests? Aggregate test totals cannot be distributed automatically. A1 and A2 will start blank.",
      )
    ) {
      return;
    }

    if (
      nextMode === "AGGREGATE_TOTALS" &&
      !window.confirm(
        "Switch to aggregate test totals? Existing per-subject A1 and A2 scores will be replaced by the two totals when you save.",
      )
    ) {
      return;
    }

    if (nextMode === "AGGREGATE_TOTALS") {
      setAggregateAssessment1Total(String(summary.assessment1Total));
      setAggregateAssessment2Total(String(summary.assessment2Total));
    }

    setRows((current) =>
      current.map((row) => ({ ...row, a1: "", a2: "" })),
    );
    setAssessmentEntryMode(nextMode);
    setSaveState("Unsaved");
  }

  function focusCell(cellIndex: number) {
    if (typeof document === "undefined") return;

    const target = document.querySelector<HTMLInputElement>(
      `[data-entry-cell="${cellIndex}"]`,
    );

    if (target) {
      target.focus();
      target.select();
    }
  }

  function handleCellKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
    cellIndex: number,
  ) {
    if (event.key !== "Enter") return;

    event.preventDefault();
    saveIfNeeded();
    focusCell(cellIndex + 1);
  }

  function renderScoreInput(
    rowId: string,
    field: "a1" | "a2" | "exam",
    value: string,
    maxValue: number | null,
    cellIndex: number,
    mobile = false,
  ) {
    return (
      <input
        value={value}
        onChange={(event) => updateCell(rowId, field, event.target.value)}
        onBlur={() => saveIfNeeded()}
        onFocus={() => setActiveRowId(rowId)}
        onKeyDown={(event) => handleCellKeyDown(event, cellIndex)}
        inputMode="numeric"
        placeholder={maxValue ? `/${maxValue}` : "--"}
        data-entry-cell={cellIndex}
        className={`surface-input rounded-[18px] px-3 py-3 font-medium text-[color:var(--text-strong)] outline-none transition focus:shadow-[0_0_0_1px_var(--accent-border),var(--shadow-frost)] ${
          mobile ? "w-full text-center text-lg" : "w-20 text-right"
        }`}
      />
    );
  }

  function renderSaveMessage() {
    if (isPending) return "Saving...";
    if (!hasEnteredScores) {
      return assessmentEntryMode === "AGGREGATE_TOTALS"
        ? "Enter the two test totals and each subject exam score."
        : "Enter A1, A2, and exam scores by subject.";
    }
    if (saveState === "Saved") return "All changes saved.";
    if (saveState === "Unsaved") return "Changes not saved yet.";
    if (saveState === "Retry") return "Save didn't complete. Try again.";
    return "Saving...";
  }

  return (
    <div className="grid gap-3 sm:gap-6 xl:grid-cols-[1.25fr_0.42fr]">
      <SectionCard title="Entry">
        <div className="surface-pocket mb-4 rounded-[24px] p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[color:var(--text-strong)]">
                Test score format
              </p>
              <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                {assessmentEntryMode === "AGGREGATE_TOTALS"
                  ? "First and second tests are class-wide totals; subjects carry exam scores."
                  : "Each subject carries its own A1, A2, and exam score."}
              </p>
            </div>
            <div className="soft-action grid grid-cols-2 rounded-full p-1">
              <button
                type="button"
                onClick={() => changeAssessmentEntryMode("AGGREGATE_TOTALS")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  assessmentEntryMode === "AGGREGATE_TOTALS"
                    ? "soft-action-tint"
                    : "text-[color:var(--text-muted)]"
                }`}
              >
                Test totals
              </button>
              <button
                type="button"
                onClick={() => changeAssessmentEntryMode("PER_SUBJECT")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  assessmentEntryMode === "PER_SUBJECT"
                    ? "soft-action-tint"
                    : "text-[color:var(--text-muted)]"
                }`}
              >
                Per subject
              </button>
            </div>
          </div>

          {assessmentEntryMode === "AGGREGATE_TOTALS" ? (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {[
                {
                  label: "First test total",
                  value: aggregateAssessment1Total,
                  setValue: setAggregateAssessment1Total,
                },
                {
                  label: "Second test total",
                  value: aggregateAssessment2Total,
                  setValue: setAggregateAssessment2Total,
                },
              ].map(({ label, value, setValue }) => (
                <label key={label} className="soft-action rounded-[20px] px-3 py-3">
                  <span className="text-xs text-[color:var(--text-muted)]">{label}</span>
                  <input
                    value={value}
                    onChange={(event) => {
                      setValue(event.target.value);
                      setSaveState("Unsaved");
                    }}
                    onBlur={() => saveIfNeeded()}
                    inputMode="numeric"
                    className="surface-input mt-2 w-full rounded-[16px] px-3 py-2.5 text-right text-lg font-medium outline-none"
                  />
                </label>
              ))}
            </div>
          ) : null}
        </div>

        {!hasEnteredScores ? (
          <div className="rounded-[22px] bg-[color:var(--accent-soft)] px-4 py-4 text-sm leading-6 text-[color:var(--accent-strong)] shadow-[var(--shadow-frost)]">
            This sheet is ready for entry. Start anywhere and the review totals will update live.
          </div>
        ) : null}

        <>
            <form className="space-y-3 sm:hidden">
              {rows.map((row, rowIndex) => {
                const rowTotal = computeRowTotal(row, assessmentEntryMode);
                const rowIsActive = activeRowId === row.id;
                const cellBase =
                  rowIndex * (assessmentEntryMode === "PER_SUBJECT" ? 3 : 1);

                return (
                  <div
                    key={row.id}
                    className={`rounded-[24px] px-4 py-4 transition ${
                      rowIsActive ? "soft-action-tint" : "frost-panel-soft"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-[color:var(--text-strong)]">
                          {row.subject}
                        </p>
                        <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                          Live totals
                        </p>
                      </div>
                      <span className="soft-action-tint inline-flex min-w-14 items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium">
                        {rowTotal}
                      </span>
                    </div>

                    <div
                      className={`mt-4 grid gap-2 ${
                        assessmentEntryMode === "PER_SUBJECT"
                          ? "grid-cols-3"
                          : "grid-cols-1"
                      }`}
                    >
                      {assessmentEntryMode === "PER_SUBJECT" ? (
                        <>
                      <label className="block">
                        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
                          A1{row.a1Max ? ` / ${row.a1Max}` : ""}
                        </p>
                        <div className="mt-2">
                          {renderScoreInput(
                            row.id,
                            "a1",
                            row.a1,
                            row.a1Max,
                            cellBase,
                            true,
                          )}
                        </div>
                      </label>
                      <label className="block">
                        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
                          A2{row.a2Max ? ` / ${row.a2Max}` : ""}
                        </p>
                        <div className="mt-2">
                          {renderScoreInput(
                            row.id,
                            "a2",
                            row.a2,
                            row.a2Max,
                            cellBase + 1,
                            true,
                          )}
                        </div>
                      </label>
                        </>
                      ) : null}
                      <label className="block">
                        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
                          Exam{row.examMax ? ` / ${row.examMax}` : ""}
                        </p>
                        <div className="mt-2">
                          {renderScoreInput(
                            row.id,
                            "exam",
                            row.exam,
                            row.examMax,
                            cellBase +
                              (assessmentEntryMode === "PER_SUBJECT" ? 2 : 0),
                            true,
                          )}
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
                    {assessmentEntryMode === "PER_SUBJECT" ? (
                      <>
                    <th className="px-4 py-3 text-right font-medium">A1</th>
                    <th className="px-4 py-3 text-right font-medium">A2</th>
                      </>
                    ) : null}
                    <th className="px-4 py-3 text-right font-medium">Exam</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-[color:var(--surface)] text-sm">
                  {rows.map((row, index) => {
                    const rowTotal = computeRowTotal(row, assessmentEntryMode);
                    const rowIsActive = activeRowId === row.id;
                    const cellBase =
                      index * (assessmentEntryMode === "PER_SUBJECT" ? 3 : 1);

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
                        <td className="px-4 py-4 font-medium text-[color:var(--text-strong)]">
                          <div>
                            <p>{row.subject}</p>
                            <p className="mt-1 text-xs font-medium text-[color:var(--text-muted)]">
                              {assessmentEntryMode === "PER_SUBJECT"
                                ? row.a1Max || row.a2Max || row.examMax
                                  ? `${row.a1Max ?? "--"} / ${row.a2Max ?? "--"} / ${row.examMax ?? "--"}`
                                  : "No score limits"
                                : row.examMax
                                  ? `Exam / ${row.examMax}`
                                  : "Exam score"}
                            </p>
                          </div>
                        </td>
                        {assessmentEntryMode === "PER_SUBJECT" ? (
                          <>
                        <td className="px-4 py-4">
                          {renderScoreInput(row.id, "a1", row.a1, row.a1Max, cellBase)}
                        </td>
                        <td className="px-4 py-4">
                          {renderScoreInput(
                            row.id,
                            "a2",
                            row.a2,
                            row.a2Max,
                            cellBase + 1,
                          )}
                        </td>
                          </>
                        ) : null}
                        <td className="px-4 py-4">
                          {renderScoreInput(
                            row.id,
                            "exam",
                            row.exam,
                            row.examMax,
                            cellBase +
                              (assessmentEntryMode === "PER_SUBJECT" ? 2 : 0),
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="soft-action-tint inline-flex min-w-12 items-center justify-center rounded-full px-3 py-1 font-medium">
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

        <div className="surface-pocket mt-4 grid gap-3 rounded-[24px] p-3 sm:mt-5 sm:grid-cols-[1fr_0.42fr] sm:gap-4 sm:p-4">
          <div className="soft-action rounded-[22px] px-4 py-4 sm:px-5 sm:py-5">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
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
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
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
                disabled={isPending || reportStatus === "LOCKED"}
                className="soft-action-tint col-span-2 rounded-full px-4 py-2 text-sm font-medium sm:col-span-1"
              >
                Publish
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {reportStatus === "LOCKED" ? (
                <>
                  <button
                    type="button"
                    onClick={handleRestore}
                    disabled={isPending}
                    className="soft-action-tint rounded-full px-4 py-2 text-sm font-medium"
                  >
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => setHardDeleteConfirmOpen(true)}
                    disabled={isPending}
                    className="rounded-full bg-[color:var(--danger-soft)] px-4 py-2 text-sm font-medium text-[color:var(--danger)]"
                  >
                    Delete permanently
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="rounded-full bg-[color:var(--danger-soft)] px-4 py-2 text-sm font-medium text-[color:var(--danger)]"
                >
                  Remove
                </button>
              )}
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
            [
              assessmentEntryMode === "AGGREGATE_TOTALS"
                ? "First test total"
                : "A1 total",
              String(summary.assessment1Total),
            ],
            [
              assessmentEntryMode === "AGGREGATE_TOTALS"
                ? "Second test total"
                : "A2 total",
              String(summary.assessment2Total),
            ],
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
            {reportStatus === "LOCKED"
              ? "This archived report can be reviewed or restored."
              : hasEnteredScores
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
            <p className="text-sm font-medium text-[color:var(--text-strong)]">
              {summary.grandTotal} total
            </p>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">
              Position {position}
            </p>
          </div>
        }
      />

      <ConfirmSurface
        open={hardDeleteConfirmOpen}
        onClose={() => setHardDeleteConfirmOpen(false)}
        onConfirm={handleDeleteArchived}
        busy={isPending}
        title="Delete archived report"
        description="This permanently removes the archived sheet and its saved row data. This action cannot be reversed."
        confirmLabel="Delete permanently"
        dangerLabel="Permanent delete"
        supportingContent={
          <div className="rounded-[22px] surface-pocket px-4 py-4">
            <p className="text-sm font-medium text-[color:var(--text-strong)]">
              {summary.grandTotal} total
            </p>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">
              Archived sheet for {reportId.replace(/-/g, " ")}
            </p>
          </div>
        }
      />
    </div>
  );
}
