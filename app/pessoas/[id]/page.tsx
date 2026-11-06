import { notFound } from "next/navigation";
import FichaDaPessoa from "@/app/pessoa/[id]/page";
import { consultarPessoaInternacionalConfirmada } from "@/data/pessoas/consultar-pessoa-internacional";
import CandidatePage from "@/app/conheca-seu-candidato/[id]/page";
import { idsAcompanhaveis } from "@/lib/eleicoes/acompanhamento-politico";
import { buscarCandidaturaConfirmadaDaPessoa } from "@/lib/eleicoes/identidade-politica";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function FichaPermanente({ params }: Props) {
  const { id } = await params;
  const candidaturaId = buscarCandidaturaConfirmadaDaPessoa(id, idsAcompanhaveis);
  if (!candidaturaId) {
    if (!consultarPessoaInternacionalConfirmada(id)) notFound();
    return FichaDaPessoa({ params: Promise.resolve({ id }) });
  }

  // Mantém a URL permanente da pessoa enquanto reaproveita a ficha editorial
  // existente. A candidatura exibida pode mudar quando uma nova eleição for
  // incorporada e vinculada com identidade CONFIRMADA.
  return CandidatePage({ params: Promise.resolve({ id: candidaturaId }) });
}
