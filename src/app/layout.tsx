import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "NOAH — Networked Observation & Anomaly Intelligence",
  description: "Making Weather Data Trustworthy. Real-time mission-control intelligence for Automatic Weather Stations (AWS).",
  keywords: ["AWS", "Weather Stations", "Anomaly Detection", "Meteorology", "NOAH", "Machine Learning"]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#050B14] text-slate-100">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
