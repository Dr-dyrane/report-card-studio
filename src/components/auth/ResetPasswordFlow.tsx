"use client";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useFeedback } from "@/components/feedback/FeedbackProvider";
import { AuthFooterLinks, AuthFrame } from "@/components/auth/AuthFrame";

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

export function ResetPasswordFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { notify } = useFeedback();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get("token");
  const tokenError = searchParams.get("error");

  const invalidState = useMemo(() => {
    if (tokenError) {
      return tokenError === "INVALID_TOKEN" ? "Link expired." : "Link invalid.";
    }

    if (!token) {
      return "Open the reset link from your email.";
    }

    return null;
  }, [token, tokenError]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setError("Open the reset link from your email.");
      return;
    }

    if (!newPassword.trim()) {
      setError("Enter a new password.");
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
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; error?: { message?: string } }
        | null;

      if (!response.ok) {
        throw payload?.error?.message ?? payload?.message ?? "Try again.";
      }

      setMessage("Password updated.");
      notify("Password updated.", "success");
      window.setTimeout(() => {
        router.push("/sign-in");
        router.refresh();
      }, 900);
    } catch (submissionError) {
      const nextError = getErrorMessage(submissionError);
      setError(nextError);
      notify("Could not update the password.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (invalidState) {
    return (
      <AuthFrame
        eyebrow="Password"
        title="Reset"
        footer={
          <AuthFooterLinks
            primaryHref="/forgot-password"
            primaryLabel="Send a new link"
            secondaryHref="/sign-in"
            secondaryLabel="Sign in"
          />
        }
      >
        <div className="space-y-4">
          <p className="rounded-[18px] bg-[color:var(--danger-soft)] px-4 py-3 text-sm text-[color:var(--danger)]">
            {invalidState}
          </p>
        </div>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame
      eyebrow="Password"
      title="New password"
      footer={
        <AuthFooterLinks
          primaryHref="/sign-in"
          primaryLabel="Back to sign in"
          secondaryHref="/forgot-password"
          secondaryLabel="Send another link"
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[color:var(--text-strong)]">
            New password
          </span>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              autoComplete="new-password"
              autoFocus
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="New password"
              className="surface-input w-full rounded-[20px] border-0 px-4 py-3 pr-14 text-base text-[color:var(--text-strong)] outline-none placeholder:text-[color:var(--text-muted)]"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((value) => !value)}
              aria-label={showNewPassword ? "Hide password" : "Show password"}
              className="soft-action absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full"
            >
              {showNewPassword ? (
                <EyeSlashIcon className="h-4.5 w-4.5 text-[color:var(--text-base)]" />
              ) : (
                <EyeIcon className="h-4.5 w-4.5 text-[color:var(--text-base)]" />
              )}
            </button>
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[color:var(--text-strong)]">
            Confirm password
          </span>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm password"
              className="surface-input w-full rounded-[20px] border-0 px-4 py-3 pr-14 text-base text-[color:var(--text-strong)] outline-none placeholder:text-[color:var(--text-muted)]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              className="soft-action absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full"
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-4.5 w-4.5 text-[color:var(--text-base)]" />
              ) : (
                <EyeIcon className="h-4.5 w-4.5 text-[color:var(--text-base)]" />
              )}
            </button>
          </div>
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

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="soft-action-tint inline-flex items-center rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Update password"}
          </button>
          <Link
            href="/sign-in"
            className="text-sm font-medium text-[color:var(--text-muted)] transition hover:text-[color:var(--text-strong)]"
          >
            Sign in
          </Link>
        </div>
      </form>
    </AuthFrame>
  );
}
