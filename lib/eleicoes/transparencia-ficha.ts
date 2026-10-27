import type { AtuacaoPoliticaDocumentada } from "@/data/eleicoes/atuacao-politica";
import type { DossieCandidato } from "@/data/eleicoes/dossies/modelo";

/**
 * Datas publicadas são extraídas dos próprios arquivos, nunca da hora
 * em que o visitante abre a página. Sem inferir que a coleta está ativa.
 */
function dataDeArquivo(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const parcial = valor.match(/^(\d{4}-\d{2}-\d{2})(?:T|$)/);
  if (!parcial) return null;
  const dia = parcial[1];
  const instante = new Date(dia + "T00:00:00.000Z");
  if (!Number.isFinite(instante.getTime()) ||
      instante.toISOString().slice(0, 10) !== dia) return null;
  return dia;
}

function rotuloData(data: string | null): string | null {
  if (!data) return null;
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export type TransparenciaFicha = {
  atuacao: {
    estado: "arquivo-disponivel" | "sem-arquivo" | "data-invalida";
    geradoEm: string | null;
    ultimoRegistroEm: string | null;
    votos: number;
    proposicoes: number;
  };
  dossie: {
    estado: "publicado" | "ausente" | "data-invalida";
    revisadoEm: string | null;
  };
  noticias: {
    estado: "nao-integrado";
  };
};

export function obterTransparenciaFicha(
  atuacao: AtuacaoPoliticaDocumentada | null,
  dossie: DossieCandidato | null,
): TransparenciaFicha {
  const diaAtuacao = dataDeArquivo(atuacao?.atualizadoEm);
  const diaDossie = dataDeArquivo(dossie?.atualizadoEm);

  const datasDeAtos = [
    ...(atuacao?.votacoes ?? []).map((v) => dataDeArquivo(v.data)),
    ...(atuacao?.proposicoes ?? []).map((p) => dataDeArquivo(p.data)),
  ].filter((data): data is string => data !== null);
  datasDeAtos.sort();

  return {
    atuacao: {
      estado: !atuacao ? "sem-arquivo" :
        diaAtuacao ? "arquivo-disponivel" : "data-invalida",
      geradoEm: rotuloData(diaAtuacao),
      ultimoRegistroEm: rotuloData(datasDeAtos.at(-1) ?? null),
      votos: atuacao?.totalVotacoes ?? 0,
      proposicoes: atuacao?.totalProposicoes ?? 0,
    },
    dossie: {
      estado: !dossie ? "ausente" :
        diaDossie ? "publicado" : "data-invalida",
      revisadoEm: rotuloData(diaDossie),
    },
    noticias: {
      // Menções de RSS não verificadas NÃO fazem parte das fichas publicadas.
      estado: "nao-integrado",
    },
  };
}
