import fs from "node:fs";
import crypto from "node:crypto";

import type { Prisma } from "../generated/prisma/client";

const PESSOA_ID =
  "politico-0e79a887b973490786f70ed44046a434";

const CANDIDATURA_2022 =
  "160001614512";

const CANDIDATURA_2026 =
  "160002547656";

type RegistroGenerico =
  Record<string, any>;

function carregar(
  caminho: string
): unknown {
  return JSON.parse(
    fs.readFileSync(
      caminho,
      "utf8"
    )
  );
}

function comoArray(
  valor: unknown
): RegistroGenerico[] {
  if (Array.isArray(valor)) {
    return valor;
  }

  if (
    valor &&
    typeof valor === "object"
  ) {
    const objeto =
      valor as RegistroGenerico;

    for (const chave of [
      "dados",
      "itens",
      "registros",
      "candidaturas",
      "pessoas",
      "politicos",
      "resultados",
    ]) {
      if (Array.isArray(objeto[chave])) {
        return objeto[chave];
      }
    }
  }

  return [];
}

function dinheiro(
  valor: unknown
): number {
  return Number(
    Number(valor).toFixed(2)
  );
}

function dataOuNull(
  valor: unknown
): Date | null {
  if (
    typeof valor !== "string" ||
    valor.trim() === ""
  ) {
    return null;
  }

  const data =
    new Date(
      `${valor}T00:00:00.000Z`
    );

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return null;
  }

  return data;
}

function origemFonte(
  fonte: unknown
) {
  if (
    fonte &&
    typeof fonte === "object" &&
    !Array.isArray(fonte)
  ) {
    const objeto =
      fonte as RegistroGenerico;

    return {
      fonteTitulo:
        typeof objeto.titulo === "string"
          ? objeto.titulo
          : null,

      fonteUrl:
        typeof objeto.url === "string"
          ? objeto.url
          : null,
    };
  }

  if (typeof fonte === "string") {
    return {
      fonteTitulo: fonte,
      fonteUrl: null,
    };
  }

  return {
    fonteTitulo: null,
    fonteUrl: null,
  };
}

function chaveEvento(
  evento: RegistroGenerico,
  categoria: "TRAJETORIA" | "ATUACAO"
): string {
  const fonte =
    origemFonte(
      evento.fonte
    );

  /*
   * A chave procura identificar o fato na fonte,
   * sem depender da descricao textual completa.
   *
   * Assim, uma melhoria posterior na descricao
   * tende a atualizar o mesmo evento em vez de
   * criar outro registro.
   */
  const identidade = {
    pessoaPoliticaId:
      PESSOA_ID,

    categoria,

    tipo:
      evento.tipo ?? null,

    dataOrdenacao:
      evento.dataOrdenacao ?? null,

    titulo:
      evento.titulo ?? null,

    fonteUrl:
      fonte.fonteUrl,
  };

  const hash =
    crypto
      .createHash("sha256")
      .update(
        JSON.stringify(
          identidade
        )
      )
      .digest("hex")
      .slice(0, 32);

  return (
    `evento:${PESSOA_ID}:${hash}`
  );
}

