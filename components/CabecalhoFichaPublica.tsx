import { ShareCandidatePageButton } from "@/components/ShareCandidatePageButton";
import { CandidatePhoto } from "@/components/CandidatePhoto";
import { buscarDadosPerfilPublico } from "@/data/eleicoes/ficha-publica";
import type { Candidatura } from "@/data/eleicoes/tipos";
import type { DossieCandidato } from "@/data/eleicoes/dossies/modelo";
import type { Eleito2026 } from "@/data/eleicoes/eleitos";
import { formatarCargo } from "@/lib/eleicoes/formatar-cargo";

type Props = {
  candidato: Candidatura;
  dossie: DossieCandidato | null;
  eleito: Eleito2026 | null;
  mandatoAtual?: {
    cargo: string;
    uf?: string;
    inicio?: number;
    fim?: number;
    fonte?: { titulo: string; url: string };
  };
};

const nomesEstados: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas",
  BA: "Bahia", CE: "Ceará", DF: "Distrito Federal",
  ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão",
  MT: "Mato Grosso", MS: "Mato Grosso do Sul", MG: "Minas Gerais",
  PA: "Pará", PB: "Paraíba", PR: "Paraná", PE: "Pernambuco",
  PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima",
  SC: "Santa Catarina", SP: "São Paulo", SE: "Sergipe",
  TO: "Tocantins",
};

function formatarNumero(valor: number): string {
  return new Intl.NumberFormat("pt-BR").format(valor);
}

// Calcula a idade apenas quando a data completa estiver documentada.
function calcularIdade(dataNascimento?: string): number | null {
  if (!dataNascimento || !/^\d{4}-\d{2}-\d{2}$/.test(dataNascimento)) return null;
  const [ano, mes, dia] = dataNascimento.split("-").map(Number);
  const hoje = new Date();
  let idade = hoje.getUTCFullYear() - ano;
  if (hoje.getUTCMonth() + 1 < mes ||
      (hoje.getUTCMonth() + 1 === mes && hoje.getUTCDate() < dia)) idade--;
  return idade >= 0 && idade <= 120 ? idade : null;
}

