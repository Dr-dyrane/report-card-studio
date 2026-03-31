"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type FeedbackTone = "neutral" | "success" | "error";

type FeedbackItem = {
  id: number;
  message: string;
  tone: FeedbackTone;
  actionLabel?: string;
  action?: () => void;
};

type FeedbackContextValue = {
  notify: (
    message: string,
    tone?: FeedbackTone,
    options?: { actionLabel?: string; action?: () => void },
  ) => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

function toneClassName(tone: FeedbackTone) {
  if (tone === "success") return "bg-[color:var(--success-soft)] text-[color:var(--success)]";
  if (tone === "error") return "bg-[color:var(--danger-soft)] text-[color:var(--danger)]";
    return "surface-chip-strong text-[color:var(--text-strong)]";
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<FeedbackItem[]>([]);

  const notify = useCallback((
    message: string,
    tone: FeedbackTone = "neutral",
    options?: { actionLabel?: string; action?: () => void },
  ) => {
    const id = Date.now() + Math.random();
    setItems((current) => [
      ...current,
      {
        id,
        message,
        tone,
        actionLabel: options?.actionLabel,
        action: options?.action,
      },
    ]);

    window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id));
    }, 2400);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[120] flex flex-col items-center gap-2 px-4 sm:bottom-6">
        {items.map((item) => (
          <div
            key={item.id}
            className={`frost-panel pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-[var(--shadow-frost)] ${toneClassName(
              item.tone,
            )}`}
          >
            <span>{item.message}</span>
            {item.actionLabel && item.action ? (
              <button
                type="button"
                className="rounded-full px-2 py-1 text-xs font-semibold text-[color:var(--accent-strong)]"
                onClick={() => {
                  item.action?.();
                  setItems((current) => current.filter((entry) => entry.id !== item.id));
                }}
              >
                {item.actionLabel}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error("useFeedback must be used within FeedbackProvider.");
  }

  return context;
}
