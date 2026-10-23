// Testa apenas a API real transpilada, com banco e Telegram simulados.
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const ts = require("typescript");

const ID1 = "100002535230";
const ID2 = "160002536522";
const sourcePath = path.join(__dirname, "..", "app", "api", "telegram", "sessao", "route.ts");

function fixture() {
  const state = {
    token: null, sessionHash: null, confirmationHash: null,
    linked: false, notifications: false, saved: [], rateLimited: false,
  };
  function sql(strings, ...args) {
    const query = strings.join("?").replace(/\s+/g, " ").trim();
    if (query.includes("SELECT EXISTS (") &&
        query.includes("FROM public.telegram_preferencias p")) {
      return Promise.resolve([{ ativadas: state.notifications }]);
    }
    if (query.includes("SELECT a.candidatura_id") &&
        query.includes("FROM public.telegram_acompanhamentos a")) {
      return Promise.resolve(state.saved.map(id => ({ candidatura_id: id })));
    }
    if (query.startsWith("SELECT candidatura_id") &&
        query.includes("FROM public.telegram_acompanhamentos")) {
      const requested = args[1];
      return Promise.resolve(state.saved.filter(id => requested.includes(id)).map(id => ({ candidatura_id: id })));
    }
    if (query.startsWith("INSERT INTO public.telegram_sessoes_site")) {
      state.sessionHash = args[0];
      state.confirmationHash = args[1];
      return Promise.resolve([{ vinculado: state.linked }]);
    }
    if (query.includes("SELECT telegram_chat_id::text") &&
        query.includes("FROM public.telegram_sessoes_site")) {
      const valid = state.linked && args[0] === state.sessionHash;
      return Promise.resolve(valid ? [{ telegram_chat_id: "12345678" }] : []);
    }
    if (query.startsWith("INSERT INTO public.telegram_acompanhamentos")) {
      assert.equal(String(args[0]), "12345678");
      const id = args[1];
      if (!state.saved.includes(id)) state.saved.push(id);
      return Promise.resolve([]);
    }
    throw Error("SQL nao previsto no teste: " + query.slice(0, 150));
  }
  sql.array = values => values;
  sql.begin = cb => cb(sql);
  const src = fs.readFileSync(sourcePath, "utf8");
  const compiled = ts.transpileModule(src, {
    fileName: sourcePath,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  assert.equal((compiled.diagnostics || []).filter(x =>
    x.category === ts.DiagnosticCategory.Error).length, 0);
  const module = { exports: {} };
  const imports = {
    "node:crypto": crypto,
    "next/server": { NextResponse: { json(body, options = {}) {
      return {
        body, status: options.status ?? 200,
        cookies: { set(name, token, options) {
          assert.equal(name, "fdp_tg_site_v1");
          assert.equal(options.httpOnly, true);
          state.token = token;
        } },
      };
    } } },
    "next/headers": { cookies: async () => ({
      get: name => name === "fdp_tg_site_v1" && state.token ? { value: state.token } : undefined,
    }) },
    "@/lib/interesses/db": { sql },
    "@/lib/rateLimit": { consumeRateLimit: async () =>
      state.rateLimited ? { allowed: false, retryAfterSeconds: 30 } : { allowed: true } },
    "@/lib/telegram/sessao-site": {
      COOKIE_SESSAO_TELEGRAM: "fdp_tg_site_v1", DIAS_SESSAO: 180, MINUTOS_CODIGO: 15,
      hashSessao: token => crypto.createHash("sha256").update(token).digest("hex"),
      tokenSessao: async () => state.token,
      inscricaoAtiva: async token => Boolean(token && state.linked && state.notifications),
    },
    "@/data/eleicoes/eleitos": { eleitos2026: [{ id: ID1 }, { id: ID2 }] },
    "@/data/eleicoes/candidaturas": { candidaturas: [
      { id: ID1, nomeUrna: "EXEMPLO 1", nomeCompleto: "EXEMPLO UM", numero: 12, cargo: "deputado-federal", uf: "MA", siglaPartido: "X" },
      { id: ID2, nomeUrna: "EXEMPLO 2", nomeCompleto: "EXEMPLO DOIS", numero: 13, cargo: "deputado-federal", uf: "PR", siglaPartido: "Y" },
    ] },
    "@/lib/eleicoes/formatar-cargo": { formatarCargo: cargo => cargo },
    "@/lib/eleicoes/identidade-politica": {
      buscarPessoaPoliticaConfirmadaPorCandidatura: id => id,
    },
  };
  vm.runInNewContext(compiled.outputText, {
    module, exports: module.exports,
    require(name) {
      assert.ok(Object.prototype.hasOwnProperty.call(imports, name), "Importacao inesperada: " + name);
      return imports[name];
    },
    URL, process: { env: { NODE_ENV: "production" } },
  }, { filename: sourcePath, timeout: 1000 });
  function request(method, ids, origin = "https://www.foradapauta.org") {
    return {
      url: "https://www.foradapauta.org/api/telegram/sessao",
      headers: { get: name => name === "origin" ? origin : null },
      json: async () => ({ ids }), method,
    };
  }
  return { state, module: module.exports, request };
}

test("GET nao considera clique anterior como inscricao confirmada", async () => {
  const f = fixture();
  assert.equal((await f.module.GET()).body.ativo, false);
  const post = await f.module.POST(f.request("POST"));
  assert.equal(post.status, 200);
  assert.match(post.body.url, /^https:\/\/t.me\/ForaDaPautaAcompanhaBot\?start=s_[A-Za-z0-9_-]{32}$/);
  assert.equal((await f.module.GET()).body.ativo, false);
  f.state.linked = true;
  f.state.notifications = true;
  assert.equal((await f.module.GET()).body.ativo, true);
  assert.equal((await f.module.GET()).body.novasEdicoes, true);
});

test("POST permite inscricao geral sem escolher representantes", async () => {
  const f = fixture();
  const post = await f.module.POST(f.request("POST", []));
  assert.equal(post.status, 200);
  assert.match(post.body.url, /^https:\/\/t.me\/ForaDaPautaAcompanhaBot\?start=s_/);
  assert.equal((await f.module.GET()).body.ativo, false);
  f.state.linked = true;
  f.state.notifications = true;
  assert.equal((await f.module.GET()).body.ativo, true);
  assert.equal((await f.module.GET()).body.novasEdicoes, true);
  assert.deepEqual((await f.module.GET()).body.ids, []);
  assert.deepEqual(f.state.saved, []);
});

test("Inscrito que acompanha politicos pode estar sem noticias editoriais", async () => {
  const f = fixture();
  await f.module.POST(f.request("POST", []));
  f.state.linked = true;
  f.state.notifications = false;
  f.state.saved.push(ID1);
  assert.equal((await f.module.GET()).body.novasEdicoes, false);
});

test("POST exige origem correta e limita tentativas", async () => {
  const f = fixture();
  assert.equal((await f.module.POST(f.request("POST", undefined, "https://outro-site.com"))).status, 403);
  assert.equal(f.state.token, null);
  f.state.rateLimited = true;
  assert.equal((await f.module.POST(f.request("POST"))).status, 429);
  assert.equal(f.state.token, null);
});

test("PUT exige sessao confirmada e nao altera politicos anteriormente escolhidos", async () => {
  const f = fixture();
  assert.equal((await f.module.PUT(f.request("PUT", [ID1]))).status, 401);
  await f.module.POST(f.request("POST"));
  assert.equal((await f.module.PUT(f.request("PUT", [ID1]))).status, 401);
  f.state.linked = true;
  f.state.notifications = true;
  f.state.saved.push(ID2);
  assert.equal((await f.module.PUT(f.request("PUT", [ID1]))).status, 200);
  assert.deepEqual(f.state.saved, [ID2, ID1]);
  assert.equal((await f.module.PUT(f.request("PUT", [ID1]))).status, 200);
  assert.deepEqual(f.state.saved, [ID2, ID1]);
});

test("PUT rejeita IDs nao eleitos e origem estranha", async () => {
  const f = fixture();
  await f.module.POST(f.request("POST"));
  f.state.linked = true;
  assert.equal((await f.module.PUT(f.request("PUT", [ID1], "https://evil.example"))).status, 403);
  assert.equal((await f.module.PUT(f.request("PUT", ["111111111111"]))).status, 400);
  assert.equal((await f.module.PUT(f.request("PUT", []))).status, 400);
  assert.equal(f.state.saved.length, 0);
});

test("PUT preserva candidatura antiga ativa sem reativar ou apagar", async () => {
  const f = fixture();
  await f.module.POST(f.request("POST"));
  f.state.linked = true;
  const antiga = "140002548998";
  f.state.saved.push(antiga);
  assert.equal((await f.module.PUT(f.request("PUT", [antiga, ID1]))).status, 200);
  assert.deepEqual(f.state.saved, [antiga, ID1]);
  assert.equal((await f.module.PUT(f.request("PUT", [antiga, "999999999999"]))).status, 400);
  assert.deepEqual(f.state.saved, [antiga, ID1]);
});
