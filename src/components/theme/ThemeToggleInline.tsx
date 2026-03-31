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
    <div className="grid grid-cols-3 gap-1.5 rounded-[18px] surface-chip p-1.5">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            aria-pressed={isActive}
            className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-[14px] px-2 py-2 text-center text-[11px] font-medium transition ${
              isActive ? "soft-action-tint" : "soft-action"
            }`}
          >
            <span
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
                isActive ? "bg-[color:var(--accent-soft)]" : "surface-chip"
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
            </span>
            <span className="leading-none">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
