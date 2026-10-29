"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { gerarPrevia, montarHtml, escaparHtml } = require("../scripts/audio/gerar-previa-local.cjs");
const { prepararPacote } = require("../scripts/audio/validar-gravacao-edicao.cjs");
const { prepararRoteiro } = require("../scripts/audio/preparar-roteiro-edicao.cjs");

test("escapa texto e mantém reprodução manual em arquivo offline", () => {
  assert.equal(escaparHtml("<script>"), "&lt;script&gt;");
  const html = montarHtml(prepararRoteiro());
  assert.match(html, /<audio controls preload="metadata" src="gravacao\.mp3"/);
  assert.match(html, /Áudio gerado por IA, sem aprovação/);
  assert.doesNotMatch(html, /<script[\s>]/);
  assert.doesNotMatch(html, /https?:\/\//);
});

test("prévia só é preparada com MP3 íntegro e não sobrescreve conteúdo diferente", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fdp-previa-"));
  try {
    assert.throws(() => gerarPrevia(dir), /ENOENT/);
    const mp3 = path.join(dir, "entrada.mp3");
    fs.writeFileSync(mp3, Buffer.concat([
      Buffer.from([73, 68, 51, 4, 0, 0, 0, 0, 0, 0]), Buffer.alloc(1500, 1)
    ]));
    const pasta = path.join(dir, "revisao");
    prepararPacote(mp3, pasta);
    const primeira = gerarPrevia(pasta);
    assert.equal(primeira.criado, true);
    assert.ok(fs.existsSync(primeira.caminho));
    assert.equal(gerarPrevia(pasta).criado, false);
    fs.appendFileSync(primeira.caminho, "\n<!-- revisão local -->");
    assert.throws(() => gerarPrevia(pasta), /não sobrescrever/);
    fs.appendFileSync(path.join(pasta, "gravacao.mp3"), Buffer.from([1]));
    assert.throws(() => gerarPrevia(pasta), /Arquivo de áudio mudou/);
  } finally {
    fs.rmSync(dir, { recursive:true, force:true });
  }
});
