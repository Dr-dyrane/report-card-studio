export function TopBar() {
  return (
    <header className="sticky top-0 z-20 px-0 pt-0 sm:px-1 sm:pt-1 xl:px-0">
      <div className="frost-panel mx-0 flex items-center justify-between gap-3 rounded-none px-4 py-3 sm:flex-wrap sm:gap-4 sm:rounded-[28px] sm:px-4 sm:py-4 xl:px-8">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
            Kradle
          </p>
          <p className="mt-1 truncate text-xs text-[color:var(--text-muted)] sm:text-sm">
            Second Term, 2024/2025 · Primary 5 Lavender
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:flex-wrap sm:gap-3">
          <div className="frost-pill hidden rounded-full px-4 py-2 text-sm text-[color:var(--text-base)] md:block">
            Primary 5 Lavender
          </div>
          <button className="inline-flex items-center rounded-full bg-[color:var(--accent)] px-3 py-2 text-sm font-semibold text-white shadow-[var(--shadow-frost)] transition hover:bg-[color:var(--accent-strong)] sm:px-4">
            New
          </button>
        </div>
      </div>
    </header>
  );
}
