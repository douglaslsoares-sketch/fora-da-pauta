import type { Campaign } from "@/data/campanhas";
import type { AvisoEdicaoAprovado } from "@/data/edicoes/avisos-aprovados";
import { prepararTextoAvisoNovaEdicao } from "./modelo-aviso-edicao";

export type EventoEdicao = { id: string; texto: string; publicadoEm: string };

export function prepararAvisosEdicoes(
  campanhas: readonly Campaign[],
  aprovacoes: readonly AvisoEdicaoAprovado[],
  agora: Date = new Date(),
): EventoEdicao[] {
  if (!Number.isFinite(agora.getTime())) throw new Error("Relógio inválido.");
  const campanhaPorSlug = new Map(campanhas.map((item) => [item.slug, item]));
  const ids = new Set<string>();

  const eventos: EventoEdicao[] = [];

  for (const aprovacao of aprovacoes) {
    if (aprovacao.aprovado !== true ||
        !/^[a-z0-9-]+$/.test(aprovacao.slug) ||
        !/^v[1-9][0-9]{0,3}$/.test(aprovacao.revisao) ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(aprovacao.publicadoEm) ||
        !Number.isFinite(Date.parse(aprovacao.publicadoEm)) ||
        typeof aprovacao.audioDisponivel !== "boolean") {
      throw new Error("Aprovação editorial inválida.");
    }

    const campanha = campanhaPorSlug.get(aprovacao.slug);
    if (!campanha || !campanha.publishedAt ||
        !/^\d{4}-\d{2}-\d{2}$/.test(campanha.publishedAt)) {
      throw new Error("A edição ainda não consta como publicada.");
    }
    const publicacao = Date.parse(aprovacao.publicadoEm);
    const atraso = agora.getTime() - publicacao;
    if (atraso < 0) {
      throw new Error("A publicação da edição está no futuro.");
    }
    // Depois de sete dias, o aviso antigo é ignorado, sem interromper
    // a fila das outras edições e sem redistribuir conteúdo atrasado.
    if (atraso > 7 * 24 * 60 * 60 * 1000) continue;
    // A data de publicação da página deve coincidir com a aprovação.
    if (aprovacao.publicadoEm.slice(0, 10) !== campanha.publishedAt) {
      throw new Error("Datas de publicação da edição não conferem.");
    }

    const id = `edicao:${aprovacao.slug}:${aprovacao.revisao}`;
    if (ids.has(id)) throw new Error("Revisão editorial duplicada.");
    ids.add(id);

    eventos.push({
      id,
      publicadoEm: aprovacao.publicadoEm,
      texto: prepararTextoAvisoNovaEdicao({
        titulo: campanha.title,
        pergunta: aprovacao.pergunta,
        chamada: aprovacao.chamada,
        atribuicao: aprovacao.atribuicao,
        urlEdicao: `https://www.foradapauta.org/campanhas/${aprovacao.slug}`,
        audioDisponivel: aprovacao.audioDisponivel,
      }),
    });
  }

  return eventos;
}
