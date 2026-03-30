"use client";

import { useTheme } from "@/components/theme/ThemeProvider";

export function ThemeToggleCard() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-3 gap-2 rounded-[24px] surface-chip p-2">
        {[
          ["system", "System"],
          ["light", "Light"],
          ["dark", "Dark"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value as "system" | "light" | "dark")}
            className={`rounded-[18px] px-4 py-3 text-sm font-medium transition ${
              theme === value ? "soft-action-tint" : "soft-action"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="surface-pocket rounded-[22px] px-4 py-4">
        <p className="text-sm text-[color:var(--text-muted)]">Current</p>
        <p className="mt-2 text-xl font-semibold text-[color:var(--text-strong)]">
          {resolvedTheme === "dark" ? "Dark appearance" : "Light appearance"}
        </p>
      </div>
    </div>
  );
}
