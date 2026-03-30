"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useFeedback } from "@/components/feedback/FeedbackProvider";
import { Field } from "@/components/ui/Field";
import { authClient } from "@/lib/auth-client";

type AccountProfileCardProps = {
  name: string;
  email: string;
  username: string;
};

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

export function AccountProfileCard({
  name: initialName,
  email,
  username: initialUsername,
}: AccountProfileCardProps) {
  const router = useRouter();
  const { notify } = useFeedback();
  const session = authClient.useSession();
  const [name, setName] = useState(initialName);
  const [username, setUsername] = useState(initialUsername);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasChanges = useMemo(
    () =>
      name.trim() !== initialName.trim() ||
      username.trim().toLowerCase() !== initialUsername.trim().toLowerCase(),
    [initialName, initialUsername, name, username],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextName = name.trim();
    const nextUsername = username.trim().toLowerCase();

    if (!nextName) {
      setError("Enter a name.");
      return;
    }

    if (!nextUsername) {
      setError("Enter a username.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/update-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: nextName,
          username: nextUsername,
          displayUsername: nextUsername,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; error?: { message?: string } }
        | null;

      if (!response.ok) {
        throw payload?.error?.message ?? payload?.message ?? "Try again.";
      }

      await session.refetch();
      router.refresh();
      setMessage("Saved.");
      notify("Account updated.", "success");
    } catch (submissionError) {
      const nextError = getErrorMessage(submissionError);
      setError(nextError);
      notify("Could not update the account.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <Field label="Name">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          className="surface-input w-full rounded-[18px] px-4 py-3 text-[color:var(--text-base)] outline-none placeholder:text-[color:var(--text-muted)]"
        />
      </Field>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
        <Field label="Email">
          <input
            value={email}
            readOnly
            className="surface-input w-full rounded-[18px] px-4 py-3 text-[color:var(--text-muted)] outline-none"
          />
        </Field>

        <Field label="Username">
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoCapitalize="none"
            autoComplete="username"
            spellCheck={false}
            className="surface-input w-full rounded-[18px] px-4 py-3 text-[color:var(--text-base)] outline-none placeholder:text-[color:var(--text-muted)]"
          />
        </Field>
      </div>

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
          disabled={isSubmitting || !hasChanges}
          className="soft-action-tint inline-flex items-center rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
