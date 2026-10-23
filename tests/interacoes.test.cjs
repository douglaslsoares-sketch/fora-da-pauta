const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const ts = require("typescript");

function load(relative, imports, env = { FDP_INTERACOES_HABILITADAS: "1" }) {
  const file = path.join(__dirname, "..", relative);
  const transpiled = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  assert.equal((transpiled.diagnostics || []).filter(x => x.category === ts.DiagnosticCategory.Error).length, 0);
  const mod = { exports: {} };
  vm.runInNewContext(transpiled.outputText, {
    module: mod, exports: mod.exports,
    require: name => { assert.ok(imports[name], "Import inesperado: " + name); return imports[name]; },
    URL, process: { env },
  }, { filename: file, timeout: 1000 });
  return mod.exports;
}
const response = { json(body, options = {}) { return { body, status: options.status || 200 }; } };
const id = "160002536522";
const idNovo = "a02251c2-a850-421b-a58d-f648a23fd927";
function fixture() {
  const queries = [];
  const sql = (strings, ...args) => {
    const text = strings.join("?").replace(/\s+/g, " ").trim();
    queries.push({ text, args });
    if (text.includes("SELECT telegram_chat_id::text")) return Promise.resolve([{ telegram_chat_id: "777" }]);
    if (text.includes("INSERT INTO public.interacoes_politicas_historico")) return Promise.resolve([]);
    if (text.includes("INSERT INTO public.interacoes_politicas")) return Promise.resolve([{ id: idNovo }]);
    throw Error("SQL inesperado: " + text);
  };
  sql.begin = fn => fn(sql);
  const imports = {
    "next/server": { NextResponse: response },
    "@/lib/interesses/db": { sql },
    "@/lib/telegram/sessao-site": { tokenSessao: async () => "valid", hashSessao: () => "hash" },
    "@/lib/rateLimit": { consumeRateLimit: async () => ({ allowed: true }) },
    "@/lib/eleicoes/acompanhamento-politico": { idsAcompanhaveis: new Set([id]) },
  };
  const api = load("app/api/interacoes/route.ts", imports);
  const request = (data, origin = "https://www.foradapauta.org") => ({
    url: "https://www.foradapauta.org/api/interacoes",
    headers: { get: key => key === "origin" ? origin : null },
    json: async () => data,
  });
  const valid = {
    candidaturaId: id, categoria: "pergunta",
    mensagem: "Gostaria de saber o motivo desta decisão.",
    origemCaminho: "/conheca-seu-candidato/" + id,
    consentiu: true,
  };
  return { api, request, valid, queries };
}
test("não recebe mensagens sem habilitação explícita", async () => {
  const f = fixture();
  const api = load("app/api/interacoes/route.ts", {
    "next/server": { NextResponse: response },
    "@/lib/interesses/db": { sql: {} },
    "@/lib/telegram/sessao-site": { tokenSessao: async () => null, hashSessao: () => "" },
    "@/lib/rateLimit": { consumeRateLimit: async () => ({ allowed: true }) },
    "@/lib/eleicoes/acompanhamento-politico": { idsAcompanhaveis: new Set([id]) },
  }, {});
  const r = await api.POST(f.request(f.valid));
  assert.equal(r.status, 503);
  assert.equal(f.queries.length, 0);
});
test("rejeita origem desconhecida e falta de consentimento", async () => {
  const f = fixture();
  assert.equal((await f.api.POST(f.request(f.valid, "https://outro.site"))).status, 403);
  assert.equal((await f.api.POST(f.request({ ...f.valid, consentiu: false }))).status, 400);
  assert.equal(f.queries.length, 0);
});
test("registra mensagem vinculada ao Telegram, com trilha e sem divulgar chat", async () => {
  const f = fixture();
  const r = await f.api.POST(f.request(f.valid));
  assert.equal(r.status, 201);
  assert.equal(r.body.protocolo, idNovo);
  assert.equal(JSON.stringify(r.body).includes("777"), false);
  assert.equal(f.queries.length, 3);
  assert.match(f.queries[1].text, /INSERT INTO public.interacoes_politicas/);
  assert.equal(f.queries[1].args[0], "777");
  assert.match(f.queries[2].text, /INSERT INTO public.interacoes_politicas_historico/);
});
