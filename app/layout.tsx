import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { EditorialAudioSystem } from "@/components/EditorialAudioSystem";
import { InterceptarRetornoMenu } from "@/components/InterceptarRetornoMenu";
import { SiteChromeRouter } from "@/components/SiteChromeRouter";
import "./globals.css";
import { imagemCompartilhamento } from "@/lib/compartilhamento";
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
    title: "Fora da Pauta",
    description: "Leia, ouça e compartilhe as publicações do Fora da Pauta.",
    url: "https://www.foradapauta.org/",
    siteName: "Fora da Pauta",
    locale: "pt_BR",
    type: "website",
    images: [{ url: imagemCompartilhamento, width: 1200, height: 630, alt: "Logomarca oficial Fora da Pauta em branco e amarelo sobre fundo azul-marinho." }],
  },
  title: {
    default: "Fora da Pauta",
    template: "%s | Fora da Pauta",
  },
  description:
    "Informação, documentos, evidências e fontes verificáveis para ajudar cada pessoa a formar sua própria avaliação.",
  icons: {
    icon: [
      { url: "/marca/fora-da-pauta-icone.svg?v=dois-tracos-1", type: "image/svg+xml" },
      { url: "/favicon.ico?v=dois-tracos-1", sizes: "any", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico?v=dois-tracos-1",
    apple: [{ url: "/marca/fora-da-pauta-apple-180.png?v=dois-tracos-1", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest?v=dois-tracos-1",
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
        <InterceptarRetornoMenu />
        {children}
        <EditorialAudioSystem />
        <Analytics />
      </body>
    </html>
  );
}

