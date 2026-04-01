import type { Metadata, Viewport } from "next";

import { FeedbackProvider } from "@/components/feedback/FeedbackProvider";
import { AppShell } from "@/components/shell/AppShell";
import { WorkspaceContextProvider } from "@/components/shell/WorkspaceContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PwaRegistrar } from "@/components/pwa/PwaRegistrar";
import { getServerSession } from "@/lib/auth-session";
import { getDb } from "@/lib/db";
import { getOwnedSchoolForUser } from "@/lib/owned-school";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Kradle",
  description:
    "A calm academic reporting workspace for fast score entry, review, and export.",
  manifest: "/manifest.webmanifest",
  applicationName: "Kradle",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kradle",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/apple-icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  let workspaceContext = {
    schoolName: null as string | null,
    sessionName: null as string | null,
    termName: null as string | null,
  };

  if (session?.user?.id) {
    const ownedSchool = await getOwnedSchoolForUser(session.user.id);

    if (ownedSchool) {
      const db = await getDb();
      const activeSession = await db.academicSession.findFirst({
        where: {
          schoolId: ownedSchool.id,
          isActive: true,
        },
        select: {
          name: true,
          terms: {
            where: { isActive: true },
            orderBy: [{ sequence: "asc" }],
            take: 1,
            select: {
              name: true,
            },
          },
        },
      });

      workspaceContext = {
        schoolName: ownedSchool.name,
        sessionName: activeSession?.name ?? null,
        termName: activeSession?.terms[0]?.name ?? null,
      };
    }
  }

  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                try {
                  const stored = localStorage.getItem("kradle-theme");
                  const theme = stored === "light" || stored === "dark" || stored === "system"
                    ? stored
                    : "system";
                  const resolved = theme === "system"
                    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
                    : theme;
                  document.documentElement.dataset.theme = resolved;
                } catch {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full font-sans">
        <FeedbackProvider>
          <ThemeProvider>
            <PwaRegistrar />
            <WorkspaceContextProvider value={workspaceContext}>
              <AppShell>{children}<Analytics /></AppShell>
            </WorkspaceContextProvider>
          </ThemeProvider>
        </FeedbackProvider>
      </body>
    </html>
  );
}
