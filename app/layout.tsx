import React from "react"
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
/// <reference path="../vercel-analytics.d.ts" />
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AssetFlow - Enterprise Asset Management",
  description:
    "Multi-tenant enterprise asset management system for tracking physical, digital, consumable, and rechargeable assets across organizations, locations, and departments.",
  keywords: [
    "asset management",
    "enterprise",
    "inventory",
    "tracking",
    "SaaS",
  ],
    generator: 'v0.app'
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f5" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
