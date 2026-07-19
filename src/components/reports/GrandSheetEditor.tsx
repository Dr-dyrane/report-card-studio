"use client";

import {
  ArrowPathIcon,
  ArrowUpTrayIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  DocumentDuplicateIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  PlusIcon,
  SparklesIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import { createReportsFromGrandSheet } from "@/app/(workspace)/reports/actions";
import { useFeedback } from "@/components/feedback/FeedbackProvider";
import grandSheetData from "@/data/primary3GreyGrandSheet.json";
import {
  GRAND_SHEET_SUBJECTS,
  grandSheetRemark,
  type GrandSheetRowInput,
} from "@/lib/grand-sheet";

type GrandSheetRow = GrandSheetRowInput;

type ClassroomOption = {
  id: string;
  name: string;
  studentCount: number;
};

type TermOption = {
  id: string;
  name: string;
  sessionName: string;
  isActive: boolean;
};

type ScanResult = {
  className?: string | null;
  academicSessionName?: string | null;
  termName?: string | null;
  rows: GrandSheetRow[];
  warnings?: string[];
};

type GeneratedReport = {
  href: string;
  label: string;
};

type ActiveCell = {
  rowIndex: number;
  columnIndex: number;
  label: string;
  cellRef: string;
  max?: number;
};

const STORAGE_KEY = "report-card-studio:primary-3-grey-grand-sheet:v3";
const subjects = GRAND_SHEET_SUBJECTS;

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

function performanceTone(percentage: number) {
  if (percentage >= 80) return "excellent";
  if (percentage >= 70) return "very-good";
  if (percentage >= 60) return "good";
  if (percentage >= 50) return "credit";
  if (percentage >= 40) return "pass";
  return "needs-improvement";
}

function excelColumn(value: number) {
  let column = value;
  let label = "";

  while (column > 0) {
    const remainder = (column - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    column = Math.floor((column - 1) / 26);
  }

  return label;
}

function gridCellRef(rowIndex: number, columnIndex: number) {
  return `${excelColumn(columnIndex + 2)}${rowIndex + 5}`;
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

export function GrandSheetEditor({
  classrooms,
  terms,
  defaultTermId,
}: {
  classrooms: ClassroomOption[];
  terms: TermOption[];
  defaultTermId: string;
}) {
  const router = useRouter();
  const { notify } = useFeedback();
  const [rows, setRows] = useState<GrandSheetRow[]>(initialRows);
  const [hydrated, setHydrated] = useState(false);
  const [activeCell, setActiveCell] = useState<ActiveCell | null>(null);
  const [selectedClassroomId, setSelectedClassroomId] = useState(
    classrooms.find((classroom) => /primary 3 gr[ae]y/i.test(classroom.name))?.id ??
      classrooms[0]?.id ??
      "",
  );
  const [selectedTermId, setSelectedTermId] = useState(
    defaultTermId ||
      terms.find((term) => term.isActive)?.id ||
      terms[0]?.id ||
      "",
  );
  const [scanPreviewUrl, setScanPreviewUrl] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanStatus, setScanStatus] = useState("Choose a clear photo");
  const [isScanning, setIsScanning] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [isPending, startTransition] = useTransition();

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

  const requiredSubjectKeys = useMemo(
    () =>
      new Set(
        subjects
          .filter((subject) =>
            rows.some((row) => hasValue(row.scores[subject.key])),
          )
          .map((subject) => subject.key),
      ),
    [rows],
  );

  const computedRows = useMemo(
    () =>
      rows.map((row) => {
        const enteredSubjectCount = subjects.filter(
          (subject) =>
            requiredSubjectKeys.has(subject.key) &&
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
          enteredSubjectCount === requiredSubjectKeys.size &&
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
        };
      }),
    [requiredSubjectKeys, rows],
  );

  const rankedTotals = useMemo(
    () =>
      computedRows
        .filter((row) => row.assessmentComplete)
        .map((row) => row.grandTotal)
        .sort((left, right) => right - left),
    [computedRows],
  );

  const savableCount = computedRows.filter(
    (row) =>
      Boolean(row.name.trim()) &&
      Boolean(row.admissionNumber.trim()) &&
      row.invalidCount === 0,
  ).length;
  const issueCount = computedRows.reduce(
    (total, row) => total + row.invalidCount,
    0,
  );
  const missingCount = rows.reduce(
    (total, row) =>
      total +
      (row.name.trim() ? 0 : 1) +
      (row.admissionNumber.trim() ? 0 : 1) +
      subjects.filter(
        (subject) =>
          requiredSubjectKeys.has(subject.key) &&
          !hasValue(row.scores[subject.key]),
      ).length +
      (hasValue(row.firstTest) ? 0 : 1) +
      (hasValue(row.secondTest) ? 0 : 1),
    0,
  );
  const activePupil = activeCell ? rows[activeCell.rowIndex] : null;
  const destinationClassroom = classrooms.find(
    (classroom) => classroom.id === selectedClassroomId,
  );
  const destinationTerm = terms.find((term) => term.id === selectedTermId);

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
      setGeneratedReports([]);
    }
  }

  function handleGrandSheetFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setScanResult(null);
    setGeneratedReports([]);

    if (!file) {
      setScanPreviewUrl(null);
      setScanStatus("Choose a clear photo");
      return;
    }

    if (file.size > 15_000_000) {
      notify("Use an image smaller than 15 MB.", "error");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setScanPreviewUrl(typeof reader.result === "string" ? reader.result : null);
      setScanStatus("Photo ready to scan");
    };
    reader.readAsDataURL(file);
  }

  async function analyzeGrandSheet() {
    if (!scanPreviewUrl) {
      notify("Choose a grand-sheet photo first.", "error");
      return;
    }

    setIsScanning(true);
    setScanStatus("Reading pupil rows...");

    try {
      const response = await fetch("/api/vision/grand-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: scanPreviewUrl }),
      });
      const payload = (await response.json()) as
        | ScanResult
        | { error?: string };

      if (!response.ok || ("error" in payload && payload.error)) {
        const message =
          "error" in payload && payload.error
            ? payload.error
            : "The grand-sheet scan did not complete.";
        setScanStatus("Scan needs another try");
        notify(message, "error");
        return;
      }

      const result = payload as ScanResult;
      setScanResult(result);
      setScanStatus(`${result.rows.length} pupil rows found`);

      if (result.className) {
        const detectedClass = classrooms.find(
          (classroom) =>
            classroom.name.toLowerCase().replace(/gray/g, "grey") ===
            result.className?.toLowerCase().replace(/gray/g, "grey"),
        );
        if (detectedClass) setSelectedClassroomId(detectedClass.id);
      }
      if (result.termName) {
        const detectedTerm = terms.find(
          (term) =>
            term.name.toLowerCase() === result.termName?.toLowerCase() &&
            (!result.academicSessionName ||
              term.sessionName.toLowerCase() ===
                result.academicSessionName.toLowerCase()),
        );
        if (detectedTerm) setSelectedTermId(detectedTerm.id);
      }

      notify("Scan ready. Review it before replacing the draft.", "success");
    } catch {
      setScanStatus("Scan needs another try");
      notify("The grand-sheet scan did not complete.", "error");
    } finally {
      setIsScanning(false);
    }
  }

  function applyScannedRows() {
    if (!scanResult?.rows.length) return;

    const shouldReplace = window.confirm(
      `Replace the current local draft with ${scanResult.rows.length} scanned pupil rows? You can review and correct every cell before creating reports.`,
    );
    if (!shouldReplace) return;

    setRows(scanResult.rows);
    setGeneratedReports([]);
    setActiveCell(null);
    setScanStatus("Scan applied to the review sheet");
    notify("Scanned rows added. Review blanks and highlighted issues.", "success");
  }

  function createStudentReports() {
    if (!selectedClassroomId) {
      notify("Choose the class first.", "error");
      return;
    }
    if (!selectedTermId) {
      notify("Choose the session and term first.", "error");
      return;
    }

    if (!savableCount) {
      notify("Add a valid pupil name and admission number first.", "error");
      return;
    }

    const savableIds = new Set(
      computedRows
        .filter(
          (row) =>
            Boolean(row.name.trim()) &&
            Boolean(row.admissionNumber.trim()) &&
            row.invalidCount === 0,
        )
        .map((row) => row.id),
    );
    const rowsToCreate = rows.filter((row) => savableIds.has(row.id));
    const selectedClassroom = classrooms.find(
      (classroom) => classroom.id === selectedClassroomId,
    );
    const shouldCreate = window.confirm(
      `Create or update ${rowsToCreate.length} report sheets in ${
        selectedClassroom?.name ?? "the selected class"
      }? Rows with blank marks will open as report drafts for later correction.`,
    );
    if (!shouldCreate) return;

    startTransition(async () => {
      const result = await createReportsFromGrandSheet({
        classroomId: selectedClassroomId,
        termId: selectedTermId,
        rows: rowsToCreate,
      });

      if (!result.ok) {
        notify(result.message, "error");
        return;
      }

      setGeneratedReports(result.reports ?? []);
      notify(result.message, "success");
      router.refresh();
    });
  }

  function focusCell(
    rowIndex: number,
    columnIndex: number,
    label: string,
    max?: number,
  ) {
    setActiveCell({
      rowIndex,
      columnIndex,
      label,
      cellRef: gridCellRef(rowIndex, columnIndex),
      max,
    });
  }

  function focusGridInput(rowIndex: number, columnIndex: number) {
    const input = document.querySelector<HTMLInputElement>(
      `[data-grand-cell="${rowIndex}-${columnIndex}"]`,
    );
    input?.focus();
    input?.select();
  }

  function handleGridKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    columnIndex: number,
  ) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const nextRow = rowIndex + (event.shiftKey ? -1 : 1);
    if (nextRow >= 0 && nextRow < rows.length) {
      focusGridInput(nextRow, columnIndex);
    }
  }

  function focusNextIssue() {
    for (const [rowIndex, row] of rows.entries()) {
      if (!row.name.trim()) {
        focusGridInput(rowIndex, 0);
        return;
      }
      if (!row.admissionNumber.trim()) {
        focusGridInput(rowIndex, 1);
        return;
      }

      for (const [subjectIndex, subject] of subjects.entries()) {
        if (!requiredSubjectKeys.has(subject.key)) continue;
        if (!isValidMark(row.scores[subject.key], subject.max)) {
          focusGridInput(rowIndex, subjectIndex + 2);
          return;
        }
      }

      if (!isValidMark(row.firstTest, 130)) {
        focusGridInput(rowIndex, 20);
        return;
      }
      if (!isValidMark(row.secondTest, 130)) {
        focusGridInput(rowIndex, 21);
        return;
      }
    }
  }

  function cellClass(rowIndex: number, columnIndex: number) {
    const activeRow = activeCell?.rowIndex === rowIndex;
    const activeColumn = activeCell?.columnIndex === columnIndex;
    return [
      activeColumn ? "grand-sheet-active-column" : "",
      activeRow && activeColumn ? "grand-sheet-active-cell" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  return (
    <div className="space-y-2.5">
      <section className="frost-panel-strong relative z-20 rounded-[30px] p-2 sm:p-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/reports"
            aria-label="Back to reports"
            className="soft-action compact-action inline-flex h-9 w-9 shrink-0 justify-center rounded-[14px]"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Link>

          <div className="flex min-w-[12rem] flex-1 items-center gap-2.5 px-1">
            <span className="soft-action-tint inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px]">
              <DocumentDuplicateIcon className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-medium text-[color:var(--text-strong)]">
                Grand sheet
              </h1>
              <p className="truncate text-xs text-[color:var(--text-muted)]">
                {rows.length} pupils · {savableCount} ready
                {issueCount || missingCount
                  ? ` · ${issueCount + missingCount} to review`
                  : " · no issues"}
              </p>
            </div>
          </div>

          {issueCount || missingCount ? (
            <button
              type="button"
              onClick={focusNextIssue}
              className="mood-badge-warning compact-action inline-flex items-center rounded-[14px] px-3 text-xs font-medium"
            >
              Review next
            </button>
          ) : null}

          <details className="grand-sheet-popover relative">
            <summary className="soft-action compact-action cursor-pointer list-none rounded-[14px] px-3 text-xs font-medium">
              <span className="max-w-32 truncate">
                {destinationClassroom?.name ?? "Destination"}
              </span>
              <ChevronDownIcon className="ml-1.5 h-3.5 w-3.5" />
            </summary>
            <div className="surface-enter frost-panel-strong absolute right-0 z-30 mt-2 grid w-[min(28rem,calc(100vw-2rem))] gap-2 rounded-[24px] p-3 shadow-[var(--shadow-2)] sm:grid-cols-2">
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-[color:var(--text-strong)]">
                  Report destination
                </p>
                <p className="mt-0.5 text-xs text-[color:var(--text-muted)]">
                  Choose where these reviewed rows should update.
                </p>
              </div>
              <select
                aria-label="Report class"
                value={selectedClassroomId}
                onChange={(event) => {
                  setSelectedClassroomId(event.target.value);
                  setGeneratedReports([]);
                }}
                className="surface-input compact-action rounded-[14px] px-3 text-sm font-normal text-[color:var(--text-strong)] outline-none"
              >
                <option value="">Choose a class</option>
                {classrooms.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name} · {classroom.studentCount} pupils
                  </option>
                ))}
              </select>
              <select
                aria-label="Report session and term"
                value={selectedTermId}
                onChange={(event) => {
                  setSelectedTermId(event.target.value);
                  setGeneratedReports([]);
                }}
                className="surface-input compact-action rounded-[14px] px-3 text-sm font-normal text-[color:var(--text-strong)] outline-none"
              >
                <option value="">Choose a term</option>
                {terms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.sessionName} · {term.name}
                    {term.isActive ? " · Active" : ""}
                  </option>
                ))}
              </select>
            </div>
          </details>

          <details className="grand-sheet-popover relative">
            <summary className="soft-action compact-action cursor-pointer list-none rounded-[14px] px-3 text-xs font-medium">
              <ArrowUpTrayIcon className="mr-1.5 h-4 w-4" />
              Scan
            </summary>
            <div className="surface-enter frost-panel-strong absolute right-0 z-30 mt-2 w-[min(25rem,calc(100vw-2rem))] rounded-[24px] p-3 shadow-[var(--shadow-2)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[color:var(--text-strong)]">
                    Scan or replace
                  </p>
                  <p className="mt-0.5 text-xs text-[color:var(--text-muted)]">
                    Use a straight, bright photo of the full sheet.
                  </p>
                </div>
                <span className="text-[11px] text-[color:var(--text-muted)]">
                  {scanStatus}
                </span>
              </div>

              {scanPreviewUrl ? (
                <div className="mt-3 grid grid-cols-[64px_1fr] gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={scanPreviewUrl}
                    alt="Grand-sheet scan preview"
                    className="h-16 w-16 rounded-[18px] object-cover"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={analyzeGrandSheet}
                      disabled={isScanning}
                      className="soft-action-tint compact-action rounded-[14px] px-3 text-xs font-medium disabled:opacity-60"
                    >
                      {isScanning ? "Reading..." : "Read rows"}
                    </button>
                    <label className="soft-action compact-action flex cursor-pointer items-center rounded-[14px] px-3 text-xs font-medium">
                      Replace photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleGrandSheetFile}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="soft-action-tint compact-action mt-3 flex cursor-pointer items-center justify-center rounded-[16px] px-3 text-sm font-medium">
                  <ArrowUpTrayIcon className="mr-2 h-4 w-4" />
                  Choose photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleGrandSheetFile}
                  />
                </label>
              )}

              {scanResult ? (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-[18px] bg-[color:var(--success-soft)] px-3 py-2">
                  <p className="text-xs text-[color:var(--text-strong)]">
                    {scanResult.rows.length} rows found
                    {scanResult.warnings?.length
                      ? ` · ${scanResult.warnings.length} need review`
                      : ""}
                  </p>
                  <button
                    type="button"
                    onClick={applyScannedRows}
                    className="compact-action rounded-[14px] bg-[color:var(--success)] px-3 text-xs font-medium text-white"
                  >
                    Use scan
                  </button>
                </div>
              ) : null}
            </div>
          </details>

          <details className="grand-sheet-popover relative">
            <summary
              aria-label="More grand sheet actions"
              className="soft-action compact-action inline-flex h-9 w-9 cursor-pointer list-none justify-center rounded-[14px]"
            >
              <EllipsisHorizontalIcon className="h-5 w-5" />
            </summary>
            <div className="surface-enter frost-panel-strong absolute right-0 z-30 mt-2 w-64 rounded-[24px] p-2 shadow-[var(--shadow-2)]">
              <button
                type="button"
                onClick={addRow}
                className="surface-hover-soft flex w-full items-center rounded-[16px] px-3 py-2 text-left text-sm"
              >
                <PlusIcon className="mr-2.5 h-4 w-4" />
                Add pupil
              </button>
              <button
                type="button"
                onClick={resetSheet}
                className="surface-hover-soft mt-1 flex w-full items-center rounded-[16px] px-3 py-2 text-left text-sm text-[color:var(--danger)]"
              >
                <ArrowPathIcon className="mr-2.5 h-4 w-4" />
                Reset local draft
              </button>
              <p className="px-3 pb-2 pt-3 text-xs leading-5 text-[color:var(--text-muted)]">
                Enter moves down. Totals, position, and remarks update automatically.
              </p>
            </div>
          </details>

          <button
            type="button"
            onClick={createStudentReports}
            disabled={
              isPending ||
              !selectedClassroomId ||
              !selectedTermId ||
              savableCount === 0
            }
            className="soft-action-tint compact-action rounded-[14px] px-3.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SparklesIcon className="mr-1.5 h-4 w-4" />
            {isPending ? "Updating..." : `Update ${savableCount}`}
          </button>
        </div>

        {generatedReports.length ? (
          <div className="mt-2 flex flex-wrap items-center gap-2 rounded-[20px] bg-[color:var(--accent-soft)] px-3 py-2">
            <p className="mr-auto text-xs text-[color:var(--text-strong)]">
              {generatedReports.length} reports updated
            </p>
            <Link
              href={generatedReports[0].href}
              className="compact-action inline-flex items-center rounded-[14px] bg-[color:var(--accent)] px-3 text-xs font-medium text-white"
            >
              <EyeIcon className="mr-1.5 h-4 w-4" />
              Open first
            </Link>
            <Link
              href="/reports"
              className="soft-action compact-action rounded-[14px] px-3 text-xs font-medium"
            >
              View all
            </Link>
          </div>
        ) : null}
      </section>

      <section className="frost-panel-strong overflow-hidden rounded-[30px] p-1.5 sm:p-2">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[color:var(--text-strong)]">
              {destinationClassroom?.name ?? "Primary 3 Grey"} ·{" "}
              {destinationTerm?.name ?? "Third Term"}
            </p>
            <p className="truncate text-xs text-[color:var(--text-muted)]">
              {destinationTerm?.sessionName ?? "2025/2026"} · Maximum 800
            </p>
          </div>
          <p
            className={`text-xs ${
              issueCount || missingCount
                ? "text-[color:var(--warning)]"
                : "text-[color:var(--success)]"
            }`}
          >
            {issueCount || missingCount
              ? `${issueCount + missingCount} items need attention`
              : "Ready to update"}
          </p>
        </div>

        {activeCell && activePupil ? (
          <div className="grand-sheet-locator mx-1 mb-1 flex min-h-10 items-center gap-2 rounded-[16px] px-3 py-1.5">
            <span className="rounded-[10px] bg-[color:var(--accent-soft)] px-2 py-1 font-mono text-[11px] font-medium text-[color:var(--accent-strong)]">
              {activeCell.cellRef}
            </span>
            <p className="min-w-0 flex-1 truncate text-xs text-[color:var(--text-strong)]">
              <span className="font-medium">
                {activePupil.name || `Pupil ${activeCell.rowIndex + 1}`}
              </span>
              <span className="text-[color:var(--text-muted)]">
                {" "}
                · {activeCell.label}
                {activeCell.max ? ` · max ${activeCell.max}` : ""}
              </span>
            </p>
            <span className="hidden text-[11px] text-[color:var(--text-muted)] sm:block">
              Enter ↓ · Shift Enter ↑
            </span>
          </div>
        ) : null}

        <div className="grand-sheet-scroll overflow-x-auto rounded-[24px] bg-[color:var(--surface)] pb-1">
          <table className="grand-sheet-table w-max min-w-full border-collapse text-xs">
            <thead>
              <tr className="table-head text-[color:var(--text-muted)]">
                <th
                  rowSpan={2}
                  className="grand-sheet-sticky grand-sheet-number left-0 z-[8] w-11 min-w-11 px-2 py-2.5 text-center font-medium"
                >
                  S/N
                </th>
                <th
                  rowSpan={2}
                  className={`grand-sheet-sticky grand-sheet-name left-11 z-[8] w-52 min-w-52 px-3 py-2.5 text-left font-medium ${
                    activeCell?.columnIndex === 0 ? "grand-sheet-active-header" : ""
                  }`}
                >
                  Name of pupil
                </th>
                <th
                  rowSpan={2}
                  className={`w-28 min-w-28 px-2 py-2.5 text-left font-medium ${
                    activeCell?.columnIndex === 1 ? "grand-sheet-active-header" : ""
                  }`}
                >
                  Admission no.
                </th>
                <th
                  colSpan={subjects.length}
                  className="px-3 py-1.5 text-center font-medium"
                >
                  Examination subjects
                </th>
                <th
                  colSpan={8}
                  className="px-3 py-1.5 text-center font-medium"
                >
                  Summary
                </th>
                <th
                  rowSpan={2}
                  aria-label="Row actions"
                  className="w-12 min-w-12"
                />
              </tr>
              <tr className="table-head text-[color:var(--text-muted)]">
                {subjects.map((subject, subjectIndex) => (
                  <th
                    key={subject.key}
                    title={subject.label}
                    className={`w-16 min-w-16 px-1 py-1.5 text-center font-medium ${
                      activeCell?.columnIndex === subjectIndex + 2
                        ? "grand-sheet-active-header"
                        : ""
                    }`}
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
                ].map(([label, max], summaryIndex) => (
                  <th
                    key={label}
                    className={`px-1 py-1.5 text-center font-medium ${
                      label === "Remark" ? "w-28 min-w-28" : "w-16 min-w-16"
                    } ${
                      summaryIndex < 2 &&
                      activeCell?.columnIndex === summaryIndex + 20
                        ? "grand-sheet-active-header"
                        : ""
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
                const tone = row.assessmentComplete
                  ? performanceTone(row.percentage)
                  : "incomplete";

                return (
                  <tr
                    key={row.id}
                    className={`group grand-sheet-performance-${tone} bg-[color:var(--surface)] even:bg-[color:var(--table-row-odd)] hover:bg-[color:var(--surface-muted)] ${
                      activeCell?.rowIndex === rowIndex ? "grand-sheet-active-row" : ""
                    }`}
                  >
                    <td className="grand-sheet-sticky grand-sheet-number left-0 z-[5] px-2 py-1 text-center font-normal text-[color:var(--text-muted)]">
                      {rowIndex + 1}
                    </td>
                    <td
                      className={`grand-sheet-sticky grand-sheet-name left-11 z-[5] p-1 ${cellClass(
                        rowIndex,
                        0,
                      )}`}
                    >
                      <input
                        aria-label={`Pupil ${rowIndex + 1} name`}
                        data-grand-cell={`${rowIndex}-0`}
                        value={row.name}
                        onFocus={() =>
                          focusCell(rowIndex, 0, "Name of pupil")
                        }
                        onKeyDown={(event) =>
                          handleGridKeyDown(event, rowIndex, 0)
                        }
                        onChange={(event) =>
                          updateRow(row.id, { name: event.target.value })
                        }
                        className="grand-sheet-input w-full min-w-0 rounded-[12px] px-2 py-1.5 font-medium text-[color:var(--text-strong)] outline-none"
                      />
                    </td>
                    <td
                      className={`p-1 ${cellClass(
                        rowIndex,
                        1,
                      )}`}
                    >
                      <input
                        aria-label={`${row.name || `Pupil ${rowIndex + 1}`} admission number`}
                        data-grand-cell={`${rowIndex}-1`}
                        value={row.admissionNumber}
                        onFocus={() =>
                          focusCell(rowIndex, 1, "Admission number")
                        }
                        onKeyDown={(event) =>
                          handleGridKeyDown(event, rowIndex, 1)
                        }
                        onChange={(event) =>
                          updateRow(row.id, {
                            admissionNumber: event.target.value,
                          })
                        }
                        className="grand-sheet-input w-full rounded-[12px] px-2 py-1.5 text-[color:var(--text-base)] outline-none"
                      />
                    </td>
                    {subjects.map((subject, subjectIndex) => {
                      const value = row.scores[subject.key];
                      const invalid =
                        hasValue(value) &&
                        !isValidMark(value, subject.max);
                      const columnIndex = subjectIndex + 2;

                      return (
                        <td
                          key={subject.key}
                          className={`p-1 ${cellClass(
                            rowIndex,
                            columnIndex,
                          )}`}
                        >
                          <input
                            aria-label={`${row.name || `Pupil ${rowIndex + 1}`} ${subject.label}, maximum ${subject.max}`}
                            data-grand-cell={`${rowIndex}-${columnIndex}`}
                            inputMode="numeric"
                            value={value}
                            onFocus={() =>
                              focusCell(
                                rowIndex,
                                columnIndex,
                                subject.label,
                                subject.max,
                              )
                            }
                            onKeyDown={(event) =>
                              handleGridKeyDown(
                                event,
                                rowIndex,
                                columnIndex,
                              )
                            }
                            onChange={(event) =>
                              updateScore(
                                row.id,
                                subject.key,
                                event.target.value,
                              )
                            }
                            className={`grand-sheet-input w-full rounded-[12px] px-1 py-1.5 text-center font-medium outline-none ${
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
                      const columnIndex =
                        field === "firstTest" ? 20 : 21;
                      const invalid =
                        hasValue(stringValue) &&
                        !isValidMark(stringValue, Number(max));

                      return (
                        <td
                          key={String(field)}
                          className={`p-1 ${cellClass(
                            rowIndex,
                            columnIndex,
                          )}`}
                        >
                          <input
                            aria-label={`${row.name || `Pupil ${rowIndex + 1}`} ${
                              field === "firstTest" ? "first" : "second"
                            } test total, maximum ${max}`}
                            data-grand-cell={`${rowIndex}-${columnIndex}`}
                            inputMode="numeric"
                            value={stringValue}
                            onFocus={() =>
                              focusCell(
                                rowIndex,
                                columnIndex,
                                field === "firstTest"
                                  ? "First Test"
                                  : "Second Test",
                                Number(max),
                              )
                            }
                            onKeyDown={(event) =>
                              handleGridKeyDown(
                                event,
                                rowIndex,
                                columnIndex,
                              )
                            }
                            onChange={(event) =>
                              updateRow(row.id, {
                                [field]: event.target.value,
                              })
                            }
                            className={`grand-sheet-input w-full rounded-[12px] px-1 py-1.5 text-center font-medium outline-none ${
                              invalid
                                ? "grand-sheet-input-error text-[color:var(--danger)]"
                                : "text-[color:var(--text-strong)]"
                            }`}
                          />
                        </td>
                      );
                    })}
                    <td className="grand-sheet-computed px-2 py-1.5 text-center font-semibold">
                      {row.hasAssessment ? row.examTotal : "—"}
                    </td>
                    <td className="grand-sheet-computed px-2 py-1.5 text-center font-semibold">
                      {row.hasAssessment ? row.testTotal : "—"}
                    </td>
                    <td
                      className="grand-sheet-computed px-2 py-1.5 text-center font-semibold text-[color:var(--text-strong)]"
                    >
                      {row.hasAssessment ? row.grandTotal : "—"}
                    </td>
                    <td
                      className="grand-sheet-computed px-2 py-1.5 text-center font-semibold"
                    >
                      {row.hasAssessment
                        ? row.percentage.toFixed(1)
                        : "—"}
                    </td>
                    <td
                      className="grand-sheet-computed px-2 py-1.5 text-center font-semibold"
                    >
                      {position}
                    </td>
                    <td
                      className={`grand-sheet-result-${tone} px-2 py-1.5 text-center font-medium`}
                    >
                      {row.assessmentComplete
                        ? grandSheetRemark(row.percentage)
                        : "—"}
                    </td>
                    <td className="px-1 py-1 text-center">
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
          </table>
        </div>
      </section>
    </div>
  );
}
