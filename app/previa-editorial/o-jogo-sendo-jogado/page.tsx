import { notFound } from "next/navigation";
import { CampaignPage } from "@/components/CampaignPage";
import { jogoSendoJogadoRascunho } from "@/data/edicoes/rascunhos/o-jogo-sendo-jogado";

export const metadata = {
  title: "Rascunho editorial — O jogo sendo jogado",
  robots: { index: false, follow: false },
};

export default function PreviaEditorial() {
  // A prévia nunca é disponibilizada no domínio público de produção.
  if (process.env.NODE_ENV !== "development") notFound();

  return (
    <div>
      <div className="bg-amber-300 px-5 py-4 text-center text-sm font-bold text-black">
        RASCUNHO PARA REVISÃO — NÃO PUBLICAR OU COMPARTILHAR
      </div>
      <CampaignPage campaign={jogoSendoJogadoRascunho} />
    </div>
  );
}
