"use client";

import {
  ArrowTopRightOnSquareIcon,
  ChevronRightIcon,
  PaintBrushIcon,
  RectangleStackIcon,
  SwatchIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  saveExportPreferences,
  saveWorkspaceProfile,
} from "@/app/(workspace)/settings/actions";
import { useFeedback } from "@/components/feedback/FeedbackProvider";
import { ThemeToggleInline } from "@/components/theme/ThemeToggleInline";
import { Field, InputShell } from "@/components/ui/Field";
import { FocusSurface } from "@/components/ui/FocusSurface";

type SettingsWorkspaceProps = {
  schoolName: string;
  activeSessionName: string;
  activeTermName: string;
  classroomsCount: number;
  subjectsCount: number;
  publishedReports: number;
  preferredStudentExport: "PDF" | "PREVIEW";
  preferredClassExport: "EXCEL" | "CSV";
};

type ActivePanel = "workspace" | "academic" | "appearance" | "exports" | null;

function Blade({
  icon,
  title,
  detail,
  summary,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
  summary: string;
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
          <span className="truncate text-sm text-[color:var(--text-muted)]">{detail}</span>
        </span>
        <span className="mt-1 block truncate text-sm text-[color:var(--text-muted)]">
          {summary}
        </span>
      </span>
      <ChevronRightIcon className="h-4.5 w-4.5 shrink-0 text-[color:var(--text-muted)] transition group-hover:translate-x-0.5" />
    </button>
  );
}

function WorkspaceEditor({
  initialName,
  sessionName,
  termName,
  onSaved,
}: {
  initialName: string;
  sessionName: string;
  termName: string;
  onSaved: () => void;
}) {
  const router = useRouter();
  const { notify } = useFeedback();
  const [name, setName] = useState(initialName);
  const [isPending, startTransition] = useTransition();

  const hasChanges = name.trim() !== initialName.trim();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await saveWorkspaceProfile({ name });
      if (!result.ok) {
        notify(result.message, "error");
        return;
      }

      notify(
        result.message,
        "success",
        result.previousName && result.previousName !== name.trim()
          ? {
              actionLabel: "Undo",
              action: async () => {
                await saveWorkspaceProfile({ name: result.previousName });
                router.refresh();
              },
            }
          : undefined,
      );
      router.refresh();
      onSaved();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Field label="Workspace name">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="surface-input w-full rounded-[18px] px-4 py-3 text-[color:var(--text-base)] outline-none"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Current session">
          <InputShell value={sessionName} />
        </Field>
        <Field label="Active term">
          <InputShell value={termName} />
        </Field>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          className="soft-action rounded-full px-4 py-2 text-sm font-medium"
          onClick={() => setName(initialName)}
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={!hasChanges || isPending}
          className="soft-action-tint rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save workspace"}
        </button>
      </div>
    </form>
  );
}

function InsetLinkRow({
  href,
  label,
  note,
}: {
  href: string;
  label: string;
  note: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-1 py-3 text-[color:var(--text-strong)]"
    >
      <span className="min-w-0">
        <span className="block font-medium">{label}</span>
        <span className="mt-1 block text-sm text-[color:var(--text-muted)]">{note}</span>
      </span>
      <ArrowTopRightOnSquareIcon className="h-4.5 w-4.5 shrink-0 text-[color:var(--text-muted)]" />
    </Link>
  );
}

