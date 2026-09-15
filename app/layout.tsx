import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

import { EditorialAudioSystem } from "@/components/EditorialAudioSystem";
import { SiteHeader } from "@/components/SiteHeader";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase:
    new URL(
      "https://www.foradapauta.org",
    ),
  title: {
    default: "Fora da Pauta",
    template: "%s | Fora da Pauta",
  },
  description:
    "Um espaço público de fala, escuta, informação e participação.",
  icons: {
    icon: "/favicon-foradapauta.png",
    shortcut: "/favicon-foradapauta.png",
    apple: "/favicon-foradapauta.png",
  },
  openGraph: {
    type: "website",
    url: "https://www.foradapauta.org",
    siteName: "Fora da Pauta",
    title: "Fora da Pauta",
    description:
      "Um espaço público de fala, escuta, informação e participação.",
    images: [
      {
        url: "/favicon-foradapauta.png",
        alt: "Fora da Pauta",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Fora da Pauta",
    description:
      "Um espaço público de fala, escuta, informação e participação.",
    images: [
      "/favicon-foradapauta.png",
    ],
  },
  manifest: "/ler-depois/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#eeeee9] font-sans">
        <SiteHeader />
        {children}
        <EditorialAudioSystem />
        <Analytics />
      </body>
    </html>
  );
}