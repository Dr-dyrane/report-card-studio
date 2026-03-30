"use client";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useFeedback } from "@/components/feedback/FeedbackProvider";
import { BrandMark } from "@/components/ui/BrandMark";
import { authClient } from "@/lib/auth-client";

type AuthMode = "password" | "magic-link";

function cleanIdentifier(value: string) {
  return value.trim();
}

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

export function SignInFlow() {
  const router = useRouter();
  const { notify } = useFeedback();
  const [mode, setMode] = useState<AuthMode>("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const normalizedIdentifier = useMemo(
    () => cleanIdentifier(identifier),
    [identifier],
  );

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!normalizedIdentifier || !password.trim()) {
      setError("Enter your credentials.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const result = normalizedIdentifier.includes("@")
        ? await authClient.signIn.email({
            email: normalizedIdentifier,
            password,
            callbackURL: "/students",
          })
        : await authClient.signIn.username({
            username: normalizedIdentifier,
            password,
            callbackURL: "/students",
          });

      if (result.error) {
        throw result.error;
      }

      notify("Signed in.", "success");
      router.push("/students");
      router.refresh();
    } catch (submissionError) {
      setError(getErrorMessage(submissionError));
      notify("Sign-in failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMagicLinkSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!normalizedIdentifier) {
      setError("Enter your email.");
      return;
    }

    if (!normalizedIdentifier.includes("@")) {
      setError("Use an email address.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const result = await authClient.signIn.magicLink({
        email: normalizedIdentifier,
        callbackURL: "/students",
      });

      if (result.error) {
        throw result.error;
      }

      setMessage("Check your inbox.");
      notify("Magic link sent.", "success");
    } catch (submissionError) {
      setError(getErrorMessage(submissionError));
      notify("Could not send the magic link.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-[1120px] items-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <section className="frost-panel-strong rounded-[32px] px-5 py-6 sm:px-8 sm:py-8">
          <div className="max-w-xl">
            <BrandMark compact />
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--text-muted)]">
              Sign in
            </p>
            <h1 className="mt-3 font-display text-5xl leading-none text-[color:var(--text-strong)] sm:text-6xl">
              Kradle
            </h1>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="surface-pocket rounded-[24px] px-4 py-4">
                <p className="text-sm text-[color:var(--text-muted)]">Email</p>
                <p className="mt-2 text-xl font-semibold text-[color:var(--text-strong)]">
                  hello@dyrane.tech
                </p>
              </div>
              <div className="surface-pocket rounded-[24px] px-4 py-4">
                <p className="text-sm text-[color:var(--text-muted)]">Username</p>
                <p className="mt-2 text-xl font-semibold text-[color:var(--text-strong)]">
                  kradle
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="frost-panel rounded-[32px] px-5 py-6 sm:px-8 sm:py-8">
          <div className="rounded-[24px] surface-chip p-2">
            <div className="grid grid-cols-2 gap-2">
              {[
                ["password", "Password"],
                ["magic-link", "Magic link"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setMode(value as AuthMode);
                    setError(null);
                    setMessage(null);
                  }}
                  className={`rounded-[18px] px-4 py-3 text-sm font-medium transition ${
                    mode === value ? "soft-action-tint" : "soft-action"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {mode === "password" ? (
            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[color:var(--text-strong)]">
                  Email or username
                </span>
                <input
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="hello@dyrane.tech or kradle"
                  className="surface-input w-full rounded-[20px] border-0 px-4 py-3 text-base text-[color:var(--text-strong)] outline-none placeholder:text-[color:var(--text-muted)]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[color:var(--text-strong)]">
                  Password
                </span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    className="surface-input w-full rounded-[20px] border-0 px-4 py-3 pr-14 text-base text-[color:var(--text-strong)] outline-none placeholder:text-[color:var(--text-muted)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="soft-action absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full"
                  >
                    {showPassword ? (
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
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("magic-link");
                    setError(null);
                    setMessage(null);
                  }}
                  className="soft-action inline-flex items-center rounded-full px-5 py-3 text-sm font-medium"
                >
                  Magic link
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleMagicLinkSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[color:var(--text-strong)]">
                  Email
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
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
                  {isSubmitting ? "Sending..." : "Send link"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("password");
                    setError(null);
                    setMessage(null);
                  }}
                  className="soft-action inline-flex items-center rounded-full px-5 py-3 text-sm font-medium"
                >
                  Password
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
