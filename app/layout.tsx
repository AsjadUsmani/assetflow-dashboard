import React from "react"
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
  themeColor: "#1a1a2e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
