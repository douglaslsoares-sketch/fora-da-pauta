const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

const code = ts.transpileModule(
  fs.readFileSync("app/api/admin/contatos-politicos/mandato-senado/route.ts", "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText;
const pessoa = { id: "12345678", cargo: "governador", nomeCompleto: "Sergio Fernando Moro", uf: "PR" };
const respostaSenado = {
  ListaParlamentarEmExercicio: {
    Parlamentares: {
      Parlamentar: [
        { IdentificacaoParlamentar: {
          CodigoParlamentar: "12345", NomeCompletoParlamentar: "SÉRGIO FERNANDO MORO",
          NomeParlamentar: "Sergio Moro", UfParlamentar: "PR",
          EmailParlamentar: "institucional@senado.leg.br",
        } },
      ],
    },
  },
};
function preparar(opts = {}) {
  const chamadas = { api: 0, banco: 0 };
  const mod = { exports: {} };
  const mocks = {
    "next/server": { NextResponse: { json(body, extras = {}) { return { body, status: extras.status || 200 }; } } },
    "next/headers": { cookies: async () => ({
      get() { return opts.auth === false ? undefined : { value: "sessao-valida" }; },
    }) },
    "@/data/eleicoes/candidaturas": { candidaturas: opts.candidaturas || [pessoa] },
    "@/lib/questionsAdminAuth": {
      QUESTIONS_ADMIN_COOKIE: "admin", verifyQuestionsAdminSessionToken: token => Boolean(token),
    },
    "@/lib/rateLimit": { consumeRateLimit: async () => ({ allowed: opts.limit !== false }) },
  };
  const contexto = {
    module: mod, exports: mod.exports,
    require(name) {
      if (!(name in mocks)) throw Error("Importação inesperada: " + name);
      return mocks[name];
    },
    Date, console,
    AbortSignal: { timeout() { return undefined; } },
    fetch: async () => {
      chamadas.api++;
      if (opts.offline) throw Error("Senado indisponível");
      return {
        ok: true, json: async () => opts.payload || respostaSenado,
      };
    },
  };
  vm.runInNewContext(code, contexto);
  async function executar(id = pessoa.id) {
    return mod.exports.GET({ nextUrl: { searchParams: new URLSearchParams({ id }) } });
  }
  return { executar, chamadas };
}

test("consulta exige autenticação administrativa", async () => {
  const c = preparar({ auth: false });
  assert.equal((await c.executar()).status, 401);
  assert.equal(c.chamadas.api, 0);
});
test("consulta exige ID válido e candidatura a governador", async () => {
  const c = preparar();
  assert.equal((await c.executar("erro")).status, 400);
  assert.equal(c.chamadas.api, 0);
  const d = preparar({ candidaturas: [{ ...pessoa, cargo: "senador" }] });
  assert.equal((await d.executar()).status, 404);
  assert.equal(d.chamadas.api, 0);
});
test("bloqueio de excesso de consultas evita chamada externa", async () => {
  const c = preparar({ limit: false });
  assert.equal((await c.executar()).status, 429);
  assert.equal(c.chamadas.api, 0);
});
test("mandato de senador encontrado é informativo e não aprova contato", async () => {
  const r = await preparar().executar();
  assert.equal(r.status, 200);
  assert.equal(r.body.mandatoSenadoEmExercicio, true);
  assert.equal(r.body.emailInstitucional, "institucional@senado.leg.br");
  assert.equal(r.body.envioHabilitado, false);
  assert.equal(r.body.contatoAprovado, false);
});
test("correspondência de nome sem UF não confirma o mandato", async () => {
  const payload = structuredClone(respostaSenado);
  payload.ListaParlamentarEmExercicio.Parlamentares.Parlamentar[0].IdentificacaoParlamentar.UfParlamentar = "SP";
  const r = await preparar({ payload }).executar();
  assert.equal(r.body.mandatoSenadoEmExercicio, false);
  assert.equal(r.body.emailInstitucional, null);
  assert.equal(r.body.envioHabilitado, false);
});
test("email fora do Senado é suprimido mesmo em mandato confirmado", async () => {
  const payload = structuredClone(respostaSenado);
  payload.ListaParlamentarEmExercicio.Parlamentares.Parlamentar[0].IdentificacaoParlamentar.EmailParlamentar = "teste@exemplo.com";
  const r = await preparar({ payload }).executar();
  assert.equal(r.body.mandatoSenadoEmExercicio, true);
  assert.equal(r.body.emailInstitucional, null);
  assert.equal(r.body.contatoAprovado, false);
});
test("falha do Senado não divulga destinatários nem autoriza envio", async () => {
  const r = await preparar({ offline: true }).executar();
  assert.equal(r.status, 503);
  assert.equal(r.body.contatoAprovado, false);
  assert.equal(r.body.envioHabilitado, false);
});
