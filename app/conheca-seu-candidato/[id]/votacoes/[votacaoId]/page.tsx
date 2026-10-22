import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { candidaturas } from "@/data/eleicoes/candidaturas";
import { buscarAtuacaoPolitica } from "@/data/eleicoes/atuacao-politica";
import { formatarCargo } from "@/lib/eleicoes/formatar-cargo";
import { FaleComRepresentante } from "@/components/FaleComRepresentante";

export const metadata: Metadata = {
  title: "Registro de votação — Fique de Olho",
  description: "Consulte uma votação documentada e saiba como escrever ao seu representante.",
};

function formatarData(iso: string) {
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : iso;
}

export default async function RegistroDeVotacao({
  params,
}: {
  params: Promise<{ id: string; votacaoId: string }>;
}) {
  const { id, votacaoId } = await params;

  if (!/^\d+$/.test(id) || !/^[\w:-]{1,90}$/.test(votacaoId)) {
    notFound();
  }

  const candidato = candidaturas.find((pessoa) => pessoa.id === id);
  if (!candidato) notFound();

  const atuacao = buscarAtuacaoPolitica(candidato.id);
  const registro = atuacao?.votacoes.find((item) => item.votacaoId === votacaoId);
  if (!registro) notFound();

  return (
    <main className="min-h-screen bg-[#eeeee9] text-[#151515]">
      <header className="bg-black text-white">
        <div className="mx-auto max-w-3xl px-5 pb-10 pt-6 sm:px-8 sm:pb-12">
          <Link
            href={`/conheca-seu-candidato/${candidato.id}/votacoes`}
            className="text-sm font-semibold text-[#FFC400]"
          >
            ← Voltar às votações
          </Link>
          <p className="mt-9 text-xs font-semibold uppercase tracking-[0.2em] text-[#FFC400]">
            Fique de Olho · Registro documentado
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Como votou {candidato.nomeUrna}?
          </h1>
          <p className="mt-4 text-sm leading-6 text-white/70">
            {formatarCargo(candidato.cargo)} · {candidato.siglaPartido} · {candidato.uf}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-7 px-5 py-9 sm:px-8">
        <article aria-labelledby="registro-votacao-titulo" className="border border-black/10 bg-white p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/45">
            {formatarData(registro.data)} · Votação nominal
          </p>
          <h2 id="registro-votacao-titulo" className="mt-4 text-2xl font-bold leading-tight">
            Registro da votação
          </h2>
          <p className="mt-5 text-base leading-7 text-black/75">
            {registro.descricao}
          </p>
          <div className="mt-6 border-l-4 border-[#FFC400] bg-[#fff9e7] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-black/55">
              Voto do representante
            </p>
            <p className="mt-1 text-2xl font-bold">
              {registro.voto.trim() || "Não informado nesta base"}
            </p>
          </div>
          <p className="mt-5 text-sm leading-6 text-black/60">
            Este é um registro documental de votação, não uma análise dos efeitos da proposta.
            Acesse a fonte para conhecer o contexto e o conteúdo completo.
          </p>
          <a
            href={registro.fonte.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-semibold underline underline-offset-4"
          >
            Consultar a fonte original ↗
          </a>
        </article>

        <FaleComRepresentante
          representanteNome={candidato.nomeUrna}
          assunto={`Votação de ${formatarData(registro.data)} — ${registro.votacaoId}`}
        />

        <p className="text-xs leading-6 text-black/55">
          O Fora da Pauta não envia mensagens em nome do cidadão.
          Os canais de contato individual só aparecem depois de verificados.
        </p>

        <Link
          href={`/conheca-seu-candidato/${candidato.id}/votacoes`}
          className="inline-block text-sm font-semibold underline underline-offset-4"
        >
          ← Ver outras votações deste representante
        </Link>
      </div>
    </main>
  );
}
