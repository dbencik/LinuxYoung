import type { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LinuxYoung — Linux Basics for Youngsters",
  description: "Learn Linux step by step. 20 hands-on lessons for teenagers with a Raspberry Pi. No experience needed.",
  openGraph: {
    title: "Linux Basics for Youngsters",
    description: "20 hands-on Linux lessons for teenagers. Master the terminal one command at a time.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full antialiased ${outfit.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "var(--font-outfit), 'Outfit', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
