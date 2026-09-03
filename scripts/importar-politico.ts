import fs from "node:fs";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

import type { Prisma } from "../generated/prisma/client";

let PESSOA_ID = "";



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

function arquivoPresenteNoCommitAtual(
  caminho: string
): boolean {
  const resultado =
    spawnSync(
      "git",
      [
        "cat-file",
        "-e",
        `HEAD:${caminho}`,
      ],
      {
        stdio: "ignore",
      }
    );

  return (
    resultado.status === 0
  );
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

function hashBemPatrimonial(
  bem: RegistroGenerico
): string {
  const identidade = {
    tipoCodigo:
      bem.tipoCodigo ??
      null,

    tipo:
      String(
        bem.tipo ??
        ""
      ),

    descricao:
      String(
        bem.descricao ??
        ""
      ),

    valor:
      dinheiro(
        bem.valor
      ),
  };

  return crypto
    .createHash("sha256")
    .update(
      JSON.stringify(
        identidade
      )
    )
    .digest("hex")
    .slice(0, 32);
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

  const candidaturasDaIdentidade =
    Array.isArray(
      identidade?.candidaturas
    )
      ? identidade.candidaturas
      : [];

  if (
    candidaturasDaIdentidade.length ===
    0
  ) {
    problemas.push(
      "Identidade politica sem candidaturas."
    );
  }

  const candidaturas2026 =
    comoArray(
      carregar(
        "data/eleicoes/gerado/candidaturas-2026.json"
      )
    );

  const candidaturas2026PorId =
    new Map(
      candidaturas2026.map(
        (item) => [
          String(item.id),
          item,
        ]
      )
    );

  const candidaturas =
    candidaturasDaIdentidade
      .map(
        (
          item: RegistroGenerico
        ) => {
          const id =
            String(
              item.candidaturaId
            );

          const eleicao =
            Number(
              item.eleicao
            );

          const completa2026 =
            eleicao === 2026
              ? candidaturas2026PorId.get(
                  id
                )
              : undefined;

          const origem =
            completa2026 ??
            item;

          return {
            id,

            pessoaPoliticaId:
              PESSOA_ID,

            eleicao,

            nomeCompleto:
              origem.nomeCompleto ??
              item.nomeCompleto ??
              null,

            nomeUrna:
              origem.nomeUrna ??
              item.nomeUrna ??
              null,

            numero:
              completa2026?.numero ??
              null,

            cargo:
              String(
                origem.cargo ??
                item.cargo ??
                ""
              ),

            uf:
              origem.uf ??
              item.uf ??
              null,

            partido:
              completa2026?.partido ??
              null,

            siglaPartido:
              completa2026?.siglaPartido ??
              null,

            federacao:
              completa2026?.federacao ??
              null,

            situacao:
              completa2026?.situacao ??
              null,

            situacaoTse:
              completa2026?.situacaoTse ??
              null,

            fonteOficial:
              completa2026?.fonteOficial ??
              null,

            ultimaVerificacao:
              dataOuNull(
                completa2026
                  ?.ultimaVerificacao
              ),
          };
        }
      )
      .sort(
        (a, b) =>
          a.eleicao -
            b.eleicao ||
          a.id.localeCompare(
            b.id
          )
      );

  const candidaturaPreferida =
    candidaturas.find(
      (item) =>
        item.eleicao === 2026
    ) ??
    candidaturas[
      candidaturas.length - 1
    ];

  if (
    !candidaturaPreferida ||
    !candidaturaPreferida.nomeCompleto
  ) {
    problemas.push(
      "Nao foi possivel definir a candidatura de referencia da pessoa."
    );
  }

  if (
    problemas.length > 0 ||
    !candidaturaPreferida ||
    !candidaturaPreferida.nomeCompleto
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

  const candidaturaComFotoPublicavel =
    candidaturas
      .filter(
        (item) =>
          item.eleicao === 2026
      )
      .find(
        (item) => {
          const caminhoFoto =
            `public/candidatos/2026/${item.id}.jpg`;

          return (
            fs.existsSync(
              caminhoFoto
            ) &&
            arquivoPresenteNoCommitAtual(
              caminhoFoto
            )
          );
        }
      );
  const pessoaPolitica = {
    id:
      PESSOA_ID,

    nomeCompleto:
      candidaturaPreferida.nomeCompleto,

    nomePublico:
      candidaturaPreferida.nomeUrna ??
      null,

    fotoUrl:
      candidaturaComFotoPublicavel
        ? `/candidatos/2026/${candidaturaComFotoPublicavel.id}.jpg`
        : null,

    fotoFonteTitulo:
      null,

    fotoFonteUrl:
      null,

    fotoDataReferencia:
      null,
  };

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

  const indiceEventoPorChave =
    new Map<string, number>();

  function adicionarEvento(
    item: RegistroGenerico,
    categoria: "TRAJETORIA" | "ATUACAO"
  ) {
    const fonte =
      origemFonte(
        item.fonte
      );

    const chaveOrigem =
      chaveEvento(
        item,
        categoria
      );

    const evento = {
      pessoaPoliticaId:
        PESSOA_ID,

      chaveOrigem,

      tipo:
        String(
          item.tipo ??
          ""
        ),

      categoria,

      dataOrdenacao:
        item.dataOrdenacao ??
        null,

      periodo:
        item.periodo ??
        null,

      titulo:
        String(
          item.titulo ??
          ""
        ),

      descricao:
        item.descricao ??
        null,

      fonteTitulo:
        fonte.fonteTitulo,

      fonteUrl:
        fonte.fonteUrl,

      dados:
        item as Prisma.InputJsonValue,
    };

    const indiceExistente =
      indiceEventoPorChave.get(
        chaveOrigem
      );

    if (
      indiceExistente ===
      undefined
    ) {
      indiceEventoPorChave.set(
        chaveOrigem,
        eventos.length
      );

      eventos.push(
        evento
      );

      return;
    }

    eventos[
      indiceExistente
    ] =
      evento;
  }

  const pastaHistoricos =
    "data/eleicoes/gerado/historico-politico-por-candidato";

  const arquivosHistoricoCarregados: string[] =
    [];

  for (
    const candidatura of
    candidaturas
  ) {
    const caminhoHistorico =
      `${pastaHistoricos}/${candidatura.id}.json`;

    if (
      !fs.existsSync(
        caminhoHistorico
      )
    ) {
      continue;
    }

    arquivosHistoricoCarregados.push(
      caminhoHistorico
    );

    const historico =
      carregar(
        caminhoHistorico
      ) as RegistroGenerico;

    for (
      const item of
      historico.trajetoria ?? []
    ) {
      adicionarEvento(
        item,
        "TRAJETORIA"
      );
    }

    for (
      const item of
      historico.atuacao ?? []
    ) {
      adicionarEvento(
        item,
        "ATUACAO"
      );
    }
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

  const registrosPatrimonioPorEleicao =
    new Map<
      number,
      RegistroGenerico[]
    >();

  for (
    const candidatura of
    candidaturas
  ) {
    const ano =
      candidatura.eleicao;

    const candidaturaId =
      candidatura.id;

    let registros =
      registrosPatrimonioPorEleicao.get(
        ano
      );

    if (
      registros ===
      undefined
    ) {
      const caminhoPatrimonio =
        `data/eleicoes/gerado/bens-${ano}.json`;

      registros =
        fs.existsSync(
          caminhoPatrimonio
        )
          ? comoArray(
              carregar(
                caminhoPatrimonio
              )
            )
          : [];

      registrosPatrimonioPorEleicao.set(
        ano,
        registros
      );
    }

    const origem =
      registros.find(
        (item) =>
          String(
            item.candidaturaId
          ) ===
          candidaturaId
      );

    /*
     * Patrimonio ausente nao invalida
     * a candidatura nem a pessoa.
     */
    if (!origem) {
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
        `Total patrimonial ${ano} da candidatura ${candidaturaId} nao confere.`
      );
    }

    if (
      quantidadeDeclarada !==
      quantidadeArray
    ) {
      problemas.push(
        `Quantidade de bens ${ano} da candidatura ${candidaturaId} nao confere.`
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

    const ocorrenciasBemPorHash =
      new Map<string, number>();
    for (
      let indice = 0;
      indice < quantidadeArray;
      indice++
    ) {
      const bem =
        origem.bens[indice];

      const hashBem =
        hashBemPatrimonial(
          bem
        );

      const ocorrenciaBem =
        (
          ocorrenciasBemPorHash.get(
            hashBem
          ) ??
          0
        ) + 1;

      ocorrenciasBemPorHash.set(
        hashBem,
        ocorrenciaBem
      );
      bens.push({
        id:
          `bem:${candidaturaId}:${hashBem}:${ocorrenciaBem}`,

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
          String(
            bem.descricao ??
            ""
          ),

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

  const idsCandidaturasUnicos =
    new Set(
      candidaturas.map(
        (candidatura) =>
          candidatura.id
      )
    );

  if (
    idsCandidaturasUnicos.size !==
    candidaturas.length
  ) {
    problemas.push(
      `IDs de candidaturas nao sao unicos: ${idsCandidaturasUnicos.size}/${candidaturas.length}.`
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



  const idsDeclaracoesUnicos =
    new Set(
      declaracoes.map(
        (declaracao) =>
          declaracao.candidaturaId
      )
    );

  if (
    idsDeclaracoesUnicos.size !==
    declaracoes.length
  ) {
    problemas.push(
      `Candidaturas de declaracoes nao sao unicas: ${idsDeclaracoesUnicos.size}/${declaracoes.length}.`
    );
  }

  const idsBensUnicos =
    new Set(
      bens.map(
        (bem) =>
          bem.id
      )
    );

  if (
    idsBensUnicos.size !==
    bens.length
  ) {
    problemas.push(
      `IDs de bens nao sao unicos: ${idsBensUnicos.size}/${bens.length}.`
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

          const bensDaDeclaracao =
            carga.bens.filter(
              (bem) =>
                bem.candidaturaId ===
                declaracao.candidaturaId
            );

          const idsBensDaDeclaracao =
            bensDaDeclaracao.map(
              (bem) =>
                bem.id
            );

          if (
            idsBensDaDeclaracao.length ===
            0
          ) {
            await tx.bemPatrimonial.deleteMany({
              where: {
                declaracaoId:
                  registro.id,
              },
            });
          }

          if (
            idsBensDaDeclaracao.length >
            0
          ) {
            await tx.bemPatrimonial.deleteMany({
              where: {
                declaracaoId:
                  registro.id,

                id: {
                  notIn:
                    idsBensDaDeclaracao,
                },
              },
            });
          }

          for (
            const bem of
            bensDaDeclaracao
          ) {
            await tx.bemPatrimonial.upsert({
              where: {
                id:
                  bem.id,
              },

              update: {
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
              },

              create: {
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
              },
            });
          }        }
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

  const indicePessoa =
    process.argv.indexOf(
      "--pessoa"
    );

  const pessoaInformada =
    indicePessoa >= 0
      ? process.argv[
          indicePessoa + 1
        ]
      : undefined;

  if (
    !pessoaInformada ||
    pessoaInformada.startsWith(
      "--"
    )
  ) {
    console.log("");
    console.log(
      "Informe a pessoa politica com --pessoa <pessoaPoliticaId>."
    );

    process.exitCode =
      2;

    return;
  }

  PESSOA_ID =
    pessoaInformada;

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