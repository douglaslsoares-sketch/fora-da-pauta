import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { formatarCargo } from "@/lib/eleicoes/formatar-cargo";

import { candidaturas } from "./candidaturas";
import dadosCamara from "./gerado/historico-politico-camara.json";

export type ItemDaTrajetoriaPolitica = {
  titulo: string;
  periodo?: string;
  descricao?: string;
  fonte: {
    titulo: string;
    url: string;
  };
};

export type ItemDaAtuacaoPolitica = {
  titulo: string;
  data?: string;
  descricao: string;
  fonte: {
    titulo: string;
    url: string;
  };
};

export type HistoricoPoliticoDoCandidato = {
  candidaturaId: string;
  trajetoria: ItemDaTrajetoriaPolitica[];
  atuacao: ItemDaAtuacaoPolitica[];
};

type ItemBrutoDaCamara = {
  titulo: string;
  periodo?: string | null;
  descricao?: string | null;
  fonte: {
    titulo: string;
    url: string;
  };
};

type HistoricoBrutoDaCamara = {
  candidaturaId: string;
  deputadoId: string;
  trajetoria: ItemBrutoDaCamara[];
};

type CandidaturaDaIdentidade = {
  candidaturaId: string;
  eleicao: number;
  nomeCompleto: string;
  nomeUrna: string;
  cargo: string;
  uf: string;
};

type SituacaoIdentidadePolitica =
  | "CONFIRMADA"
  | "EM_REVISAO";

type IdentidadePolitica = {
  pessoaPoliticaId: string;
  situacaoIdentidade: SituacaoIdentidadePolitica;
  motivoRevisao?: string | null;
  candidaturas: CandidaturaDaIdentidade[];
};

type RegistroEleitoral2022 = {
  candidaturaId: string;
  eleicao: number;
  nomeCompleto: string;
  nomeUrna: string;
  cargo: string;
  uf: string;
  numero: string;
  siglaPartido: string;
  situacaoTse: string;
};

type ArquivoResumo2022 = {
  eleicao: number;
  fonteOficial: string;
  registros: RegistroEleitoral2022[];
};

/*
 * Regras:
 *
 * 1. A candidatura atual de 2026 vem diretamente da base eleitoral.
 *
 * 2. Uma candidatura de eleição anterior só é associada quando
 *    a identidade política está CONFIRMADA.
 *
 * 3. EM_REVISAO nunca transfere trajetória entre eleições.
 *
 * 4. Registro de candidatura não é apresentado como mandato.
 *
 * 5. A situação registrada pelo TSE permanece explícita.
 *
 * 6. Histórico institucional da Câmara só é agregado quando a
 *    identidade política atual está CONFIRMADA.
 */

const historicosDaCamara =
  (dadosCamara as HistoricoBrutoDaCamara[]).map(
    (historico): HistoricoPoliticoDoCandidato => ({
      candidaturaId:
        historico.candidaturaId,

      trajetoria:
        historico.trajetoria.map(
          (item) => ({
            titulo:
              item.titulo,

            periodo:
              item.periodo ?? undefined,

            descricao:
              item.descricao ?? undefined,

            fonte: {
              titulo:
                item.fonte.titulo,

              url:
                item.fonte.url,
            },
          }),
        ),

      atuacao: [],
    }),
  );

const arquivoIdentidades =
  join(
    process.cwd(),
    "data",
    "eleicoes",
    "gerado",
    "identidades-politicas.json",
  );

const identidades =
  JSON.parse(
    readFileSync(
      arquivoIdentidades,
      "utf8",
    ),
  ) as IdentidadePolitica[];

const arquivoResumo2022 =
  join(
    process.cwd(),
    "data",
    "eleicoes",
    "gerado",
    "candidaturas-2022-resumo.json",
  );

const resumo2022 =
  JSON.parse(
    readFileSync(
      arquivoResumo2022,
      "utf8",
    ),
  ) as ArquivoResumo2022;

const candidaturaAtualPorId =
  new Map(
    candidaturas.map(
      (candidatura) => [
        candidatura.id,
        candidatura,
      ] as const,
    ),
  );

const identidadePorCandidatura =
  new Map<
    string,
    IdentidadePolitica
  >();

for (const identidade of identidades) {

  for (
    const candidatura of
    identidade.candidaturas
  ) {

    identidadePorCandidatura.set(
      candidatura.candidaturaId,
      identidade,
    );
  }
}

const registro2022PorId =
  new Map(
    resumo2022.registros.map(
      (registro) => [
        registro.candidaturaId,
        registro,
      ] as const,
    ),
  );

const historicoCamaraPorCandidatura =
  new Map(
    historicosDaCamara.map(
      (historico) => [
        historico.candidaturaId,
        historico,
      ] as const,
    ),
  );

function descreverCircunscricao(
  uf: string,
) {

  if (
    uf.trim().toUpperCase() ===
    "BR"
  ) {
    return "de âmbito nacional";
  }

  return `na circunscrição ${uf}`;
}

