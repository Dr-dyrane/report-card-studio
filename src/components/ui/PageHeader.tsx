type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: string;
  secondaryAction?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  secondaryAction,
}: PageHeaderProps) {
  return (
    <section className="frost-panel-strong rounded-[26px] px-3 py-4 sm:rounded-[32px] sm:px-8 sm:py-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-display text-[2.25rem] leading-[0.96] text-[color:var(--text-strong)] sm:mt-3 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-5 text-[color:var(--text-muted)] sm:mt-4 sm:text-base sm:leading-7">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {secondaryAction ? (
            <button className="soft-action rounded-full px-4 py-2 text-sm font-medium transition hover:bg-white/84">
              {secondaryAction}
            </button>
          ) : null}
          {action ? (
            <button className="soft-action-tint rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-[rgba(231,240,255,0.96)]">
              {action}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
