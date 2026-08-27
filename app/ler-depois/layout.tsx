import type { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    icon: "/fora-da-pauta-ler-depois-192.png",
    apple: "/fora-da-pauta-ler-depois-180.png",
  },

  appleWebApp: {
    capable: true,
    title: "Ler depois",
    statusBarStyle: "default",
  },
};

export default function LerDepoisLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}