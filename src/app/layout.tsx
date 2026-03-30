import type { Metadata, Viewport } from "next";

import { AppShell } from "@/components/shell/AppShell";
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
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full font-sans">
        <PwaRegistrar />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
