"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { useFeedback } from "@/components/feedback/FeedbackProvider";
import { BrandMark } from "@/components/ui/BrandMark";
import { completeOnboarding } from "@/app/onboarding/actions";

type OnboardingStep = "workspace" | "classroom" | "finish";

type OnboardingFlowProps = {
  email: string;
  displayName: string;
};

const storageKey = "kradle-onboarding";

function makeDefaultSchoolName(displayName: string, email: string) {
  const base =
    displayName.trim() ||
    email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  return `${base}'s School`;
}

export function OnboardingFlow({ email, displayName }: OnboardingFlowProps) {
  const router = useRouter();
  const { notify } = useFeedback();
  const [initialState] = useState(() => {
    if (typeof window === "undefined") {
      return {
        step: "workspace" as OnboardingStep,
        schoolName: makeDefaultSchoolName(displayName, email),
        className: "",
      };
    }

    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        return {
          step: "workspace" as OnboardingStep,
          schoolName: makeDefaultSchoolName(displayName, email),
          className: "",
        };
      }

      const parsed = JSON.parse(raw) as {
        schoolName?: string;
        className?: string;
        step?: OnboardingStep;
      };

      return {
        step: parsed.step ?? ("workspace" as OnboardingStep),
        schoolName:
          parsed.schoolName ?? makeDefaultSchoolName(displayName, email),
        className: parsed.className ?? "",
      };
    } catch {
      return {
        step: "workspace" as OnboardingStep,
        schoolName: makeDefaultSchoolName(displayName, email),
        className: "",
      };
    }
  });
  const [step, setStep] = useState<OnboardingStep>(initialState.step);
  const [schoolName, setSchoolName] = useState(initialState.schoolName);
  const [className, setClassName] = useState(initialState.className);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const schoolInputRef = useRef<HTMLInputElement | null>(null);
  const classInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          schoolName,
          className,
          step,
        }),
      );
    } catch {}
  }, [schoolName, className, step]);

  useEffect(() => {
    if (step === "workspace") {
      schoolInputRef.current?.focus();
    }

    if (step === "classroom") {
      classInputRef.current?.focus();
    }
  }, [step]);

  const steps = useMemo(
    () => [
      { id: "workspace", label: "Workspace" },
      { id: "classroom", label: "Class" },
      { id: "finish", label: "Finish" },
    ] satisfies Array<{ id: OnboardingStep; label: string }>,
    [],
  );

  const submit = () => {
    setError(null);

    if (!schoolName.trim()) {
      setError("Add your school name.");
      setStep("workspace");
      return;
    }

    startTransition(async () => {
      const result = await completeOnboarding({
        schoolName,
        className,
      });

      if (!result.ok || !result.href) {
        setError(result.message ?? "Try again.");
        notify("Could not finish setup.", "error");
        return;
      }

      try {
        localStorage.removeItem(storageKey);
      } catch {}

      notify("Workspace ready.", "success");
      router.push(result.href);
      router.refresh();
    });
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-[1080px] items-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="frost-panel-strong rounded-[32px] px-5 py-6 sm:px-8 sm:py-8">
          <BrandMark compact />
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--text-muted)]">
            Onboarding
          </p>
          <h1 className="mt-3 font-display text-5xl leading-none text-[color:var(--text-strong)] sm:text-6xl">
            Kradle
          </h1>
          <div className="mt-6 surface-pocket rounded-[24px] px-4 py-4">
            <p className="text-sm text-[color:var(--text-muted)]">Account</p>
            <p className="mt-2 text-lg font-semibold text-[color:var(--text-strong)]">
              {email}
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2">
            {steps.map((item, index) => {
              const isActive = step === item.id;
              const isPast = steps.findIndex((entry) => entry.id === step) > index;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStep(item.id)}
                  className={`rounded-full px-3 py-2 text-sm transition ${
                    isActive
                      ? "soft-action-tint"
                      : isPast
                        ? "soft-action"
                        : "surface-chip text-[color:var(--text-muted)]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="frost-panel rounded-[32px] px-5 py-6 sm:px-8 sm:py-8">
          <div className="min-h-[420px]">
            {step === "workspace" ? (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                    Step 1
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold text-[color:var(--text-strong)]">
                    Name your workspace
                  </h2>
                </div>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[color:var(--text-strong)]">
                    School name
                  </span>
                  <input
                    ref={schoolInputRef}
                    type="text"
                    value={schoolName}
                    onChange={(event) => setSchoolName(event.target.value)}
                    className="surface-input w-full rounded-[20px] border-0 px-4 py-3 text-base text-[color:var(--text-strong)] outline-none"
                  />
                </label>
              </div>
            ) : null}

            {step === "classroom" ? (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                    Step 2
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold text-[color:var(--text-strong)]">
                    Add your first class
                  </h2>
                </div>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[color:var(--text-strong)]">
                    Class name
                  </span>
                  <input
                    ref={classInputRef}
                    type="text"
                    value={className}
                    onChange={(event) => setClassName(event.target.value)}
                    placeholder="Primary 5 Lavender"
                    className="surface-input w-full rounded-[20px] border-0 px-4 py-3 text-base text-[color:var(--text-strong)] outline-none placeholder:text-[color:var(--text-muted)]"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setStep("finish")}
                  className="soft-action inline-flex items-center rounded-full px-4 py-2 text-sm font-medium"
                >
                  Skip for now
                </button>
              </div>
            ) : null}

            {step === "finish" ? (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                    Step 3
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold text-[color:var(--text-strong)]">
                    Review
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="surface-pocket rounded-[24px] px-4 py-4">
                    <p className="text-sm text-[color:var(--text-muted)]">Workspace</p>
                    <p className="mt-2 text-lg font-semibold text-[color:var(--text-strong)]">
                      {schoolName || "Not set"}
                    </p>
                  </div>
                  <div className="surface-pocket rounded-[24px] px-4 py-4">
                    <p className="text-sm text-[color:var(--text-muted)]">First class</p>
                    <p className="mt-2 text-lg font-semibold text-[color:var(--text-strong)]">
                      {className || "Skip for now"}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {error ? (
              <p className="mt-6 rounded-[18px] bg-[color:var(--danger-soft)] px-4 py-3 text-sm text-[color:var(--danger)]">
                {error}
              </p>
            ) : null}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep((current) =>
                  current === "finish"
                    ? "classroom"
                    : current === "classroom"
                      ? "workspace"
                      : "workspace",
                );
              }}
              className="soft-action inline-flex items-center rounded-full px-4 py-3 text-sm font-medium"
            >
              Back
            </button>

            <div className="flex items-center gap-3">
              {step !== "finish" ? (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep((current) =>
                      current === "workspace" ? "classroom" : "finish",
                    );
                  }}
                  className="soft-action-tint inline-flex items-center rounded-full px-5 py-3 text-sm font-semibold"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={isPending}
                  className="soft-action-tint inline-flex items-center rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60"
                >
                  {isPending ? "Setting up..." : "Open workspace"}
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
