<html suppressHydrationWarning>
import type { Metadata, Viewport } from "next";

import { AmbientStage } from "@/components/effects/ambient-stage";
import { Providers } from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "MongolType | Realtime Mongolian Cyrillic typing races",
  description:
    "A realtime competitive typing platform for improving Mongolian Cyrillic keyboard speed, accuracy, rhythm, and consistency.",
  applicationName: "MongolType",
  keywords: ["Mongolian", "Cyrillic", "typing", "keyboard", "realtime", "race"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://mongoltype.pages.dev")
};

export const viewport: Viewport = {
  themeColor: "#05060a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mn" className="dark">
      <body>
        <AmbientStage />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
