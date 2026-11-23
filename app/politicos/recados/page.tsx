import type { Metadata } from "next";
import { CandidateSelector } from "@/components/CandidateSelector";
import { PaginaPoliticos } from "@/components/PaginaPoliticos";
export const metadata: Metadata = { title: "Mandar um recado | Políticos" };
export default function RecadosPoliticos() {
  return <PaginaPoliticos titulo="Mandar um recado">
    <p className="mb-5 text-center text-base leading-7 text-slate-200">Escolha qualquer político para consultar as informações e os canais de contato disponíveis. Não é necessário acompanhá-lo.</p>
    <CandidateSelector mode="recado" recadoBasePath="/politicos/recados" />
    <p className="mt-5 text-sm leading-6 text-slate-300">O envio individual ainda depende da conferência do mandato e de um contato institucional verificado.</p>
  </PaginaPoliticos>;
}
