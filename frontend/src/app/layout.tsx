import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Noah's Ark — Real-Time Weather Station Quality Control",
  description: "Making Weather Data Trustworthy. Real-time meteorological intelligence for Automatic Weather Stations (AWS).",
  keywords: ["AWS", "Weather Stations", "Anomaly Detection", "Meteorology", "Noah's Ark", "Machine Learning", "IMD"],
  icons: {
    icon: "/noah_emblem.png",
    shortcut: "/noah_emblem.png",
    apple: "/noah_emblem.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#E2EDF8] text-slate-900">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
