"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { BottomTabBar } from "@/components/shell/BottomTabBar";
import { MobileContextFab } from "@/components/shell/MobileContextFab";
import { SidebarNav } from "@/components/shell/SidebarNav";
import { TopBar } from "@/components/shell/TopBar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (
    pathname === "/" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password")
  ) {
    return (
      <div className="min-h-screen bg-[color:var(--canvas)] text-[color:var(--text-base)]">
        {children}
      </div>
    );
  }

  return (
    <div className="isolate min-h-screen bg-[color:var(--canvas)] text-[color:var(--text-base)]">
      <div className="flex min-h-screen items-start gap-0 px-2 py-0 sm:gap-2 sm:px-2 sm:py-2 xl:gap-4 xl:px-4 xl:py-3">
        <SidebarNav />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="app-main flex-1 px-0 py-2 pb-28 sm:py-4 sm:pb-8 xl:py-6">
            {children}
          </main>
        </div>
      </div>
      <BottomTabBar />
      <MobileContextFab />
    </div>
  );
}
