import type { Candidatura } from "@/data/eleicoes/tipos";
import type {
  DossieCandidato,
  EventoDossie,
  FonteDossie,
} from "@/data/eleicoes/dossies/modelo";
import type { AtuacaoPoliticaDocumentada } from "@/data/eleicoes/atuacao-politica";
import { formatarCargo } from "@/lib/eleicoes/formatar-cargo";

type Props = {
  candidato: Candidatura;
  dossie: DossieCandidato | null;
  atuacao: AtuacaoPoliticaDocumentada | null;
};

function FonteResumida({
  fonte,
}: {
  fonte: FonteDossie;
}) {
  return (
    <a
      href={fonte.url}
      target="_blank"
      rel="noreferrer"
      className="text-xs font-semibold text-black/65 underline decoration-black/25 underline-offset-4 hover:text-black"
    >
      Conferir fonte: {fonte.veiculoOuInstituicao} ↗
    </a>
  );
}

function RegistroResumido({
  evento,
}: {
  evento: EventoDossie;
}) {
  return (
    <li className="border-l-2 border-[#FFC400] pl-4">
      <h4 className="text-base font-semibold leading-6">{evento.titulo}</h4>
      <p className="mt-2 text-sm leading-6 text-black/70">{evento.resumo}</p>
      <div className="mt-2">
        <FonteResumida fonte={evento.fontes[0]} />
      </div>
    </li>
  );
}

