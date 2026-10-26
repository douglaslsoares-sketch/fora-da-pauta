import type { DossieCandidato } from "@/data/eleicoes/dossies/modelo";
import type { EventoNotificacao } from "./registrar-novidades";

const DATA_PUBLICACAO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/;
const REVISAO = /^[a-z0-9][a-z0-9._-]{0,49}$/i;

function reduzir(texto: string, limite: number) {
  const caracteres = Array.from(texto.trim());
  return caracteres.length <= limite
    ? texto.trim()
    : caracteres.slice(0, limite - 1).join("") + "…";
}

/**
 * O histórico editorial relaciona somente registros com o MESMO tema indicado
 * explicitamente na ficha. Nunca infere motivação, coerência ou culpa.
 * A data de cada registro fica visível e as fontes permanecem consultáveis.
 */
export function contextoDocumental(
  dossie: DossieCandidato,
  eventoId: string,
): string {
  const principal = dossie.eventos.find((item) => item.id === eventoId);
  const tema = principal?.tema?.normalize("NFKC").trim().toLocaleLowerCase("pt-BR");
  if (!principal || !tema || tema.length < 3) return "";

  const anteriores = dossie.eventos
    .filter((item) =>
      item.id !== principal.id &&
      item.tema?.normalize("NFKC").trim().toLocaleLowerCase("pt-BR") === tema &&
      item.data.inicio <= principal.data.inicio &&
      item.fontes.some((fonte) =>
        fonte.titulo.trim() && /^https:\/\//.test(fonte.url)
      )
    )
    .sort((a, b) => b.data.inicio.localeCompare(a.data.inicio))
    .slice(0, 2);

  if (anteriores.length === 0) return "";
  const relatos = anteriores.map((item) => {
    const documento = item.fontes.find((fonte) =>
      fonte.titulo.trim() && /^https:\/\//.test(fonte.url)
    )!;
    const qualificacao = item.natureza.includes("alegacao")
      ? "uma alegação atribuída em registro"
      : item.natureza.includes("em-investigacao")
        ? "uma investigação registrada"
        : item.natureza.includes("contestada")
          ? "um registro contestado"
          : "um registro público";
    return `${qualificacao} de ${reduzir(item.data.rotulo, 60)}: ${reduzir(item.titulo, 95)}. Fonte: ${documento.url}`;
  });

  return `Sobre o mesmo assunto, a ficha contém também ${relatos.join(" E ")}. Esses registros ajudam a conhecer a trajetória, mas, isoladamente, não demonstram mudança de posição nem relação de causa e efeito.`;
}

/**
 * Apenas eventos publicados no dossiê e marcados expressamente pela edição
 * entram nos avisos. Nenhum evento antigo vira aviso por simples importação.
 */
export function prepararAvisosDossie(
  dossie: DossieCandidato | null,
  agora: Date = new Date(),
): EventoNotificacao[] {
  if (!dossie) return [];

  const avisos: EventoNotificacao[] = [];
  const vistos = new Set<string>();

  for (const evento of dossie.eventos) {
    const aviso = evento.avisoTelegram;
    if (!aviso) continue;

    if (
      !REVISAO.test(aviso.revisao) ||
      !DATA_PUBLICACAO.test(aviso.publicadoEm) ||
      !Number.isFinite(Date.parse(aviso.publicadoEm)) ||
      !["nova-informacao", "desdobramento", "correcao"].includes(aviso.tipo) ||
      !evento.id || !evento.titulo.trim() || !evento.data.rotulo.trim()
    ) {
      throw new Error(`Aviso editorial inválido no dossiê ${dossie.candidaturaId}.`);
    }

    // Publicações futuras não podem ser notificadas antecipadamente.
    if (Date.parse(aviso.publicadoEm) > agora.getTime()) continue;

    const fonte = evento.fontes.find((item) =>
      item.titulo.trim() && /^https:\/\//.test(item.url)
    );
    if (!fonte) {
      throw new Error(`Aviso sem fonte HTTPS no dossiê ${dossie.candidaturaId}.`);
    }

    const id = `dossie:${evento.id}:${aviso.revisao}`;
    if (vistos.has(id)) {
      throw new Error(`Revisão editorial duplicada: ${id}.`);
    }
    vistos.add(id);

    const chamada = {
      "nova-informacao": "Nova informação publicada na ficha",
      desdobramento: "Novo desdobramento publicado na ficha",
      correcao: "Correção importante publicada na ficha",
    }[aviso.tipo];

    const dataPublicacao = aviso.publicadoEm.slice(0, 10)
      .split("-").reverse().join("/");

    const endereco =
      `https://www.foradapauta.org/conheca-seu-candidato/${dossie.candidaturaId}` +
      `#evento-${encodeURIComponent(evento.id)}`;

    avisos.push({
      id,
      publicadoEm: aviso.publicadoEm,
      texto: [
        `${chamada}: ${reduzir(dossie.nome, 90)}`,
        reduzir(evento.titulo, 180),
        `Quando aconteceu: ${reduzir(evento.data.rotulo, 100)}`,
        `Publicado no Fora da Pauta: ${dataPublicacao}`,
        reduzir(evento.resumo, 800),
        contextoDocumental(dossie, evento.id),
        `Fonte: ${reduzir(fonte.titulo, 180)}`,
        fonte.url,
        `Leia a ficha e confira os documentos: ${endereco}`,
        "Para modificar seus acompanhamentos, envie /opcoes.",
      ].filter(Boolean).join("\n\n"),
    });
  }

  return avisos;
}
