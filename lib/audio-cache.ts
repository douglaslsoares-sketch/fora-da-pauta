import "server-only";

import { sql } from "@/lib/interesses/db";

let criacaoTabela: Promise<void> | null = null;

export class LimiteDeAudioAtingido extends Error {
  constructor() {
    super(
      "Limite diário de novas narrações atingido. Áudios existentes continuam disponíveis.",
    );
    this.name = "LimiteDeAudioAtingido";
  }
}

const LIMITE_GERACOES_DIA = 30;

async function garantirTabela() {
  if (!criacaoTabela) {
    criacaoTabela = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS fdp_audio_cache (
          chave TEXT PRIMARY KEY,
          arquivo BYTEA NOT NULL,
          criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS fdp_audio_geracoes_diarias (
          dia DATE PRIMARY KEY,
          total INTEGER NOT NULL DEFAULT 0
        )
      `;
    })();
  }

  try {
    await criacaoTabela;
  } catch (erro) {
    criacaoTabela = null;
    throw erro;
  }

  return sql;
}

/**
 * A chave é calculada no servidor usando o conteúdo, modelo,
 * voz e instruções. Cada versão de um trecho tem um só MP3
 * compartilhado por todos os visitantes.
 *
 * O bloqueio transacional evita duas cobranças simultâneas
 * para a mesma chave, mesmo em instâncias distintas do site.
 */
export async function obterOuGerarAudioCompartilhado(
  chave: string,
  gerar: () => Promise<Uint8Array>,
): Promise<{ arquivo: Uint8Array; geradoAgora: boolean }> {
  const sql = await garantirTabela();

  return sql.begin(async (tx) => {
    await tx`
      SELECT pg_advisory_xact_lock(hashtext(${chave}))
    `;

    const encontrados = await tx`
      SELECT arquivo
      FROM fdp_audio_cache
      WHERE chave = ${chave}
      LIMIT 1
    `;

    if (encontrados.length > 0) {
      return {
        arquivo: new Uint8Array(
          encontrados[0].arquivo as Uint8Array,
        ),
        geradoAgora: false,
      };
    }

    // Contagem global: mesmo com muitos visitantes, novos textos
    // não podem consumir créditos indefinidamente.
    // A reserva é revertida automaticamente se a geração falhar.
    await tx`
      INSERT INTO fdp_audio_geracoes_diarias (dia, total)
      VALUES (CURRENT_DATE, 0)
      ON CONFLICT (dia) DO NOTHING
    `;

    const quota = await tx`
      UPDATE fdp_audio_geracoes_diarias
      SET total = total + 1
      WHERE dia = CURRENT_DATE
        AND total < ${LIMITE_GERACOES_DIA}
      RETURNING total
    `;

    if (quota.length === 0) {
      throw new LimiteDeAudioAtingido();
    }

    const arquivo = await gerar();

    if (arquivo.byteLength === 0) {
      throw new Error("A geração do áudio retornou um arquivo vazio.");
    }

    await tx`
      INSERT INTO fdp_audio_cache (chave, arquivo)
      VALUES (${chave}, ${Buffer.from(arquivo)})
    `;

    return { arquivo, geradoAgora: true };
  });
}