function formatarSituacaoTse(
  situacao: string,
) {
  const valor =
    situacao?.trim();

  if (
    !valor ||
    valor.startsWith("#")
  ) {
    return (
      "Situação no TSE: ainda não informada " +
      "na base consultada."
    );
  }

  return `Situação no TSE: ${valor}.`;
}
function itemCandidaturaAtual(
  candidaturaId: string,
): ItemDaTrajetoriaPolitica | null {

  const candidatura =
    candidaturaAtualPorId.get(
      candidaturaId,
    );

  if (!candidatura) {
    return null;
  }

  const cargo =
    formatarCargo(
      candidatura.cargo,
    );

  const partido =
    candidatura.siglaPartido
      ? `, pelo ${candidatura.siglaPartido}`
      : "";

  return {
    titulo:
      `Registro de candidatura a ${cargo}`,

    periodo:
      String(
        candidatura.eleicao,
      ),

    descricao:
      `${formatarSituacaoTse(candidatura.situacaoTse)} ` +
      `Registro ${descreverCircunscricao(
        candidatura.uf,
      )} nas Eleições de ${candidatura.eleicao}${partido}.`,

    fonte: {
      titulo:
        `Tribunal Superior Eleitoral — Candidatos ${candidatura.eleicao}`,

      url:
        candidatura.fonteOficial,
    },
  };
}

function itemCandidatura2022(
  candidaturaId: string,
): ItemDaTrajetoriaPolitica | null {

  const registro =
    registro2022PorId.get(
      candidaturaId,
    );

  if (!registro) {
    return null;
  }

  const cargo =
    formatarCargo(
      registro.cargo
        .trim()
        .toLowerCase()
        .replace(
          /\s+/g,
          "-",
        ),
    );

  const partido =
    registro.siglaPartido
      ? `, pelo ${registro.siglaPartido}`
      : "";

  return {
    titulo:
      `Registro de candidatura a ${cargo}`,

    periodo:
      String(
        registro.eleicao,
      ),

    descricao:
      `${formatarSituacaoTse(registro.situacaoTse)} ` +
      `Registro ${descreverCircunscricao(
        registro.uf,
      )} nas Eleições de ${registro.eleicao}${partido}.`,

    fonte: {
      titulo:
        "Tribunal Superior Eleitoral — Candidatos 2022",

      url:
        resumo2022.fonteOficial,
    },
  };
}

function montarRegistrosEleitorais(
  candidaturaId: string,
): ItemDaTrajetoriaPolitica[] {

  const itens:
    ItemDaTrajetoriaPolitica[] = [];

  const atual =
    itemCandidaturaAtual(
      candidaturaId,
    );

  if (atual) {
    itens.push(
      atual,
    );
  }

  const identidade =
    identidadePorCandidatura.get(
      candidaturaId,
    );

  if (
    !identidade ||
    identidade.situacaoIdentidade !==
      "CONFIRMADA"
  ) {
    return itens;
  }

  const candidaturaAtual =
    candidaturaAtualPorId.get(
      candidaturaId,
    );

  if (!candidaturaAtual) {
    return itens;
  }

  for (
    const candidaturaAnterior of
    identidade.candidaturas
  ) {

    if (
      candidaturaAnterior.candidaturaId ===
      candidaturaId
    ) {
      continue;
    }

    if (
      candidaturaAnterior.eleicao >=
      candidaturaAtual.eleicao
    ) {
      continue;
    }

    if (
      candidaturaAnterior.eleicao !==
      2022
    ) {
      continue;
    }

    const item =
      itemCandidatura2022(
        candidaturaAnterior.candidaturaId,
      );

    if (item) {
      itens.push(
        item,
      );
    }
  }

  return itens;
}

function removerDuplicatas(
  itens: ItemDaTrajetoriaPolitica[],
) {

  const vistos =
    new Set<string>();

  return itens.filter(
    (item) => {

      const chave =
        [
          item.titulo,
          item.periodo ?? "",
          item.descricao ?? "",
          item.fonte.url,
        ].join("|||");

      if (vistos.has(chave)) {
        return false;
      }

      vistos.add(chave);

      return true;
    },
  );
}

/*
 * Mantida para compatibilidade.
 * Esta exportação representa somente o histórico institucional
 * previamente importado da Câmara.
 */
export const historicosPoliticos:
  HistoricoPoliticoDoCandidato[] =
    historicosDaCamara;

export function buscarHistoricoPolitico(
  candidaturaId: string,
): HistoricoPoliticoDoCandidato | null {

  const identidade =
    identidadePorCandidatura.get(
      candidaturaId,
    );

  const identidadeConfirmada =
    identidade?.situacaoIdentidade ===
    "CONFIRMADA";

  const registrosEleitorais =
    montarRegistrosEleitorais(
      candidaturaId,
    );

  const historicoCamara =
    identidadeConfirmada
      ? historicoCamaraPorCandidatura.get(
          candidaturaId,
        )
      : undefined;

  const trajetoria =
    removerDuplicatas([
      ...registrosEleitorais,
      ...(
        historicoCamara?.trajetoria ??
        []
      ),
    ]);

  if (trajetoria.length === 0) {
    return null;
  }

  return {
    candidaturaId,

    trajetoria,

    atuacao:
      historicoCamara?.atuacao ??
      [],
  };
}