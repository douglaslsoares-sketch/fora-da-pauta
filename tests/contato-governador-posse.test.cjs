const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

const codigo = ts.transpileModule(
  fs.readFileSync("lib/eleicoes/contato-governador.ts", "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText;
const pessoa = {
  id: "12345678", cargo: "governador", nomeUrna: "Sergio Moro",
  nomeCompleto: "Sergio Fernando Moro", uf: "PR",
};
const fonteUm = "<html><body><div>Governador do Estado</div><h3>Sergio Moro</h3><p>Palácio Iguaçu</p><p>E-mail: gabinete@governadoria.pr.gov.br</p><h3>Chefe da Casa Civil</h3></body></html>";
const fonteDois = "<html><body><div>SERGIO MORO</div><div>GOVERNADOR DO ESTADO DO PARANÁ</div><div>Endereço Comercial</div><div>E-mail: gabinete@governadoria.pr.gov.br</div><div>VICE-GOVERNADOR DO ESTADO DO PARANÁ</div></body></html>";
function criar(opts = {}) {
  const mod = { exports: {} };
  const urls = [];
  const deps = {
    "server-only": {},
    "@/lib/eleicoes/acompanhamento-politico": {
      idsEleitosEm2026: new Set(opts.eleito === false ? [] : [pessoa.id]),
    },
  };
  const contexto = {
    module: mod, exports: mod.exports,
    require: nome => {
      if (!(nome in deps)) throw new Error("Dependência inválida: " + nome);
      return deps[nome];
    },
    URL, Date, console,
    AbortSignal: { timeout: () => undefined },
    fetch: async (url) => {
      urls.push(url);
      if (opts.falha && url.includes("gcau")) throw new Error("Falhou");
      return {
        ok: true, url, headers: { get: () => "text/html; charset=utf-8" },
        text: async () => url.includes("gcau") ? (opts.segunda || fonteDois) : (opts.primeira || fonteUm),
      };
    },
  };
  vm.runInNewContext(codigo, contexto);
  return { verificar: (quando, p = pessoa) => mod.exports.consultarContatoGovernadorEmExercicio(p, quando), urls };
}
const antes = Date.parse("2027-01-05T20:00:00-03:00");
const depois = Date.parse("2027-01-07T12:00:00-03:00");
test("antes da posse nao consulta nem publica email", async () => {
  const app = criar();
  const r = await app.verificar(antes);
  assert.equal(r.situacao, "aguardando_posse");
  assert.equal(r.emailInstitucional, null);
  assert.equal(r.envioHabilitado, false);
  assert.equal(app.urls.length, 0);
});
test("reconhece contato novo somente quando duas fontes concordam apos a posse", async () => {
  const app = criar();
  const r = await app.verificar(depois);
  assert.equal(r.situacao, "confirmado");
  assert.equal(r.emailInstitucional, "gabinete@governadoria.pr.gov.br");
  assert.equal(r.fontesConferidas.length, 2);
  assert.equal(r.envioHabilitado, false);
  assert.equal(r.contatoAprovado, false);
});
test("não reutiliza contato de governador anterior", async () => {
  const app = criar({ primeira: fonteUm.replace("Sergio Moro", "Carlos Massa Ratinho Junior") });
  const r = await app.verificar(depois);
  assert.equal(r.situacao, "nao_confirmado");
  assert.equal(r.emailInstitucional, null);
});
test("não admite emails divergentes", async () => {
  const app = criar({ segunda: fonteDois.replace("gabinete@", "outro@") });
  const r = await app.verificar(depois);
  assert.equal(r.situacao, "nao_confirmado");
});
test("não aceita formato malicioso ou fonte sem correspondência", async () => {
  const app = criar({ segunda: fonteDois.replace("gabinete@governadoria.pr.gov.br", "teste@gmail.com") });
  const r = await app.verificar(depois);
  assert.equal(r.situacao, "nao_confirmado");
  assert.equal(r.emailInstitucional, null);
});
test("fontes indisponíveis nunca liberam contato", async () => {
  const r = await criar({ falha: true }).verificar(depois);
  assert.equal(r.situacao, "indisponivel");
  assert.equal(r.envioHabilitado, false);
});
test("demais estados exigem integracao validada, sem simulacao de contato", async () => {
  const app = criar();
  const r = await app.verificar(depois, { ...pessoa, uf: "SP" });
  assert.equal(r.situacao, "manual");
  assert.equal(r.emailInstitucional, null);
  assert.equal(app.urls.length, 0);
});
test("candidatura sem vitória confirmada não é reconhecida", async () => {
  const app = criar({ eleito: false });
  const r = await app.verificar(depois);
  assert.equal(r.situacao, "nao_aplicavel");
  assert.equal(app.urls.length, 0);
});
test("outro cargo não pode utilizar conferência de governador", async () => {
  const app = criar();
  const r = await app.verificar(depois, { ...pessoa, cargo: "senador" });
  assert.equal(r.situacao, "nao_aplicavel");
  assert.equal(app.urls.length, 0);
});