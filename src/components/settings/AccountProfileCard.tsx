"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useFeedback } from "@/components/feedback/FeedbackProvider";
import { Field } from "@/components/ui/Field";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { getGeneratedAvatarUrl } from "@/lib/avatar";
import { authClient } from "@/lib/auth-client";

type AccountProfileCardProps = {
  name: string;
  email: string;
  username: string;
  image?: string | null;
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
  image: initialImage,
}: AccountProfileCardProps) {
  const router = useRouter();
  const { notify } = useFeedback();
  const session = authClient.useSession();
  const [name, setName] = useState(initialName);
  const [username, setUsername] = useState(initialUsername);
  const [image, setImage] = useState(initialImage ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const generatedAvatarUrl = useMemo(
    () => getGeneratedAvatarUrl({ name, username, email }),
    [email, name, username],
  );

  const hasChanges = useMemo(
    () =>
      name.trim() !== initialName.trim() ||
      username.trim().toLowerCase() !== initialUsername.trim().toLowerCase() ||
      image.trim() !== (initialImage?.trim() ?? ""),
    [image, initialImage, initialName, initialUsername, name, username],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextName = name.trim();
    const nextUsername = username.trim().toLowerCase();
    const nextImage = image.trim();

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
          image: nextImage || null,
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
      <div className="surface-pocket flex flex-col gap-4 rounded-[22px] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <UserAvatar
            name={name}
            username={username}
            email={email}
            image={image}
            sizeClassName="h-20 w-20"
            textClassName="text-2xl"
            roundedClassName="rounded-[24px]"
            className="surface-chip-strong"
          />
          <div className="min-w-0">
            <p className="text-lg font-semibold text-[color:var(--text-strong)]">
              {name.trim() || "Kradle"}
            </p>
            <p className="mt-1 truncate text-sm text-[color:var(--text-muted)]">{email}</p>
            <p className="mt-2 text-sm font-medium text-[color:var(--accent-strong)]">
              @{username.trim() || "kradle"}
            </p>
          </div>
        </div>
        <div className="surface-chip rounded-[18px] px-4 py-3 text-sm text-[color:var(--text-muted)]">
          Generated fallback stays in sync with your name and username.
        </div>
      </div>

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

      <Field label="Avatar image URL">
        <div className="grid gap-3">
          <input
            value={image}
            onChange={(event) => setImage(event.target.value)}
            autoCapitalize="none"
            autoComplete="url"
            spellCheck={false}
            placeholder={generatedAvatarUrl}
            className="surface-input w-full rounded-[18px] px-4 py-3 text-[color:var(--text-base)] outline-none placeholder:text-[color:var(--text-muted)]"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setImage(generatedAvatarUrl)}
              className="soft-action rounded-full px-4 py-2 text-sm font-medium"
            >
              Use generated
            </button>
            <button
              type="button"
              onClick={() => setImage("")}
              className="soft-action rounded-full px-4 py-2 text-sm font-medium"
            >
              Clear custom
            </button>
          </div>
        </div>
      </Field>

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
