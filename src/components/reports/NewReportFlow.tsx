"use client";

import { ChangeEvent, KeyboardEvent, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowPathIcon,
  ArrowRightIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  DocumentPlusIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

import {
  applyScannedReportPrefill,
  createStudentReportCard,
} from "@/app/(workspace)/reports/actions";
import { useFeedback } from "@/components/feedback/FeedbackProvider";
import { useNewReportFlow } from "@/components/reports/NewReportFlowContext";
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

type StepMeta = {
  id: string;
  label: string;
  title: string;
  description: string;
};

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function NewReportFlow({
  classrooms,
}: {
  classrooms: ClassroomOption[];
  initialMode?: "manual" | "scan";
}) {
  const router = useRouter();
  const { notify } = useFeedback();
  const {
    mode,
    selectedClassroomId,
    classQuery,
    studentName,
    scanPreviewUrl,
    scanExtraction,
    scanStatus,
    currentStep,
    visitedSteps,
    setMode,
    setSelectedClassroomId,
    setClassQuery,
    setStudentName,
    setScanPreviewUrl,
    setScanExtraction,
    setScanStatus,
    setCurrentStep,
    resetFlow,
  } = useNewReportFlow();

  const [scanFile, setScanFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStageIndex, setScanStageIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const studentInputRef = useRef<HTMLInputElement | null>(null);

  const scanStages = useMemo(
    () => [
      "Reading the report card image",
      "Finding student, class, and totals",
      "Mapping the subject rows",
      "Preparing your review sheet",
    ],
    [],
  );

  const steps = useMemo<StepMeta[]>(
    () =>
      mode === "scan"
        ? [
            {
              id: "mode",
              label: "Path",
              title: "Choose how you want to begin",
              description: "Start with a blank sheet or let Kradle scan the report card first.",
            },
            {
              id: "class",
              label: "Class",
              title: "Choose the class",
              description: "We’ll use the class to load the right students, subjects, and totals.",
            },
            {
              id: "student",
              label: "Student",
              title: "Confirm the student",
              description: "Scan can suggest the name, but you can correct it here before saving.",
            },
            {
              id: "scan",
              label: "Scan",
              title: "Scan the card image",
              description: "Bring in the photo and let Kradle prepare a reviewed draft.",
            },
            {
              id: "review",
              label: "Review",
              title: "Review before opening the sheet",
              description: "Check the extracted totals and rows, then open the reviewed sheet.",
            },
          ]
        : [
            {
              id: "mode",
              label: "Path",
              title: "Choose how you want to begin",
              description: "Start with a blank sheet or let Kradle scan the report card first.",
            },
            {
              id: "class",
              label: "Class",
              title: "Choose the class",
              description: "We’ll use the class to load the right students, subjects, and totals.",
            },
            {
              id: "student",
              label: "Student",
              title: "Confirm the student",
              description: "Add the student name and Kradle will open a clean report sheet instantly.",
            },
            {
              id: "open",
              label: "Open",
              title: "Open the new sheet",
              description: "Review the student and class, then open the live sheet with totals ready.",
            },
          ],
    [mode],
  );

  const maxStep = steps.length - 1;
  const current = steps[Math.min(currentStep, maxStep)];

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
    if (!selectedClassroomId || current?.id !== "student") return;

    const frame = window.requestAnimationFrame(() => {
      studentInputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [current?.id, selectedClassroomId]);

  useEffect(() => {
    if (!isScanning) {
      setScanStageIndex(0);
      return;
    }

    const timer = window.setInterval(() => {
      setScanStageIndex((active) => (active >= scanStages.length - 1 ? active : active + 1));
    }, 1400);

    return () => window.clearInterval(timer);
  }, [isScanning, scanStages]);

  useEffect(() => {
    if (!scanPreviewUrl) {
      setScanFile(null);
    }
  }, [scanPreviewUrl]);

  useEffect(() => {
    if (currentStep > maxStep) {
      setCurrentStep(maxStep);
    }
  }, [currentStep, maxStep, setCurrentStep]);

  function syncDetectedContext(extraction: ScanExtraction) {
    if (extraction.studentName?.trim()) {
      setStudentName(studentName.trim() || extraction.studentName?.trim() || "");
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

  const readyStudentName = getReadyStudentName();
  const canGoNext =
    current?.id === "mode"
      ? true
      : current?.id === "class"
        ? Boolean(selectedClassroom)
        : current?.id === "student"
          ? Boolean(selectedClassroom && readyStudentName)
          : current?.id === "scan"
            ? Boolean(scanExtraction)
            : false;

  function goNext() {
    if (current.id === "scan" && !scanExtraction) {
      notify("Scan the card first.", "error");
      return;
    }

    if (current.id === "student" && !readyStudentName) {
      notify("Add the student name first.", "error");
      return;
    }

    if (current.id === "class" && !selectedClassroom) {
      notify("Choose a class first.", "error");
      return;
    }

    setCurrentStep(Math.min(currentStep + 1, maxStep));
  }

  function goBack() {
    setCurrentStep(Math.max(currentStep - 1, 0));
  }

  function openManualSheet() {
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
      resetFlow();
      router.push(result.href);
    });
  }

  function handleStudentKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;

    event.preventDefault();

    if (mode === "manual" && current.id === "open") {
      openManualSheet();
      return;
    }

    if (canGoNext) {
      goNext();
    }
  }

  async function analyzeScan() {
    if (!scanPreviewUrl) {
      notify("Add a report card image first.", "error");
      return;
    }

    setIsScanning(true);
    setScanStageIndex(0);
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
      setCurrentStep(Math.min(currentStep + 1, maxStep));
      notify("Scan ready for review.", "success");
    } catch {
      setScanStatus("Needs retry");
      notify("Scan didn't complete.", "error");
    } finally {
      setIsScanning(false);
    }
  }

  function useScanAndOpenSheet() {
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
      resetFlow();
      router.push(result.href);
    });
  }

  function renderStepBody() {
    if (current.id === "mode") {
      return (
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode("manual")}
              className={`rounded-[26px] px-5 py-5 text-left transition ${
                mode === "manual" ? "soft-action-tint" : "soft-action"
              }`}
            >
              <span className="surface-chip inline-flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--accent-strong)]">
                <DocumentPlusIcon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-xl font-semibold text-[color:var(--text-strong)]">
                Start manually
              </h3>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">
                Open a clean sheet and enter the report card directly, one score row at a time.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode("scan")}
              className={`rounded-[26px] px-5 py-5 text-left transition ${
                mode === "scan" ? "soft-action-tint" : "soft-action"
              }`}
            >
              <span className="surface-chip inline-flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--accent-strong)]">
                <SparklesIcon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-xl font-semibold text-[color:var(--text-strong)]">
                Scan to prefill
              </h3>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">
                Use the card image to prefill totals and rows, then cross-check before opening the sheet.
              </p>
            </button>
          </div>
        </div>
      );
    }

    if (current.id === "class") {
      return (
        <div className="grid gap-4">
          <input
            type="text"
            value={classQuery}
            onChange={(event) => setClassQuery(event.target.value)}
            placeholder="Find class"
            className="surface-input w-full rounded-[18px] px-4 py-3 text-sm text-[color:var(--text-strong)] outline-none placeholder:text-[color:var(--text-muted)]"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredClassrooms.map((classroom) => {
              const active = classroom.id === selectedClassroomId;
              return (
                <button
                  key={classroom.id}
                  type="button"
                  onClick={() => setSelectedClassroomId(classroom.id)}
                  className={`rounded-[24px] px-5 py-5 text-left transition ${
                    active ? "soft-action-tint" : "soft-action"
                  }`}
                >
                  <h3 className="text-lg font-semibold text-[color:var(--text-strong)]">
                    {classroom.name}
                  </h3>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-[color:var(--text-muted)]">
                    <div>
                      <p>Students</p>
                      <p className="mt-1 font-semibold text-[color:var(--text-strong)]">
                        {classroom.studentCount}
                      </p>
                    </div>
                    <div>
                      <p>Reports</p>
                      <p className="mt-1 font-semibold text-[color:var(--text-strong)]">
                        {classroom.activeReports}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (current.id === "student") {
      return (
        <div className="grid gap-4">
          <div className="surface-pocket rounded-[24px] px-5 py-5">
            <p className="text-sm text-[color:var(--text-muted)]">Class</p>
            <p className="mt-2 text-lg font-semibold text-[color:var(--text-strong)]">
              {selectedClassroom?.name ?? "--"}
            </p>
          </div>

          <input
            ref={studentInputRef}
            type="text"
            value={studentName}
            onChange={(event) => setStudentName(event.target.value)}
            onKeyDown={handleStudentKeyDown}
            placeholder="Student name"
            className="surface-input w-full rounded-[22px] px-5 py-4 text-lg text-[color:var(--text-strong)] outline-none placeholder:text-[color:var(--text-muted)]"
          />

          <div className="soft-action rounded-[22px] px-4 py-4 text-sm leading-6 text-[color:var(--text-muted)]">
            {mode === "scan"
              ? "The scan can suggest a name, but you can always adjust it before saving."
              : "Press Enter to move on once the student name is ready."}
          </div>
        </div>
      );
    }

    if (current.id === "scan") {
      return (
        <div className="grid gap-4">
          <label className="soft-action flex min-h-72 cursor-pointer items-center justify-center rounded-[26px] px-5 py-5 text-center text-sm font-medium text-[color:var(--text-muted)]">
            {scanPreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={scanPreviewUrl}
                alt="Selected report card"
                className="h-auto max-h-80 w-full rounded-[20px] object-cover"
              />
            ) : (
              <div className="grid gap-2">
                <p className="font-semibold text-[color:var(--text-strong)]">Choose image</p>
                <p>Add a clear report-card photo to begin the prefill.</p>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>

          <div className="flex items-center justify-between gap-3 text-sm text-[color:var(--text-muted)]">
            <span>{scanFile?.name ?? "No image selected"}</span>
            <span>{scanStatus}</span>
          </div>

          {isScanning ? (
            <div className="surface-pocket grid gap-3 rounded-[24px] px-4 py-4">
              <div className="soft-action-tint flex items-center gap-3 rounded-[18px] px-4 py-4">
                <span className="surface-chip inline-flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--accent-strong)]">
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[color:var(--text-strong)]">
                    Scanning in progress
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                    {scanStages[scanStageIndex]}
                  </p>
                </div>
              </div>
              <div className="grid gap-2">
                {scanStages.map((stage, index) => {
                  const isDone = index < scanStageIndex;
                  const isCurrent = index === scanStageIndex;

                  return (
                    <div
                      key={stage}
                      className={`rounded-[18px] px-4 py-3 ${
                        isCurrent ? "soft-action-tint" : isDone ? "surface-pocket" : "soft-action"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full surface-chip text-[color:var(--text-muted)]">
                          {isDone ? (
                            <CheckCircleIcon className="h-4.5 w-4.5 text-[color:var(--success)]" />
                          ) : isCurrent ? (
                            <ArrowPathIcon className="h-4.5 w-4.5 animate-spin text-[color:var(--accent-strong)]" />
                          ) : (
                            <span className="text-xs font-semibold">{index + 1}</span>
                          )}
                        </span>
                        <p className="text-sm text-[color:var(--text-base)]">{stage}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      );
    }

    if (current.id === "review") {
      return (
        <div className="grid gap-4">
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
                className={`rounded-[20px] px-4 py-4 ${index === 3 ? "soft-action-tint" : "soft-action"}`}
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
              {(scanExtraction?.scores ?? []).slice(0, 6).map((row) => (
                <div key={row.subject} className="soft-action rounded-[18px] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-[color:var(--text-strong)]">{row.subject}</p>
                    <span className="text-sm font-semibold text-[color:var(--text-strong)]">
                      {row.totalScore ?? "--"}
                    </span>
                  </div>
                </div>
              ))}
              {!scanExtraction?.scores?.length ? (
                <div className="soft-action rounded-[18px] px-4 py-4 text-sm text-[color:var(--text-muted)]">
                  No subject rows came through yet. You can still open the sheet and complete it there.
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
      );
    }

    return (
      <div className="grid gap-4">
        <div className="surface-pocket rounded-[26px] px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
            Ready
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
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[0.78fr_0.22fr]">
      <SectionCard title={current.title} description={current.description}>
        <div className="grid gap-5">
          <div className="flex flex-wrap gap-2">
            {steps.map((step, index) => {
              const active = index === currentStep;
              const visited = visitedSteps.includes(index);

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    if (visited || index <= currentStep) setCurrentStep(index);
                  }}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    active
                      ? "soft-action-tint font-semibold"
                      : visited
                        ? "soft-action font-medium"
                        : "surface-chip text-[color:var(--text-muted)]"
                  }`}
                >
                  {step.label}
                </button>
              );
            })}
          </div>

          {renderStepBody()}

          <div className="surface-pocket flex flex-wrap items-center justify-between gap-3 rounded-[24px] p-3">
            <div className="flex flex-wrap gap-2">
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="soft-action inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  Back
                </button>
              ) : null}

              <button
                type="button"
                onClick={resetFlow}
                className="soft-action rounded-full px-4 py-2 text-sm font-medium"
              >
                Reset
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {current.id === "scan" ? (
                <button
                  type="button"
                  onClick={analyzeScan}
                  disabled={isPending || isScanning || !scanPreviewUrl}
                  className="soft-action-tint inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
                >
                  {isScanning ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <ArrowUpTrayIcon className="h-4 w-4" />}
                  {isScanning ? "Scanning..." : "Scan image"}
                </button>
              ) : null}

              {current.id === "review" ? (
                <button
                  type="button"
                  onClick={useScanAndOpenSheet}
                  disabled={isPending || !scanExtraction || !selectedClassroom || !readyStudentName}
                  className="soft-action-tint rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
                >
                  Open reviewed sheet
                </button>
              ) : null}

              {current.id === "open" ? (
                <button
                  type="button"
                  onClick={openManualSheet}
                  disabled={isPending || !selectedClassroom || !readyStudentName}
                  className="soft-action-tint rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
                >
                  Open sheet
                </button>
              ) : null}

              {current.id !== "scan" && current.id !== "review" && current.id !== "open" ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNext}
                  className="soft-action-tint inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
                >
                  Continue
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Context" description="Your progress stays here while you move through the flow.">
        <div className="grid gap-3">
          <div className="surface-pocket rounded-[22px] px-4 py-4">
            <p className="text-sm text-[color:var(--text-muted)]">Path</p>
            <p className="mt-2 font-semibold text-[color:var(--text-strong)]">
              {mode === "scan" ? "Scan to prefill" : "Manual sheet"}
            </p>
          </div>
          <div className="surface-pocket rounded-[22px] px-4 py-4">
            <p className="text-sm text-[color:var(--text-muted)]">Class</p>
            <p className="mt-2 font-semibold text-[color:var(--text-strong)]">
              {selectedClassroom?.name ?? "--"}
            </p>
          </div>
          <div className="surface-pocket rounded-[22px] px-4 py-4">
            <p className="text-sm text-[color:var(--text-muted)]">Student</p>
            <p className="mt-2 font-semibold text-[color:var(--text-strong)]">
              {readyStudentName || "--"}
            </p>
          </div>
          <div className="surface-pocket rounded-[22px] px-4 py-4">
            <p className="text-sm text-[color:var(--text-muted)]">Progress</p>
            <p className="mt-2 font-semibold text-[color:var(--text-strong)]">
              Step {Math.min(currentStep + 1, steps.length)} of {steps.length}
            </p>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">
              {scanStatus}
            </p>
          </div>
          {mode === "scan" && scanExtraction?.summary?.grandTotal ? (
            <div className="soft-action-tint rounded-[22px] px-4 py-4">
              <p className="text-sm text-[color:var(--text-muted)]">Detected total</p>
              <p className="mt-2 text-2xl font-semibold text-[color:var(--text-strong)]">
                {scanExtraction.summary.grandTotal}
              </p>
            </div>
          ) : null}
        </div>
      </SectionCard>
    </div>
  );
}
