"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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

type FlowMode = "manual" | "scan";

type PersistedState = {
  mode: FlowMode;
  selectedClassroomId: string;
  classQuery: string;
  studentName: string;
  scanPreviewUrl: string | null;
  scanExtraction: ScanExtraction | null;
  scanStatus: string;
  currentStep: number;
  visitedSteps: number[];
};

type NewReportFlowContextValue = PersistedState & {
  setMode: (mode: FlowMode) => void;
  setSelectedClassroomId: (value: string) => void;
  setClassQuery: (value: string) => void;
  setStudentName: (value: string) => void;
  setScanPreviewUrl: (value: string | null) => void;
  setScanExtraction: (value: ScanExtraction | null) => void;
  setScanStatus: (value: string) => void;
  setCurrentStep: (value: number) => void;
  markVisited: (value: number) => void;
  resetFlow: () => void;
};

const STORAGE_KEY = "kradle-new-report-flow";

const NewReportFlowContext = createContext<NewReportFlowContextValue | null>(null);

export function NewReportFlowProvider({
  children,
  initialMode,
  initialClassroomId,
}: {
  children: ReactNode;
  initialMode: FlowMode;
  initialClassroomId: string;
}) {
  const [hydrated, setHydrated] = useState(false);
  const [mode, setModeState] = useState<FlowMode>(initialMode);
  const [selectedClassroomId, setSelectedClassroomId] = useState(initialClassroomId);
  const [classQuery, setClassQuery] = useState("");
  const [studentName, setStudentName] = useState("");
  const [scanPreviewUrl, setScanPreviewUrl] = useState<string | null>(null);
  const [scanExtraction, setScanExtraction] = useState<ScanExtraction | null>(null);
  const [scanStatus, setScanStatus] = useState("Ready");
  const [currentStep, setCurrentStepState] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState<number[]>([0]);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setHydrated(true);
        return;
      }

      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      setModeState(parsed.mode === "scan" ? "scan" : initialMode);
      setSelectedClassroomId(parsed.selectedClassroomId || initialClassroomId);
      setClassQuery(parsed.classQuery || "");
      setStudentName(parsed.studentName || "");
      setScanPreviewUrl(parsed.scanPreviewUrl || null);
      setScanExtraction(parsed.scanExtraction || null);
      setScanStatus(parsed.scanStatus || "Ready");
      setCurrentStepState(typeof parsed.currentStep === "number" ? parsed.currentStep : 0);
      setVisitedSteps(
        Array.isArray(parsed.visitedSteps) && parsed.visitedSteps.length
          ? parsed.visitedSteps
          : [0],
      );
    } catch {
      // Keep defaults if hydration fails.
    } finally {
      setHydrated(true);
    }
  }, [initialClassroomId, initialMode]);

  useEffect(() => {
    if (!hydrated) return;

    const payload: PersistedState = {
      mode,
      selectedClassroomId,
      classQuery,
      studentName,
      scanPreviewUrl,
      scanExtraction,
      scanStatus,
      currentStep,
      visitedSteps,
    };

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [
    classQuery,
    currentStep,
    hydrated,
    mode,
    scanExtraction,
    scanPreviewUrl,
    scanStatus,
    selectedClassroomId,
    studentName,
    visitedSteps,
  ]);

  const value = useMemo<NewReportFlowContextValue>(() => {
    const markVisited = (step: number) => {
      setVisitedSteps((current) => (current.includes(step) ? current : [...current, step]));
    };

    const setCurrentStep = (step: number) => {
      setCurrentStepState(step);
      markVisited(step);
    };

    const setMode = (nextMode: FlowMode) => {
      setModeState(nextMode);
      setCurrentStepState(0);
      setVisitedSteps([0]);
      setScanPreviewUrl(null);
      setScanExtraction(null);
      setScanStatus("Ready");
    };

    const resetFlow = () => {
      setModeState(initialMode);
      setSelectedClassroomId(initialClassroomId);
      setClassQuery("");
      setStudentName("");
      setScanPreviewUrl(null);
      setScanExtraction(null);
      setScanStatus("Ready");
      setCurrentStepState(0);
      setVisitedSteps([0]);
      window.sessionStorage.removeItem(STORAGE_KEY);
    };

    return {
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
      markVisited,
      resetFlow,
    };
  }, [
    classQuery,
    currentStep,
    initialClassroomId,
    initialMode,
    mode,
    scanExtraction,
    scanPreviewUrl,
    scanStatus,
    selectedClassroomId,
    studentName,
    visitedSteps,
  ]);

  return (
    <NewReportFlowContext.Provider value={value}>
      {children}
    </NewReportFlowContext.Provider>
  );
}

export function useNewReportFlow() {
  const context = useContext(NewReportFlowContext);

  if (!context) {
    throw new Error("useNewReportFlow must be used within NewReportFlowProvider.");
  }

  return context;
}
