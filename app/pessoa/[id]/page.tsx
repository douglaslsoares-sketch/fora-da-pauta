import { notFound, redirect } from "next/navigation";
import { candidaturas } from "@/data/eleicoes/candidaturas";
import { buscarCandidaturaConfirmadaDaPessoa } from "@/lib/eleicoes/identidade-politica";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Ficha política | Fora da Pauta",
  robots: { index: false, follow: false },
};

/**
 * Endereço permanente da pessoa. Nesta primeira etapa, usa a ficha
 * eleitoral existente apenas quando há UMA candidatura disponível
 * associada documentalmente a uma identidade CONFIRMADA.
 *
 * Identidades ambíguas, em revisão ou sem candidatura consultável
 * não são associadas por semelhança de nome.
 */
export default async function FichaDaPessoa({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^politico-[a-z0-9-]{8,80}$/.test(id)) notFound();

  const candidaturasDisponiveis = new Set(candidaturas.map(c => c.id));
  const candidaturaId = buscarCandidaturaConfirmadaDaPessoa(
    id,
    candidaturasDisponiveis,
  );

  if (!candidaturaId) notFound();
  redirect(`/conheca-seu-candidato/${candidaturaId}`);
}
