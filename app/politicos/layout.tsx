import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AvaliacaoVozProvider } from "@/components/politicos/AvaliacaoVozProvider";
import { AssinaturaEcossistema } from "@/components/AssinaturaEcossistema";

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
    <AssinaturaEcossistema />
  </AvaliacaoVozProvider>;
}