function montarCarga() {
  const problemas: string[] =
    [];

  const identidades =
    comoArray(
      carregar(
        "data/eleicoes/gerado/identidades-politicas.json"
      )
    );

  const identidade =
    identidades.find(
      (item) =>
        item.pessoaPoliticaId ===
        PESSOA_ID
    );

  if (!identidade) {
    problemas.push(
      "Identidade politica nao encontrada."
    );
  }

  const candidaturaIdentidade2022 =
    identidade?.candidaturas?.find(
      (item: RegistroGenerico) =>
        String(
          item.candidaturaId
        ) === CANDIDATURA_2022
    );

  const candidaturaIdentidade2026 =
    identidade?.candidaturas?.find(
      (item: RegistroGenerico) =>
        String(
          item.candidaturaId
        ) === CANDIDATURA_2026
    );

  if (!candidaturaIdentidade2022) {
    problemas.push(
      "Candidatura 2022 nao encontrada na identidade."
    );
  }

  if (!candidaturaIdentidade2026) {
    problemas.push(
      "Candidatura 2026 nao encontrada na identidade."
    );
  }

  const candidaturas2026 =
    comoArray(
      carregar(
        "data/eleicoes/gerado/candidaturas-2026.json"
      )
    );

  const candidaturaCompleta2026 =
    candidaturas2026.find(
      (item) =>
        String(item.id) ===
        CANDIDATURA_2026
    );

  if (!candidaturaCompleta2026) {
    problemas.push(
      "Candidatura completa de 2026 nao encontrada."
    );
  }

  if (
    problemas.length > 0 ||
    !candidaturaIdentidade2022 ||
    !candidaturaIdentidade2026 ||
    !candidaturaCompleta2026
  ) {
    return {
      problemas,
      pessoaPolitica: null,
      candidaturas: [],
      eventos: [],
      declaracoes: [],
      bens: [],
    };
  }

  const pessoaPolitica = {
    id:
      PESSOA_ID,

    nomeCompleto:
      candidaturaCompleta2026.nomeCompleto,

    nomePublico:
      candidaturaCompleta2026.nomeUrna ??
      null,

    fotoUrl:
      `/candidatos/2026/${CANDIDATURA_2026}.jpg`,

    fotoFonteTitulo:
      null,

    fotoFonteUrl:
      null,

    fotoDataReferencia:
      null,
  };

  const candidatura2022 = {
    id:
      String(
        candidaturaIdentidade2022.candidaturaId
      ),

    pessoaPoliticaId:
      PESSOA_ID,

    eleicao:
      Number(
        candidaturaIdentidade2022.eleicao
      ),

    nomeCompleto:
      candidaturaIdentidade2022.nomeCompleto ??
      null,

    nomeUrna:
      candidaturaIdentidade2022.nomeUrna ??
      null,

    numero:
      null,

    cargo:
      candidaturaIdentidade2022.cargo,

    uf:
      candidaturaIdentidade2022.uf ??
      null,

    partido:
      null,

    siglaPartido:
      null,

    federacao:
      null,

    situacao:
      null,

    situacaoTse:
      null,

    fonteOficial:
      null,

    ultimaVerificacao:
      null,
  };

  const candidatura2026 = {
    id:
      String(
        candidaturaCompleta2026.id
      ),

    pessoaPoliticaId:
      PESSOA_ID,

    eleicao:
      Number(
        candidaturaCompleta2026.eleicao
      ),

    nomeCompleto:
      candidaturaCompleta2026.nomeCompleto ??
      null,

    nomeUrna:
      candidaturaCompleta2026.nomeUrna ??
      null,

    numero:
      candidaturaCompleta2026.numero ??
      null,

    cargo:
      candidaturaCompleta2026.cargo,

    uf:
      candidaturaCompleta2026.uf ??
      null,

    partido:
      candidaturaCompleta2026.partido ??
      null,

    siglaPartido:
      candidaturaCompleta2026.siglaPartido ??
      null,

    federacao:
      candidaturaCompleta2026.federacao ??
      null,

    situacao:
      candidaturaCompleta2026.situacao ??
      null,

    situacaoTse:
      candidaturaCompleta2026.situacaoTse ??
      null,

    fonteOficial:
      candidaturaCompleta2026.fonteOficial ??
      null,

    ultimaVerificacao:
      dataOuNull(
        candidaturaCompleta2026.ultimaVerificacao
      ),
  };

  const candidaturas = [
    candidatura2022,
    candidatura2026,
  ];

  const historico =
    carregar(
      "data/eleicoes/gerado/historico-politico-por-candidato/160002547656.json"
    ) as RegistroGenerico;

  const eventos: Array<{
    pessoaPoliticaId: string;
    chaveOrigem: string;
    tipo: string;
    categoria: "TRAJETORIA" | "ATUACAO";
    dataOrdenacao: string | null;
    periodo: string | null;
    titulo: string;
    descricao: string | null;
    fonteTitulo: string | null;
    fonteUrl: string | null;
    dados: Prisma.InputJsonValue;
  }> = [];

  for (
    const item of
    historico.trajetoria ?? []
  ) {
    const fonte =
      origemFonte(
        item.fonte
      );

    eventos.push({
      pessoaPoliticaId:
        PESSOA_ID,

      chaveOrigem:
        chaveEvento(
          item,
          "TRAJETORIA"
        ),

      tipo:
        item.tipo,

      categoria:
        "TRAJETORIA",

      dataOrdenacao:
        item.dataOrdenacao ??
        null,

      periodo:
        item.periodo ??
        null,

      titulo:
        item.titulo,

      descricao:
        item.descricao ??
        null,

      fonteTitulo:
        fonte.fonteTitulo,

      fonteUrl:
        fonte.fonteUrl,

      dados:
        item as Prisma.InputJsonValue,
    });
  }

  for (
    const item of
    historico.atuacao ?? []
  ) {
    const fonte =
      origemFonte(
        item.fonte
      );

    eventos.push({
      pessoaPoliticaId:
        PESSOA_ID,

      chaveOrigem:
        chaveEvento(
          item,
          "ATUACAO"
        ),

      tipo:
        item.tipo,

      categoria:
        "ATUACAO",

      dataOrdenacao:
        item.dataOrdenacao ??
        null,

      periodo:
        item.periodo ??
        null,

      titulo:
        item.titulo,

      descricao:
        item.descricao ??
        null,

      fonteTitulo:
        fonte.fonteTitulo,

      fonteUrl:
        fonte.fonteUrl,

      dados:
        item as Prisma.InputJsonValue,
    });
  }

  const declaracoes: Array<{
    pessoaPoliticaId: string;
    candidaturaId: string;
    eleicao: number;
    valorTotal: number;
    quantidadeDeBens: number;
    fonteTitulo: string | null;
    fonteUrl: string | null;
    verificadoEm: Date | null;
  }> = [];

  const bens: Array<{
    id: string;
    candidaturaId: string;
    eleicao: number;
    tipoCodigo: string | null;
    tipo: string | null;
    descricao: string;
    valor: number;
    ordem: number;
  }> = [];

  for (
    const ano of
    [2022, 2026]
  ) {
    const candidaturaId =
      ano === 2022
        ? CANDIDATURA_2022
        : CANDIDATURA_2026;

    const registros =
      comoArray(
        carregar(
          `data/eleicoes/gerado/bens-${ano}.json`
        )
      );

    const origem =
      registros.find(
        (item) =>
          String(
            item.candidaturaId
          ) === candidaturaId
      );

    if (!origem) {
      problemas.push(
        `Patrimonio ${ano} nao encontrado.`
      );

      continue;
    }

    const totalDeclarado =
      dinheiro(
        origem.totalDeclarado
      );

    const quantidadeDeclarada =
      Number(
        origem.quantidadeDeBens
      );

    const quantidadeArray =
      Array.isArray(
        origem.bens
      )
        ? origem.bens.length
        : 0;

    const somaBens =
      dinheiro(
        (origem.bens ?? [])
          .reduce(
            (
              total: number,
              bem: RegistroGenerico
            ) =>
              total +
              Number(
                bem.valor
              ),
            0
          )
      );

    if (
      somaBens !==
      totalDeclarado
    ) {
      problemas.push(
        `Total patrimonial ${ano} nao confere.`
      );
    }

    if (
      quantidadeDeclarada !==
      quantidadeArray
    ) {
      problemas.push(
        `Quantidade de bens ${ano} nao confere.`
      );
    }

    declaracoes.push({
      pessoaPoliticaId:
        PESSOA_ID,

      candidaturaId,

      eleicao:
        ano,

      valorTotal:
        totalDeclarado,

      quantidadeDeBens:
        quantidadeDeclarada,

      fonteTitulo:
        typeof origem.fonte ===
        "string"
          ? origem.fonte
          : null,

      fonteUrl:
        null,

      verificadoEm:
        null,
    });

    for (
      let indice = 0;
      indice < quantidadeArray;
      indice++
    ) {
      const bem =
        origem.bens[indice];

      bens.push({
        id:
          `bem:${candidaturaId}:${indice + 1}`,

        candidaturaId,

        eleicao:
          ano,

        tipoCodigo:
          bem.tipoCodigo ??
          null,

        tipo:
          bem.tipo ??
          null,

        descricao:
          bem.descricao,

        valor:
          dinheiro(
            bem.valor
          ),

        ordem:
          indice + 1,
      });
    }
  }

  const chaves =
    eventos.map(
      (evento) =>
        evento.chaveOrigem
    );

  const chavesUnicas =
    new Set(
      chaves
    );

  const trajetoria =
    eventos.filter(
      (evento) =>
        evento.categoria ===
        "TRAJETORIA"
    );

  const atuacao =
    eventos.filter(
      (evento) =>
        evento.categoria ===
        "ATUACAO"
    );

  if (
    candidaturas.length !== 2
  ) {
    problemas.push(
      `Esperadas 2 candidaturas; obtidas ${candidaturas.length}.`
    );
  }

  if (
    trajetoria.length !== 6
  ) {
    problemas.push(
      `Esperados 6 eventos de trajetoria; obtidos ${trajetoria.length}.`
    );
  }

  if (
    atuacao.length !== 75
  ) {
    problemas.push(
      `Esperados 75 eventos de atuacao; obtidos ${atuacao.length}.`
    );
  }

  if (
    eventos.length !== 81
  ) {
    problemas.push(
      `Esperados 81 eventos; obtidos ${eventos.length}.`
    );
  }

  if (
    chavesUnicas.size !==
    eventos.length
  ) {
    problemas.push(
      `Chaves de eventos nao sao unicas: ${chavesUnicas.size}/${eventos.length}.`
    );
  }

  if (
    declaracoes.length !== 2
  ) {
    problemas.push(
      `Esperadas 2 declaracoes; obtidas ${declaracoes.length}.`
    );
  }

  if (
    bens.length !== 13
  ) {
    problemas.push(
      `Esperados 13 bens; obtidos ${bens.length}.`
    );
  }

  return {
    problemas,
    pessoaPolitica,
    candidaturas,
    eventos,
    declaracoes,
    bens,
  };
}

