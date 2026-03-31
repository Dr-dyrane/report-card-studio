import { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  tone?: "default" | "focus" | "success" | "warning" | "danger";
};

export function SectionCard({
  title,
  description,
  children,
  tone = "default",
}: SectionCardProps) {
  const toneClass =
    tone === "focus"
      ? "mood-surface-focus"
      : tone === "success"
        ? "mood-surface-success"
        : tone === "warning"
          ? "mood-surface-warning"
          : tone === "danger"
            ? "mood-surface-danger"
            : "";

  return (
    <section
      className={`frost-panel premium-sheen rounded-[24px] px-4 py-4 sm:rounded-[30px] sm:px-7 sm:py-6 ${toneClass}`}
    >
      <div className="mb-3 sm:mb-4">
        <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em] text-[color:var(--text-strong)] sm:text-[1.35rem]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 text-sm leading-6 text-[color:var(--text-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
