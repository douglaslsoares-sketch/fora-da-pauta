import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { EditorialAudioSystem } from "@/components/EditorialAudioSystem";
import { SiteChromeRouter } from "@/components/SiteChromeRouter";
import { RodapePaginasInternas } from "@/components/RodapePaginasInternas";
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
  metadataBase: new URL("https://www.foradapauta.org"),
  openGraph: {
    title: "Fora da Pauta — Há mais para entender.",
    description: "Um espaço para entender melhor as decisões que afetam a nossa vida e o que está por trás das notícias.",
    url: "https://www.foradapauta.org/",
    siteName: "Fora da Pauta",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/compartilhar/olho-v2", width: 1200, height: 630, alt: "Olho amarelo do Fora da Pauta sobre fundo preto, sem texto." }],
  },
  title: {
    default: "Fora da Pauta",
    template: "%s | Fora da Pauta",
  },
  description:
    "Informação, documentos, evidências e fontes verificáveis para ajudar cada pessoa a formar sua própria avaliação.",
  icons: {
    icon: [{ url: "/marca/fora-da-pauta-icone.svg", type: "image/svg+xml" }],
    shortcut: "/marca/fora-da-pauta-icone.svg",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Fora da Pauta", statusBarStyle: "black-translucent" },
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
        <SiteChromeRouter />
        {children}
        <RodapePaginasInternas />
        <EditorialAudioSystem />
        <Analytics />
      </body>
    </html>
  );
}

