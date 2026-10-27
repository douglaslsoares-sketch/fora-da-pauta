/**
 * Liga registros de um dossiê somente por tema editorial EXPRESSAMENTE
 * atribuído. Jamais infere posicionamento político por palavras parecidas.
 * A resenha automática é um rascunho factual e não substitui a fonte.
 */
import type { DossieCandidato, EventoDossie } from "@/data/eleicoes/dossies/modelo";

export type EvidenciaResenha = {
  id: string;
  titulo: string;
  data: string;
  url: string;
  fonte: string;
  natureza: string;
  resumo: string;
};

export type ContextoResenha = {
  tema: string | null;
  fato: EvidenciaResenha;
  relacionados: EvidenciaResenha[];
  narrativa: string;
};

function fonteValida(evento: EventoDossie) {
  return evento.fontes.find((f) => {
    try {
      const url = new URL(f.url);
      return url.protocol === "https:" && Boolean(url.hostname) &&
        Boolean(f.titulo.trim());
    } catch { return false; }
  });
}

function evidenciar(evento: EventoDossie): EvidenciaResenha | null {
  const fonte = fonteValida(evento);
  if (!fonte || !evento.titulo.trim() || !evento.resumo.trim()) return null;
  return {
    id: evento.id, titulo: evento.titulo, data: evento.data.rotulo,
    url: fonte.url, fonte: fonte.titulo,
    natureza: evento.natureza.join(", "), resumo: evento.resumo,
  };
}

function rotuloFato(evento: EventoDossie): string {
  if (evento.natureza.includes("alegacao")) return "Uma alegação registrada";
  if (evento.natureza.includes("contestada")) return "Uma informação contestada";
  if (evento.natureza.includes("em-investigacao")) return "Um fato sob investigação";
  if (evento.natureza.includes("decisao")) return "Uma decisão documentada";
  if (evento.eixos.includes("o-que-diz-e-defende")) return "Uma manifestação pública registrada";
  return "Um acontecimento documentado";
}

function normalizarTema(valor?: string): string | null {
  const tema = valor?.normalize("NFKC").trim().replace(/\s+/g, " ");
  return tema && tema.length >= 3 ? tema.toLocaleLowerCase("pt-BR") : null;
}

/**
 * Só inclui histórico explicitamente classificado sob o MESMO tema.
 * Eventos sem tema não geram uma ligação artificial.
 * Não faz alegações sobre autoria, culpa, causalidade ou veracidade.
 */
export function montarContextoResenha(
  dossie: DossieCandidato | null,
  eventoId: string,
): ContextoResenha | null {
  if (!dossie) return null;
  const evento = dossie.eventos.find((x) => x.id === eventoId);
  if (!evento) return null;
  const fato = evidenciar(evento);
  if (!fato) return null;

  const tema = normalizarTema(evento.tema);
  const relacionados = tema
    ? dossie.eventos
      .filter((e) => e.id !== evento.id && normalizarTema(e.tema) === tema)
      .map(evidenciar)
      .filter((e): e is EvidenciaResenha => e !== null)
      .sort((a, b) => a.id.localeCompare(b.id))
      .slice(0, 5)
    : [];

  const abertura = `${rotuloFato(evento)} na trajetória de ${dossie.nome}: ${evento.titulo}. ${evento.resumo.trim()}`;
  const contexto = relacionados.length
    ? `Sobre o mesmo assunto, a ficha reúne mais ${relacionados.length} ${relacionados.length === 1 ? "registro documental" : "registros documentais"} de outras datas. Eles ajudam a acompanhar o histórico, mas não demonstram, por si só, coerência, mudança de posição ou relação de causa e efeito.`
    : "Ainda não há outros registros ligados explicitamente a esse assunto na ficha.";
  return {
    tema: evento.tema?.trim() || null,
    fato, relacionados,
    narrativa: `${abertura} ${contexto}`,
  };
}
