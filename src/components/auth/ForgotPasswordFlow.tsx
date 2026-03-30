"use client";

import { FormEvent, useState } from "react";

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

export function ForgotPasswordFlow() {
  const { notify } = useFeedback();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail.includes("@")) {
      setError("Use an email address.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          redirectTo: "/reset-password",
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; error?: { message?: string } }
        | null;

      if (!response.ok) {
        throw payload?.error?.message ?? payload?.message ?? "Try again.";
      }

      setMessage(payload?.message ?? "Check your inbox.");
      notify("Reset link sent.", "success");
    } catch (submissionError) {
      const nextError = getErrorMessage(submissionError);
      setError(nextError);
      notify("Could not send the reset link.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFrame
      eyebrow="Password"
      title="Reset"
      footer={
        <AuthFooterLinks
          primaryHref="/sign-in"
          primaryLabel="Back to sign in"
          secondaryHref="/sign-in"
          secondaryLabel="Password"
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[color:var(--text-strong)]">
            Email
          </span>
          <input
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="hello@dyrane.tech"
            className="surface-input w-full rounded-[20px] border-0 px-4 py-3 text-base text-[color:var(--text-strong)] outline-none placeholder:text-[color:var(--text-muted)]"
          />
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
            {isSubmitting ? "Sending..." : "Send reset link"}
          </button>
        </div>
      </form>
    </AuthFrame>
  );
}
