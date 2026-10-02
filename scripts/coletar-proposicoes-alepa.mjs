const wsUrl = process.argv[2];

const ws = new WebSocket(wsUrl);

const sleep = ms =>
  new Promise(resolve => setTimeout(resolve, ms));

await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve);
  ws.addEventListener("error", reject);
});

let seq = 0;
const pendentes = new Map();

ws.addEventListener("message", event => {
  const msg = JSON.parse(event.data);

  if (msg.id && pendentes.has(msg.id)) {
    const { resolve, reject } = pendentes.get(msg.id);
    pendentes.delete(msg.id);

    if (msg.error) reject(new Error(JSON.stringify(msg.error)));
    else resolve(msg.result);
  }
});

function comando(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++seq;

    pendentes.set(id, { resolve, reject });

    ws.send(JSON.stringify({
      id,
      method,
      params
    }));
  });
}

async function avaliar(expression) {
  const resposta = await comando("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true
  });

  if (resposta.exceptionDetails) {
    throw new Error(
      resposta.exceptionDetails.text ||
      "Erro ao executar JavaScript."
    );
  }

  return resposta.result?.value;
}

async function esperar(expression, descricao, timeout = 30000) {
  const inicio = Date.now();

  while ((Date.now() - inicio) < timeout) {
    try {
      if (await avaliar(expression)) return;
    } catch {}

    await sleep(300);
  }

  console.log("=== ESTADO DA PAGINA NO TIMEOUT ===");
console.log(await avaliar(`JSON.stringify({
  url: location.href,
  titulo: document.title,
  estado: document.readyState,
  Ano: typeof Ano,
  painel: typeof cbpProposicoes,
  resultados: typeof cardViewProposicoes,
  ASPx: typeof ASPx,
  texto: document.body?.innerText.slice(0, 2500),
  scripts: [...document.scripts].filter(s => s.src).map(s => s.src)
})`));
throw new Error(`Timeout aguardando: ${descricao}`);
}

function expressaoIds() {
  return `
    JSON.stringify(
      [...new Set(
        (document.documentElement.innerHTML.match(/IdProposicao=\\d+/g) || [])
          .map(x => x.replace("IdProposicao=", ""))
      )]
    )
  `;
}

ws.addEventListener("message", event => {
  const msg = JSON.parse(event.data);
  if (msg.method === "Runtime.exceptionThrown") {
    console.log("=== ERRO JAVASCRIPT ===");
    console.log(JSON.stringify(msg.params.exceptionDetails));
  }
  if (msg.method === "Network.loadingFailed") {
    console.log("=== RECURSO COM FALHA ===");
    console.log(JSON.stringify(msg.params));
  }
});
await comando("Page.enable");
await comando("Runtime.enable");

console.log("");
console.log("1. Abrindo pagina da ALEPA...");

await comando("Page.navigate", {
  url: "https://www.alepa.pa.gov.br/Legislativo/Proposicoes"
});

await esperar(
  `document.readyState === "complete"`,
  "carregamento da pagina"
);

await esperar(
  `
    typeof Ano !== "undefined" &&
    typeof cbpProposicoes !== "undefined" &&
    typeof cardViewProposicoes !== "undefined" &&
    typeof onSearchButtonClick === "function"
  `,
  "controles DevExpress"
);

console.log("   OK");

console.log("");
console.log("2. Definindo Ano = 2026...");

await avaliar(`
  Ano.SetValue(2026);
  true;
`);

const valorAno = await avaliar(`
  Ano.GetValue()
`);

console.log("   Ano no controle:", valorAno);

console.log("");
console.log("3. Executando pesquisa...");

await avaliar(`
  onSearchButtonClick(true);
  true;
`);

await esperar(
  `
    typeof cardViewProposicoes !== "undefined" &&
    cardViewProposicoes.GetPageCount() > 0
  `,
  "resultado da pesquisa de 2026",
  40000
);

await esperar(
  `
    typeof cardViewProposicoes.InCallback !== "function" ||
    !cardViewProposicoes.InCallback()
  `,
  "fim do callback da pesquisa",
  40000
);

const fs = await import("node:fs");
const destino = process.argv[3];

await esperar(
  "!cbpProposicoes.InCallback() && !cardViewProposicoes.InCallback()",
  "fim da pesquisa", 60000
);

