const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

const js = ts.transpileModule(
  fs.readFileSync("app/api/admin/contatos-politicos/mandatos-em-exercicio/route.ts", "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText;
const pessoa = { id: "12345678", cargo: "governador", nomeCompleto: "Pessoa de Exemplo", uf: "PR" };
function preparar(opcoes = {}) {
  const chamadas = [];
  const modulo = { exports: {} };
  const dependencias = {
    "next/server": { NextResponse: { json(body, options = {}) { return { status: options.status || 200, body }; } } },
    "next/headers": { cookies: async () => ({ get: () => opcoes.auth === false ? undefined : { value: "sessao" } }) },
    "@/data/eleicoes/candidaturas": { candidaturas: opcoes.pessoas || [pessoa] },
    "@/lib/eleicoes/consultar-contato-parlamentar": {
      consultarContatoParlamentar: async (p) => {
        chamadas.push(p);
        if (opcoes.throwSenado && p.cargo === "senador") throw Error("Senado fora do ar");
        if (p.cargo === "senador" && opcoes.senado) return opcoes.senado;
        if (p.cargo === "deputado-federal" && opcoes.camara) return opcoes.camara;
        return { situacao: "pendente", motivo: "não encontrado", fonteUrl: "https://fonte.exemplo", envioHabilitado: false };
      },
    },
    "@/lib/questionsAdminAuth": { QUESTIONS_ADMIN_COOKIE: "admin", verifyQuestionsAdminSessionToken: Boolean },
    "@/lib/rateLimit": { consumeRateLimit: async () => ({ allowed: opcoes.limite !== false }) },
  };
  vm.runInNewContext(js, {
    module: modulo, exports: modulo.exports,
    require(nome) {
      if (!Object.hasOwn(dependencias, nome)) throw Error("Dependência não autorizada: " + nome);
      return dependencias[nome];
    },
    Date, console,
  });
  async function executar(id = pessoa.id) {
    return modulo.exports.GET({ nextUrl: { searchParams: new URLSearchParams({ id }) } });
  }
  return { executar, chamadas };
}
test("nega consulta sem autenticação", async () => {
  const s = preparar({ auth: false });
  assert.equal((await s.executar()).status, 401);
  assert.equal(s.chamadas.length, 0);
});
test("nega identificador incorreto", async () => {
  const s = preparar();
  assert.equal((await s.executar("abc")).status, 400);
  assert.equal(s.chamadas.length, 0);
});
test("nega candidatura desconhecida ou presidente", async () => {
  const s = preparar();
  assert.equal((await s.executar("87654321")).status, 404);
  const p = preparar({ pessoas: [{ ...pessoa, cargo: "presidente" }] });
  assert.equal((await p.executar()).status, 404);
});
test("bloqueia excesso de consultas", async () => {
  const s = preparar({ limite: false });
  assert.equal((await s.executar()).status, 429);
  assert.equal(s.chamadas.length, 0);
});
test("governador eleito pode ter mandato no Senado confirmado sem liberar envio", async () => {
  const s = preparar({ senado: {
    situacao: "encontrado", nomeOficial: "Pessoa de Exemplo",
    emailInstitucional: "gabinete@senado.leg.br", fonteUrl: "https://senado.leg.br",
    envioHabilitado: false,
  } });
  const r = await s.executar();
  assert.equal(r.status, 200);
  assert.equal(r.body.verificacoes.length, 3);
  assert.equal(r.body.verificacoes[0].situacao, "confirmado");
  assert.equal(r.body.verificacoes[0].cargo, "senador");
  assert.equal(r.body.verificacoes[2].situacao, "manual");
  assert.equal(r.body.contatoAprovado, false);
  assert.equal(r.body.envioHabilitado, false);
  assert.deepEqual(s.chamadas.map(c => c.cargo), ["senador", "deputado-federal"]);
  assert(s.chamadas.every(c => c.id === pessoa.id && c.nomeCompleto === pessoa.nomeCompleto));
});
test("consulta serve igualmente para deputados estaduais eleitos", async () => {
  const s = preparar({ pessoas: [{ ...pessoa, cargo: "deputado-estadual" }] });
  const r = await s.executar();
  assert.equal(r.status, 200);
  assert.equal(r.body.verificacoes[2].situacao, "manual");
  assert.equal(r.body.envioHabilitado, false);
});
test("consulta serve também para candidatos a deputado federal", async () => {
  const s = preparar({ pessoas: [{ ...pessoa, cargo: "deputado-federal" }] });
  assert.equal((await s.executar()).status, 200);
});
test("fonte federal indisponível não vira ausência confirmada de mandato", async () => {
  const s = preparar({ throwSenado: true });
  const r = await s.executar();
  assert.equal(r.body.verificacoes[0].situacao, "indisponivel");
  assert.equal(r.body.verificacoes[0].emailInstitucional, null);
  assert.equal(r.body.envioHabilitado, false);
});
test("ausência de contato confirmado não equivale a ausência de mandato", async () => {
  const r = await preparar().executar();
  assert.equal(r.body.verificacoes[0].situacao, "nao_confirmado");
  assert.equal(r.body.verificacoes[1].situacao, "nao_confirmado");
  assert.equal(r.body.contatoAprovado, false);
});
