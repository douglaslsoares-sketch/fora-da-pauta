import { notFound } from "next/navigation";
import { PreviewAudioReader } from "@/components/PreviewAudioReader";
import { CampaignPage } from "@/components/CampaignPage";
import { lulaVenceuOGloboRascunho } from "@/data/edicoes/rascunhos/lula-venceu-o-globo";
export const metadata = {
  title: "Rascunho editorial — Lula venceu. O que O Globo disse no dia seguinte?",
  robots: { index: false, follow: false },
};
export default function PreviaEditorial() {
  // No deploy de Preview, o Next.js usa NODE_ENV="production" também.
// Apenas o ambiente Vercel "preview" e o desenvolvimento local devem exibir o rascunho.
  const ehDesenvolvimentoLocal = process.env.NODE_ENV === "development";
  const ehPreviewVercel = process.env.VERCEL_ENV === "preview";
  if (!ehDesenvolvimentoLocal && !ehPreviewVercel) notFound();
  return (
    <div>
      <div className="bg-amber-300 px-5 py-4 text-center text-sm font-bold text-black">
        PRÉVIA PROTEGIDA — RASCUNHO, NÃO PUBLICADO. ÁUDIO DEMONSTRATIVO DO NAVEGADOR
      </div>
      <CampaignPage campaign={lulaVenceuOGloboRascunho} audioDemonstrativo />
      <PreviewAudioReader />
    </div>
  );
}
