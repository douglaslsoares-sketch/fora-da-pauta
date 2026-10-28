import { notFound } from "next/navigation";
import { CampaignPage } from "@/components/CampaignPage";
import { lulaVenceuOGloboRascunho } from "@/data/edicoes/rascunhos/lula-venceu-o-globo";
export const metadata = {
  title: "Rascunho editorial — Lula venceu. O que O Globo disse no dia seguinte?",
  robots: { index: false, follow: false },
};
export default function PreviaEditorial() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <div>
      <div className="bg-amber-300 px-5 py-4 text-center text-sm font-bold text-black">
        RASCUNHO PARA REVISÃO — NÃO PUBLICAR OU COMPARTILHAR
      </div>
      <CampaignPage campaign={lulaVenceuOGloboRascunho} />
    </div>
  );
}
