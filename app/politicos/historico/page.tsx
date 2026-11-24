import type { Metadata } from "next";
import { CandidateFollowLiveSearch } from "@/components/CandidateFollowLiveSearch";
import { PaginaPoliticos } from "@/components/PaginaPoliticos";

export const metadata: Metadata = {
  title: "Histórico de um político",
  description: "Pesquise um político e consulte a trajetória, as atividades e os registros documentados disponíveis, com datas e fontes.",
};

export default function PaginaHistoricoPolitico() {
  return (
    <PaginaPoliticos titulo="Histórico de um político" largura="ampla">
      <p className="text-sm leading-6 text-slate-200">
        Digite o nome de um político para conhecer sua trajetória, as candidaturas e os registros disponíveis de sua atuação. Não é necessário acompanhá-lo.
      </p>
      <CandidateFollowLiveSearch mode="history" />
      <p className="mt-5 text-sm leading-6 text-slate-400">
        A consulta apresenta informações documentadas existentes na base. A ausência de registros não significa que uma atividade não tenha ocorrido.
      </p>
    </PaginaPoliticos>
  );
}
