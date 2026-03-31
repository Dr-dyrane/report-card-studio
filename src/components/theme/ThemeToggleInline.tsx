"use client";

import {
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";

import { useTheme } from "@/components/theme/ThemeProvider";

const options = [
  { value: "system", label: "System", icon: ComputerDesktopIcon },
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
] as const;

export function ThemeToggleInline() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex w-full items-center gap-1 rounded-[16px] surface-chip p-1">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            aria-pressed={isActive}
            className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[12px] px-2.5 py-2 text-[11px] font-medium transition ${
              isActive
                ? "soft-action-tint shadow-[var(--shadow-frost)]"
                : "bg-transparent text-[color:var(--text-base)]"
            }`}
          >
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                isActive ? "bg-[color:var(--accent-soft)]" : "bg-transparent"
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
          </button>
        );
      })}
    </div>
  );
}
