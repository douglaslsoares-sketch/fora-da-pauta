import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CampaignRoute() {
  // As edições anteriores permanecem arquivadas no repositório.
  // Nenhum artigo antigo deve ser acessível por URL direta.
  notFound();
}