function imprimirResumo(
  carga: ReturnType<
    typeof montarCarga
  >
) {
  console.log("");
  console.log(
    "=== RESUMO DA CARGA ==="
  );

  console.log(
    `PessoaPolitica         : ${carga.pessoaPolitica ? 1 : 0}`
  );

  console.log(
    `Candidaturas           : ${carga.candidaturas.length}`
  );

  console.log(
    `EventosPoliticos       : ${carga.eventos.length}`
  );

  console.log(
    `DeclaracoesPatrimoniais: ${carga.declaracoes.length}`
  );

  console.log(
    `BensPatrimoniais       : ${carga.bens.length}`
  );

  console.log(
    `Problemas              : ${carga.problemas.length}`
  );

  const chaves =
    new Set(
      carga.eventos.map(
        (evento) =>
          evento.chaveOrigem
      )
    );

  console.log(
    `Chaves de evento unicas: ${chaves.size}`
  );

  for (
    const declaracao of
    carga.declaracoes
  ) {
    console.log(
      `Patrimonio ${declaracao.eleicao}: ${declaracao.valorTotal.toFixed(2)} | ${declaracao.quantidadeDeBens} bens`
    );
  }

  for (
    const problema of
    carga.problemas
  ) {
    console.log(
      `PROBLEMA: ${problema}`
    );
  }
}

