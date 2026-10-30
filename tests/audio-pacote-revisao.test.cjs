"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { prepararPacote, verificarPacote } = require("../scripts/audio/validar-gravacao-edicao.cjs");

function temp() { return fs.mkdtempSync(path.join(os.tmpdir(), "fdp-audio-revisao-")); }
function amostraDeCabecalho() {
  // Fixture de hash/cabeçalho, NÃO é áudio reproduzível.
  return Buffer.concat([Buffer.from([73,68,51,4,0,0,0,0,0,0]), Buffer.alloc(1500, 1)]);
}

test("prepara gravação somente em diretório privado, com aprovação bloqueada", () => {
  const tmp = temp();
  try {
    const mp3 = path.join(tmp, "entrada.mp3");
    const pasta = path.join(tmp, ".local", "audio-review", "lula-venceu-o-globo");
    fs.writeFileSync(mp3, amostraDeCabecalho());
    const m = prepararPacote(mp3, pasta);
    assert.equal(m.estado, "aguardando_revisao_humana");
    assert.equal(m.narracao_aprovada, false);
    assert.equal(m.artigo_aprovado, false);
    assert.equal(verificarPacote(pasta).publicacao, "bloqueada");
    assert.throws(() => prepararPacote(mp3, pasta), /Não sobrescrever/);
  } finally { fs.rmSync(tmp, { force: true, recursive: true }); }
});

test("detecta mudança da gravação ou do roteiro associado", () => {
  const tmp = temp();
  try {
    const mp3 = path.join(tmp, "entrada.mp3");
    const pasta = path.join(tmp, "pacote");
    fs.writeFileSync(mp3, amostraDeCabecalho());
    prepararPacote(mp3, pasta);
    fs.appendFileSync(path.join(pasta, "gravacao.mp3"), Buffer.from([0, 1]));
    assert.throws(() => verificarPacote(pasta), /Arquivo de áudio mudou/);
    fs.writeFileSync(path.join(pasta, "gravacao.mp3"), amostraDeCabecalho());
    const arquivo = path.join(pasta, "revisao.json");
    const m = JSON.parse(fs.readFileSync(arquivo, "utf8"));
    m.versao_texto_sha256 = "0".repeat(64);
    fs.writeFileSync(arquivo, JSON.stringify(m));
    assert.throws(() => verificarPacote(pasta), /texto editorial mudou/);
  } finally { fs.rmSync(tmp, { force: true, recursive: true }); }
});

test("recusa arquivo sem cabeçalho MP3 e aprovação manual", () => {
  const tmp = temp();
  try {
    const mp3 = path.join(tmp, "entrada.mp3");
    const pasta = path.join(tmp, "pacote");
    fs.writeFileSync(mp3, Buffer.alloc(1400, 2));
    assert.throws(() => prepararPacote(mp3, pasta), /Cabeçalho MP3/);
    fs.writeFileSync(mp3, amostraDeCabecalho());
    prepararPacote(mp3, pasta);
    const arquivo = path.join(pasta, "revisao.json");
    const m = JSON.parse(fs.readFileSync(arquivo, "utf8"));
    m.narracao_aprovada = true;
    fs.writeFileSync(arquivo, JSON.stringify(m));
    assert.throws(() => verificarPacote(pasta), /Sem aprovação para publicação/);
  } finally { fs.rmSync(tmp, { force: true, recursive: true }); }
});
