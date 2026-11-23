import type { Metadata } from "next";
import { PaginaPoliticos } from "@/components/PaginaPoliticos";
export const metadata: Metadata = { title: "Compartilhar | Políticos" };
const endereco = "https://foradapauta.org/politicos";
const mensagem = "Conheça o aplicativo Políticos. Acompanhe quem nos representa. " + endereco;
export default function Compartilhar() {
  return <PaginaPoliticos titulo="Compartilhar">
    <p className="text-center text-lg leading-7 text-slate-200">Indique o aplicativo Políticos para outras pessoas.</p>
    <div className="mt-6 rounded-xl border border-[#334e65] bg-[#152d45] p-5">
      <p className="text-sm font-semibold text-[#ffd432]">Endereço do aplicativo</p>
      <p className="mt-2 break-all text-lg font-semibold">{endereco}</p>
    </div>
    <a href={"https://wa.me/?text=" + encodeURIComponent(mensagem)} target="_blank" rel="noopener noreferrer" className="mt-5 block rounded-xl bg-[#25d366] px-5 py-4 text-center font-bold text-[#092235]">Compartilhar pelo WhatsApp</a>
  </PaginaPoliticos>;
}
