import Link from "next/link";
import { FecharPaginaLink } from "@/components/FecharPaginaLink";
import { notFound } from "next/navigation";
import { candidaturas } from "@/data/eleicoes/candidaturas";
import { formatarCargo } from "@/lib/eleicoes/formatar-cargo";
import { InteracaoPessoaPublica } from "@/components/InteracaoPessoaPublica";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Entrar em contato — Fora da Pauta",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

function diretorioPorCargo(cargo: string) {
  const nome = cargo.toLowerCase();
  if (nome.includes("senador")) {
    return {
      titulo: "Contatos dos gabinetes no Senado Federal",
      url: "https://www12.senado.leg.br/transparencia/sen/senadores",
      instrucao: "Localize a pessoa na lista de senadores em exercício e consulte os contatos do gabinete.",
    };
  }
  if (nome.includes("deputado") && nome.includes("federal")) {
    return {
      titulo: "Fale com um deputado — Câmara dos Deputados",
      url: "https://www.camara.leg.br/fale-conosco",
      instrucao: "Procure o nome do deputado para encontrar telefone e e-mail do gabinete.",
    };
  }
  return null;
}

export default async function ContatoRepresentante({ params }: Props) {
  const { id } = await params;
  if (!/^\d{8,20}$/.test(id)) notFound();
  const pessoa = candidaturas.find(item => item.id === id);
  if (!pessoa) notFound();
  const cargo = formatarCargo(pessoa.cargo, pessoa.genero);
  const diretorio = diretorioPorCargo(cargo);
  const habilitado = process.env.FDP_INTERACOES_HABILITADAS === "1";

  return (
    <main className="min-h-screen bg-white px-5 py-10 text-black">
      <div className="mx-auto max-w-[720px]">
        <div className="flex justify-end"><FecharPaginaLink /></div>
        <h1 className="mt-8 text-3xl font-bold">Entrar em contato</h1>
        <p className="mt-4 text-xl font-semibold">{pessoa.nomeUrna}</p>
        <p className="mt-1 text-sm text-black/65">{cargo} · {pessoa.uf} · {pessoa.siglaPartido}</p>
        {habilitado ? (
          <InteracaoPessoaPublica candidaturaId={pessoa.id} />
        ) : null}
        <section className="mt-8 rounded-xl border border-black/15 bg-black/[0.025] p-5">
          <h2 className="text-lg font-bold">Canal oficial de contato</h2>
          {diretorio ? (
            <>
              <p className="mt-3 text-sm leading-6">{diretorio.instrucao}</p>
              <a href={diretorio.url} target="_blank" rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#FFD700] px-4 py-3 text-center font-bold text-black">
                {diretorio.titulo} ↗
              </a>
            </>
          ) : (
            <p className="mt-3 text-sm leading-6">
              Ainda não temos um canal institucional de contato individual verificado para esta pessoa.
              Não vamos indicar telefones ou perfis sem confirmação.
            </p>
          )}
        </section>
        {!habilitado ? (
          <p className="mt-5 text-sm leading-6 text-black/65">
            O envio de mensagens pelo Fora da Pauta não está habilitado.
            Esta página não envia mensagens automaticamente.
          </p>
        ) : null}
        <Link href={`/conheca-seu-candidato/${pessoa.id}`}
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-black/20 px-5 py-3 font-semibold">
          Ver ficha política →
        </Link>
      </div>
    </main>
  );
}
