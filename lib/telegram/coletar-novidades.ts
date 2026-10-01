import "server-only";

import { buscarAtuacaoPolitica } from "@/data/eleicoes/atuacao-politica";
import { sql } from "../interesses/db";
import {
  registrarNovidadesNaFila,
  type EventoNotificacao,
} from "./registrar-novidades";

function limitarTexto(texto: string) {
  const caracteres = Array.from(texto);
  return caracteres.length <= 2500
    ? texto
    : caracteres.slice(0, 2499).join("") + "…";
}

export async function coletarNovidadesCandidatos() {
  // Prioriza fontes nunca verificadas e depois as mais antigas.
  // O lote limitado permite continuar nas próximas execuções.
  const candidaturas = await sql<{ candidatura_id: string }[]>`
    SELECT a.candidatura_id
    FROM public.telegram_acompanhamentos AS a
    LEFT JOIN public.telegram_fontes_notificacao AS f
      ON f.tipo = 'candidato'
      AND f.referencia = a.candidatura_id
    WHERE a.status IN ('ativo', 'aguardando_eleicao')
      AND a.cancelled_at IS NULL
    GROUP BY a.candidatura_id, f.verificado_at
    ORDER BY f.verificado_at ASC NULLS FIRST, a.candidatura_id
    LIMIT 10
  `;

  const resumo = {
    fontesVerificadas: 0,
    fontesInicializadas: 0,
    fontesSemDados: 0,
    fontesComFalha: 0,
    eventosNovos: 0,
    avisosInseridos: 0,
  };

  for (const { candidatura_id: id } of candidaturas) {
    try {
      const atuacao = buscarAtuacaoPolitica(id);

      if (!atuacao) {
        // Não inicializa uma fonte vazia por ausência do arquivo.
        resumo.fontesSemDados++;
        continue;
      }

      const ficha =
        `https://www.foradapauta.org/conheca-seu-candidato/${id}`;

      const eventos: EventoNotificacao[] = [
        ...atuacao.votacoes.map((votacao) => ({
          id: `votacao:${votacao.votacaoId}`,
          texto:
            "Novo registro documentado na ficha que você acompanha.\n\n" +
            `Votação: ${votacao.votacaoId}\n` +
            `Data: ${votacao.data}\n` +
            `Voto registrado: ${votacao.voto}\n\n` +
            limitarTexto(votacao.descricao) +
            `\n\nVer ficha: ${ficha}\n` +
            "Para interromper os avisos, envie /parar.",
        })),
        ...atuacao.proposicoes.map((proposicao) => ({
          id: `proposicao:${proposicao.proposicaoId}`,
          texto:
            "Novo registro documentado na ficha que você acompanha.\n\n" +
            `Proposição: ${proposicao.identificacao}\n` +
            `Data: ${proposicao.data}\n` +
            `Vínculo registrado: ${proposicao.papel}\n\n` +
            limitarTexto(proposicao.ementa) +
            `\n\nVer ficha: ${ficha}\n` +
            "Para interromper os avisos, envie /parar.",
        })),
      ];

      const resultado = await registrarNovidadesNaFila({
        tipo: "candidato",
        referencia: id,
        eventos,
      });

      resumo.fontesVerificadas++;
      if (resultado.inicializacao) resumo.fontesInicializadas++;
      resumo.eventosNovos += resultado.eventosNovos;
      resumo.avisosInseridos += resultado.avisosInseridos;
    } catch {
      resumo.fontesComFalha++;
      console.error("Falha ao conferir novidades de uma candidatura.");
    }
  }

  return resumo;
}