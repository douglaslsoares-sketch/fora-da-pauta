import Link from "next/link";
import { CabecalhoInterno } from "@/components/CabecalhoInterno";
import { CandidatePhoto } from "@/components/CandidatePhoto";
import type { Metadata } from "next";
import { RecadoPoliticoFormulario } from "@/components/RecadoPoliticoFormulario";
import { candidaturas } from "@/data/eleicoes/candidaturas";
export const metadata: Metadata = { title: "Recado para político | Fora da Pauta" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pessoa = candidaturas.find(p => p.id === id);
  // Links institucionais: não são contatos pessoais validados.
  const canalInstitucional = pessoa?.cargo === "deputado-federal"
    ? { href: "https://www.camara.leg.br/fale-conosco", titulo: "Consultar os canais da Câmara dos Deputados" }
    : pessoa?.cargo === "senador"
      ? { href: "https://www25.senado.leg.br/web/senadores/em-exercicio/", titulo: "Consultar senadores em exercício e seus contatos" }
      : pessoa?.cargo === "presidente"
        ? { href: "https://falabr.cgu.gov.br/v2/", titulo: "Consultar o Fala.BR — ouvidoria federal" }
        : null;
  return <main className="min-h-screen bg-[#141c2b] px-5 pb-24 pt-4 text-white">
    <section className="mx-auto max-w-xl">
      <CabecalhoInterno titulo="Mandar um recado" />
      {pessoa ? (
        <>
          <div className="mx-auto mt-4 flex max-w-md items-center gap-4 rounded-xl border border-[#344760] bg-[#24334b] p-4">
            <CandidatePhoto id={pessoa.id} name={pessoa.nomeUrna} />
            <div className="min-w-0">
              <p className="text-lg font-bold">{pessoa.nomeUrna}</p>
              <p className="mt-1 text-sm text-slate-300">{pessoa.siglaPartido} · {pessoa.uf}</p>
            </div>
          </div>
          <p role="status" className="mx-auto mt-5 max-w-md rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm leading-relaxed text-amber-100">
            O envio de recados a políticos ainda não está disponível. Estamos verificando os contatos oficiais; nenhuma mensagem será encaminhada nesta etapa.
          </p>
          {canalInstitucional ? (
            <aside className="mx-auto mt-4 max-w-md rounded-xl border border-[#344760] bg-[#24334b] p-4">
              <h2 className="text-base font-bold text-[#f4c542]">Consulta a canais oficiais</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">
                Consulte o portal da instituição. Este link não confirma que o político escolhido está em exercício nem envia seu recado.
              </p>
              <a href={canalInstitucional.href} target="_blank" rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-11 items-center rounded-lg border border-[#f4c542] px-4 py-2 text-sm font-semibold text-white underline underline-offset-4 hover:bg-[#344760] focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400">
                {canalInstitucional.titulo}
              </a>
              {pessoa.cargo === "presidente" ? <p className="mt-2 text-xs leading-relaxed text-slate-300">O Fala.BR recebe manifestações para órgãos federais; não é contato direto com o Presidente.</p> : null}
            </aside>
          ) : null}
          <RecadoPoliticoFormulario />
        </>
      ) : <p className="mt-6 text-center">Não foi possível identificar o destinatário.</p>}
      <div className="mt-6 pb-6 text-center"><Link href="/mandar-recado/politico" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-red-600 px-8 py-3 font-bold"><span aria-hidden="true" className="mr-2 text-sm font-normal">x</span>Fechar</Link></div>
    </section>
  </main>;
}
