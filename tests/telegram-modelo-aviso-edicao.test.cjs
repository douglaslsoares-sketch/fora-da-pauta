const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const arquivo = path.join(__dirname, "../lib/telegram/modelo-aviso-edicao.ts");
const codigo = ts.transpileModule(fs.readFileSync(arquivo, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const modulo = { exports: {} };
vm.runInNewContext(codigo, { module: modulo, exports: modulo.exports, URL }, { timeout: 2000 });
const { prepararTextoAvisoNovaEdicao } = modulo.exports;
const exemplo = {
  titulo: "O jogo sendo jogado",
  pergunta: "Quem escolhe o que aparece no noticiário?",
  chamada: "Entenda como a cobertura eleitoral é construída.",
  atribuicao: "José, do Portal do José",
  urlEdicao: "https://www.foradapauta.org/campanhas/o-jogo-sendo-jogado",
  audioDisponivel: false,
};

test("modelo oferece leitura e atribuição sem prometer áudio indisponível", () => {
  const texto = prepararTextoAvisoNovaEdicao(exemplo);
  assert.match(texto, /NOVA EDIÇÃO/);
  assert.match(texto, /O jogo sendo jogado/);
  assert.match(texto, /José, do Portal do José/);
  assert.match(texto, /Leia a edição:/);
  assert.doesNotMatch(texto, /ouça/);
});
test("só anuncia áudio quando disponível", () => {
  assert.match(prepararTextoAvisoNovaEdicao({ ...exemplo, audioDisponivel: true }), /Leia ou ouça/);
});
test("rejeita links externos e texto vazio", () => {
  assert.throws(() => prepararTextoAvisoNovaEdicao({ ...exemplo, urlEdicao: "https://example.org/campanhas/x" }), /link direto/);
  assert.throws(() => prepararTextoAvisoNovaEdicao({ ...exemplo, pergunta: "  " }), /pergunta/);
});
test("o módulo não possui função de envio nem consulta", () => {
  assert.deepEqual(Object.keys(modulo.exports), ["prepararTextoAvisoNovaEdicao"]);
});
