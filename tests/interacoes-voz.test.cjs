const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

const source = fs.readFileSync("lib/interacoes/juntar-transcricao.ts", "utf8");
const transpiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const moduleObj = { exports: {} };
vm.runInNewContext(transpiled.outputText, { module: moduleObj, exports: moduleObj.exports });
const { juntarTranscricao } = moduleObj.exports;
test("fala inicial vira texto editável", () => {
  assert.equal(juntarTranscricao("", " Bom dia, tenho uma pergunta. "), "Bom dia, tenho uma pergunta.");
});
test("ditado adicional não apaga texto revisado", () => {
  assert.equal(juntarTranscricao("Quero saber a razão da decisão.", " Pode me explicar?"), "Quero saber a razão da decisão. Pode me explicar?");
});
test("resultados parciais vazios não substituem o texto", () => {
  assert.equal(juntarTranscricao("Mensagem já corrigida.", "   "), "Mensagem já corrigida.");
});
test("retira espaços duplicados apenas da nova fala", () => {
  assert.equal(juntarTranscricao("Mensagem anterior", " nova   mensagem "), "Mensagem anterior nova mensagem");
});