const paginas = await avaliar("cardViewProposicoes.GetPageCount()");
const totalTexto = await avaliar(
  'document.getElementById("cardViewProposicoes").innerText'
);
const totalMatch = totalTexto.match(/^\s*(\d+)\s+Resultados/i);
if (!totalMatch || !Number.isInteger(paginas) || paginas < 1) {
  throw new Error("Total da pesquisa nao identificado.");
}
const totalEsperado = Number(totalMatch[1]);

await avaliar(`
  cardViewProposicoes.BeginCallback.AddHandler(function(s, e) {
    e.customArgs["model[Ano]"] = 2026;
    e.customArgs["Ano"] = 2026;
  });
  true;
`);

const registros = new Map();

for (let pagina = 0; pagina < paginas; pagina++) {
  if (pagina > 0) {
    await avaliar("cardViewProposicoes.GotoPage(" + pagina + "); true;");
  }

  await esperar(
    "cardViewProposicoes.GetPageIndex() === " + pagina +
    " && !cardViewProposicoes.InCallback() && !cbpProposicoes.InCallback()",
    "pagina " + (pagina + 1), 60000
  );
  await sleep(500);

  if (await avaliar("cardViewProposicoes.GetPageCount()") !== paginas) {
    throw new Error("Numero de paginas mudou durante a coleta.");
  }

  const cards = await avaliar(`
    [...document.querySelectorAll('#cardViewProposicoes [onclick]')]
      .filter(el => /DetalhesProposicao/.test(el.getAttribute('onclick') || ''))
      .map(el => ({
        comando: el.getAttribute('onclick'),
        texto: el.innerText
      }))
  `);

  if (!Array.isArray(cards) || cards.length < 1 || cards.length > 10 ||
      (pagina < paginas - 1 && cards.length !== 10)) {
    throw new Error("Quantidade inesperada de cards: pagina " + (pagina + 1));
  }

  for (const card of cards) {
    const chamada = card.comando.match(
      /^onCardClick\(\s*(["'])(.*?)\1\s*\)\s*;?$/
    );
    if (!chamada) throw new Error("Endereco do card nao identificado.");

    const url = new URL(chamada[2], "https://www.alepa.pa.gov.br");
    const id = url.searchParams.get("IdProposicao");
    const tipo = url.searchParams.get("tipo");

    if (url.origin !== "https://www.alepa.pa.gov.br" ||
        url.pathname !== "/Legislativo/DetalhesProposicao" ||
        !/^\d+$/.test(id || "") || !tipo ||
        ["situacao", "decisao", "veto"].some(p => !url.searchParams.has(p))) {
      throw new Error("Link incompleto ou inesperado.");
    }

    const linhas = card.texto.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    const titulo = linhas[1]?.match(/^(.*),\s*DE\s+(\d{2})\/(\d{2})\/(\d{4})$/i);

    if (!titulo || !/\/2026\b/.test(titulo[1])) {
      throw new Error("Titulo ou data fora de 2026: " + card.texto);
    }

    const grupo = tipo.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const chave = "alepa:" + grupo + ":" + id;
    if (registros.has(chave)) throw new Error("Registro repetido: " + chave);

    registros.set(chave, {
      proposicaoId: chave,
      idOficial: id,
      tipoOficial: tipo,
      identificacao: titulo[1],
      data: titulo[4] + "-" + titulo[3] + "-" + titulo[2],
      dataAnoDivergente: titulo[4] !== "2026", autorOficial: linhas[0],
      ementa: linhas.slice(2).join(" "),
      url: url.href,
      pagina: pagina + 1
    });
  }

  console.log("Pagina " + (pagina + 1) + "/" + paginas +
    ": " + registros.size + " links completos");

  fs.writeFileSync(destino + ".parcial", JSON.stringify({
    ano: 2026,
    totalEsperado,
    paginasColetadas: pagina + 1,
    proposicoes: [...registros.values()]
  }, null, 2), "utf8");
}

if (registros.size !== totalEsperado) {
  throw new Error("Total coletado diverge do total anunciado.");
}

fs.writeFileSync(destino, JSON.stringify({
  fonte: "https://www.alepa.pa.gov.br/Legislativo/Proposicoes",
  ano: 2026,
  verificadoEm: new Date().toISOString(),
  paginas,
  total: registros.size,
  proposicoes: [...registros.values()]
}, null, 2), "utf8");

console.log("Lista completa conferida:", registros.size);
console.log("Arquivo:", destino);
ws.close();