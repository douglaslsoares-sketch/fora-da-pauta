import type { Metadata } from "next";
import { CandidateSelector } from "@/components/CandidateSelector";
import { PaginaPoliticos } from "@/components/PaginaPoliticos";

export const metadata: Metadata = {
  title: "Histórico de um político",
  description: "Pesquise um político e consulte a trajetória, as atividades e os registros documentados disponíveis, com datas e fontes.",
};

export default function PaginaHistoricoPolitico() {
  return (
    <PaginaPoliticos titulo="Histórico de um político">
      <p className="mb-5 text-base leading-7 text-slate-200">
        Digite o nome de um político para conhecer sua trajetória, as candidaturas e os registros disponíveis de sua atuação. Não é necessário acompanhá-lo.
      </p>
      <div className="rounded-2xl bg-white p-4 text-slate-900 sm:p-6">
        <CandidateSelector mode="browse" resultBasePath="/politicos/historico" apenasNome />
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-400">
        A consulta apresenta informações documentadas existentes na base. A ausência de registros não significa que uma atividade não tenha ocorrido.
      </p>
    </PaginaPoliticos>
  );
}
