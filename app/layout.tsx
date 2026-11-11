import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { EditorialAudioSystem } from "@/components/EditorialAudioSystem";
import { SiteChromeRouter } from "@/components/SiteChromeRouter";
import { FecharAoFinalDoConteudo } from "@/components/FecharAoFinalDoConteudo";
import { RodapePaginasInternas } from "@/components/RodapePaginasInternas";
import { RegistrarOrigemNavegacao } from "@/components/RegistrarOrigemNavegacao";
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
    title: "Fique de Olho — Saiba o que os políticos estão fazendo.",
    description: "Acompanhe o dia a dia dos políticos. Entenda como as decisões políticas afetam a nossa vida.",
    url: "https://www.foradapauta.org/",
    siteName: "Fique de Olho",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/compartilhar/olho-v2", width: 1200, height: 630, alt: "Olho amarelo do Fique de Olho sobre fundo preto, sem texto." }],
  },
  title: {
    default: "Fique de Olho",
    template: "%s | Fique de Olho",
  },
  description:
    "Informação, documentos, evidências e fontes verificáveis para ajudar cada pessoa a formar sua própria avaliação.",
  icons: {
    icon: [{ url: "/marca/fora-da-pauta-icone.svg", type: "image/svg+xml" }],
    shortcut: "/marca/fora-da-pauta-icone.svg",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Fique de Olho", statusBarStyle: "black-translucent" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR" translate="no"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#eeeee9] font-sans">
        <RegistrarOrigemNavegacao />
        <SiteChromeRouter />
        {children}
        <FecharAoFinalDoConteudo />
        <RodapePaginasInternas />
        <EditorialAudioSystem />
        <Analytics />
      </body>
    </html>
  );
}

