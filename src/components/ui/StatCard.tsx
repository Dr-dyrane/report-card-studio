type StatCardProps = {
  label: string;
  value: string;
  hint: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <article className="frost-panel rounded-[22px] px-4 py-4 sm:px-5 sm:py-5">
      <p className="text-sm text-[color:var(--text-muted)]">{label}</p>
      <p className="mt-2 text-[2rem] font-semibold tracking-tight text-[color:var(--text-strong)] sm:mt-3 sm:text-[2rem]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-5 text-[color:var(--text-muted)]">
        {hint}
      </p>
    </article>
  );
}
