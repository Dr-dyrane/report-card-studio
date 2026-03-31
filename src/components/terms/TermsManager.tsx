"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  removeAcademicSession,
  removeTerm,
  saveAcademicSession,
  saveTerm,
  setActiveAcademicSession,
  setActiveTerm,
} from "@/app/(workspace)/terms/actions";
import { useFeedback } from "@/components/feedback/FeedbackProvider";
import { ConfirmSurface } from "@/components/ui/ConfirmSurface";
import { Field } from "@/components/ui/Field";

type SessionItem = {
  id: string;
  name: string;
  isActive: boolean;
  termsCount: number;
  reportCount: number;
};

type TermItem = {
  id: string;
  name: string;
  sequence: number;
  isActive: boolean;
  nextTermBegins: string | null;
  sessionId: string;
  sessionName: string;
  reportCount: number;
};

export function TermsManager({
  sessions,
  terms,
  schoolName,
}: {
  sessions: SessionItem[];
  terms: TermItem[];
  schoolName: string;
}) {
  const router = useRouter();
  const { notify } = useFeedback();
  const [isPending, startTransition] = useTransition();
  const [sessionName, setSessionName] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [termId, setTermId] = useState<string | null>(null);
  const [termName, setTermName] = useState("");
  const [termSequence, setTermSequence] = useState("1");
  const [nextTermBegins, setNextTermBegins] = useState("");
  const [termSessionId, setTermSessionId] = useState(sessions[0]?.id ?? "");
  const [confirmState, setConfirmState] = useState<
    | { kind: "session"; id: string; title: string; description: string; label: string }
    | { kind: "term"; id: string; title: string; description: string; label: string }
    | null
  >(null);

  const activeSession = useMemo(
    () => sessions.find((item) => item.isActive) ?? sessions[0] ?? null,
    [sessions],
  );

  const openSessionEditor = (session?: SessionItem) => {
    setEditingSessionId(session?.id ?? null);
    setSessionName(session?.name ?? "");
  };

  const openTermEditor = (term?: TermItem) => {
    setTermId(term?.id ?? null);
    setTermName(term?.name ?? "");
    setTermSequence(String(term?.sequence ?? (terms.length + 1)));
    setNextTermBegins(term?.nextTermBegins ?? "");
    setTermSessionId(term?.sessionId ?? activeSession?.id ?? sessions[0]?.id ?? "");
  };

  const saveSession = () => {
    startTransition(async () => {
      const result = await saveAcademicSession({
        sessionId: editingSessionId ?? undefined,
        name: sessionName,
      });

      if (!result.ok) {
        notify(result.message, "error");
        return;
      }

      notify(result.message, "success");
      openSessionEditor();
      router.refresh();
    });
  };

  const saveNextTerm = () => {
    startTransition(async () => {
      const result = await saveTerm({
        termId: termId ?? undefined,
        sessionId: termSessionId,
        name: termName,
        sequence: termSequence,
        nextTermBegins,
      });

      if (!result.ok) {
        notify(result.message, "error");
        return;
      }

      notify(result.message, "success");
      openTermEditor();
      router.refresh();
    });
  };

  const activateSession = (id: string) => {
    startTransition(async () => {
      const result = await setActiveAcademicSession({ sessionId: id });
      if (!result.ok) {
        notify(result.message, "error");
        return;
      }

      notify(result.message, "success", result.previousSessionId
        ? {
            actionLabel: "Undo",
            action: () => {
              startTransition(async () => {
                await setActiveAcademicSession({ sessionId: result.previousSessionId! });
                router.refresh();
              });
            },
          }
        : undefined);
      router.refresh();
    });
  };

  const activateTerm = (id: string) => {
    startTransition(async () => {
      const result = await setActiveTerm({ termId: id });
      if (!result.ok) {
        notify(result.message, "error");
        return;
      }

      notify(result.message, "success", result.previousTermId
        ? {
            actionLabel: "Undo",
            action: () => {
              startTransition(async () => {
                await setActiveTerm({ termId: result.previousTermId! });
                router.refresh();
              });
            },
          }
        : undefined);
      router.refresh();
    });
  };

  const confirmRemove = () => {
    if (!confirmState) return;

    startTransition(async () => {
      const result =
        confirmState.kind === "session"
          ? await removeAcademicSession({ sessionId: confirmState.id })
          : await removeTerm({ termId: confirmState.id });

      if (!result.ok) {
        notify(result.message, "error");
        return;
      }

      notify(result.message, "success");
      setConfirmState(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="frost-panel rounded-[24px] px-5 py-5 sm:rounded-[30px] sm:px-7 sm:py-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[color:var(--text-strong)] sm:text-xl">
              Sessions
            </h2>
            <button
              type="button"
              className="soft-action rounded-full px-4 py-2 text-sm font-medium"
              onClick={() => openSessionEditor()}
            >
              New session
            </button>
          </div>

          <div className="grid gap-3">
            {sessions.map((session) => (
              <div key={session.id} className="surface-pocket rounded-[22px] px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[color:var(--text-strong)]">{session.name}</p>
                    <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                      {session.termsCount} terms / {session.reportCount} reports
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${session.isActive ? "soft-action-tint" : "soft-action"}`}>
                    {session.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" className="soft-action rounded-full px-3 py-2 text-sm font-medium" onClick={() => openSessionEditor(session)}>
                    Edit
                  </button>
                  {!session.isActive ? (
                    <button type="button" className="soft-action-tint rounded-full px-3 py-2 text-sm font-semibold" onClick={() => activateSession(session.id)}>
                      Make active
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="rounded-full bg-[color:var(--danger-soft)] px-3 py-2 text-sm font-medium text-[color:var(--danger)]"
                    onClick={() =>
                      setConfirmState({
                        kind: "session",
                        id: session.id,
                        title: "Remove session",
                        description:
                          "Only sessions without report history can be removed. Active sessions must be switched first.",
                        label: session.name,
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="frost-panel rounded-[24px] px-5 py-5 sm:rounded-[30px] sm:px-7 sm:py-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[color:var(--text-strong)] sm:text-xl">
              Session editor
            </h2>
          </div>
          <div className="grid gap-5">
            <Field label="Workspace">
              <div className="surface-pocket rounded-[18px] px-4 py-3 text-sm text-[color:var(--text-base)]">
                {schoolName}
              </div>
            </Field>
            <Field label="Name">
              <input
                value={sessionName}
                onChange={(event) => setSessionName(event.target.value)}
                className="surface-input w-full rounded-[18px] px-4 py-3 text-sm text-[color:var(--text-base)] outline-none"
                placeholder="2024/2025"
              />
            </Field>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="soft-action rounded-full px-4 py-2 text-sm font-medium" onClick={() => openSessionEditor()}>
                Clear
              </button>
              <button type="button" className="soft-action-tint rounded-full px-4 py-2 text-sm font-semibold" onClick={saveSession} disabled={isPending}>
                {isPending ? "Saving..." : editingSessionId ? "Save session" : "Create session"}
              </button>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="frost-panel rounded-[24px] px-5 py-5 sm:rounded-[30px] sm:px-7 sm:py-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[color:var(--text-strong)] sm:text-xl">
              Terms
            </h2>
            <button type="button" className="soft-action rounded-full px-4 py-2 text-sm font-medium" onClick={() => openTermEditor()}>
              New term
            </button>
          </div>

          <div className="grid gap-3">
            {terms.map((term) => (
              <div key={term.id} className="surface-pocket rounded-[22px] px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[color:var(--text-strong)]">{term.name}</p>
                    <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                      {term.sessionName} / Order {term.sequence}
                    </p>
                    {term.nextTermBegins ? (
                      <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                        Next begins {term.nextTermBegins}
                      </p>
                    ) : null}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${term.isActive ? "soft-action-tint" : "soft-action"}`}>
                    {term.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" className="soft-action rounded-full px-3 py-2 text-sm font-medium" onClick={() => openTermEditor(term)}>
                    Edit
                  </button>
                  {!term.isActive ? (
                    <button type="button" className="soft-action-tint rounded-full px-3 py-2 text-sm font-semibold" onClick={() => activateTerm(term.id)}>
                      Make active
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="rounded-full bg-[color:var(--danger-soft)] px-3 py-2 text-sm font-medium text-[color:var(--danger)]"
                    onClick={() =>
                      setConfirmState({
                        kind: "term",
                        id: term.id,
                        title: "Remove term",
                        description:
                          "Only inactive terms without report history can be removed.",
                        label: term.name,
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="frost-panel rounded-[24px] px-5 py-5 sm:rounded-[30px] sm:px-7 sm:py-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[color:var(--text-strong)] sm:text-xl">
              Term editor
            </h2>
          </div>
          <div className="grid gap-5">
            <Field label="Session">
              <select
                value={termSessionId}
                onChange={(event) => setTermSessionId(event.target.value)}
                className="surface-input w-full rounded-[18px] px-4 py-3 text-sm text-[color:var(--text-base)] outline-none"
              >
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Name">
                <input
                  value={termName}
                  onChange={(event) => setTermName(event.target.value)}
                  className="surface-input w-full rounded-[18px] px-4 py-3 text-sm text-[color:var(--text-base)] outline-none"
                  placeholder="Second Term"
                />
              </Field>
              <Field label="Order">
                <input
                  value={termSequence}
                  onChange={(event) => setTermSequence(event.target.value)}
                  className="surface-input w-full rounded-[18px] px-4 py-3 text-sm text-[color:var(--text-base)] outline-none"
                  inputMode="numeric"
                />
              </Field>
            </div>
            <Field label="Next begins">
              <input
                value={nextTermBegins}
                onChange={(event) => setNextTermBegins(event.target.value)}
                className="surface-input w-full rounded-[18px] px-4 py-3 text-sm text-[color:var(--text-base)] outline-none"
                placeholder="2026-05-04"
              />
            </Field>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="soft-action rounded-full px-4 py-2 text-sm font-medium" onClick={() => openTermEditor()}>
                Clear
              </button>
              <button type="button" className="soft-action-tint rounded-full px-4 py-2 text-sm font-semibold" onClick={saveNextTerm} disabled={isPending}>
                {isPending ? "Saving..." : termId ? "Save term" : "Create term"}
              </button>
            </div>
          </div>
        </section>
      </div>

      <ConfirmSurface
        open={Boolean(confirmState)}
        onClose={() => setConfirmState(null)}
        onConfirm={confirmRemove}
        busy={isPending}
        title={confirmState?.title ?? "Remove"}
        description={confirmState?.description ?? ""}
        confirmLabel="Remove"
        supportingContent={
          confirmState ? (
            <div className="rounded-[22px] surface-pocket px-4 py-4">
              <p className="text-sm font-semibold text-[color:var(--text-strong)]">
                {confirmState.label}
              </p>
            </div>
          ) : null
        }
      />
    </div>
  );
}
