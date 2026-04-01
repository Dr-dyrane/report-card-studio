"use client";

import {
  CalendarDaysIcon,
  ChevronRightIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/outline";
import { FormEvent, useMemo, useState, useTransition } from "react";
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
import { MobileBladeList } from "@/components/mobile/MobileBladeList";
import { ConfirmSurface } from "@/components/ui/ConfirmSurface";
import { Field } from "@/components/ui/Field";
import { FocusSurface } from "@/components/ui/FocusSurface";
import { SectionCard } from "@/components/ui/SectionCard";

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

type ActivePanel =
  | { kind: "session"; session?: SessionItem }
  | { kind: "term"; term?: TermItem }
  | null;

function Blade({
  icon,
  title,
  detail,
  summary,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail?: string;
  summary?: string;
  onClick: () => void;
}) {
  const Icon = icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group frost-panel-soft flex w-full items-center gap-3 rounded-[24px] px-4 py-4 text-left transition hover:translate-y-[-1px]"
    >
      <span className="surface-chip inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] text-[color:var(--text-base)]">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-3">
          <span className="truncate text-base font-semibold text-[color:var(--text-strong)]">
            {title}
          </span>
          {detail ? (
            <span className="truncate text-sm text-[color:var(--text-muted)]">{detail}</span>
          ) : null}
        </span>
        {summary ? (
          <span className="mt-1 block truncate text-sm text-[color:var(--text-muted)]">
            {summary}
          </span>
        ) : null}
      </span>
      <ChevronRightIcon className="h-4.5 w-4.5 shrink-0 text-[color:var(--text-muted)] transition group-hover:translate-x-0.5" />
    </button>
  );
}

function SessionEditor({
  schoolName,
  initialSession,
  onSaved,
}: {
  schoolName: string;
  initialSession?: SessionItem;
  onSaved: () => void;
}) {
  const router = useRouter();
  const { notify } = useFeedback();
  const [name, setName] = useState(initialSession?.name ?? "");
  const [isPending, startTransition] = useTransition();

  const hasValue = Boolean(name.trim());

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await saveAcademicSession({
        sessionId: initialSession?.id,
        name,
      });

      if (!result.ok) {
        notify(result.message, "error");
        return;
      }

      notify(result.message, "success");
      router.refresh();
      onSaved();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Field label="Workspace">
        <div className="surface-pocket rounded-[18px] px-4 py-3 text-sm text-[color:var(--text-base)]">
          {schoolName}
        </div>
      </Field>

      <Field label="Session name">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="surface-input w-full rounded-[18px] px-4 py-3 text-[color:var(--text-base)] outline-none"
          placeholder="2024/2025"
        />
      </Field>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => setName(initialSession?.name ?? "")}
          className="soft-action rounded-full px-4 py-2 text-sm font-medium"
        >
          Revert
        </button>
        <button
          type="submit"
          disabled={!hasValue || isPending}
          className="soft-action-tint rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

