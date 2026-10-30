// Testes locais e isolados: usa o webhook real compilado com TypeScript,
// mas substitui banco, token e Telegram por dados ficticios em memoria.
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const ts = require("typescript");

const A = "100000000001", B = "100000000002";
const caminho = path.join(__dirname, "..", "app", "api", "telegram", "webhook", "route.ts");

function cenario() {
  const db = {
    politicos: [
      { chat: "100", id: A, status: "ativo" },
      { chat: "100", id: B, status: "aguardando_eleicao" },
      { chat: "200", id: A, status: "ativo" },
    ],
    edicoes: [
      { chat: "100", status: "ativo" },
      { chat: "200", status: "ativo" },
    ],
    sessoes: [{
      sessao_hash: "sessao_teste_hash",
      codigo_hash: crypto.createHash("sha256").update("a".repeat(32)).digest("hex"),
      telegram_chat_id: null,
      candidaturas_pendentes: [],
    }],
    fila: [
      { chat: "100", tipo: "candidato", ref: A, status: "pendente" },
      { chat: "100", tipo: "candidato", ref: B, status: "erro" },
      { chat: "100", tipo: "edicoes", ref: "", status: "pendente" },
      { chat: "200", tipo: "candidato", ref: A, status: "pendente" },
      { chat: "200", tipo: "edicoes", ref: "", status: "pendente" },
    ],
  };
  const mensagens = [];
  let gravacoes = 0;
  const ativa = (r) => r.status === "ativo";
  const pendente = (r) => r.status === "pendente" || r.status === "erro";
  const cancelar = (r) => { r.status = "cancelado"; gravacoes++; return r; };

  function sql(strings, ...args) {
    const q = strings.join("?").replace(/\s+/g, " ").trim();
    const chat = String(args[0] ?? "");
    const id = String(args[1] ?? "");
    if (q.includes("FROM public.telegram_sessoes_site") && q.includes("codigo_hash")) {
      const sessao = db.sessoes.find(s => s.codigo_hash === String(args[0]));
      return Promise.resolve(sessao ? [{
        sessao_hash: sessao.sessao_hash,
        telegram_chat_id: sessao.telegram_chat_id,
        candidaturas_pendentes: sessao.candidaturas_pendentes,
      }] : []);
    }
    if (q.startsWith("INSERT INTO public.telegram_preferencias") && q.includes("DO NOTHING")) {
      if (!db.edicoes.some(r => r.chat === chat)) db.edicoes.push({ chat, status: "ativo" });
      return Promise.resolve([]);
    }
    if (q.includes("SELECT EXISTS (") && q.includes("FROM public.telegram_sessoes_site")) {
      return Promise.resolve([{ pronto: false }]);
    }
    if (q.includes("SELECT EXISTS (") && q.includes("FROM public.telegram_preferencias")) {
      return Promise.resolve([{ ativa: db.edicoes.some(r => r.chat === chat && r.status === "ativo") }]);
    }
    if (q.startsWith("INSERT INTO public.telegram_acompanhamentos") || q.startsWith("INSERT INTO telegram_acompanhamentos")) {
      const record = db.politicos.find(p => p.chat === chat && p.id === id);
      if (record) record.status = "ativo";
      else db.politicos.push({ chat, id, status: "ativo" });
      gravacoes++;
      return Promise.resolve([]);
    }
    if (q.startsWith("UPDATE public.telegram_sessoes_site")) {
      const sessao = db.sessoes.find(s => s.sessao_hash === String(args[3]));
      if (sessao) {
        sessao.telegram_chat_id = String(args[0]);
        sessao.codigo_hash = String(args[2]);
        gravacoes++;
      }
      return Promise.resolve([]);
    }
    if (q.includes("SELECT candidatura_id") && q.includes("FROM public.telegram_acompanhamentos"))
      return Promise.resolve(db.politicos.filter((r) => r.chat === chat &&
        ["ativo", "aguardando_eleicao"].includes(r.status)).map((r) => ({ candidatura_id: r.id })));
    if (q.includes("SELECT tipo") && q.includes("FROM public.telegram_preferencias"))
      return Promise.resolve(db.edicoes.filter((r) => r.chat === chat && ativa(r))
        .map(() => ({ tipo: "novas_edicoes" })));
    if (q.startsWith("UPDATE public.telegram_preferencias") || q.startsWith("UPDATE telegram_preferencias"))
      return Promise.resolve(db.edicoes.filter((r) => r.chat === chat && ativa(r))
        .map(cancelar).map(() => ({ tipo: "novas_edicoes" })));
    if (q.startsWith("UPDATE public.telegram_acompanhamentos") || q.startsWith("UPDATE telegram_acompanhamentos"))
      return Promise.resolve(db.politicos.filter((r) => r.chat === chat &&
        (q.includes("AND candidatura_id =") ? r.id === id : true) && r.status !== "cancelado")
        .map(cancelar).map((r) => ({ candidatura_id: r.id })));
    if (q.startsWith("UPDATE public.telegram_fila_avisos"))
      return Promise.resolve(db.fila.filter((r) => r.chat === chat && pendente(r) &&
        (q.includes("AND tipo = 'edicoes'") ? r.tipo === "edicoes" :
          q.includes("AND tipo = 'candidato'") ? r.tipo === "candidato" && r.ref === id : true))
        .map(cancelar));
    if (q.startsWith("INSERT INTO telegram_preferencias")) {
      const r = db.edicoes.find((r) => r.chat === chat);
      if (r) r.status = "ativo";
      else db.edicoes.push({ chat, status: "ativo" });
      gravacoes++;
      return Promise.resolve([]);
    }
    throw Error("Consulta SQL nao simulada: " + q.slice(0, 160));
  }
  sql.begin = (callback) => callback(sql);
  const src = fs.readFileSync(caminho, "utf8");
  const compiled = ts.transpileModule(src, {
    fileName: caminho,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  assert.equal((compiled.diagnostics || []).filter((x) => x.category === ts.DiagnosticCategory.Error).length, 0);
  const mod = { exports: {} };
  const imports = {
    "node:crypto": crypto,
    "next/server": { NextResponse: { json: (body, opts = {}) => ({
      body, status: opts.status || 200,
    }) } },
    "@/data/eleicoes/candidaturas": { candidaturas: [
      { id: A, nomeUrna: "Pessoa A" }, { id: B, nomeUrna: "Pessoa B" },
    ] },
    "@/data/eleicoes/eleitos": { eleitos2026: [{ id: A }, { id: B }] },
    "@/lib/eleicoes/acompanhamento-politico": { idsAcompanhaveis: new Set([A, B]) },
    "@/lib/eleicoes/identidade-politica": {
      buscarPessoaPoliticaConfirmadaPorCandidatura: () => null,
    },
    "@/lib/telegram/ambiente": {
      telegramLiberadoNesteAmbiente: () => true,
      nomeBotTelegram: () => "ForaDaPautaAcompanhaBot",
      origemRetornoTelegram: () => "https://www.foradapauta.org",
      tokenBotTelegram: () => "token-teste",
      segredoWebhookTelegram: () => "segredo-teste",
    },
    "@/lib/interesses/db": { sql },
  };
  vm.runInNewContext(compiled.outputText, {
    module: mod, exports: mod.exports,
    require: (name) => {
      assert.ok(Object.prototype.hasOwnProperty.call(imports, name), "Importacao inesperada: " + name);
      return imports[name];
    },
    process: { env: { TELEGRAM_WEBHOOK_SECRET: "segredo-teste", TELEGRAM_BOT_TOKEN: "token-teste" } },
    console: { error() {} }, Buffer, AbortSignal,
    fetch: async (_url, options) => {
      mensagens.push(JSON.parse(options.body));
      return { ok: true };
    },
  }, { filename: caminho, timeout: 1000 });

  return {
    db, mensagens,
    get gravacoes() { return gravacoes; },
    async enviar(texto, { chat = "100", segredo = "segredo-teste", tipo = "private" } = {}) {
      return mod.exports.POST({
        headers: { get: (name) => name === "x-telegram-bot-api-secret-token" ? segredo : null },
        json: async () => ({ message: { text: texto, chat: { id: Number(chat), type: tipo } } }),
      });
    },
  };
}

test("segredo incorreto bloqueia comandos antes da leitura do banco", async () => {
  const c = cenario();
  assert.equal((await c.enviar("/opcoes", { segredo: "errado" })).status, 401);
  assert.equal(c.mensagens.length, 0);
  assert.equal(c.gravacoes, 0);
});

test("ignora comandos em grupos", async () => {
  const c = cenario();
  assert.equal((await c.enviar("/parar", { tipo: "group" })).status, 200);
  assert.equal(c.gravacoes, 0);
});

test("/opcoes apresenta escolhas sem alterar assinaturas", async () => {
  const c = cenario();
  assert.equal((await c.enviar("/opcoes")).status, 200);
  assert.match(c.mensagens[0].text, /Pessoa A/);
  assert.match(c.mensagens[0].text, /Pessoa B/);
  assert.match(c.mensagens[0].text, /Novas edições: ativadas/);
  assert.equal(c.gravacoes, 0);
});

test("/parar_edicoes preserva todos os politicos e outras contas", async () => {
  const c = cenario();
  await c.enviar("/parar_edicoes");
  assert.equal(c.db.edicoes.find((r) => r.chat === "100").status, "cancelado");
  assert.equal(c.db.edicoes.find((r) => r.chat === "200").status, "ativo");
  assert.ok(c.db.politicos.every((r) => r.status !== "cancelado"));
  assert.equal(c.db.fila.find((r) => r.chat === "100" && r.tipo === "edicoes").status, "cancelado");
  assert.equal(c.db.fila.find((r) => r.chat === "100" && r.tipo === "candidato").status, "pendente");
});

test("/parar_candidato_ID preserva outras escolhas e outros chats", async () => {
  const c = cenario();
  await c.enviar("/parar_candidato_" + A);
  assert.equal(c.db.politicos.find((r) => r.chat === "100" && r.id === A).status, "cancelado");
  assert.equal(c.db.politicos.find((r) => r.chat === "100" && r.id === B).status, "aguardando_eleicao");
  assert.equal(c.db.politicos.find((r) => r.chat === "200").status, "ativo");
  assert.equal(c.db.fila.find((r) => r.chat === "100" && r.ref === A).status, "cancelado");
  assert.equal(c.db.fila.find((r) => r.chat === "100" && r.ref === B).status, "erro");
  assert.equal(c.db.edicoes.find((r) => r.chat === "100").status, "ativo");
});

test("/parar cancela tudo somente para o solicitante", async () => {
  const c = cenario();
  await c.enviar("/parar");
  assert.ok(c.db.politicos.filter((r) => r.chat === "100").every((r) => r.status === "cancelado"));
  assert.ok(c.db.politicos.filter((r) => r.chat === "200").every((r) => r.status === "ativo"));
  assert.equal(c.db.edicoes.find((r) => r.chat === "100").status, "cancelado");
  assert.equal(c.db.edicoes.find((r) => r.chat === "200").status, "ativo");
  assert.ok(c.db.fila.filter((r) => r.chat === "100").every((r) => r.status === "cancelado"));
});

test("/start projeto reativa somente as noticias editoriais", async () => {
  const c = cenario();
  await c.enviar("/parar_edicoes");
  await c.enviar("/start projeto");
  assert.equal(c.db.edicoes.find((r) => r.chat === "100").status, "ativo");
  assert.ok(c.db.politicos.every((r) => r.status !== "cancelado"));
  assert.match(c.mensagens.at(-1).text, /novidades editoriais/i);
});

test("comandos invalidos nao modificam preferencias", async () => {
  const c = cenario();
  await c.enviar("/parar_candidato_123");
  await c.enviar("/nao-existe");
  assert.equal(c.gravacoes, 0);
});

test("confirma a inscricao via sessao do site no mesmo bot", async () => {
  const c = cenario();
  const resp = await c.enviar("/start s_" + "a".repeat(32), { chat: "300" });
  assert.equal(resp.status, 200);
  assert.equal(c.db.sessoes[0].telegram_chat_id, "300");
  const urlConclusao = new URL(c.mensagens.at(-1).reply_markup.inline_keyboard[0][0].url);
  assert.equal(c.db.sessoes[0].codigo_hash,
    crypto.createHash("sha256").update(urlConclusao.searchParams.get("codigo")).digest("hex"));
  assert.match(c.mensagens.at(-1).text, /inscrição foi iniciada no Telegram/i);
  assert.equal(c.mensagens.at(-1).reply_markup.inline_keyboard[0][0].text, "Concluir a inscrição");
  assert.match(c.mensagens.at(-1).reply_markup.inline_keyboard[0][0].url,
    /^https:\/\/www\.foradapauta\.org\/api\/telegram\/concluir\?codigo=[A-Za-z0-9_-]{32}$/);
  assert.equal(c.db.edicoes.find(r => r.chat === "300").status, "ativo");
});

test("nao permite confirmar duas vezes um codigo consumido", async () => {
  const c = cenario();
  await c.enviar("/start s_" + "a".repeat(32), { chat: "300" });
  await c.enviar("/start s_" + "a".repeat(32), { chat: "400" });
  assert.equal(c.db.sessoes[0].telegram_chat_id, "300");
  assert.ok(!c.db.edicoes.some(r => r.chat === "400"));
  assert.match(c.mensagens.at(-1).text, /expirou ou já foi usado/i);
});

test("selecionados da edicao sao ativados ao confirmar no bot", async () => {
  const v = cenario();
  v.db.sessoes[0].candidaturas_pendentes = [A, B];
  const resp = await v.enviar("/start s_" + "a".repeat(32), { chat: "300" });
  assert.equal(resp.status, 200);
  assert.deepEqual(v.db.politicos.filter(p => p.chat === "300").map(p => p.id), [A, B]);
  assert.equal(v.db.edicoes.find(p => p.chat === "300").status, "ativo");
  assert.equal(v.mensagens.at(-1).reply_markup.inline_keyboard[0][0].text, "Concluir a inscrição");
  assert.deepEqual(v.db.politicos.filter(p => p.chat === "300").map(p => p.id), [A, B]);
});

test("acompanha pessoa nao eleita sem condicionar avisos a vitoria", async () => {
  const c = cenario();
  const resposta = await c.enviar("/start seguir_" + B);
  assert.equal(resposta.status, 200);
  assert.equal(c.db.politicos.find(p => p.chat === "100" && p.id === B).status, "ativo");
  const mensagem = c.mensagens.at(-1);
  assert.match(mensagem.text, /tenha sido eleita ou não/i);
  assert.doesNotMatch(mensagem.text, /se essa candidatura for eleita/i);
  assert.equal(mensagem.reply_markup, undefined);
  assert.match(mensagem.text, /novas edições do Fora da Pauta/i);
  assert.match(mensagem.text, /parar_candidato_/i);
});

test("nao reativa edicoes desativadas ao seguir outra pessoa", async () => {
  const c = cenario();
  await c.enviar("/parar_edicoes");
  const resposta = await c.enviar("/start seguir_" + B);
  assert.equal(resposta.status, 200);
  assert.equal(c.db.edicoes.find(r => r.chat === "100").status, "cancelado");
  assert.match(c.mensagens.at(-1).text, /desativado as novas edições/i);
  assert.equal(c.mensagens.at(-1).reply_markup, undefined);
});

test("inscricao direta inicial ativa edicoes sem segundo botao", async () => {
  const c = cenario();
  const resposta = await c.enviar("/start seguir_" + A, { chat: "300" });
  assert.equal(resposta.status, 200);
  assert.equal(c.db.edicoes.find(r => r.chat === "300").status, "ativo");
  assert.equal(c.db.politicos.find(r => r.chat === "300" && r.id === A).status, "ativo");
  assert.equal(c.mensagens.at(-1).reply_markup, undefined);
});
