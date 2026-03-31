"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { saveWorkspaceProfile } from "@/app/(workspace)/settings/actions";
import { useFeedback } from "@/components/feedback/FeedbackProvider";
import { Field } from "@/components/ui/Field";

export function WorkspaceProfileCard({
  name: initialName,
  sessionName,
  termName,
}: {
  name: string;
  sessionName: string;
  termName: string;
}) {
  const router = useRouter();
  const { notify } = useFeedback();
  const [name, setName] = useState(initialName);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await saveWorkspaceProfile({ name });
      if (!result.ok) {
        notify(result.message, "error");
        return;
      }

      notify(result.message, "success", result.previousName && result.previousName !== name.trim()
        ? {
            actionLabel: "Undo",
            action: async () => {
              await saveWorkspaceProfile({ name: result.previousName });
              router.refresh();
            },
          }
        : undefined);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <Field label="Name">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="surface-input w-full rounded-[18px] px-4 py-3 text-[color:var(--text-base)] outline-none"
        />
      </Field>
      <Field label="Session">
        <div className="surface-pocket rounded-[18px] px-4 py-3 text-sm text-[color:var(--text-base)]">
          {sessionName}
        </div>
      </Field>
      <Field label="Active term">
        <div className="surface-pocket rounded-[18px] px-4 py-3 text-sm text-[color:var(--text-base)]">
          {termName}
        </div>
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="soft-action rounded-full px-4 py-2 text-sm font-medium"
          onClick={() => setName(initialName)}
        >
          Reset
        </button>
        <button
          type="submit"
          className="soft-action-tint rounded-full px-4 py-2 text-sm font-semibold"
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