function ExportPreferencesEditor({
  initialStudentExport,
  initialClassExport,
  publishedReports,
  classroomsCount,
  onSaved,
}: {
  initialStudentExport: "PDF" | "PREVIEW";
  initialClassExport: "EXCEL" | "CSV";
  publishedReports: number;
  classroomsCount: number;
  onSaved: () => void;
}) {
  const { notify } = useFeedback();
  const [preferredStudentExport, setPreferredStudentExport] = useState(initialStudentExport);
  const [preferredClassExport, setPreferredClassExport] = useState(initialClassExport);
  const [isPending, startTransition] = useTransition();

  const hasChanges =
    preferredStudentExport !== initialStudentExport ||
    preferredClassExport !== initialClassExport;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await saveExportPreferences({
        preferredStudentExport,
        preferredClassExport,
      });

      if (!result.ok) {
        notify(result.message, "error");
        return;
      }

      notify(result.message, "success");
      onSaved();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="premium-wash rounded-[22px] px-4 py-4 shadow-[var(--shadow-frost)]">
          <p className="text-sm font-semibold text-[color:var(--text-strong)]">Student export</p>
          <div className="mt-3 flex gap-2">
            {[
              ["PDF", "PDF"],
              ["PREVIEW", "Preview"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPreferredStudentExport(value as "PDF" | "PREVIEW")}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  preferredStudentExport === value ? "soft-action-tint" : "soft-action"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="premium-wash rounded-[22px] px-4 py-4 shadow-[var(--shadow-frost)]">
          <p className="text-sm font-semibold text-[color:var(--text-strong)]">Class export</p>
          <div className="mt-3 flex gap-2">
            {[
              ["EXCEL", "Excel"],
              ["CSV", "CSV"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPreferredClassExport(value as "EXCEL" | "CSV")}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  preferredClassExport === value ? "soft-action-tint" : "soft-action"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Published reports">
          <InputShell value={String(publishedReports)} compact />
        </Field>
        <Field label="Class files">
          <InputShell value={String(classroomsCount)} compact />
        </Field>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={!hasChanges || isPending}
          className="soft-action-tint rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save preferences"}
        </button>
      </div>
    </form>
  );
}

export function SettingsWorkspace({
  schoolName,
  activeSessionName,
  activeTermName,
  classroomsCount,
  subjectsCount,
  publishedReports,
  preferredStudentExport,
  preferredClassExport,
}: SettingsWorkspaceProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  return (
    <>
      <section className="premium-wash premium-sheen rounded-[26px] px-4 py-4 shadow-[var(--shadow-frost-strong)] sm:px-5 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[1.85rem] font-semibold tracking-tight text-[color:var(--text-strong)] sm:text-[2.1rem]">
              {schoolName}
            </p>
            <p className="mt-1.5 text-base text-[color:var(--text-base)]">
              {activeTermName} · {activeSessionName}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <span className="surface-chip rounded-full px-3.5 py-2 text-sm font-medium text-[color:var(--text-base)]">
                {classroomsCount} classes
              </span>
              <span className="surface-chip rounded-full px-3.5 py-2 text-sm font-medium text-[color:var(--text-base)]">
                {subjectsCount} subjects
              </span>
              <span className="surface-chip rounded-full px-3.5 py-2 text-sm font-medium text-[color:var(--text-base)]">
                {publishedReports} published reports
              </span>
            </div>
          </div>

          <div className="surface-pocket rounded-full px-4 py-2.5 text-sm text-[color:var(--text-muted)]">
            Workspace
          </div>
        </div>
      </section>

      <div className="grid gap-3">
        <Blade
          icon={RectangleStackIcon}
          title="Workspace"
          detail={schoolName}
          summary={activeSessionName}
          onClick={() => setActivePanel("workspace")}
        />
        <Blade
          icon={SwatchIcon}
          title="Academic context"
          detail={activeTermName}
          summary={`${classroomsCount} classes · ${subjectsCount} subjects`}
          onClick={() => setActivePanel("academic")}
        />
        <Blade
          icon={PaintBrushIcon}
          title="Appearance"
          detail="Theme"
          summary="Light, dark, system"
          onClick={() => setActivePanel("appearance")}
        />
        <Blade
          icon={ArrowTopRightOnSquareIcon}
          title="Exports"
          detail="Files"
          summary={`${preferredStudentExport} · ${preferredClassExport}`}
          onClick={() => setActivePanel("exports")}
        />
      </div>

      <FocusSurface
        open={activePanel === "workspace"}
        onClose={() => setActivePanel(null)}
        title="Workspace"
      >
        <WorkspaceEditor
          initialName={schoolName}
          sessionName={activeSessionName}
          termName={activeTermName}
          onSaved={() => setActivePanel(null)}
        />
      </FocusSurface>

      <FocusSurface
        open={activePanel === "academic"}
        onClose={() => setActivePanel(null)}
        title="Academic context"
      >
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Current session">
              <InputShell value={activeSessionName} />
            </Field>
            <Field label="Active term">
              <InputShell value={activeTermName} />
            </Field>
          </div>

          <div className="premium-wash overflow-hidden rounded-[22px] px-4 py-2 shadow-[var(--shadow-frost)]">
            <InsetLinkRow href="/terms" label="Terms" note="Set the active session and term." />
            <div className="border-t border-[color:var(--border-soft)]/40">
              <InsetLinkRow href="/classes" label="Classes" note="Organize classrooms and teaching groups." />
            </div>
            <div className="border-t border-[color:var(--border-soft)]/40">
              <InsetLinkRow href="/subjects" label="Subjects" note="Adjust subject rows and scoring structure." />
            </div>
          </div>
        </div>
      </FocusSurface>

      <FocusSurface
        open={activePanel === "appearance"}
        onClose={() => setActivePanel(null)}
        title="Appearance"
      >
        <div className="grid gap-4">
          <div className="premium-wash rounded-[22px] px-4 py-4 shadow-[var(--shadow-frost)]">
            <ThemeToggleInline />
          </div>
        </div>
      </FocusSurface>

      <FocusSurface
        open={activePanel === "exports"}
        onClose={() => setActivePanel(null)}
        title="Exports"
      >
        <div className="grid gap-4">
          <ExportPreferencesEditor
            initialStudentExport={preferredStudentExport}
            initialClassExport={preferredClassExport}
            publishedReports={publishedReports}
            classroomsCount={classroomsCount}
            onSaved={() => setActivePanel(null)}
          />

          <div className="premium-wash overflow-hidden rounded-[22px] px-4 py-2 shadow-[var(--shadow-frost)]">
            <InsetLinkRow href="/exports" label="Export center" note="Student files and class files." />
            <div className="border-t border-[color:var(--border-soft)]/40">
              <InsetLinkRow href="/reports" label="Reports" note="Review and publish before export." />
            </div>
          </div>
        </div>
      </FocusSurface>
    </>
  );
}
