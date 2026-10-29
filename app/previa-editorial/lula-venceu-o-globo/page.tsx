import { notFound } from "next/navigation";
import { PreviewAudioReader } from "@/components/PreviewAudioReader";
import { CampaignPage } from "@/components/CampaignPage";
import { lulaVenceuOGloboRascunho } from "@/data/edicoes/rascunhos/lula-venceu-o-globo";
export const metadata = {
  title: "Rascunho editorial — Lula venceu. O que O Globo disse no dia seguinte?",
  robots: { index: false, follow: false },
};
export default function PreviaEditorial() {
  if (process.env.NODE_ENV === "production") notFound();
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