export function CabecalhoFichaPublica({
  candidato,
  dossie,
  eleito,
  mandatoAtual,
}: Props) {
  const dados = buscarDadosPerfilPublico(candidato.id);
  const resultadoTse = candidato.resultadoEleitoral?.situacaoTse?.trim();
  const genero = candidato.genero;
  const rotuloEleito = genero === "feminino"
    ? "Eleita"
    : genero === "masculino"
      ? "Eleito"
      : "Eleição confirmada";
  const situacao = eleito
    ? dados?.rotuloEleitoral ?? (eleito.resultadoTse.toUpperCase().includes("SUPLENTE")
        ? "Suplente"
        : rotuloEleito)
    : resultadoTse && !resultadoTse.startsWith("#")
      ? (genero === "feminino"
          ? resultadoTse.replace(/^((?:RE)?ELEIT)O\b/i, "$1A")
          : resultadoTse).replace(/\s+/g, " ").toLocaleLowerCase("pt-BR")
      : null;
  const cargo = formatarCargo(candidato.cargo, genero);
  const idade = dados?.dataNascimento ? calcularIdade(dados.dataNascimento) : dados?.idade ?? null;
  const nomeExibido = dossie?.nome?.trim() || candidato.nomeUrna.toLocaleLowerCase("pt-BR").replace(/(^|\s)(\p{L})/gu, (_, espaco: string, letra: string) => espaco + letra.toLocaleUpperCase("pt-BR"));
  const local = candidato.uf === "BR" ? "Brasil" : nomesEstados[candidato.uf] ?? candidato.uf;
  const apresentacao = dados?.apresentacao;
  // Um perfil editorial específico tem prioridade. Para os demais, aproveitar
  // somente a biografia já documentada, sem inferir bandeiras ou feitos.
  const biografiaDocumentada = !apresentacao && dossie?.biografia.fontes.length
    ? dossie.biografia.paragrafos.slice(0, 2)
    : [];
  const propostasDocumentadas = !apresentacao
    ? (dossie?.promessas ?? []).filter((p) => p.fontes.length > 0).slice(0, 3)
    : [];
  const resumo = !apresentacao && biografiaDocumentada.length === 0
    ? dossie?.emPoucasLinhas?.trim()
    : null;

  return (
    <section aria-labelledby="nome-politico" className="mx-auto w-full max-w-[760px] px-5 pb-5 pt-5 sm:px-6 sm:pt-6">
      <div className="flex items-start gap-4 sm:gap-5">
        <div className="shrink-0">
          <CandidatePhoto id={candidato.id} name={candidato.nomeUrna} variant="profile" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 id="nome-politico" className="break-words text-xl font-semibold leading-tight tracking-[-0.025em] text-black sm:text-2xl">
            {nomeExibido}
          </h1>
          <p className="mt-1 text-sm leading-5 text-black/60">
            {eleito
              ? genero
                ? `${rotuloEleito} ${cargo.toLowerCase()} ${candidato.uf === "BR" ? "no Brasil" : `por ${local}`} em ${candidato.eleicao}`
                : `Eleição confirmada em ${candidato.eleicao} · Cargo: ${cargo} · ${local}`
              : candidato.cargo === "presidente"
                ? `Candidatura à Presidência da República em ${candidato.eleicao}`
                : `Candidatura ao cargo de ${cargo.toLowerCase()} por ${local} em ${candidato.eleicao}`}
          </p>
          {situacao ? (
            <span className={`mt-2 inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${eleito ? "bg-emerald-100 text-emerald-800" : "bg-black/5 text-black/65"}`}>
              {situacao}
            </span>
          ) : null}
          <dl className="mt-2 space-y-1 text-sm leading-6 text-black/80">
            <div><dt className="inline font-semibold">Partido: </dt><dd className="inline">{candidato.siglaPartido}</dd></div>
            {idade != null ? <div><dt className="inline font-semibold">Idade: </dt><dd className="inline">{idade} anos</dd></div> : null}
            {dados?.cidade ? <div><dt className="inline font-semibold">{dados.cidadeRotulo ?? "Cidade"}: </dt><dd className="inline">{dados.cidade}</dd></div> : null}
            {dados?.votos != null ? <div><dt className="inline font-semibold">Votos: </dt><dd className="inline">{formatarNumero(dados.votos)}{dados.percentualVotosValidos != null ? ` (${new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(dados.percentualVotosValidos)}% dos válidos)` : ""}</dd></div> : null}
          </dl>
        </div>
      </div>
      {apresentacao ? (
        <div className="mt-6 space-y-4 text-base leading-7 text-black/85">
          {apresentacao.paragrafos.map((paragrafo, index) => (
            <p key={index}>{paragrafo}</p>
          ))}
          {apresentacao.destaques && apresentacao.destaques.itens.length > 0 ? (
            <div>
              <p className="font-semibold">
                {apresentacao.destaques.tipo === "bandeiras-politicas"
                  ? "Principais bandeiras políticas:"
                  : "Principais áreas de atuação:"}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                {apresentacao.destaques.itens.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {apresentacao.posicionamento ? <p>{apresentacao.posicionamento}</p> : null}
        </div>
      ) : biografiaDocumentada.length > 0 ? (
        <div className="mt-6 space-y-4 text-base leading-7 text-black/85">
          {biografiaDocumentada.map((paragrafo, index) => (
            <p key={index}>{paragrafo}</p>
          ))}
          {propostasDocumentadas.length > 0 ? (
            <div>
              <p className="font-semibold">Propostas registradas em campanha:</p>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                {propostasDocumentadas.map((proposta) => (
                  <li key={proposta.id}>{proposta.titulo}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm leading-6 text-black/60">
                São propostas documentadas, não realizações comprovadas.
              </p>
            </div>
          ) : null}
        </div>
      ) : resumo ? (
        <p className="mt-6 text-base leading-7 text-black/85">{resumo}</p>
      ) : (
        <p className="mt-6 text-sm leading-6 text-black/65">
          A apresentação biográfica desta pessoa está em levantamento.
          Os dados eleitorais oficiais e os registros disponíveis podem
          ser consultados no aprofundamento abaixo.
        </p>
      )}
      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold">
        <a className="text-black/65 underline decoration-black/25 underline-offset-4" href={candidato.fonteOficial} target="_blank" rel="noreferrer">Registro eleitoral — TSE ↗</a>
        {dados?.fonteDados ? <a className="text-black/65 underline decoration-black/25 underline-offset-4" href={dados.fonteDados.url} target="_blank" rel="noreferrer">{dados.fonteDados.titulo} ↗</a> : null}
        {dados?.fonteVotos ? <a className="text-black/65 underline decoration-black/25 underline-offset-4" href={dados.fonteVotos.url} target="_blank" rel="noreferrer">Fonte dos votos — TRE ↗</a> : null}
        {apresentacao?.fontes.map((fonte, index) => <a key={index} className="text-black/65 underline decoration-black/25 underline-offset-4" href={fonte.url} target="_blank" rel="noreferrer">{fonte.titulo} ↗</a>)}
        {biografiaDocumentada.length > 0
          ? dossie?.biografia.fontes.slice(0, 2).map((fonte) => (
              <a key={fonte.id} className="text-black/65 underline decoration-black/25 underline-offset-4" href={fonte.url} target="_blank" rel="noreferrer">{fonte.veiculoOuInstituicao} — biografia ↗</a>
            ))
          : null}
        {propostasDocumentadas.length > 0 ? (
          <a className="text-black/65 underline decoration-black/25 underline-offset-4" href="#o-que-prometeu">Fontes das propostas no detalhamento ↓</a>
        ) : null}
      </div>
      <div className="mt-4"><ShareCandidatePageButton tipo="ficha" inline /></div>
      <details className="mt-4 border-t border-black/10 pt-3">
        <summary className="w-fit cursor-pointer text-xs font-semibold text-black/60 underline underline-offset-4">Nome completo, mandato e dados eleitorais</summary>
        <div className="mt-3 space-y-2 text-sm leading-6 text-black/70">
          <p><strong>Nome completo:</strong> {candidato.nomeCompleto}</p>
          <p><strong>Número:</strong> {candidato.numero} · <strong>UF:</strong> {candidato.uf}</p>
          {mandatoAtual ? <p><strong>Mandato documentado:</strong> {formatarCargo(mandatoAtual.cargo, genero)}{mandatoAtual.uf ? ` · ${mandatoAtual.uf}` : ""}{mandatoAtual.inicio && mandatoAtual.fim ? ` · ${mandatoAtual.inicio}–${mandatoAtual.fim}` : ""}{mandatoAtual.fonte ? <> · <a className="underline" href={mandatoAtual.fonte.url} target="_blank" rel="noreferrer">{mandatoAtual.fonte.titulo} ↗</a></> : null}</p> : null}
          <p><strong>Situação no TSE:</strong> {eleito?.resultadoTse ?? candidato.situacaoTse}</p>
        </div>
      </details>
    </section>
  );
}
