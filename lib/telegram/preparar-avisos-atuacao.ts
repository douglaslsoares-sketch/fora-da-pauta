import type { AtuacaoPoliticaDocumentada } from "@/data/eleicoes/atuacao-politica";
import type { EventoNotificacao } from "./registrar-novidades";

/**
 * Registros de atuação são extraídos de bases institucionais.
 * Um novo registro encontrado não é necessariamente um fato ocorrido hoje.
 * Não atribua motivação ou efeito político sem comprovação.
 */
function reduzir(texto: string, limite: number) {
  const caracteres = Array.from(texto.trim());
  return caracteres.length <= limite
    ? texto.trim()
    : caracteres.slice(0, limite - 1).join("") + "…";
}

function fonteOficial(
  fonte: { titulo: string; url: string },
): string {
  const titulo = reduzir(fonte.titulo, 140);
  let url: URL;
  try {
    url = new URL(fonte.url);
  } catch {
    throw new Error("Fonte institucional com endereço inválido.");
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    !(
      url.hostname.endsWith(".leg.br") ||
      url.hostname.endsWith(".gov.br")
    ) ||
    url.port !== "" ||
    fonte.url.length > 850 ||
    !titulo
  ) {
    throw new Error("Fonte institucional insegura ou sem identificação.");
  }

  return `Fonte: ${titulo}\n${url.toString()}`;
}

export function prepararAvisosAtuacao(
  atuacao: AtuacaoPoliticaDocumentada | null,
  candidaturaId: string,
): EventoNotificacao[] {
  if (!atuacao) return [];
  if (!/^\d{8,20}$/.test(candidaturaId)) {
    throw new Error("Identificador eleitoral inválido.");
  }
  const ficha = `https://www.foradapauta.org/conheca-seu-candidato/${candidaturaId}`;
  return [
    ...atuacao.votacoes.map((votacao) => ({
      id: `votacao:${votacao.votacaoId}`,
      texto: [
        "Um registro de votação parlamentar foi incluído no acompanhamento.",
        `Quando ocorreu: ${reduzir(votacao.data, 65)}.`,
        votacao.voto.trim()
          ? `Voto registrado: ${reduzir(votacao.voto, 80)}.`
          : "Voto individual não disponível neste registro. Não é possível atribuir uma posição.",
        reduzir(votacao.descricao, 1450),
        "Este é o registro da votação, não uma conclusão automática sobre as intenções de quem votou.",
        fonteOficial(votacao.fonte),
        `Consulte a ficha e outros registros: ${ficha}`,
        "Para mudar seus acompanhamentos, envie /opcoes.",
      ].join("\n\n"),
    })),
    ...atuacao.proposicoes.map((proposicao) => ({
      id: `proposicao:${proposicao.proposicaoId}`,
      texto: [
        "Um registro de proposição parlamentar foi incluído no acompanhamento.",
        `Proposição: ${reduzir(proposicao.identificacao, 100)}.`,
        `Data do registro: ${reduzir(proposicao.data, 65)}.`,
        `Vínculo registrado na fonte: ${reduzir(proposicao.papel, 140)}.`,
        reduzir(proposicao.ementa, 1400),
        "Uma proposição registrada não significa, por si só, que a proposta virou lei.",
        fonteOficial(proposicao.fonte),
        `Consulte a ficha e outros registros: ${ficha}`,
        "Para mudar seus acompanhamentos, envie /opcoes.",
      ].join("\n\n"),
    })),
  ];
}
