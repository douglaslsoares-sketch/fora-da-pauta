const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

const source = fs.readFileSync("app/api/admin/contatos-politicos/prontidao/route.ts", "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

const parlamentar = {
  id: "12345678",
  cargo: "deputado-federal",
  nomeCompleto: "Parlamentar Ficticio",
  nomeUrna: "Parlamentar Teste",
  uf: "PR",
};
const fonte = {
  situacao: "encontrado",
  emailInstitucional: "contato@camara.leg.br",
  fonteUrl: "https://www.camara.leg.br/deputados/12345",
  casa: "Câmara dos Deputados",
};
function registro(overrides = {}) {
  return {
    nome_civil: parlamentar.nomeCompleto,
    cargo: parlamentar.cargo,
    uf: parlamentar.uf,
    instituicao: fonte.casa,
    email_institucional: fonte.emailInstitucional,
    fonte_url: fonte.fonteUrl,
    status: "revisado",
    expira_em: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}
function preparar(opcoes = {}) {
  const chamadas = { banco: 0, fonte: 0, limite: 0 };
  const mod = { exports: {} };
  const env = Object.hasOwn(opcoes, "env") ? opcoes.env : {
    RESEND_API_KEY: "chave-simulada-sem-rede",
    FDP_RECADOS_EMAIL_REMETENTE: "recados@foradapauta.org",
  };
  const dependencias = {
    "next/server": {
      NextResponse: {
        json(body, options = {}) {
          return { status: options.status ?? 200, body, headers: options.headers };
        },
      },
    },
    "next/headers": {
      cookies: async () => ({
        get: () => opcoes.autenticado === false ? undefined : { value: "sessao-ficticia" },
      }),
    },
    "@/lib/interesses/db": {
      sql: async (partes) => {
        chamadas.banco++;
        const consulta = partes.join("?");
        assert.match(consulta, /^\s*SELECT\b/i, "O teste de prontidao nao pode escrever no banco");
        if (opcoes.falhaBanco) throw Error("banco simulado indisponivel");
        const linha = Object.hasOwn(opcoes, "registro") ? opcoes.registro : registro();
        return linha ? [linha] : [];
      },
    },
    "@/data/eleicoes/candidaturas": {
      candidaturas: [parlamentar, {
        id: "87654321", cargo: "presidente", nomeCompleto: "Presidente Ficticio",
        nomeUrna: "Presidente Teste", uf: "BR",
      }],
    },
    "@/lib/eleicoes/consultar-contato-parlamentar": {
      consultarContatoParlamentar: async () => {
        chamadas.fonte++;
        return opcoes.fonte || fonte;
      },
    },
    "@/lib/questionsAdminAuth": {
      QUESTIONS_ADMIN_COOKIE: "admin_mock",
      verifyQuestionsAdminSessionToken: (token) => Boolean(token),
    },
    "@/lib/rateLimit": {
      consumeRateLimit: async () => {
        chamadas.limite++;
        return { allowed: opcoes.limite === false ? false : true };
      },
    },
  };
  vm.runInNewContext(compiled, {
    module: mod,
    exports: mod.exports,
    require(name) {
      if (!Object.hasOwn(dependencias, name))
        throw Error("Importacao nao autorizada no teste: " + name);
      return dependencias[name];
    },
    process: { env },
    Date,
    console: { error() {} },
  });
  async function executar(id = parlamentar.id) {
    return mod.exports.GET({
      nextUrl: { searchParams: new URLSearchParams({ id }) },
    });
  }
  return { executar, chamadas };
}

test("nega acesso sem sessao administrativa e nao consulta dados", async () => {
  const { executar, chamadas } = preparar({ autenticado: false });
  const r = await executar();
  assert.equal(r.status, 401);
  assert.equal(chamadas.banco, 0);
  assert.equal(chamadas.fonte, 0);
});

test("rejeita identificador invalido antes de consultar banco", async () => {
  const { executar, chamadas } = preparar();
  assert.equal((await executar("abc")).status, 400);
  assert.equal(chamadas.banco, 0);
});

test("nao aceita presidente na rotina automatica de parlamentares", async () => {
  const { executar, chamadas } = preparar();
  assert.equal((await executar("87654321")).status, 400);
  assert.equal(chamadas.banco, 0);
});

test("respeita limitacao de consultas", async () => {
  const { executar, chamadas } = preparar({ limite: false });
  assert.equal((await executar()).status, 429);
  assert.equal(chamadas.banco, 0);
});

test("aprovacao vigente e dados atuais: pronto para teste, mas envio bloqueado", async () => {
  const { executar, chamadas } = preparar();
  const r = await executar();
  assert.equal(r.status, 200);
  assert.equal(r.body.revisaoVigente, true);
  assert.equal(r.body.consultaFonteConcluida, true);
  assert.equal(r.body.contatoIgualAoAtual, true);
  assert.equal(r.body.credenciaisEnvioPresentes, true);
  assert.equal(r.body.prontoParaTesteDeTransporte, true);
  assert.equal(r.body.envioHabilitado, false);
  assert.equal(chamadas.banco, 1);
  assert.equal(chamadas.fonte, 1);
});

test("sem chave ou remetente nao declara transporte pronto", async () => {
  for (const env of [
    { FDP_RECADOS_EMAIL_REMETENTE: "recados@foradapauta.org" },
    { RESEND_API_KEY: "chave-simulada" },
  ]) {
    const r = await preparar({ env }).executar();
    assert.equal(r.status, 200);
    assert.equal(r.body.credenciaisEnvioPresentes, false);
    assert.equal(r.body.prontoParaTesteDeTransporte, false);
    assert.equal(r.body.envioHabilitado, false);
  }
});

test("sem revisao vigente nao chama fonte e nao autoriza envio", async () => {
  const semRegistro = preparar({ registro: null });
  const a = await semRegistro.executar();
  assert.equal(a.body.revisaoVigente, false);
  assert.equal(a.body.prontoParaTesteDeTransporte, false);
  assert.equal(a.body.envioHabilitado, false);
  assert.equal(semRegistro.chamadas.fonte, 0);

  for (const linha of [
    registro({ status: "revogado" }),
    registro({ expira_em: "2020-01-01T00:00:00.000Z" }),
    registro({ nome_civil: "Outra Pessoa" }),
  ]) {
    const teste = preparar({ registro: linha });
    const r = await teste.executar();
    assert.equal(r.body.revisaoVigente, false);
    assert.equal(r.body.prontoParaTesteDeTransporte, false);
    assert.equal(teste.chamadas.fonte, 0);
  }
});

test("contato divergente da fonte nao fica pronto", async () => {
  const r = await preparar({
    fonte: { ...fonte, emailInstitucional: "outro@camara.leg.br" },
  }).executar();
  assert.equal(r.body.revisaoVigente, true);
  assert.equal(r.body.contatoIgualAoAtual, false);
  assert.equal(r.body.prontoParaTesteDeTransporte, false);
  assert.equal(r.body.envioHabilitado, false);
});

test("fonte indisponivel impede prontidao", async () => {
  const r = await preparar({ fonte: { situacao: "indisponivel" } }).executar();
  assert.equal(r.body.consultaFonteConcluida, false);
  assert.equal(r.body.prontoParaTesteDeTransporte, false);
  assert.equal(r.body.envioHabilitado, false);
});

test("falha no banco devolve erro sem disparar mensagens", async () => {
  const { executar, chamadas } = preparar({ falhaBanco: true });
  const r = await executar();
  assert.equal(r.status, 500);
  assert.equal(chamadas.fonte, 0);
});
