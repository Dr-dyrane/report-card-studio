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
  const { theme, hydrated, setTheme } = useTheme();

  return (
    <div className="flex w-full items-center gap-1 rounded-[14px] surface-chip p-1">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = hydrated && theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            aria-label={option.label}
            aria-pressed={isActive}
            className={`flex min-h-[2.5rem] flex-1 items-center justify-center gap-2 rounded-[11px] px-2 py-2 text-[11px] font-medium leading-none transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${isActive
                ? "soft-action-tint shadow-[var(--shadow-frost)]"
                : "bg-transparent text-[color:var(--text-base)]"
              }`}
          >
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors duration-200 ${isActive ? "bg-[color:var(--accent-soft)]" : "bg-transparent"
                }`}
            >
              <Icon className="h-4 w-4 stroke-[1.75]" />
            </span>
          </button>
        );
      })}
    </div>
  );
}