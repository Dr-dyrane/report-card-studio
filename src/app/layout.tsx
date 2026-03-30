import type { Metadata, Viewport } from "next";

import { FeedbackProvider } from "@/components/feedback/FeedbackProvider";
import { AppShell } from "@/components/shell/AppShell";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PwaRegistrar } from "@/components/pwa/PwaRegistrar";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
            <AppShell>{children}</AppShell>
          </ThemeProvider>
        </FeedbackProvider>
      </body>
    </html>
  );
}
