"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

export type ThemeMode = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeSnapshot = {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
};

type ThemeContextValue = ThemeSnapshot & {
  hydrated: boolean;
  setTheme: (theme: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "kradle-theme";
const THEME_EVENT = "kradle-theme-change";
const SERVER_SNAPSHOT: ThemeSnapshot = {
  theme: "system",
  resolvedTheme: "light",
};

let lastClientSnapshot: ThemeSnapshot | null = null;

function getStoredTheme(): ThemeMode {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : "system";
}

function resolveTheme(theme: ThemeMode): ResolvedTheme {
  if (theme === "light" || theme === "dark") {
    return theme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getClientSnapshot(): ThemeSnapshot {
  const theme = getStoredTheme();
  const resolvedTheme = resolveTheme(theme);

  if (
    lastClientSnapshot &&
    lastClientSnapshot.theme === theme &&
    lastClientSnapshot.resolvedTheme === resolvedTheme
  ) {
    return lastClientSnapshot;
  }

  lastClientSnapshot = {
    theme,
    resolvedTheme,
  };

  return lastClientSnapshot;
}

function getServerSnapshot(): ThemeSnapshot {
  return SERVER_SNAPSHOT;
}

function applyThemeToDocument(resolvedTheme: ResolvedTheme) {
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.style.colorScheme = resolvedTheme;
}

function subscribeTheme(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  const handleThemeChange = () => callback();
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      callback();
    }
  };

  media.addEventListener("change", handleThemeChange);
  window.addEventListener("storage", handleStorage);
  window.addEventListener(THEME_EVENT, handleThemeChange);

  return () => {
    media.removeEventListener("change", handleThemeChange);
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(THEME_EVENT, handleThemeChange);
  };
}

function subscribeHydration() {
  return () => {};
}

function getHydratedClientSnapshot() {
  return true;
}

function getHydratedServerSnapshot() {
  return false;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribeTheme,
    getClientSnapshot,
    getServerSnapshot,
  );

  const hydrated = useSyncExternalStore(
    subscribeHydration,
    getHydratedClientSnapshot,
    getHydratedServerSnapshot,
  );

  useEffect(() => {
    applyThemeToDocument(snapshot.resolvedTheme);
  }, [snapshot.resolvedTheme]);

  const setTheme = (nextTheme: ThemeMode) => {
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    applyThemeToDocument(resolveTheme(nextTheme));
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: snapshot.theme,
      resolvedTheme: snapshot.resolvedTheme,
      hydrated,
      setTheme,
    }),
    [snapshot, hydrated],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }

  return context;
}
