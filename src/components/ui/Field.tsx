import { ReactNode } from "react";

type FieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="block space-y-2">
      <div>
        <p className="text-sm font-semibold text-[color:var(--text-strong)]">
          {label}
        </p>
        {hint ? (
          <p className="mt-1 text-sm text-[color:var(--text-muted)]">{hint}</p>
        ) : null}
      </div>
      {children}
    </label>
  );
}

export function InputShell({
  value,
  compact = false,
}: {
  value: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`frost-pill rounded-[18px] px-4 py-3 text-[color:var(--text-base)] ${
        compact ? "text-sm" : "text-sm leading-6"
      }`}
    >
      {value}
    </div>
  );
}
