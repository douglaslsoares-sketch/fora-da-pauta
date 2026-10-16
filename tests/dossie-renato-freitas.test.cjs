const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const id = "160002536522";
const arquivo = path.join(__dirname, "..", "data", "eleicoes", "dossies", id + ".ts");
const codigo = ts.transpileModule(fs.readFileSync(arquivo, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const mod = { exports: {} };
vm.runInNewContext(codigo, { module: mod, exports: mod.exports }, { timeout: 1500 });
const dossie = mod.exports.dossieRenatoFreitas;

test("associa o dossiê à candidatura correta", () => {
  assert.equal(dossie.candidaturaId, id);
  assert.equal(dossie.nome, "Renato Freitas");
});
test("nenhum fato histórico fica marcado para Telegram", () => {
  assert.ok(dossie.eventos.length > 0);
  assert.ok(dossie.eventos.every((evento) => evento.avisoTelegram === undefined));
});
test("o registro distingue comissão de lei e explica os limites da pesquisa", () => {
  const evento = dossie.eventos.find((e) => e.id === "2026-06-08-pl23-sarau-periferico-comissao-cultura");
  assert.ok(evento);
  assert.match(evento.resumo, /não comprovam a situação final/);
  assert.match(evento.resumo, /não\s+significam/);
  assert.ok(evento.fontes.length >= 2);
  assert.ok(evento.fontes.every((f) => f.url.startsWith("https://")));
});
test("índice registra a ficha sem modificar layout", () => {
  const indice = fs.readFileSync(path.join(__dirname, "..", "data", "eleicoes", "dossies", "index.ts"), "utf8");
  assert.match(indice, /import \{ dossieRenatoFreitas \} from "\.\/160002536522"/);
  assert.match(indice, /\[dossieRenatoFreitas\.candidaturaId\]/);
});
