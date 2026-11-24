import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AvaliacaoVozProvider } from "@/components/politicos/AvaliacaoVozProvider";
import Link from "next/link";

export const metadata: Metadata = {
  applicationName: "Políticos",
  title: { default: "Políticos", template: "%s | Políticos" },
  description: "Acompanhe quem nos representa.",
  manifest: "/politicos/manifest.webmanifest",
  icons: { icon: [{ url: "/politicos/icone.svg", type: "image/svg+xml" }] },
  appleWebApp: { capable: true, title: "Políticos", statusBarStyle: "black-translucent" },
};

export default function LayoutPoliticos({ children }: { children: ReactNode }) {
  // O layout permanece montado ao navegar entre rotas internas do Políticos.
  return <AvaliacaoVozProvider>
    {children}
    <footer className="flex justify-center bg-[#0C192B] px-5 pb-10 pt-7"><Link href="/" aria-label="ForaDaPauta.org" className="block w-[190px] max-w-full"><img src="/marca/foradapauta-gabarito.png" alt="ForaDaPauta.org" className="block h-auto w-full" /></Link></footer>
  </AvaliacaoVozProvider>;
}
