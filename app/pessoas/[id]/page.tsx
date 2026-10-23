import { notFound, redirect } from "next/navigation";
import { idsAcompanhaveis } from "@/lib/eleicoes/acompanhamento-politico";
import { buscarCandidaturaConfirmadaDaPessoa } from "@/lib/eleicoes/identidade-politica";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function FichaPermanente({ params }: Props) {
  const { id } = await params;
  const candidaturaId = buscarCandidaturaConfirmadaDaPessoa(id, idsAcompanhaveis);
  if (!candidaturaId) notFound();

  // O endereço da pessoa permanece estável entre eleições.
  // A ficha atual continua compatível com os links de candidatura existentes.
  redirect(`/conheca-seu-candidato/${candidaturaId}`);
}
