"use client";

import {
  CameraIcon,
  ChevronRightIcon,
  KeyIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { AccountSignOutRow } from "@/components/account/AccountSignOutRow";
import { useFeedback } from "@/components/feedback/FeedbackProvider";
import { ChangePasswordCard } from "@/components/settings/ChangePasswordCard";
import { Field } from "@/components/ui/Field";
import { FocusSurface } from "@/components/ui/FocusSurface";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { authClient } from "@/lib/auth-client";
import { getGeneratedAvatarUrl } from "@/lib/avatar";

type ProfileWorkspaceProps = {
  user: {
    name?: string | null;
    email?: string | null;
    username?: string | null;
    image?: string | null;
  };
  schoolName?: string | null;
};

type ActivePanel = "identity" | "avatar" | "security" | null;

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

  return "Could not save.";
}

async function updateUserAccount(input: {
  name?: string;
  username?: string;
  displayUsername?: string;
  image?: string | null;
}) {
  const response = await fetch("/api/auth/update-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const payload = (await response.json().catch(() => null)) as
    | { message?: string; error?: { message?: string } }
    | null;

  if (!response.ok) {
    throw payload?.error?.message ?? payload?.message ?? "Could not save.";
  }
}

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

function IdentityEditor({
  initialName,
  initialEmail,
  initialUsername,
  onSaved,
}: {
  initialName: string;
  initialEmail: string;
  initialUsername: string;
  onSaved: () => void;
}) {
  const router = useRouter();
  const { notify } = useFeedback();
  const session = authClient.useSession();
  const [name, setName] = useState(initialName);
  const [username, setUsername] = useState(initialUsername);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasChanges =
    name.trim() !== initialName.trim() ||
    username.trim().toLowerCase() !== initialUsername.trim().toLowerCase();

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

    try {
      await updateUserAccount({
        name: nextName,
        username: nextUsername,
        displayUsername: nextUsername,
      });
      await session.refetch();
      router.refresh();
      notify("Profile updated.", "success");
      onSaved();
    } catch (submissionError) {
      setError(getErrorMessage(submissionError));
      notify("Could not update the profile.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Field label="Name">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          className="surface-input w-full rounded-[18px] px-4 py-3 text-[color:var(--text-base)] outline-none"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
        <Field label="Email">
          <input
            value={initialEmail}
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
            className="surface-input w-full rounded-[18px] px-4 py-3 text-[color:var(--text-base)] outline-none"
          />
        </Field>
      </div>

      {error ? (
        <p className="rounded-[18px] bg-[color:var(--danger-soft)] px-4 py-3 text-sm text-[color:var(--danger)]">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={!hasChanges || isSubmitting}
          className="soft-action-tint rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

async function fileToAvatarDataUrl(file: File) {
  const fileDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const nextImage = new Image();
    nextImage.onload = () => resolve(nextImage);
    nextImage.onerror = () => reject(new Error("Could not load the image."));
    nextImage.src = fileDataUrl;
  });

  const size = 320;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");

  if (!context) {
    return fileDataUrl;
  }

  const scale = Math.max(size / image.width, size / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  const x = (size - width) / 2;
  const y = (size - height) / 2;

  context.drawImage(image, x, y, width, height);

  return canvas.toDataURL("image/jpeg", 0.86);
}

function AvatarEditor({
  name,
  email,
  username,
  initialImage,
  onSaved,
}: {
  name: string;
  email: string;
  username: string;
  initialImage?: string | null;
  onSaved: () => void;
}) {
  const router = useRouter();
  const { notify } = useFeedback();
  const session = authClient.useSession();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [image, setImage] = useState(initialImage ?? "");
  const [urlDraft, setUrlDraft] = useState(initialImage ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatedAvatarUrl = useMemo(
    () => getGeneratedAvatarUrl({ name, username, email }),
    [email, name, username],
  );

  const usingGenerated = !image.trim();
  const hasChanges = image.trim() !== (initialImage?.trim() ?? "");

  const handleUpload = async (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const nextImage = await fileToAvatarDataUrl(file);
      setImage(nextImage);
      setUrlDraft(nextImage);
    } catch (uploadError) {
      setError(getErrorMessage(uploadError));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);

    try {
      await updateUserAccount({ image: image.trim() || null });
      await session.refetch();
      router.refresh();
      notify("Avatar updated.", "success");
      onSaved();
    } catch (submissionError) {
      setError(getErrorMessage(submissionError));
      notify("Could not update the avatar.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="surface-pocket flex items-center gap-4 rounded-[24px] px-4 py-4">
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
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-[color:var(--text-strong)]">
            {usingGenerated ? "Generated avatar" : "Custom avatar"}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="soft-action rounded-[18px] px-4 py-3 text-sm font-semibold"
        >
          {isUploading ? "Preparing..." : "Upload photo"}
        </button>
        <button
          type="button"
          onClick={() => {
            setImage(generatedAvatarUrl);
            setUrlDraft(generatedAvatarUrl);
          }}
          className="soft-action rounded-[18px] px-4 py-3 text-sm font-semibold"
        >
          Use generated
        </button>
        <button
          type="button"
          onClick={() => {
            setImage("");
            setUrlDraft("");
          }}
          className="soft-action rounded-[18px] px-4 py-3 text-sm font-semibold"
        >
          Clear custom
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          void handleUpload(event.target.files?.[0] ?? null);
          event.currentTarget.value = "";
        }}
      />

      <Field label="Image URL">
        <div className="grid gap-3">
          <input
            value={urlDraft}
            onChange={(event) => setUrlDraft(event.target.value)}
            autoCapitalize="none"
            autoComplete="url"
            spellCheck={false}
            placeholder={generatedAvatarUrl}
            className="surface-input w-full rounded-[18px] px-4 py-3 text-[color:var(--text-base)] outline-none"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setImage(urlDraft.trim())}
              className="soft-action rounded-full px-4 py-2 text-sm font-medium"
            >
              Use URL
            </button>
          </div>
        </div>
      </Field>

      {error ? (
        <p className="rounded-[18px] bg-[color:var(--danger-soft)] px-4 py-3 text-sm text-[color:var(--danger)]">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={!hasChanges || isSubmitting}
          className="soft-action-tint rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

export function ProfileWorkspace({ user, schoolName }: ProfileWorkspaceProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  const name = user.name ?? "Kradle";
  const email = user.email ?? "";
  const username = user.username ?? "kradle";

  return (
    <>
      <section className="premium-wash premium-sheen rounded-[26px] px-4 py-4 shadow-[var(--shadow-frost-strong)] sm:px-5 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <UserAvatar
              name={name}
              username={username}
              email={email}
              image={user.image}
              sizeClassName="h-18 w-18 sm:h-20 sm:w-20"
              textClassName="text-2xl"
              roundedClassName="rounded-[24px]"
              className="surface-chip-strong"
            />
            <div className="min-w-0">
              <p className="text-[1.55rem] font-semibold tracking-tight text-[color:var(--text-strong)] sm:text-[1.8rem]">
                {name}
              </p>
              <p className="mt-1 truncate text-base text-[color:var(--text-base)]">{email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="surface-chip rounded-full px-3 py-1.5 text-sm font-medium text-[color:var(--accent-strong)]">
                  @{username}
                </span>
                {schoolName ? (
                  <span className="surface-chip rounded-full px-3 py-1.5 text-sm font-medium text-[color:var(--text-base)]">
                    {schoolName}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        <Blade
          icon={PencilSquareIcon}
          title="Identity"
          detail={name}
          summary={email}
          onClick={() => setActivePanel("identity")}
        />
        <Blade
          icon={CameraIcon}
          title="Avatar"
          detail={user.image ? "Custom" : "Generated"}
          summary="Profile image"
          onClick={() => setActivePanel("avatar")}
        />
        <Blade
          icon={KeyIcon}
          title="Security"
          detail="Password"
          summary="Sign-in"
          onClick={() => setActivePanel("security")}
        />
        <AccountSignOutRow compact />
      </div>

      <FocusSurface
        open={activePanel === "identity"}
        onClose={() => setActivePanel(null)}
        title="Identity"
      >
        <IdentityEditor
          initialName={name}
          initialEmail={email}
          initialUsername={username}
          onSaved={() => setActivePanel(null)}
        />
      </FocusSurface>

      <FocusSurface
        open={activePanel === "avatar"}
        onClose={() => setActivePanel(null)}
        title="Avatar"
      >
        <AvatarEditor
          name={name}
          email={email}
          username={username}
          initialImage={user.image}
          onSaved={() => setActivePanel(null)}
        />
      </FocusSurface>

      <FocusSurface
        open={activePanel === "security"}
        onClose={() => setActivePanel(null)}
        title="Password"
      >
        <ChangePasswordCard />
      </FocusSurface>
    </>
  );
}
