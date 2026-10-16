const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const origem = path.join(__dirname, "..", "lib", "telegram", "preparar-avisos-dossie.ts");
const codigo = ts.transpileModule(fs.readFileSync(origem, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const mod = { exports: {} };
vm.runInNewContext(codigo, { module: mod, exports: mod.exports, Date, Set, Error });
const { prepararAvisosDossie } = mod.exports;

function dossie(aviso) {
  return {
    candidaturaId: "100002535230",
    nome: "Pessoa de exemplo",
    eventos: [{
      id: "2024-exemplo",
      titulo: "Registro público de 2024",
      data: { inicio: "2024-03-09", rotulo: "9 de março de 2024" },
      resumo: "Foi localizado um documento sobre um fato ocorrido em 2024.",
      fontes: [{ titulo: "Documento original", url: "https://example.org/documento" }],
      ...(aviso ? { avisoTelegram: aviso } : {}),
    }],
  };
}

const publicado = {
  revisao: "v1",
  publicadoEm: "2026-10-16T08:00:00-03:00",
  tipo: "nova-informacao",
};
const agora = new Date("2026-10-17T12:00:00Z");

test("não notifica eventos sem aprovação editorial", () => {
  assert.equal(prepararAvisosDossie(dossie(null), agora).length, 0);
});

test("diferencia data do fato e publicação recente", () => {
  const avisos = prepararAvisosDossie(dossie(publicado), agora);
  assert.equal(avisos.length, 1);
  assert.equal(avisos[0].id, "dossie:2024-exemplo:v1");
  assert.match(avisos[0].texto, /Quando aconteceu: 9 de março de 2024/);
  assert.match(avisos[0].texto, /Publicado no Fora da Pauta: 16\/10\/2026/);
  assert.match(avisos[0].texto, /#evento-2024-exemplo/);
  assert.match(avisos[0].texto, /https:\/\/example.org\/documento/);
});

test("não avisa sobre publicação programada para o futuro", () => {
  const futuro = { ...publicado, publicadoEm: "2027-01-01T09:00:00-03:00" };
  assert.equal(prepararAvisosDossie(dossie(futuro), agora).length, 0);
});

test("correções têm identidade de revisão e aviso próprios", () => {
  const corrigido = { ...publicado, revisao: "v2", tipo: "correcao" };
  const aviso = prepararAvisosDossie(dossie(corrigido), agora)[0];
  assert.equal(aviso.id, "dossie:2024-exemplo:v2");
  assert.match(aviso.texto, /Correção importante/);
});

test("rejeita informação marcada sem fonte segura", () => {
  const item = dossie(publicado);
  item.eventos[0].fontes[0].url = "http://example.org/documento";
  assert.throws(() => prepararAvisosDossie(item, agora), /fonte HTTPS/);
});

test("rejeita metadados editoriais inválidos", () => {
  assert.throws(() => prepararAvisosDossie(dossie({ ...publicado, revisao: "mudar tudo" }), agora), /inválido/);
  assert.throws(() => prepararAvisosDossie(dossie({ ...publicado, publicadoEm: "2026-10-16" }), agora), /inválido/);
});

test("rejeita revisão repetida de um mesmo evento", () => {
  const item = dossie(publicado);
  item.eventos.push({ ...item.eventos[0] });
  assert.throws(() => prepararAvisosDossie(item, agora), /duplicada/);
});

test("limita mensagens longas ao teto do Telegram", () => {
  const item = dossie(publicado);
  item.eventos[0].resumo = "a".repeat(8000);
  assert.ok(prepararAvisosDossie(item, agora)[0].texto.length < 4096);
});

test("cadastro e reativação precisam anteceder a publicação editorial", () => {
  const registro = fs.readFileSync(
    path.join(__dirname, "..", "lib", "telegram", "registrar-novidades.ts"), "utf8",
  );
  assert.ok(registro.includes("created_at <= "));
  assert.ok(registro.includes("updated_at <= "));
  assert.ok(registro.includes("AND updated_at <= "));
  assert.ok(registro.includes("status = 'aguardando_eleicao'"));
});

test("a fila não libera atos brutos para quem aguarda o mandato", () => {
  const fila = fs.readFileSync(
    path.join(__dirname, "..", "lib", "telegram", "processar-fila.ts"), "utf8",
  );
  const condicao = "a.status = 'aguardando_eleicao' AND f.evento_id LIKE 'dossie:%'";
  assert.equal(fila.split(condicao).length - 1, 2);
});