function TermEditor({
  sessions,
  activeSessionId,
  initialTerm,
  onSaved,
}: {
  sessions: SessionItem[];
  activeSessionId?: string | null;
  initialTerm?: TermItem;
  onSaved: () => void;
}) {
  const router = useRouter();
  const { notify } = useFeedback();
  const [sessionId, setSessionId] = useState(
    initialTerm?.sessionId ?? activeSessionId ?? sessions[0]?.id ?? "",
  );
  const [name, setName] = useState(initialTerm?.name ?? "");
  const [sequence, setSequence] = useState(String(initialTerm?.sequence ?? 1));
  const [nextTermBegins, setNextTermBegins] = useState(initialTerm?.nextTermBegins ?? "");
  const [isPending, startTransition] = useTransition();

  const canSave = Boolean(sessionId && name.trim() && sequence.trim());

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await saveTerm({
        termId: initialTerm?.id,
        sessionId,
        name,
        sequence,
        nextTermBegins,
      });

      if (!result.ok) {
        notify(result.message, "error");
        return;
      }

      notify(result.message, "success");
      router.refresh();
      onSaved();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Field label="Session">
        <select
          value={sessionId}
          onChange={(event) => setSessionId(event.target.value)}
          className="surface-input w-full rounded-[18px] px-4 py-3 text-[color:var(--text-base)] outline-none"
        >
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Term name">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="surface-input w-full rounded-[18px] px-4 py-3 text-[color:var(--text-base)] outline-none"
            placeholder="Second Term"
          />
        </Field>
        <Field label="Order">
          <input
            value={sequence}
            onChange={(event) => setSequence(event.target.value)}
            className="surface-input w-full rounded-[18px] px-4 py-3 text-[color:var(--text-base)] outline-none"
            inputMode="numeric"
          />
        </Field>
      </div>

      <Field label="Next begins">
        <input
          value={nextTermBegins}
          onChange={(event) => setNextTermBegins(event.target.value)}
          className="surface-input w-full rounded-[18px] px-4 py-3 text-[color:var(--text-base)] outline-none"
          placeholder="2026-05-04"
        />
      </Field>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setSessionId(initialTerm?.sessionId ?? activeSessionId ?? sessions[0]?.id ?? "");
            setName(initialTerm?.name ?? "");
            setSequence(String(initialTerm?.sequence ?? 1));
            setNextTermBegins(initialTerm?.nextTermBegins ?? "");
          }}
          className="soft-action rounded-full px-4 py-2 text-sm font-medium"
        >
          Revert
        </button>
        <button
          type="submit"
          disabled={!canSave || isPending}
          className="soft-action-tint rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

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
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [confirmState, setConfirmState] = useState<
    | { kind: "session"; id: string; title: string; description: string; label: string }
    | { kind: "term"; id: string; title: string; description: string; label: string }
    | null
  >(null);

  const activeSession = useMemo(
    () => sessions.find((item) => item.isActive) ?? sessions[0] ?? null,
    [sessions],
  );

  const activeTerm = useMemo(
    () => terms.find((item) => item.isActive) ?? terms[0] ?? null,
    [terms],
  );

  const activateSession = (id: string) => {
    startTransition(async () => {
      const result = await setActiveAcademicSession({ sessionId: id });
      if (!result.ok) {
        notify(result.message, "error");
        return;
      }

      notify(
        result.message,
        "success",
        result.previousSessionId
          ? {
              actionLabel: "Undo",
              action: () => {
                startTransition(async () => {
                  await setActiveAcademicSession({ sessionId: result.previousSessionId! });
                  router.refresh();
                });
              },
            }
          : undefined,
      );
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

      notify(
        result.message,
        "success",
        result.previousTermId
          ? {
              actionLabel: "Undo",
              action: () => {
                startTransition(async () => {
                  await setActiveTerm({ termId: result.previousTermId! });
                  router.refresh();
                });
              },
            }
          : undefined,
      );
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
    <div className="space-y-4 sm:space-y-6">
      <section className="premium-wash premium-sheen rounded-[26px] px-4 py-4 shadow-[var(--shadow-frost-strong)] sm:px-5 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[1.85rem] font-semibold tracking-tight text-[color:var(--text-strong)] sm:text-[2.1rem]">
              {schoolName}
            </p>
            <p className="mt-1.5 text-base text-[color:var(--text-base)]">
              {(activeTerm?.name ?? "No term")} · {(activeSession?.name ?? "No session")}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <span className="surface-chip rounded-full px-3.5 py-2 text-sm font-medium text-[color:var(--text-base)]">
                {sessions.length} sessions
              </span>
              <span className="surface-chip rounded-full px-3.5 py-2 text-sm font-medium text-[color:var(--text-base)]">
                {terms.length} terms
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <Blade
          icon={RectangleStackIcon}
          title="Sessions"
          detail={activeSession?.name ?? undefined}
          summary={`${sessions.length} total`}
          onClick={() => setActivePanel({ kind: "session" })}
        />
        <Blade
          icon={CalendarDaysIcon}
          title="Terms"
          detail={activeTerm?.name ?? undefined}
          summary={`${terms.length} total`}
          onClick={() => setActivePanel({ kind: "term" })}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Sessions">
          <MobileBladeList
            items={sessions.map((session) => {
              const actions = [
                {
                  label: "Edit",
                  href: "#",
                  tone: "accent" as const,
                  onClick: () => setActivePanel({ kind: "session", session }),
                },
                !session.isActive
                  ? {
                      label: "Make active",
                      href: "#",
                      onClick: () => activateSession(session.id),
                    }
                  : null,
              ].filter((action): action is NonNullable<typeof action> => Boolean(action));

              return {
                id: session.id,
                title: session.name,
                subtitle: `${session.termsCount} terms`,
                eyebrow: "Session",
                badge: {
                  label: session.isActive ? "Active" : "Inactive",
                  tone: session.isActive ? ("success" as const) : ("default" as const),
                },
                quickValue: String(session.reportCount),
                quickHint: "reports",
                meta: [
                  { label: "Terms", value: String(session.termsCount) },
                  { label: "Reports", value: String(session.reportCount) },
                ],
                actions,
              };
            })}
            emptyMessage="No sessions yet."
          />

          <div className="hidden gap-3 sm:grid">
            {sessions.map((session) => (
              <div key={session.id} className="surface-pocket rounded-[22px] px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[color:var(--text-strong)]">{session.name}</p>
                    <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                      {session.termsCount} terms · {session.reportCount} reports
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      session.isActive ? "mood-badge-success" : "soft-action"
                    }`}
                  >
                    {session.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActivePanel({ kind: "session", session })}
                    className="soft-action rounded-full px-3 py-2 text-sm font-medium"
                  >
                    Edit
                  </button>
                  {!session.isActive ? (
                    <button
                      type="button"
                      onClick={() => activateSession(session.id)}
                      className="soft-action-tint rounded-full px-3 py-2 text-sm font-semibold"
                    >
                      Make active
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmState({
                        kind: "session",
                        id: session.id,
                        title: "Remove session",
                        description:
                          "Only sessions without report history can be removed. Switch active sessions first.",
                        label: session.name,
                      })
                    }
                    className="rounded-full bg-[color:var(--danger-soft)] px-3 py-2 text-sm font-medium text-[color:var(--danger)]"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {!sessions.length ? (
              <div className="empty-state rounded-[22px] px-4 py-4 text-sm text-[color:var(--text-muted)]">
                No sessions yet.
              </div>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard title="Terms">
          <MobileBladeList
            items={terms.map((term) => {
              const actions = [
                {
                  label: "Edit",
                  href: "#",
                  tone: "accent" as const,
                  onClick: () => setActivePanel({ kind: "term", term }),
                },
                !term.isActive
                  ? {
                      label: "Make active",
                      href: "#",
                      onClick: () => activateTerm(term.id),
                    }
                  : null,
              ].filter((action): action is NonNullable<typeof action> => Boolean(action));

              return {
                id: term.id,
                title: term.name,
                subtitle: term.sessionName,
                eyebrow: "Term",
                badge: {
                  label: term.isActive ? "Active" : "Inactive",
                  tone: term.isActive ? ("success" as const) : ("default" as const),
                },
                quickValue: String(term.sequence),
                quickHint: "order",
                summary: term.nextTermBegins ? `Next begins ${term.nextTermBegins}` : undefined,
                meta: [
                  { label: "Session", value: term.sessionName },
                  { label: "Reports", value: String(term.reportCount) },
                  { label: "Order", value: String(term.sequence) },
                  { label: "Next", value: term.nextTermBegins ?? "--" },
                ],
                actions,
              };
            })}
            emptyMessage="No terms yet."
          />

          <div className="hidden gap-3 sm:grid">
            {terms.map((term) => (
              <div key={term.id} className="surface-pocket rounded-[22px] px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[color:var(--text-strong)]">{term.name}</p>
                    <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                      {term.sessionName} · Order {term.sequence}
                    </p>
                    {term.nextTermBegins ? (
                      <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                        Next begins {term.nextTermBegins}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      term.isActive ? "mood-badge-success" : "soft-action"
                    }`}
                  >
                    {term.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActivePanel({ kind: "term", term })}
                    className="soft-action rounded-full px-3 py-2 text-sm font-medium"
                  >
                    Edit
                  </button>
                  {!term.isActive ? (
                    <button
                      type="button"
                      onClick={() => activateTerm(term.id)}
                      className="soft-action-tint rounded-full px-3 py-2 text-sm font-semibold"
                    >
                      Make active
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmState({
                        kind: "term",
                        id: term.id,
                        title: "Remove term",
                        description: "Only inactive terms without report history can be removed.",
                        label: term.name,
                      })
                    }
                    className="rounded-full bg-[color:var(--danger-soft)] px-3 py-2 text-sm font-medium text-[color:var(--danger)]"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {!terms.length ? (
              <div className="empty-state rounded-[22px] px-4 py-4 text-sm text-[color:var(--text-muted)]">
                No terms yet.
              </div>
            ) : null}
          </div>
        </SectionCard>
      </div>

      <FocusSurface
        open={activePanel?.kind === "session"}
        onClose={() => setActivePanel(null)}
        title={activePanel?.kind === "session" && activePanel.session ? "Edit session" : "New session"}
      >
        <SessionEditor
          schoolName={schoolName}
          initialSession={activePanel?.kind === "session" ? activePanel.session : undefined}
          onSaved={() => setActivePanel(null)}
        />
      </FocusSurface>

      <FocusSurface
        open={activePanel?.kind === "term"}
        onClose={() => setActivePanel(null)}
        title={activePanel?.kind === "term" && activePanel.term ? "Edit term" : "New term"}
      >
        <TermEditor
          sessions={sessions}
          activeSessionId={activeSession?.id}
          initialTerm={activePanel?.kind === "term" ? activePanel.term : undefined}
          onSaved={() => setActivePanel(null)}
        />
      </FocusSurface>

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
            <div className="surface-pocket rounded-[22px] px-4 py-4">
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