export function ApresentacaoPublica({
  candidato,
  dossie,
  atuacao,
}: Props) {
  const registrosDeAtuacao = (dossie?.eventos ?? [])
    .filter(
      (evento) =>
        evento.eixos.includes("exercicio-cargo") &&
        evento.natureza.includes("documentado") &&
        !evento.natureza.some((natureza) =>
          ["alegacao", "contestada", "em-investigacao"].includes(natureza),
        ) &&
        evento.fontes.length > 0,
    )
    .sort((a, b) => b.data.inicio.localeCompare(a.data.inicio))
    .slice(0, 3);

  const propostas = (dossie?.promessas ?? [])
    .filter((promessa) => promessa.fontes.length > 0)
    .slice(0, 4);

  const posicionamentos = (dossie?.eventos ?? [])
    .filter(
      (evento) =>
        evento.eixos.includes("o-que-diz-e-defende") &&
        evento.fontes.length > 0 &&
        !evento.natureza.some((natureza) =>
          ["alegacao", "contestada", "em-investigacao"].includes(natureza),
        ),
    )
    .sort((a, b) => b.data.inicio.localeCompare(a.data.inicio))
    .slice(0, 3);

  return (
    <section
      aria-labelledby="apresentacao-publica-titulo"
      className="mt-5 border-t border-black/15 pb-9 pt-8 sm:pb-11"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/50">
        Aprofundamento
      </p>
      <h2
        id="apresentacao-publica-titulo"
        className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.035em] sm:text-3xl"
      >
        Conheça melhor {candidato.nomeUrna}
      </h2>

      {dossie?.biografia.paragrafos.length ? (
        <>
          <div className="mt-5 space-y-4">
            {dossie.biografia.paragrafos.slice(0, 4).map((paragrafo, index) => (
              <p
                key={index}
                className="max-w-2xl text-base leading-7 text-black/75"
              >
                {paragrafo}
              </p>
            ))}
          </div>
          {dossie.biografia.fontes.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {dossie.biografia.fontes.slice(0, 2).map((fonte) => (
                <FonteResumida key={fonte.id} fonte={fonte} />
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <div className="mt-5 max-w-2xl space-y-3">
          <p className="text-base leading-7 text-black/75">
            {candidato.nomeCompleto} consta na base da Justiça Eleitoral
            como candidato ao cargo de {formatarCargo(candidato.cargo)}
            {candidato.uf === "BR" ? "" : ` por ${candidato.uf}`},
            pelo {candidato.siglaPartido}, nas eleições de {candidato.eleicao}.
          </p>
          <p className="text-sm leading-6 text-black/55">
            Ainda estamos reunindo fontes para apresentar sua formação,
            trajetória e principais posições com a mesma clareza.
            A falta desse resumo não significa ausência de atuação política.
          </p>
          <a
            href={candidato.fonteOficial}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-xs font-semibold underline decoration-black/25 underline-offset-4"
          >
            Conferir registro oficial no TSE ↗
          </a>
        </div>
      )}

      {registrosDeAtuacao.length > 0 ? (
        <div className="mt-9 border-t border-black/15 pt-7">
          <h3 className="text-xl font-semibold tracking-[-0.025em]">
            O que já fez no exercício do cargo
          </h3>
          <p className="mt-2 text-sm leading-6 text-black/55">
            Alguns registros documentados. Projeto apresentado, votação e lei
            em vigor são situações diferentes.
          </p>
          <ul className="mt-5 space-y-6">
            {registrosDeAtuacao.map((evento) => (
              <RegistroResumido key={evento.id} evento={evento} />
            ))}
          </ul>
        </div>
      ) : atuacao && (atuacao.totalProposicoes > 0 || atuacao.totalVotacoes > 0) ? (
        <div className="mt-9 border-t border-black/15 pt-7">
          <h3 className="text-xl font-semibold tracking-[-0.025em]">
            Atuação parlamentar registrada
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-black/70">
            Nossa base contém {atuacao.totalProposicoes} registros de proposições
            e {atuacao.totalVotacoes} registros de votações relacionados a esta
            pessoa. Esses números não representam, por si só, leis aprovadas.
          </p>
          <p className="mt-2 text-sm leading-6">
            <a href="#exercicio-cargo" className="font-semibold underline underline-offset-4">
              Consultar atuação e documentos
            </a>
          </p>
        </div>
      ) : null}

      {propostas.length > 0 ? (
        <div className="mt-9 border-t border-black/15 pt-7">
          <h3 className="text-xl font-semibold tracking-[-0.025em]">
            O que propõe
          </h3>
          <p className="mt-2 text-sm leading-6 text-black/55">
            Compromissos de campanha encontrados em documentos públicos.
            Não significam que já foram realizados.
          </p>
          <ul className="mt-5 space-y-5">
            {propostas.map((proposta) => (
              <li key={proposta.id} className="border-l-2 border-[#FFC400] pl-4">
                <h4 className="text-base font-semibold leading-6">{proposta.titulo}</h4>
                <p className="mt-2 text-sm leading-6 text-black/70">
                  {proposta.compromisso}
                </p>
                <div className="mt-2">
                  <FonteResumida fonte={proposta.fontes[0]} />
                </div>
              </li>
            ))}
          </ul>
          <a
            href="#o-que-prometeu"
            className="mt-5 inline-block text-sm font-semibold underline underline-offset-4"
          >
            Ver propostas e documentos completos
          </a>
        </div>
      ) : null}

      {posicionamentos.length > 0 ? (
        <div className="mt-9 border-t border-black/15 pt-7">
          <h3 className="text-xl font-semibold tracking-[-0.025em]">
            O que diz e o que defende
          </h3>
          <p className="mt-2 text-sm leading-6 text-black/55">
            Manifestações públicas registradas com suas fontes, sem deduzir
            posições apenas pela filiação partidária.
          </p>
          <ul className="mt-5 space-y-6">
            {posicionamentos.map((evento) => (
              <RegistroResumido key={evento.id} evento={evento} />
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-9 border-t border-black/15 pt-5">
        <p className="max-w-2xl text-sm leading-6 text-black/60">
          Esta é a apresentação inicial. As fontes, informações eleitorais,
          votações, propostas, patrimônio e registros completos continuam
          disponíveis na ficha detalhada abaixo.
        </p>
        <a
          href={dossie ? "#dossie" : "#sobre-os-dados"}
          className="mt-3 inline-block text-sm font-semibold underline decoration-[#bd8c00] underline-offset-4"
        >
          Explorar a ficha completa ↓
        </a>
      </div>
    </section>
  );
}
