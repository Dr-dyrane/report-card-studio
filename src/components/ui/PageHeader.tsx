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
    <section className="frost-panel-strong rounded-[26px] px-4 py-5 sm:rounded-[32px] sm:px-8 sm:py-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-display text-3xl leading-none text-[color:var(--text-strong)] sm:mt-3 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--text-muted)] sm:mt-4 sm:text-base sm:leading-7">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {secondaryAction ? (
            <button className="frost-pill rounded-full px-4 py-2 text-sm font-semibold text-[color:var(--text-base)] transition hover:bg-white/90">
              {secondaryAction}
            </button>
          ) : null}
          {action ? (
            <button className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-frost)] transition hover:bg-[color:var(--accent-strong)]">
              {action}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
