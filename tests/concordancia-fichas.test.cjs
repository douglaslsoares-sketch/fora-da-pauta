const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

// Transpilar o módulo TypeScript sem depender de executar a aplicação Next.js.
const source = fs.readFileSync("lib/eleicoes/formatar-cargo.ts", "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const moduleBox = { exports: {} };
vm.runInNewContext(outputText, { module: moduleBox, exports: moduleBox.exports });
const { formatarCargo, formatarSituacaoEleitoral } = moduleBox.exports;

test("cargos femininos documentados", () => {
  assert.equal(formatarCargo("senador", "feminino"), "Senadora");
  assert.equal(formatarCargo("deputado-federal", "feminino"), "Deputada Federal");
  assert.equal(formatarCargo("deputado-estadual", "feminino"), "Deputada Estadual");
  assert.equal(formatarCargo("governador", "feminino"), "Governadora");
  assert.equal(formatarCargo("prefeito", "feminino"), "Prefeita");
  assert.equal(formatarCargo("vereador", "feminino"), "Vereadora");
  assert.equal(formatarCargo("1-suplente", "feminino"), "1ª Suplente");
  assert.equal(formatarCargo("presidente", "feminino"), "Presidente da República");
});

test("cargos masculinos documentados e compatibilidade com registros antigos", () => {
  assert.equal(formatarCargo("senador", "masculino"), "Senador");
  assert.equal(formatarCargo("deputado-federal", "masculino"), "Deputado Federal");
  assert.equal(formatarCargo("governador", "masculino"), "Governador");
  assert.equal(formatarCargo("1-suplente", "masculino"), "1º Suplente");
  assert.equal(formatarCargo("senador"), "Senador");
});

test("resultados eleitorais flexionados conservam grafia e caixa", () => {
  assert.equal(formatarSituacaoEleitoral("Eleito", "feminino"), "Eleita");
  assert.equal(formatarSituacaoEleitoral("REELEITO", "feminino"), "REELEITA");
  assert.equal(formatarSituacaoEleitoral("Não eleito", "feminino"), "Não eleita");
  assert.equal(formatarSituacaoEleitoral("Deferido", "feminino"), "Deferida");
  assert.equal(formatarSituacaoEleitoral("Indeferido", "feminino"), "Indeferida");
  assert.equal(formatarSituacaoEleitoral("Eleito", "masculino"), "Eleito");
  assert.equal(formatarSituacaoEleitoral("Suplente", "feminino"), "Suplente");
});
