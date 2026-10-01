import fs from "node:fs";
import path from "node:path";

const base = "https://ple.cl.df.gov.br/pleservico/api/public";
const ano = 2026;
const tamanho = 100;

async function main() {
  const registros = new Map();
  let totalEsperado;
  let paginasEsperadas;
  let concluido = false;

  for (let pagina = 0; pagina < 200; pagina++) {
    const resposta = await fetch(
      `${base}/proposicao/filter?page=${pagina}&size=${tamanho}&sort=id,ASC`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ano: String(ano), ementa: true }),
        signal: AbortSignal.timeout(45000),
      },
    );

    if (!resposta.ok) {
      throw new Error(`Página ${pagina}: HTTP ${resposta.status}`);
    }

    const dados = await resposta.json();
    if (
      !Array.isArray(dados.content) ||
      !Number.isInteger(dados.totalElements) ||
      !Number.isInteger(dados.totalPages)
    ) {
      throw new Error(`Paginação inesperada na página ${pagina}.`);
    }

    if (pagina === 0) {
      totalEsperado = dados.totalElements;
      paginasEsperadas = dados.totalPages;
    } else if (
      dados.totalElements !== totalEsperado ||
      dados.totalPages !== paginasEsperadas
    ) {
      throw new Error("A base mudou durante a coleta. Execute novamente.");
    }

    for (const item of dados.content) {
      if (
        !Number.isInteger(item.id) ||
        typeof item.siglaNumeroAno !== "string" ||
        typeof item.autoria !== "string" ||
        typeof item.ementa !== "string"
      ) {
        throw new Error("Proposição com estrutura inesperada.");
      }
      if (registros.has(item.id)) {
        throw new Error("Paginação repetiu uma proposição.");
      }
      registros.set(item.id, item);
    }

    console.log(`Página ${pagina + 1}/${paginasEsperadas}: ${registros.size} registros`);

    if (pagina + 1 >= paginasEsperadas) {
      concluido = true;
      break;
    }
  }

  if (!concluido || registros.size !== totalEsperado) {
    throw new Error("Coleta incompleta; nenhum arquivo final foi gravado.");
  }

  const marca = new Date().toISOString().replace(/[:.]/g, "-");
  const pasta = path.resolve("..", `conferencia-cldf-${marca}`);
  fs.mkdirSync(pasta);

  const itens = [...registros.values()];
  fs.writeFileSync(
    process.argv[2] || path.join(pasta, "proposicoes-2026.json"),
    JSON.stringify({
      fonte: base,
      ano,
      verificadoEm: new Date().toISOString(),
      total: itens.length,
      proposicoes: itens,
    }, null, 2),
    "utf8",
  );

  const porAutoria = new Map();
  for (const item of itens) {
    porAutoria.set(item.autoria, (porAutoria.get(item.autoria) || 0) + 1);
  }

  console.log("=== RESUMO POR AUTORIA EXIBIDA ===");
  console.log(JSON.stringify(
    [...porAutoria].map(([autoria, quantidade]) => ({ autoria, quantidade })),
    null, 2,
  ));
  console.log("Arquivo de conferência:", pasta);
  console.log("Coleta completa:", itens.length);
}

main().catch(error => {
  console.error("Falha na coleta:", error.message);
  let causa = error.cause;
  for (let nivel = 0; causa && nivel < 5; nivel++) {
    console.error(JSON.stringify({
      nivel,
      nome: causa.name,
      codigo: causa.code,
      mensagem: causa.message,
      erros: Array.isArray(causa.errors)
        ? causa.errors.map(item => ({
            codigo: item.code,
            mensagem: item.message,
          }))
        : undefined,
    }));
    causa = causa.cause;
  }
  process.exitCode = 1;
});