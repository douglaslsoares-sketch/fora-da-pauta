const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

const code = ts.transpileModule(fs.readFileSync("app/api/cron/contato-governador-pr/route.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText;
function preparar(opcoes = {}) {
  const consultas = [];
  const pessoa = { id: "12345678", uf: "PR", cargo: "governador", nomeCompleto: "Pessoa Eleita" };
  let execucoes = 0;
  let tabela = false;
  const sql = (partes, ...valores) => {
    consultas.push({ sql: partes.join("?"), valores });
    if (partes.join("?").includes("CREATE TABLE")) tabela = true;
    return Promise.resolve([]);
  };
  sql.begin = async (f) => f(async (partes, ...valores) => {
    const texto = partes.join("?");
    consultas.push({ sql: texto, valores });
    if (texto.includes("SELECT")) return [];
    return [];
  });
  const dependencias = {
    "node:crypto": { timingSafeEqual: (a,b) => a.equals(b) },
    "next/server": { NextResponse: { json: (body, options = {}) => ({ body, status: options.status || 200 }) } },
    "@/lib/interesses/db": { sql },
    "@/data/eleicoes/candidaturas": { candidaturas: opcoes.pessoas || [pessoa] },
    "@/lib/eleicoes/acompanhamento-politico": { idsEleitosEm2026: new Set(opcoes.eleitos === false ? [] : [pessoa.id]) },
    "@/lib/eleicoes/contato-governador": {
      consultarContatoGovernadorEmExercicio: async () => {
        execucoes++;
        return opcoes.resultado || {
          situacao: "aguardando_posse", nomeOficial: null, emailInstitucional: null,
          fonteUrl: null, fontesConferidas: [],
        };
      },
    },
  };
  const mod = { exports: {} };
  vm.runInNewContext(code, {
    module: mod, exports: mod.exports,
    require: x => {
      if (!(x in dependencias)) throw Error("Dependencia desconhecida " + x);
      return dependencias[x];
    },
    Buffer, Date, console,
    process: { env: { CRON_SECRET: opcoes.secret === false ? undefined : "chave-somente-de-teste",
      VERCEL_ENV: opcoes.environment || "production" } },
  });
  const executar = (auth = "Bearer chave-somente-de-teste") => mod.exports.GET({
    headers: { get: nome => nome === "authorization" ? auth : null }
  });
  return { executar, consultas, execucoes: () => execucoes, tabela: () => tabela };
}
test("sem token autorizado, nenhuma leitura ou gravação", async () => {
  const p = preparar();
  assert.equal((await p.executar("")).status, 401);
  assert.equal(p.execucoes(), 0);
  assert.equal(p.consultas.length, 0);
});
test("se variável secreta ausente, token nunca vale", async () => {
  const p = preparar({ secret: false });
  assert.equal((await p.executar("Bearer undefined")).status, 401);
});
test("não executa fora de produção", async () => {
  const p = preparar({ environment: "preview" });
  assert.equal((await p.executar()).status, 403);
  assert.equal(p.execucoes(), 0);
});
test("exige uma única candidatura eleita confirmada", async () => {
  const p = preparar({ eleitos: false });
  assert.equal((await p.executar()).status, 422);
  assert.equal(p.consultas.length, 0);
});
test("marca pendência antes da posse sem armazenar email", async () => {
  const p = preparar();
  const r = await p.executar();
  assert.equal(r.status, 200);
  assert.equal(r.body.situacao, "aguardando_posse");
  assert.equal(r.body.contatoReconhecido, false);
  assert.equal(r.body.envioHabilitado, false);
  assert.equal(r.body.contatoAprovado, false);
  assert.equal(p.tabela(), true);
  assert(!p.consultas.some(c => c.sql.includes("UPDATE") && c.valores.includes("email@exemplo.com")));
});
test("duas fontes concordantes produzem reconhecimento informativo sem envio", async () => {
  const p = preparar({ resultado: {
    situacao: "confirmado", nomeOficial: "Pessoa Eleita", emailInstitucional: "gabinete@governadoria.pr.gov.br",
    fonteUrl: "https://www.parana.pr.gov.br/Pagina/Quemequem", fontesConferidas: ["fonte1", "fonte2"],
  } });
  const r = await p.executar();
  assert.equal(r.status, 200);
  assert.equal(r.body.contatoReconhecido, true);
  assert.equal(r.body.emailInstitucional, undefined);
  assert.equal(r.body.envioHabilitado, false);
  assert.equal(r.body.contatoAprovado, false);
  assert(p.consultas.some(c => c.sql.includes("INSERT INTO public.contatos_governadores_monitorados")));
});
test("quando fonte falha, contato antigo não é persistido", async () => {
  const p = preparar({ resultado: {
    situacao: "indisponivel", emailInstitucional: "velho@governadoria.pr.gov.br",
    nomeOficial: "Titular Anterior", fonteUrl: null, fontesConferidas: [],
  } });
  const r = await p.executar();
  assert.equal(r.status, 200);
  assert.equal(r.body.contatoReconhecido, false);
  assert(!p.consultas.some(c => c.valores.includes("velho@governadoria.pr.gov.br")));
});