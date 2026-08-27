import type { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    icon: "/ler-depois-192.png",
    apple: "/ler-depois-180.png",
  },

  appleWebApp: {
    capable: true,
    title: "Fora da Pauta",
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