async function aplicarCarga(
  carga: ReturnType<
    typeof montarCarga
  >
) {
  await import(
    "dotenv/config"
  );

  const {
    PrismaPg,
  } =
    await import(
      "@prisma/adapter-pg"
    );

  const {
    PrismaClient,
  } =
    await import(
      "../generated/prisma/client"
    );

  const connectionString =
    process.env.DATABASE_URL;

  if (!connectionString) {
    console.error(
      "DATABASE_URL nao encontrada."
    );

    process.exitCode =
      20;

    return;
  }

  const adapter =
    new PrismaPg({
      connectionString,
    });

  const prisma =
    new PrismaClient({
      adapter,
    });

  try {
    await prisma.$transaction(
      async (tx) => {
        const pessoa =
          carga.pessoaPolitica;

        if (!pessoa) {
          throw new Error(
            "Pessoa politica ausente na carga."
          );
        }

        await tx.pessoaPolitica.upsert({
          where: {
            id:
              pessoa.id,
          },

          update: {
            nomeCompleto:
              pessoa.nomeCompleto,

            nomePublico:
              pessoa.nomePublico,

            fotoUrl:
              pessoa.fotoUrl,

            fotoFonteTitulo:
              pessoa.fotoFonteTitulo,

            fotoFonteUrl:
              pessoa.fotoFonteUrl,

            fotoDataReferencia:
              pessoa.fotoDataReferencia,
          },

          create:
            pessoa,
        });

        for (
          const candidatura of
          carga.candidaturas
        ) {
          await tx.candidatura.upsert({
            where: {
              id:
                candidatura.id,
            },

            update: {
              pessoaPoliticaId:
                candidatura.pessoaPoliticaId,

              eleicao:
                candidatura.eleicao,

              nomeCompleto:
                candidatura.nomeCompleto,

              nomeUrna:
                candidatura.nomeUrna,

              numero:
                candidatura.numero,

              cargo:
                candidatura.cargo,

              uf:
                candidatura.uf,

              partido:
                candidatura.partido,

              siglaPartido:
                candidatura.siglaPartido,

              federacao:
                candidatura.federacao,

              situacao:
                candidatura.situacao,

              situacaoTse:
                candidatura.situacaoTse,

              fonteOficial:
                candidatura.fonteOficial,

              ultimaVerificacao:
                candidatura.ultimaVerificacao,
            },

            create:
              candidatura,
          });
        }

        for (
          const evento of
          carga.eventos
        ) {
          await tx.eventoPolitico.upsert({
            where: {
              chaveOrigem:
                evento.chaveOrigem,
            },

            update: {
              pessoaPoliticaId:
                evento.pessoaPoliticaId,

              tipo:
                evento.tipo,

              categoria:
                evento.categoria,

              dataOrdenacao:
                evento.dataOrdenacao,

              periodo:
                evento.periodo,

              titulo:
                evento.titulo,

              descricao:
                evento.descricao,

              fonteTitulo:
                evento.fonteTitulo,

              fonteUrl:
                evento.fonteUrl,

              dados:
                evento.dados,
            },

            create:
              evento,
          });
        }

        for (
          const declaracao of
          carga.declaracoes
        ) {
          const registro =
            await tx.declaracaoPatrimonial.upsert({
              where: {
                candidaturaId:
                  declaracao.candidaturaId,
              },

              update: {
                pessoaPoliticaId:
                  declaracao.pessoaPoliticaId,

                eleicao:
                  declaracao.eleicao,

                valorTotal:
                  declaracao.valorTotal,

                quantidadeDeBens:
                  declaracao.quantidadeDeBens,

                fonteTitulo:
                  declaracao.fonteTitulo,

                fonteUrl:
                  declaracao.fonteUrl,

                verificadoEm:
                  declaracao.verificadoEm,
              },

              create:
                declaracao,
            });

          await tx.bemPatrimonial.deleteMany({
            where: {
              declaracaoId:
                registro.id,
            },
          });

          const bensDaDeclaracao =
            carga.bens.filter(
              (bem) =>
                bem.candidaturaId ===
                declaracao.candidaturaId
            );

          if (
            bensDaDeclaracao.length >
            0
          ) {
            await tx.bemPatrimonial.createMany({
              data:
                bensDaDeclaracao.map(
                  (bem) => ({
                    id:
                      bem.id,

                    declaracaoId:
                      registro.id,

                    tipoCodigo:
                      bem.tipoCodigo,

                    tipo:
                      bem.tipo,

                    descricao:
                      bem.descricao,

                    valor:
                      bem.valor,

                    ordem:
                      bem.ordem,
                  })
                ),
            });
          }
        }
      }
    );

    console.log("");
    console.log(
      "Carga aplicada com sucesso."
    );
  }
  finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const aplicar =
    process.argv.includes(
      "--apply"
    );

  const carga =
    montarCarga();

  imprimirResumo(
    carga
  );

  if (
    carga.problemas.length >
    0
  ) {
    console.log("");
    console.log(
      "Carga bloqueada por problemas de validacao."
    );

    process.exitCode =
      10;

    return;
  }

  if (!aplicar) {
    console.log("");
    console.log(
      "MODO DRY-RUN."
    );

    console.log(
      "Nenhuma conexao com PostgreSQL foi aberta."
    );

    console.log(
      "Para gravar futuramente sera necessario executar explicitamente com --apply."
    );

    return;
  }

  console.log("");
  console.log(
    "MODO APPLY solicitado."
  );

  await aplicarCarga(
    carga
  );
}

await main();