import "server-only";

import { candidaturas } from "../../data/eleicoes/candidaturas";
import { sql } from "../interesses/db";
import { classificarResultadoEleitoral } from "./resultado-eleitoral";

type GrupoAcompanhamentos = {
  candidatura_id: string;
  quantidade: number;
};

export async function sincronizarAcompanhamentos(
  { aplicar = false }: { aplicar?: boolean } = {},
) {
  const porId = new Map<string, (typeof candidaturas)[number]>();

  for (const candidatura of candidaturas) {
    if (porId.has(candidatura.id)) {
      throw new Error("Candidatura duplicada na base eleitoral.");
    }
    porId.set(candidatura.id, candidatura);
  }

  return sql.begin(async (transacao) => {
    const grupos = await transacao<GrupoAcompanhamentos[]>`
      SELECT candidatura_id, count(*)::int AS quantidade
      FROM public.telegram_acompanhamentos
      WHERE status = 'aguardando_eleicao'
        AND cancelled_at IS NULL
      GROUP BY candidatura_id
    `;

    const resumo = {
      simulacao: !aplicar,
      aguardandoConsultados: 0,
      seriamAtivados: 0,
      seriamMarcadosNaoEleitos: 0,
      permaneceriamAguardando: 0,
      candidaturaAusenteNaBase: 0,
      ativados: 0,
      marcadosNaoEleitos: 0,
    };

    for (const grupo of grupos) {
      const quantidade = Number(grupo.quantidade);
      resumo.aguardandoConsultados += quantidade;

      const candidatura = porId.get(grupo.candidatura_id);
      if (!candidatura) {
        resumo.candidaturaAusenteNaBase += quantidade;
        continue;
      }

      const resultado = classificarResultadoEleitoral(
        candidatura.resultadoEleitoral,
      );

      if (resultado === "aguardando") {
        resumo.permaneceriamAguardando += quantidade;
        continue;
      }

      const novoStatus =
        resultado === "eleito" ? "ativo" : "nao_eleito";

      if (resultado === "eleito") {
        resumo.seriamAtivados += quantidade;
      } else {
        resumo.seriamMarcadosNaoEleitos += quantidade;
      }

      if (!aplicar) continue;

      const alterados = await transacao`
        UPDATE public.telegram_acompanhamentos
        SET status = ${novoStatus},
            updated_at = now()
        WHERE candidatura_id = ${grupo.candidatura_id}
          AND status = 'aguardando_eleicao'
          AND cancelled_at IS NULL
        RETURNING id
      `;

      if (resultado === "eleito") {
        resumo.ativados += alterados.length;
      } else {
        resumo.marcadosNaoEleitos += alterados.length;
      }
    }

    return resumo;
  });
}