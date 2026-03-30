"use client";

import { ChangeEvent, KeyboardEvent, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ArrowUpTrayIcon, DocumentPlusIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

import {
  applyScannedReportPrefill,
  createStudentReportCard,
} from "@/app/reports/actions";
import { useFeedback } from "@/components/feedback/FeedbackProvider";
import { SectionCard } from "@/components/ui/SectionCard";

type ClassroomOption = {
  id: string;
  name: string;
  studentCount: number;
  activeReports: number;
};

type ScanExtraction = {
  studentName?: string | null;
  className?: string | null;
  summary?: {
    assessment1Total?: number;
    assessment2Total?: number;
    examTotal?: number;
    grandTotal?: number;
    grandMax?: number;
  };
  scores?: Array<{
    subject: string;
    a1Score?: number | null;
    a2Score?: number | null;
    examScore?: number | null;
    totalScore?: number | null;
  }>;
  teacherComment?: string;
  position?: string | null;
  warnings?: string[];
};

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function stepTone(active: boolean, ready: boolean) {
  if (active) return "soft-action-tint";
  if (ready) return "surface-pocket";
  return "soft-action";
}

export function NewReportFlow({
  classrooms,
  initialMode = "manual",
}: {
  classrooms: ClassroomOption[];
  initialMode?: "manual" | "scan";
}) {
  const router = useRouter();
  const { notify } = useFeedback();
  const [mode, setMode] = useState<"manual" | "scan">(initialMode);
  const [selectedClassroomId, setSelectedClassroomId] = useState(classrooms[0]?.id ?? "");
  const [classQuery, setClassQuery] = useState("");
  const [studentName, setStudentName] = useState("");
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [scanPreviewUrl, setScanPreviewUrl] = useState<string | null>(null);
  const [scanExtraction, setScanExtraction] = useState<ScanExtraction | null>(null);
  const [scanStatus, setScanStatus] = useState("Ready");
  const [isPending, startTransition] = useTransition();
  const studentInputRef = useRef<HTMLInputElement | null>(null);
  const reviewRef = useRef<HTMLDivElement | null>(null);

  const selectedClassroom = useMemo(
    () => classrooms.find((classroom) => classroom.id === selectedClassroomId) ?? null,
    [classrooms, selectedClassroomId],
  );
  const filteredClassrooms = useMemo(() => {
    const query = classQuery.trim().toLowerCase();
    if (!query) return classrooms;

    return classrooms.filter((classroom) => classroom.name.toLowerCase().includes(query));
  }, [classQuery, classrooms]);

  useEffect(() => {
    if (!selectedClassroomId) return;

    const frame = window.requestAnimationFrame(() => {
      studentInputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [selectedClassroomId]);

  useEffect(() => {
    if (!scanExtraction) return;

    const frame = window.requestAnimationFrame(() => {
      reviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [scanExtraction]);

  function syncDetectedContext(extraction: ScanExtraction) {
    if (extraction.studentName?.trim()) {
      setStudentName((current) => current.trim() || extraction.studentName?.trim() || "");
    }

    if (extraction.className?.trim()) {
      const detectedClassroom = classrooms.find(
        (classroom) =>
          normalizeName(classroom.name) === normalizeName(extraction.className ?? ""),
      );

      if (detectedClassroom) {
        setSelectedClassroomId(detectedClassroom.id);
      }
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    setScanFile(nextFile);
    setScanExtraction(null);
    setScanStatus(nextFile ? "Image ready" : "Ready");

    if (!nextFile) {
      setScanPreviewUrl(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setScanPreviewUrl(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(nextFile);
  }

  function getReadyStudentName() {
    return studentName.trim() || scanExtraction?.studentName?.trim() || "";
  }

  function openManualSheet() {
    const readyStudentName = getReadyStudentName();
    if (!selectedClassroom) {
      notify("Choose a class first.", "error");
      return;
    }

    if (!readyStudentName) {
      notify("Enter the student name first.", "error");
      return;
    }

    startTransition(async () => {
      const result = await createStudentReportCard({
        fullName: readyStudentName,
        classroomId: selectedClassroom.id,
      });

      if (!result.ok || !result.href) {
        notify(result.message || "Couldn't open the report sheet.", "error");
        return;
      }

      notify(result.message || "Student sheet ready.", "success");
      router.push(result.href);
    });
  }

  function handleStudentKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" || mode !== "manual") return;

    event.preventDefault();
    openManualSheet();
  }

  async function analyzeScan() {
    if (!scanPreviewUrl) {
      notify("Add a report card image first.", "error");
      return;
    }

    setScanStatus("Analyzing...");

    try {
      const response = await fetch("/api/vision/report-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageDataUrl: scanPreviewUrl,
          studentName: studentName.trim() || undefined,
          className: selectedClassroom?.name,
        }),
      });

      const payload = (await response.json()) as { error?: string } | ScanExtraction;

      if (!response.ok || ("error" in payload && payload.error)) {
        const message =
          "error" in payload && payload.error ? payload.error : "Scan didn't complete.";
        setScanStatus("Needs retry");
        notify(message, "error");
        return;
      }

      const extraction = payload as ScanExtraction;
      setScanExtraction(extraction);
      syncDetectedContext(extraction);
      setScanStatus("Scanned");
      notify("Scan ready for review.", "success");
    } catch {
      setScanStatus("Needs retry");
      notify("Scan didn't complete.", "error");
    }
  }

  function useScanAndOpenSheet() {
    const readyStudentName = getReadyStudentName();
    if (!selectedClassroom) {
      notify("Choose a class first.", "error");
      return;
    }

    if (!readyStudentName) {
      notify("Confirm the student name before saving.", "error");
      return;
    }

    if (!scanExtraction) {
      notify("Scan the image first.", "error");
      return;
    }

    startTransition(async () => {
      const result = await applyScannedReportPrefill({
        fullName: readyStudentName,
        classroomId: selectedClassroom.id,
        extraction: scanExtraction,
      });

      if (!result.ok || !result.href) {
        notify(result.message || "Couldn't apply the scan.", "error");
        return;
      }

      notify("Scan applied. Review the sheet.", "success");
      router.push(result.href);
    });
  }

  const readyStudentName = getReadyStudentName();
  const canStartManual = Boolean(selectedClassroom && readyStudentName);
  const canAnalyzeScan = Boolean(scanPreviewUrl);
  const canUseScan = Boolean(selectedClassroom && readyStudentName && scanExtraction);

  return (
    <div className="grid gap-4 xl:grid-cols-[0.84fr_1.16fr]">
      <SectionCard title="Create">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-2 rounded-[24px] surface-chip p-2">
            {[
              ["manual", "Manual"],
              ["scan", "Scan"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value as "manual" | "scan")}
                className={`rounded-[18px] px-4 py-3 text-sm font-medium transition ${
                  mode === value ? "soft-action-tint" : "soft-action"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid gap-3">
            <div className={`rounded-[24px] p-4 ${stepTone(true, false)}`}>
              <div className="flex items-start gap-3">
                <span className="surface-chip inline-flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--accent-strong)]">
                  {mode === "scan" ? (
                    <SparklesIcon className="h-5 w-5" />
                  ) : (
                    <DocumentPlusIcon className="h-5 w-5" />
                  )}
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                    Step 1
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-[color:var(--text-strong)]">
                    {mode === "scan" ? "Choose scan intake" : "Start with a clean sheet"}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">
                    {mode === "scan"
                      ? "Bring in the image first, then confirm the extracted details before the sheet opens."
                      : "Create a new student sheet instantly, with all class subject rows already in place."}
                  </p>
                </div>
              </div>
            </div>

            <div className={`rounded-[24px] p-4 ${stepTone(Boolean(selectedClassroom), Boolean(selectedClassroom))}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                Step 2
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[color:var(--text-strong)]">
                Choose the class
              </h3>
              <input
                type="text"
                value={classQuery}
                onChange={(event) => setClassQuery(event.target.value)}
                placeholder="Find class"
                className="surface-input mt-3 w-full rounded-[18px] px-4 py-3 text-sm text-[color:var(--text-strong)] outline-none placeholder:text-[color:var(--text-muted)]"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {filteredClassrooms.map((classroom) => (
                  <button
                    key={classroom.id}
                    type="button"
                    onClick={() => setSelectedClassroomId(classroom.id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      selectedClassroomId === classroom.id ? "soft-action-tint" : "soft-action"
                    }`}
                  >
                    {classroom.name}
                  </button>
                ))}
                {!filteredClassrooms.length ? (
                  <div className="soft-action rounded-full px-4 py-2 text-sm text-[color:var(--text-muted)]">
                    No classes match that search.
                  </div>
                ) : null}
              </div>
              {selectedClassroom ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="surface-pocket rounded-[18px] px-4 py-4">
                    <p className="text-sm text-[color:var(--text-muted)]">Students</p>
                    <p className="mt-2 font-semibold text-[color:var(--text-strong)]">
                      {selectedClassroom.studentCount}
                    </p>
                  </div>
                  <div className="surface-pocket rounded-[18px] px-4 py-4">
                    <p className="text-sm text-[color:var(--text-muted)]">Reports this term</p>
                    <p className="mt-2 font-semibold text-[color:var(--text-strong)]">
                      {selectedClassroom.activeReports}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className={`rounded-[24px] p-4 ${stepTone(Boolean(readyStudentName), Boolean(readyStudentName))}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                Step 3
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[color:var(--text-strong)]">
                Confirm the student
              </h3>
              <input
                ref={studentInputRef}
                type="text"
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                onKeyDown={handleStudentKeyDown}
                placeholder="Student name"
                className="surface-input mt-3 w-full rounded-[20px] px-4 py-4 text-base text-[color:var(--text-strong)] outline-none placeholder:text-[color:var(--text-muted)]"
              />
              <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
                {mode === "scan"
                  ? "Scan can suggest a name, but this field stays editable so you can correct it before saving."
                  : "Keep it simple: add the student name, then Kradle opens the new sheet immediately."}
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      <div ref={reviewRef}>
      <SectionCard title={mode === "scan" ? "Review" : "Ready"}>
        {mode === "manual" ? (
          <div className="grid gap-4">
            <div className="surface-pocket rounded-[26px] px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                Next
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[color:var(--text-strong)]">
                Open the new sheet
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--text-muted)]">
                Kradle will create the student if needed, attach the active class, and open a clean report sheet with live totals.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="soft-action rounded-[20px] px-4 py-4">
                  <p className="text-sm text-[color:var(--text-muted)]">Class</p>
                  <p className="mt-2 font-semibold text-[color:var(--text-strong)]">
                    {selectedClassroom?.name ?? "--"}
                  </p>
                </div>
                <div className="soft-action rounded-[20px] px-4 py-4">
                  <p className="text-sm text-[color:var(--text-muted)]">Student</p>
                  <p className="mt-2 font-semibold text-[color:var(--text-strong)]">
                    {readyStudentName || "--"}
                  </p>
                </div>
              </div>
            </div>

            <div className="surface-pocket flex flex-wrap gap-2 rounded-[24px] p-3">
              <button
                type="button"
                onClick={openManualSheet}
                disabled={isPending || !canStartManual}
                className="soft-action-tint rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                Open sheet
              </button>
              <button
                type="button"
                onClick={() => setStudentName("")}
                className="soft-action rounded-full px-4 py-2 text-sm font-medium"
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="surface-pocket rounded-[26px] px-5 py-5">
              <div className="flex items-start gap-3">
                <span className="surface-chip inline-flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--accent-strong)]">
                  <ArrowUpTrayIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                    Step 4
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-[color:var(--text-strong)]">
                    Scan, review, open
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--text-muted)]">
                    Upload the card image, let Kradle prefill the totals and rows, then open the sheet for final cross-checking.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[0.84fr_1.16fr]">
                <div className="grid gap-3">
                  <label className="soft-action flex min-h-56 cursor-pointer items-center justify-center rounded-[22px] px-5 py-5 text-center text-sm font-medium text-[color:var(--text-muted)]">
                    {scanPreviewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={scanPreviewUrl}
                        alt="Selected report card"
                        className="h-auto max-h-72 w-full rounded-[18px] object-cover"
                      />
                    ) : (
                      <div className="grid gap-2">
                        <p className="font-semibold text-[color:var(--text-strong)]">Choose image</p>
                        <p>Add a clear report-card photo to begin the prefill.</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>

                  <div className="flex items-center justify-between gap-3 text-sm text-[color:var(--text-muted)]">
                    <span>{scanFile?.name ?? "No image selected"}</span>
                    <span>{scanStatus}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={analyzeScan}
                      disabled={isPending || !canAnalyzeScan}
                      className="soft-action-tint rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
                    >
                      Scan image
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setScanFile(null);
                        setScanPreviewUrl(null);
                        setScanExtraction(null);
                        setScanStatus("Ready");
                      }}
                      className="soft-action rounded-full px-4 py-2 text-sm font-medium"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="soft-action rounded-[20px] px-4 py-4">
                      <p className="text-sm text-[color:var(--text-muted)]">Student</p>
                      <p className="mt-2 font-semibold text-[color:var(--text-strong)]">
                        {(scanExtraction?.studentName ?? readyStudentName) || "--"}
                      </p>
                    </div>
                    <div className="soft-action rounded-[20px] px-4 py-4">
                      <p className="text-sm text-[color:var(--text-muted)]">Class</p>
                      <p className="mt-2 font-semibold text-[color:var(--text-strong)]">
                        {scanExtraction?.className ?? selectedClassroom?.name ?? "--"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["A1", scanExtraction?.summary?.assessment1Total ?? "--"],
                      ["A2", scanExtraction?.summary?.assessment2Total ?? "--"],
                      ["Exam", scanExtraction?.summary?.examTotal ?? "--"],
                      ["Total", scanExtraction?.summary?.grandTotal ?? "--"],
                    ].map(([label, value], index) => (
                      <div
                        key={label}
                        className={`rounded-[20px] px-4 py-4 ${
                          index === 3 ? "soft-action-tint" : "soft-action"
                        }`}
                      >
                        <p className="text-sm text-[color:var(--text-muted)]">{label}</p>
                        <p className="mt-2 text-2xl font-semibold text-[color:var(--text-strong)]">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="surface-pocket rounded-[22px] px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                      Subject rows
                    </p>
                    <div className="mt-3 grid gap-2">
                      {(scanExtraction?.scores ?? []).slice(0, 5).map((row) => (
                        <div key={row.subject} className="soft-action rounded-[18px] px-4 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold text-[color:var(--text-strong)]">
                              {row.subject}
                            </p>
                            <span className="text-sm font-semibold text-[color:var(--text-strong)]">
                              {row.totalScore ?? "--"}
                            </span>
                          </div>
                        </div>
                      ))}
                      {!scanExtraction?.scores?.length ? (
                        <div className="soft-action rounded-[18px] px-4 py-4 text-sm text-[color:var(--text-muted)]">
                          Scan first to preview the extracted subject rows.
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {scanExtraction?.warnings?.length ? (
                    <div className="rounded-[24px] bg-[color:var(--warning-soft)] px-4 py-4 text-sm leading-6 text-[color:var(--warning)] shadow-[var(--shadow-frost)]">
                      {scanExtraction.warnings.join(" ")}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="surface-pocket flex flex-wrap gap-2 rounded-[24px] p-3">
              <button
                type="button"
                onClick={useScanAndOpenSheet}
                disabled={isPending || !canUseScan}
                className="soft-action-tint rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                Open reviewed sheet
              </button>
              <button
                type="button"
                onClick={() => setScanExtraction(null)}
                className="soft-action rounded-full px-4 py-2 text-sm font-medium"
              >
                Clear review
              </button>
            </div>
          </div>
        )}
      </SectionCard>
      </div>
    </div>
  );
}
