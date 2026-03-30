type StatCardProps = {
  label: string;
  value: string;
  hint: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <article className="frost-panel rounded-[24px] px-5 py-5">
      <p className="text-sm text-[color:var(--text-muted)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--text-strong)]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">
        {hint}
      </p>
    </article>
  );
}
