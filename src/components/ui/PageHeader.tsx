import Link from "next/link";

type HeaderAction = {
  label: string;
  href: string;
};

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: HeaderAction;
  secondaryAction?: HeaderAction;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  secondaryAction,
}: PageHeaderProps) {
  return (
    <section className="frost-panel-strong premium-wash premium-sheen rounded-[26px] px-3 py-4 sm:rounded-[30px] sm:px-7 sm:py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-display text-[2.25rem] leading-[0.96] text-[color:var(--text-strong)] sm:mt-2 sm:text-[4rem]">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-5 text-[color:var(--text-muted)] sm:mt-3 sm:text-[15px] sm:leading-6">
              {description}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {secondaryAction ? (
            <Link
              href={secondaryAction.href}
                className="soft-action surface-hover rounded-full px-4 py-2 text-sm font-medium transition"
            >
              {secondaryAction.label}
            </Link>
          ) : null}
          {action ? (
            <Link
              href={action.href}
              className="soft-action-tint rounded-full px-4 py-2 text-sm font-semibold transition"
            >
              {action.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
