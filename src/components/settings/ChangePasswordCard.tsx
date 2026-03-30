"use client";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { FormEvent, useState } from "react";

import { useFeedback } from "@/components/feedback/FeedbackProvider";
import { Field } from "@/components/ui/Field";

function getErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }

    if (
      "error" in error &&
      error.error &&
      typeof error.error === "object" &&
      "message" in error.error &&
      typeof error.error.message === "string"
    ) {
      return error.error.message;
    }
  }

  return "Try again.";
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <Field label={label}>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="surface-input w-full rounded-[20px] border-0 px-4 py-3 pr-14 text-base text-[color:var(--text-strong)] outline-none placeholder:text-[color:var(--text-muted)]"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="soft-action absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full"
        >
          {visible ? (
            <EyeSlashIcon className="h-4.5 w-4.5 text-[color:var(--text-base)]" />
          ) : (
            <EyeIcon className="h-4.5 w-4.5 text-[color:var(--text-base)]" />
          )}
        </button>
      </div>
    </Field>
  );
}

export function ChangePasswordCard() {
  const { notify } = useFeedback();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentPassword.trim() || !newPassword.trim()) {
      setError("Enter both passwords.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
          revokeOtherSessions,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; error?: { message?: string } }
        | null;

      if (!response.ok) {
        throw payload?.error?.message ?? payload?.message ?? "Try again.";
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password updated.");
      notify("Password updated.", "success");
    } catch (submissionError) {
      const nextError = getErrorMessage(submissionError);
      setError(nextError);
      notify("Could not update the password.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <PasswordField
        label="Current password"
        value={currentPassword}
        onChange={setCurrentPassword}
        autoComplete="current-password"
      />
      <PasswordField
        label="New password"
        value={newPassword}
        onChange={setNewPassword}
        autoComplete="new-password"
      />
      <PasswordField
        label="Confirm password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        autoComplete="new-password"
      />

      <label className="surface-chip inline-flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm text-[color:var(--text-base)]">
        <input
          type="checkbox"
          checked={revokeOtherSessions}
          onChange={(event) => setRevokeOtherSessions(event.target.checked)}
          className="h-4 w-4 accent-[color:var(--accent)]"
        />
        Sign out other devices
      </label>

      {error ? (
        <p className="rounded-[18px] bg-[color:var(--danger-soft)] px-4 py-3 text-sm text-[color:var(--danger)]">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-[18px] bg-[color:var(--success-soft)] px-4 py-3 text-sm text-[color:var(--success)]">
          {message}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="soft-action-tint inline-flex items-center rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Change password"}
        </button>
      </div>
    </form>
  );
}
