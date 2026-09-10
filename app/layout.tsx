import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { EditorialPrinciplesBar } from "@/components/EditorialPrinciplesBar";
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
  title: {
    default: "Fora da Pauta",
    template: "%s | Fora da Pauta",
  },
  description:
    "Informação, documentos, evidências e fontes verificáveis para ajudar cada pessoa a formar sua própria avaliação.",
  icons: {
    icon: "/icon.png",
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
        {children}
        <Analytics />
      </body>
    </html>
  );
}
