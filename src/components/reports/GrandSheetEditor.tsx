"use client";

import {
  ArrowPathIcon,
  CheckCircleIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";

import grandSheetData from "@/data/primary3GreyGrandSheet.json";

type Subject = {
  key: string;
  label: string;
  shortLabel: string;
  max: number;
};

type GrandSheetRow = {
  id: string;
  name: string;
  admissionNumber: string;
  scores: Record<string, string>;
  firstTest: string;
  secondTest: string;
};

const STORAGE_KEY = "report-card-studio:primary-3-grey-grand-sheet:v2";

const subjects: Subject[] = [
  { key: "mathematics", label: "Mathematics", shortLabel: "Maths", max: 60 },
  { key: "grammar", label: "Grammar", shortLabel: "Grammar", max: 60 },
  { key: "composition", label: "Composition", shortLabel: "Compo.", max: 20 },
  { key: "comprehension", label: "Comprehension", shortLabel: "Compre.", max: 20 },
  { key: "spelling", label: "Spelling & Dictation", shortLabel: "Spell.", max: 30 },
  { key: "oralReading", label: "Oral Reading", shortLabel: "Oral", max: 20 },
  { key: "writing", label: "Writing", shortLabel: "Writing", max: 20 },
  { key: "socialStudies", label: "Social Studies", shortLabel: "Social", max: 40 },
  { key: "science", label: "Science", shortLabel: "Science", max: 30 },
  { key: "healthEducation", label: "Health Education", shortLabel: "Health", max: 40 },
  { key: "religion", label: "Religion", shortLabel: "Religion", max: 20 },
  { key: "verbal", label: "Verbal Reasoning", shortLabel: "Verbal", max: 20 },
  { key: "quantitative", label: "Quantitative Reasoning", shortLabel: "Quant.", max: 20 },
  { key: "computer", label: "Computer", shortLabel: "Computer", max: 30 },
  { key: "poetry", label: "Poetry", shortLabel: "Poetry", max: 20 },
  { key: "history", label: "History", shortLabel: "History", max: 30 },
  { key: "civic", label: "Civic Education", shortLabel: "Civic", max: 30 },
  { key: "creativeArt", label: "Creative Art", shortLabel: "C. Art", max: 30 },
];

function emptyScores() {
  return Object.fromEntries(subjects.map((subject) => [subject.key, ""]));
}

function makeRow(index: number, name = ""): GrandSheetRow {
  return {
    id: `pupil-${index + 1}`,
    name,
    admissionNumber: "",
    scores: emptyScores(),
    firstTest: "",
    secondTest: "",
  };
}

const initialRows: GrandSheetRow[] = grandSheetData.map((row) => ({
  ...row,
  scores: {
    ...emptyScores(),
    ...row.scores,
  },
}));

function numericValue(value: string) {
  const parsed = Number(value);
  return value.trim() === "" || !Number.isFinite(parsed) ? 0 : parsed;
}

function hasValue(value: string) {
  return value.trim() !== "";
}

function isValidMark(value: string, max: number) {
  if (!hasValue(value)) return false;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= max;
}

function ordinal(value: number) {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${value}th`;
  if (value % 10 === 1) return `${value}st`;
  if (value % 10 === 2) return `${value}nd`;
  if (value % 10 === 3) return `${value}rd`;
  return `${value}th`;
}

function remarkFor(percentage: number) {
  if (percentage >= 80) return "Excellent";
  if (percentage >= 70) return "Very Good";
  if (percentage >= 60) return "Good";
  if (percentage >= 50) return "Credit";
  if (percentage >= 40) return "Pass";
  return "Needs Improvement";
}

function normalizeStoredRows(value: unknown): GrandSheetRow[] | null {
  if (!Array.isArray(value)) return null;

  const rows = value.filter(
    (row): row is Partial<GrandSheetRow> =>
      typeof row === "object" && row !== null,
  );

  if (!rows.length) return null;

  return rows.map((row, index) => ({
    id: typeof row.id === "string" ? row.id : `pupil-${index + 1}`,
    name: typeof row.name === "string" ? row.name : "",
    admissionNumber:
      typeof row.admissionNumber === "string" ? row.admissionNumber : "",
    scores: Object.fromEntries(
      subjects.map((subject) => [
        subject.key,
        typeof row.scores?.[subject.key] === "string"
          ? row.scores[subject.key]
          : "",
      ]),
    ),
    firstTest: typeof row.firstTest === "string" ? row.firstTest : "",
    secondTest: typeof row.secondTest === "string" ? row.secondTest : "",
  }));
}

export function GrandSheetEditor() {
  const [rows, setRows] = useState<GrandSheetRow[]>(initialRows);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const restored = normalizeStoredRows(JSON.parse(stored));
        if (restored) setRows(restored);
      }
    } catch {
      // A damaged local draft should never block the editor.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }, [hydrated, rows]);

  const computedRows = useMemo(
    () =>
      rows.map((row) => {
        const enteredSubjectCount = subjects.filter((subject) =>
          hasValue(row.scores[subject.key]),
        ).length;
        const examTotal = subjects.reduce(
          (total, subject) => total + numericValue(row.scores[subject.key]),
          0,
        );
        const hasAssessment =
          enteredSubjectCount > 0 ||
          hasValue(row.firstTest) ||
          hasValue(row.secondTest);
        const testTotal =
          numericValue(row.firstTest) + numericValue(row.secondTest);
        const grandTotal = examTotal + testTotal;
        const percentage = (grandTotal / 800) * 100;
        const invalidScoreCount = subjects.filter(
          (subject) =>
            hasValue(row.scores[subject.key]) &&
            !isValidMark(row.scores[subject.key], subject.max),
        ).length;
        const invalidTestCount = [
          [row.firstTest, 130],
          [row.secondTest, 130],
        ].filter(
          ([value, max]) =>
            hasValue(String(value)) &&
            !isValidMark(String(value), Number(max)),
        ).length;
        const assessmentComplete =
          enteredSubjectCount === subjects.length &&
          hasValue(row.firstTest) &&
          hasValue(row.secondTest) &&
          invalidScoreCount + invalidTestCount === 0;

        return {
          ...row,
          enteredSubjectCount,
          examTotal,
          testTotal,
          grandTotal,
          percentage,
          hasAssessment,
          invalidCount: invalidScoreCount + invalidTestCount,
          assessmentComplete,
          complete:
            Boolean(row.name.trim()) &&
            Boolean(row.admissionNumber.trim()) &&
            assessmentComplete,
        };
      }),
    [rows],
  );

  const rankedTotals = useMemo(
    () =>
      computedRows
        .filter((row) => row.assessmentComplete)
        .map((row) => row.grandTotal)
        .sort((left, right) => right - left),
    [computedRows],
  );

  const completeCount = computedRows.filter((row) => row.complete).length;
  const issueCount = computedRows.reduce(
    (total, row) => total + row.invalidCount,
    0,
  );

  function updateRow(
    id: string,
    patch: Partial<Omit<GrandSheetRow, "id" | "scores">>,
  ) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  function updateScore(id: string, subjectKey: string, value: string) {
    setRows((current) =>
      current.map((row) =>
        row.id === id
          ? { ...row, scores: { ...row.scores, [subjectKey]: value } }
          : row,
      ),
    );
  }

  function addRow() {
    setRows((current) => [
      ...current,
      {
        ...makeRow(current.length, ""),
        id: `pupil-${Date.now()}`,
      },
    ]);
  }

  function removeRow(id: string) {
    setRows((current) => current.filter((row) => row.id !== id));
  }

  function resetSheet() {
    if (
      window.confirm(
        "Reset this local draft to the photographed pupil list? All entered marks and corrections on this device will be cleared.",
      )
    ) {
      setRows(initialRows);
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <section className="frost-panel rounded-[24px] px-3 py-3 sm:rounded-[28px] sm:px-5 sm:py-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            <span className="surface-chip rounded-full px-3 py-2 text-xs font-semibold text-[color:var(--text-strong)]">
              {rows.length} pupils
            </span>
            <span className="mood-badge-success rounded-full px-3 py-2 text-xs font-semibold">
              {completeCount} complete
            </span>
            <span
              className={`rounded-full px-3 py-2 text-xs font-semibold ${
                issueCount
                  ? "mood-badge-warning"
                  : "surface-chip text-[color:var(--text-muted)]"
              }`}
            >
              {issueCount ? `${issueCount} marks need review` : "No score errors"}
            </span>
            <span className="surface-chip rounded-full px-3 py-2 text-xs font-medium text-[color:var(--text-muted)]">
              Autosaved on this device
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetSheet}
              className="soft-action rounded-full px-3.5 py-2 text-sm font-medium"
            >
              <ArrowPathIcon className="mr-2 h-4 w-4" />
              Reset draft
            </button>
            <button
              type="button"
              onClick={addRow}
              className="soft-action-tint rounded-full px-3.5 py-2 text-sm font-semibold"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add pupil
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-[color:var(--text-muted)]">
          Enter the two test totals and the 18 exam marks. Exam total, grand
          total, percentage, position, and remark update automatically. This
          working sheet is not connected to the school database.
        </p>
      </section>

      <section className="frost-panel-strong overflow-hidden rounded-[24px] sm:rounded-[30px]">
        <div className="border-b border-[color:var(--border-soft)] px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
                Primary 3 Grey
              </p>
              <h2 className="mt-1 font-display text-2xl text-[color:var(--text-strong)] sm:text-3xl">
                Third Term Examination
              </h2>
            </div>
            <p className="text-sm text-[color:var(--text-muted)]">
              2025/2026 session · Maximum 800
            </p>
          </div>
        </div>

        <div className="grand-sheet-scroll overflow-x-auto pb-2">
          <table className="grand-sheet-table w-max min-w-full border-separate border-spacing-0 text-xs">
            <thead>
              <tr className="table-head text-[color:var(--text-muted)]">
                <th
                  rowSpan={2}
                  className="grand-sheet-sticky grand-sheet-number left-0 z-[8] w-11 min-w-11 border-b border-r border-[color:var(--border-soft)] px-2 py-3 text-center font-semibold"
                >
                  S/N
                </th>
                <th
                  rowSpan={2}
                  className="grand-sheet-sticky grand-sheet-name left-11 z-[8] w-52 min-w-52 border-b border-r border-[color:var(--border-soft)] px-3 py-3 text-left font-semibold"
                >
                  Name of pupil
                </th>
                <th
                  rowSpan={2}
                  className="w-28 min-w-28 border-b border-r border-[color:var(--border-soft)] px-2 py-3 text-left font-semibold"
                >
                  Admission no.
                </th>
                <th
                  colSpan={subjects.length}
                  className="border-b border-r border-[color:var(--border-soft)] px-3 py-2 text-center font-semibold"
                >
                  Examination subjects
                </th>
                <th
                  colSpan={8}
                  className="border-b border-[color:var(--border-soft)] px-3 py-2 text-center font-semibold"
                >
                  Summary
                </th>
                <th
                  rowSpan={2}
                  aria-label="Row actions"
                  className="w-12 min-w-12 border-b border-l border-[color:var(--border-soft)]"
                />
              </tr>
              <tr className="table-head text-[color:var(--text-muted)]">
                {subjects.map((subject) => (
                  <th
                    key={subject.key}
                    title={subject.label}
                    className="w-16 min-w-16 border-b border-r border-[color:var(--border-soft)] px-1 py-2 text-center font-semibold"
                  >
                    <span className="block truncate">{subject.shortLabel}</span>
                    <span className="mt-1 block text-[10px] font-normal opacity-75">
                      /{subject.max}
                    </span>
                  </th>
                ))}
                {[
                  ["First Test", "130"],
                  ["Second Test", "130"],
                  ["Exam Total", "540"],
                  ["Test Total", "260"],
                  ["Grand Total", "800"],
                  ["Percentage", "100"],
                  ["Position", ""],
                  ["Remark", ""],
                ].map(([label, max]) => (
                  <th
                    key={label}
                    className={`border-b border-r border-[color:var(--border-soft)] px-1 py-2 text-center font-semibold ${
                      label === "Remark" ? "w-28 min-w-28" : "w-16 min-w-16"
                    }`}
                  >
                    <span className="block">{label}</span>
                    {max ? (
                      <span className="mt-1 block text-[10px] font-normal opacity-75">
                        /{max}
                      </span>
                    ) : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {computedRows.map((row, rowIndex) => {
                const positionIndex = rankedTotals.indexOf(row.grandTotal);
                const position =
                  row.assessmentComplete &&
                  positionIndex >= 0
                    ? ordinal(positionIndex + 1)
                    : "—";

                return (
                  <tr
                    key={row.id}
                    className="group bg-[color:var(--surface)] even:bg-[color:var(--table-row-odd)] hover:bg-[color:var(--surface-muted)]"
                  >
                    <td className="grand-sheet-sticky grand-sheet-number left-0 z-[5] border-b border-r border-[color:var(--border-soft)] px-2 py-1.5 text-center font-semibold text-[color:var(--text-muted)]">
                      {rowIndex + 1}
                    </td>
                    <td className="grand-sheet-sticky grand-sheet-name left-11 z-[5] border-b border-r border-[color:var(--border-soft)] p-1">
                      <input
                        aria-label={`Pupil ${rowIndex + 1} name`}
                        value={row.name}
                        onChange={(event) =>
                          updateRow(row.id, { name: event.target.value })
                        }
                        className="grand-sheet-input w-full min-w-0 rounded-md px-2 py-2 font-semibold text-[color:var(--text-strong)] outline-none"
                      />
                    </td>
                    <td className="border-b border-r border-[color:var(--border-soft)] p-1">
                      <input
                        aria-label={`${row.name || `Pupil ${rowIndex + 1}`} admission number`}
                        value={row.admissionNumber}
                        onChange={(event) =>
                          updateRow(row.id, {
                            admissionNumber: event.target.value,
                          })
                        }
                        className="grand-sheet-input w-full rounded-md px-2 py-2 text-[color:var(--text-base)] outline-none"
                      />
                    </td>
                    {subjects.map((subject) => {
                      const value = row.scores[subject.key];
                      const invalid =
                        hasValue(value) &&
                        !isValidMark(value, subject.max);

                      return (
                        <td
                          key={subject.key}
                          className="border-b border-r border-[color:var(--border-soft)] p-1"
                        >
                          <input
                            aria-label={`${row.name || `Pupil ${rowIndex + 1}`} ${subject.label}, maximum ${subject.max}`}
                            inputMode="numeric"
                            value={value}
                            onChange={(event) =>
                              updateScore(
                                row.id,
                                subject.key,
                                event.target.value,
                              )
                            }
                            className={`grand-sheet-input w-full rounded-md px-1 py-2 text-center font-medium outline-none ${
                              invalid
                                ? "grand-sheet-input-error text-[color:var(--danger)]"
                                : "text-[color:var(--text-strong)]"
                            }`}
                          />
                        </td>
                      );
                    })}
                    {[
                      ["firstTest", row.firstTest, 130],
                      ["secondTest", row.secondTest, 130],
                    ].map(([field, value, max]) => {
                      const stringValue = String(value);
                      const invalid =
                        hasValue(stringValue) &&
                        !isValidMark(stringValue, Number(max));

                      return (
                        <td
                          key={String(field)}
                          className="border-b border-r border-[color:var(--border-soft)] p-1"
                        >
                          <input
                            aria-label={`${row.name || `Pupil ${rowIndex + 1}`} ${
                              field === "firstTest" ? "first" : "second"
                            } test total, maximum ${max}`}
                            inputMode="numeric"
                            value={stringValue}
                            onChange={(event) =>
                              updateRow(row.id, {
                                [field]: event.target.value,
                              })
                            }
                            className={`grand-sheet-input w-full rounded-md px-1 py-2 text-center font-medium outline-none ${
                              invalid
                                ? "grand-sheet-input-error text-[color:var(--danger)]"
                                : "text-[color:var(--text-strong)]"
                            }`}
                          />
                        </td>
                      );
                    })}
                    <td className="grand-sheet-computed border-b border-r border-[color:var(--border-soft)] px-2 py-2 text-center font-semibold">
                      {row.hasAssessment ? row.examTotal : "—"}
                    </td>
                    <td className="grand-sheet-computed border-b border-r border-[color:var(--border-soft)] px-2 py-2 text-center font-semibold">
                      {row.hasAssessment ? row.testTotal : "—"}
                    </td>
                    <td className="grand-sheet-computed border-b border-r border-[color:var(--border-soft)] px-2 py-2 text-center font-semibold text-[color:var(--text-strong)]">
                      {row.hasAssessment ? row.grandTotal : "—"}
                    </td>
                    <td className="grand-sheet-computed border-b border-r border-[color:var(--border-soft)] px-2 py-2 text-center font-semibold">
                      {row.hasAssessment
                        ? row.percentage.toFixed(1)
                        : "—"}
                    </td>
                    <td className="grand-sheet-computed border-b border-r border-[color:var(--border-soft)] px-2 py-2 text-center font-semibold">
                      {position}
                    </td>
                    <td className="grand-sheet-computed border-b border-r border-[color:var(--border-soft)] px-2 py-2 text-center font-medium">
                      {row.assessmentComplete
                        ? remarkFor(row.percentage)
                        : "—"}
                    </td>
                    <td className="border-b border-[color:var(--border-soft)] px-1 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        aria-label={`Remove ${row.name || `pupil ${rowIndex + 1}`}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--text-muted)] opacity-40 transition hover:bg-[color:var(--danger-soft)] hover:text-[color:var(--danger)] hover:opacity-100 focus:opacity-100"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="table-head font-semibold text-[color:var(--text-muted)]">
                <td className="grand-sheet-sticky grand-sheet-number left-0 z-[6] border-r border-t border-[color:var(--border-soft)]" />
                <td className="grand-sheet-sticky grand-sheet-name left-11 z-[6] border-r border-t border-[color:var(--border-soft)] px-3 py-3">
                  Maximum marks
                </td>
                <td
                  colSpan={1}
                  className="border-r border-t border-[color:var(--border-soft)]"
                />
                {subjects.map((subject) => (
                  <td
                    key={subject.key}
                    className="border-r border-t border-[color:var(--border-soft)] px-1 py-3 text-center"
                  >
                    {subject.max}
                  </td>
                ))}
                {[130, 130, 540, 260, 800, 100, "—", "—"].map((value, index) => (
                  <td
                    key={`${value}-${index}`}
                    className="border-r border-t border-[color:var(--border-soft)] px-1 py-3 text-center"
                  >
                    {value}
                  </td>
                ))}
                <td className="border-t border-[color:var(--border-soft)]" />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section className="quiet-note flex items-start gap-3 rounded-[22px] px-4 py-3 text-sm text-[color:var(--text-muted)]">
        <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--success)]" />
        <p className="leading-5">
          A pupil is marked complete only when name, admission number, both
          test totals, and all 18 exam marks are present and within their
          maximums.
        </p>
      </section>
    </div>
  );
}
