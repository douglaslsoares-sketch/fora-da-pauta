const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const origem = path.join(__dirname, "..", "lib", "eleicoes", "resenha-contextual.ts");
const codigo = ts.transpileModule(fs.readFileSync(origem, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const mod = { exports: {} };
vm.runInNewContext(codigo, { module: mod, exports: mod.exports, URL, Set, Error });
const { montarContextoResenha } = mod.exports;

function evento(id, tema, natureza = ["documentado"], url = "https://www.camara.leg.br/noticias/100") {
  return {
    id, tema, natureza, eixos: ["o-que-diz-e-defende"],
    titulo: "Manifestação registrada " + id,
    resumo: "O registro original descreve o acontecimento " + id + ".",
    data: { inicio: "2026-10-01", rotulo: "1º de outubro de 2026" },
    fontes: [{ id: "fonte-" + id, titulo: "Documento original " + id, url }],
  };
}

test("agrupa apenas eventos de tema editorial exatamente identificado", () => {
  const dossie = { nome: "Pessoa fictícia", candidaturaId: "100000000001", eventos: [
    evento("a", "Jornada de trabalho"), evento("b", "jornada de trabalho"),
    evento("c", "Segurança pública"),
  ] };
  const resumo = montarContextoResenha(dossie, "a");
  assert.equal(resumo.relacionados.length, 1);
  assert.equal(resumo.relacionados[0].id, "b");
  assert.match(resumo.narrativa, /outras datas/);
  assert.match(resumo.narrativa, /não demonstram/);
});

test("não cria relações a partir de palavras-chave sem tema", () => {
  const dossie = { nome: "Pessoa fictícia", eventos: [evento("a", undefined), evento("b", undefined)] };
  assert.equal(montarContextoResenha(dossie, "a").relacionados.length, 0);
});

test("não transforma alegações em fatos documentados", () => {
  const dossie = { nome: "Pessoa fictícia", eventos: [evento("a", "Tema", ["alegacao"])] };
  assert.match(montarContextoResenha(dossie, "a").narrativa, /alegação registrada/);
});

test("rejeita fonte HTTP e URL sem segurança", () => {
  const dossie = { nome: "Pessoa fictícia", eventos: [evento("a", "Tema", ["documentado"], "http://example.com")] };
  assert.equal(montarContextoResenha(dossie, "a"), null);
});

test("rascunho de IA não pode publicar automaticamente na fila do Telegram", () => {
  const codigoIA = fs.readFileSync(
    path.join(__dirname, "..", "lib", "eleicoes", "gerar-rascunho-resenha-ia.ts"), "utf8");
  assert.match(codigoIA, /RASCUNHO_NAO_PUBLICAR/);
  assert.doesNotMatch(codigoIA, /registrarNovidadesNaFila|processarFilaTelegram|telegram_fila_avisos/);
  assert.match(codigoIA, /referencias\.includes\(eventoId\)/);
});
