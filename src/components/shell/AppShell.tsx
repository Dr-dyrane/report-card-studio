import { ReactNode } from "react";

import { BottomTabBar } from "@/components/shell/BottomTabBar";
import { SidebarNav } from "@/components/shell/SidebarNav";
import { TopBar } from "@/components/shell/TopBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[color:var(--canvas)] text-[color:var(--text-base)]">
      <div className="flex min-h-screen gap-0 px-0 py-0 sm:gap-2 sm:px-2 sm:py-2 xl:gap-4 xl:px-4 xl:py-3">
        <SidebarNav />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 px-0 py-2 pb-28 sm:px-2 sm:py-4 sm:pb-8 xl:px-6 xl:py-6">
            {children}
          </main>
        </div>
      </div>
      <BottomTabBar />
    </div>
  );
}
