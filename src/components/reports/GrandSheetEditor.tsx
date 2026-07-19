"use client";

import {
  ArrowPathIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
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
}: {
  classrooms: ClassroomOption[];
  terms: TermOption[];
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
    terms.find(
      (term) =>
        /2025\s*\/\s*2026/i.test(term.sessionName) &&
        /third/i.test(term.name),
    )?.id ??
      terms.find((term) => term.isActive)?.id ??
      terms[0]?.id ??
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
          complete:
            Boolean(row.name.trim()) &&
            Boolean(row.admissionNumber.trim()) &&
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

  const completeCount = computedRows.filter((row) => row.complete).length;
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
    <div className="space-y-3 sm:space-y-4">
      <section className="frost-panel-strong overflow-hidden rounded-[26px] sm:rounded-[30px]">
        <div className="grid gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="soft-action-tint inline-flex h-11 w-11 items-center justify-center rounded-2xl">
                <DocumentDuplicateIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                  Grand sheet workflow
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[color:var(--text-strong)]">
                  One class sheet, every pupil report
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {[
                ["1", "Add", "Scan a photo or continue this draft"],
                ["2", "Review", "Correct highlighted blanks and marks"],
                ["3", "Create", "Open every pupil’s report and preview"],
              ].map(([number, title, description]) => (
                <div
                  key={number}
                  className="surface-pocket rounded-[20px] px-3.5 py-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--accent-soft)] text-xs font-bold text-[color:var(--accent-strong)]">
                      {number}
                    </span>
                    <p className="font-semibold text-[color:var(--text-strong)]">
                      {title}
                    </p>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[color:var(--text-muted)]">
                    {description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
              <label className="block">
                <span className="text-xs font-semibold text-[color:var(--text-muted)]">
                  Save report sheets to
                </span>
                <select
                  value={selectedClassroomId}
                  onChange={(event) => {
                    setSelectedClassroomId(event.target.value);
                    setGeneratedReports([]);
                  }}
                  className="surface-input mt-2 w-full rounded-[16px] px-3 py-3 text-sm font-semibold text-[color:var(--text-strong)] outline-none"
                >
                  <option value="">Choose a class</option>
                  {classrooms.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name} · {classroom.studentCount} pupils
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-[color:var(--text-muted)]">
                  Session and term
                </span>
                <select
                  value={selectedTermId}
                  onChange={(event) => {
                    setSelectedTermId(event.target.value);
                    setGeneratedReports([]);
                  }}
                  className="surface-input mt-2 w-full rounded-[16px] px-3 py-3 text-sm font-semibold text-[color:var(--text-strong)] outline-none"
                >
                  <option value="">Choose a term</option>
                  {terms.map((term) => (
                    <option key={term.id} value={term.id}>
                      {term.sessionName} · {term.name}
                      {term.isActive ? " · Active" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={createStudentReports}
                disabled={
                  isPending ||
                  !selectedClassroomId ||
                  !selectedTermId ||
                  savableCount === 0
                }
                className="soft-action-tint self-end rounded-[16px] px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SparklesIcon className="mr-2 h-4 w-4" />
                {isPending
                  ? "Creating reports..."
                  : `Create ${savableCount || ""} report ${
                      savableCount === 1 ? "sheet" : "sheets"
                    }`}
              </button>
            </div>

            <p className="mt-3 text-xs leading-5 text-[color:var(--text-muted)]">
              Rows with valid names and admission numbers become drafts, even
              when some marks are still blank. Existing pupil reports for the
              selected term are updated instead of duplicated.
            </p>
          </div>

          <div className="surface-pocket rounded-[24px] px-4 py-4 sm:px-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[color:var(--text-strong)]">
                  Scan a grand sheet
                </p>
                <p className="mt-1 text-xs leading-5 text-[color:var(--text-muted)]">
                  Photograph the full page straight-on in bright light.
                </p>
              </div>
              <span className="surface-chip rounded-full px-2.5 py-1 text-[11px] font-semibold text-[color:var(--text-muted)]">
                {scanStatus}
              </span>
            </div>

            {scanPreviewUrl ? (
              <div className="mt-4 grid grid-cols-[84px_1fr] gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={scanPreviewUrl}
                  alt="Grand-sheet scan preview"
                  className="h-24 w-[84px] rounded-[16px] object-cover shadow-[var(--shadow-frost)]"
                />
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={analyzeGrandSheet}
                    disabled={isScanning}
                    className="soft-action-tint w-full rounded-[14px] px-3 py-2.5 text-sm font-semibold disabled:opacity-60"
                  >
                    <SparklesIcon className="mr-2 h-4 w-4" />
                    {isScanning ? "Reading sheet..." : "Read pupil rows"}
                  </button>
                  <label className="soft-action flex cursor-pointer items-center justify-center rounded-[14px] px-3 py-2.5 text-sm font-medium">
                    <ArrowUpTrayIcon className="mr-2 h-4 w-4" />
                    Choose another
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
              <label className="mt-4 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed border-[color:var(--accent-border)] bg-[color:var(--accent-soft)] px-4 text-center">
                <ArrowUpTrayIcon className="h-6 w-6 text-[color:var(--accent-strong)]" />
                <span className="mt-2 text-sm font-semibold text-[color:var(--accent-strong)]">
                  Choose grand-sheet photo
                </span>
                <span className="mt-1 text-xs text-[color:var(--text-muted)]">
                  JPG, PNG, or a camera image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleGrandSheetFile}
                />
              </label>
            )}

            {scanResult ? (
              <div className="mt-3 rounded-[18px] bg-[color:var(--success-soft)] px-3.5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--text-strong)]">
                      {scanResult.rows.length} rows ready for review
                    </p>
                    <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                      {scanResult.warnings?.length
                        ? `${scanResult.warnings.length} uncertain cells will stay blank`
                        : "No scan warnings returned"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={applyScannedRows}
                    className="rounded-full bg-[color:var(--success)] px-3 py-2 text-xs font-bold text-white"
                  >
                    Use scan
                  </button>
                </div>
              </div>
            ) : null}

            {generatedReports.length ? (
              <div className="mt-3 rounded-[18px] bg-[color:var(--accent-soft)] px-3.5 py-3">
                <p className="text-sm font-semibold text-[color:var(--text-strong)]">
                  {generatedReports.length} report sheets ready
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link
                    href={generatedReports[0].href}
                    className="rounded-full bg-[color:var(--accent)] px-3 py-2 text-xs font-bold text-white"
                  >
                    <EyeIcon className="mr-1.5 h-4 w-4" />
                    Open first pupil
                  </Link>
                  <Link
                    href="/reports"
                    className="soft-action rounded-full px-3 py-2 text-xs font-semibold"
                  >
                    View all reports
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="frost-panel rounded-[24px] px-3 py-3 sm:rounded-[28px] sm:px-5 sm:py-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            <span className="surface-chip rounded-full px-3 py-2 text-xs font-semibold text-[color:var(--text-strong)]">
              {rows.length} pupils
            </span>
            <span className="surface-chip rounded-full px-3 py-2 text-xs font-semibold text-[color:var(--accent-strong)]">
              {savableCount} report-ready
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
            <span
              className={`rounded-full px-3 py-2 text-xs font-semibold ${
                missingCount
                  ? "mood-badge-warning"
                  : "surface-chip text-[color:var(--text-muted)]"
              }`}
            >
              {missingCount ? `${missingCount} blanks` : "All cells filled"}
            </span>
            <span className="surface-chip rounded-full px-3 py-2 text-xs font-medium text-[color:var(--text-muted)]">
              Autosaved on this device
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={focusNextIssue}
              className="soft-action-tint rounded-full px-3.5 py-2 text-sm font-semibold"
            >
              Next blank or issue
            </button>
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
              className="soft-action rounded-full px-3.5 py-2 text-sm font-semibold"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add pupil
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-[color:var(--text-muted)]">
          Enter the two test totals and the 18 exam marks. Exam total, grand
          total, percentage, position, and remark update automatically. Nothing
          reaches the school database until you choose a class and create the
          report sheets above.
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

        <div className="grand-sheet-locator flex min-h-14 flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          {activeCell && activePupil ? (
            <>
              <div className="flex min-w-0 items-center gap-3">
                <span className="rounded-lg bg-[color:var(--accent-soft)] px-2.5 py-1.5 font-mono text-xs font-bold text-[color:var(--accent-strong)]">
                  {activeCell.cellRef}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[color:var(--text-strong)]">
                    {activePupil.name || `Pupil ${activeCell.rowIndex + 1}`}
                  </p>
                  <p className="text-xs text-[color:var(--text-muted)]">
                    Row {activeCell.rowIndex + 1} · {activeCell.label}
                    {activeCell.max ? ` · Maximum ${activeCell.max}` : ""}
                  </p>
                </div>
              </div>
              <p className="text-xs text-[color:var(--text-muted)]">
                Enter moves down · Shift + Enter moves up
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-[color:var(--text-strong)]">
                Select a cell to start correcting
              </p>
              <p className="text-xs text-[color:var(--text-muted)]">
                Your exact row, pupil, subject, and workbook reference will stay visible here.
              </p>
            </>
          )}
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
                  className={`grand-sheet-sticky grand-sheet-name left-11 z-[8] w-52 min-w-52 border-b border-r border-[color:var(--border-soft)] px-3 py-3 text-left font-semibold ${
                    activeCell?.columnIndex === 0 ? "grand-sheet-active-header" : ""
                  }`}
                >
                  Name of pupil
                </th>
                <th
                  rowSpan={2}
                  className={`w-28 min-w-28 border-b border-r border-[color:var(--border-soft)] px-2 py-3 text-left font-semibold ${
                    activeCell?.columnIndex === 1 ? "grand-sheet-active-header" : ""
                  }`}
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
                {subjects.map((subject, subjectIndex) => (
                  <th
                    key={subject.key}
                    title={subject.label}
                    className={`w-16 min-w-16 border-b border-r border-[color:var(--border-soft)] px-1 py-2 text-center font-semibold ${
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
                    className={`border-b border-r border-[color:var(--border-soft)] px-1 py-2 text-center font-semibold ${
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
                    <td className="grand-sheet-sticky grand-sheet-number left-0 z-[5] border-b border-r border-[color:var(--border-soft)] px-2 py-1.5 text-center font-semibold text-[color:var(--text-muted)]">
                      {rowIndex + 1}
                    </td>
                    <td
                      className={`grand-sheet-sticky grand-sheet-name left-11 z-[5] border-b border-r border-[color:var(--border-soft)] p-1 ${cellClass(
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
                        className="grand-sheet-input w-full min-w-0 rounded-md px-2 py-2 font-semibold text-[color:var(--text-strong)] outline-none"
                      />
                    </td>
                    <td
                      className={`border-b border-r border-[color:var(--border-soft)] p-1 ${cellClass(
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
                        className="grand-sheet-input w-full rounded-md px-2 py-2 text-[color:var(--text-base)] outline-none"
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
                          className={`border-b border-r border-[color:var(--border-soft)] p-1 ${cellClass(
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
                      const columnIndex =
                        field === "firstTest" ? 20 : 21;
                      const invalid =
                        hasValue(stringValue) &&
                        !isValidMark(stringValue, Number(max));

                      return (
                        <td
                          key={String(field)}
                          className={`border-b border-r border-[color:var(--border-soft)] p-1 ${cellClass(
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
                    <td
                      className={`grand-sheet-computed grand-sheet-result-${tone} border-b border-r border-[color:var(--border-soft)] px-2 py-2 text-center font-semibold text-[color:var(--text-strong)]`}
                    >
                      {row.hasAssessment ? row.grandTotal : "—"}
                    </td>
                    <td
                      className={`grand-sheet-computed grand-sheet-result-${tone} border-b border-r border-[color:var(--border-soft)] px-2 py-2 text-center font-semibold`}
                    >
                      {row.hasAssessment
                        ? row.percentage.toFixed(1)
                        : "—"}
                    </td>
                    <td
                      className={`grand-sheet-computed grand-sheet-result-${tone} border-b border-r border-[color:var(--border-soft)] px-2 py-2 text-center font-semibold`}
                    >
                      {position}
                    </td>
                    <td
                      className={`grand-sheet-computed grand-sheet-result-${tone} border-b border-r border-[color:var(--border-soft)] px-2 py-2 text-center font-medium`}
                    >
                      {row.assessmentComplete
                        ? grandSheetRemark(row.percentage)
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
