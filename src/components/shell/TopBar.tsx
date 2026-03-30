export function TopBar() {
  return (
    <header className="frost-panel sticky top-0 z-20 mx-2 mt-2 flex items-center justify-between gap-3 rounded-[24px] px-3 py-3 sm:mx-3 sm:mt-3 sm:flex-wrap sm:gap-4 sm:rounded-[28px] sm:px-4 sm:py-4 xl:px-8">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
          Report Card Studio
        </p>
        <p className="mt-1 truncate text-xs text-[color:var(--text-muted)] sm:text-sm">
          Second Term, 2024/2025 · Primary 5 Lavender
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:flex-wrap sm:gap-3">
        <div className="frost-pill hidden min-w-[240px] rounded-full px-4 py-2 text-sm text-[color:var(--text-muted)] xl:block">
          Search
        </div>
        <div className="frost-pill hidden rounded-full px-4 py-2 text-sm text-[color:var(--text-base)] sm:block">
          Second Term
        </div>
        <div className="frost-pill hidden rounded-full px-4 py-2 text-sm text-[color:var(--text-base)] sm:block">
          2024/2025
        </div>
        <button className="inline-flex items-center rounded-full bg-[color:var(--accent)] px-3 py-2 text-sm font-semibold text-white shadow-[var(--shadow-frost)] transition hover:bg-[color:var(--accent-strong)] sm:px-4">
          New
        </button>
      </div>
    </header>
  );
}
