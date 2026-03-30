import { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function SectionCard({
  title,
  description,
  children,
}: SectionCardProps) {
  return (
    <section className="frost-panel rounded-[24px] px-4 py-4 sm:rounded-[30px] sm:px-7 sm:py-6">
      <div className="mb-3 sm:mb-5">
        <h2 className="text-lg font-semibold text-[color:var(--text-strong)] sm:text-xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
