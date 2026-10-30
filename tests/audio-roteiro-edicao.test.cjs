"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { prepararRoteiro, digest, textoAudivel } = require("../scripts/audio/preparar-roteiro-edicao.cjs");

test("roteiro gerado usa o texto original e conserva a sequencia dos blocos", () => {
  const r = prepararRoteiro();
  assert.equal(r.estado, "rascunho_para_revisao");
  assert.equal(r.slug, "lula-venceu-o-globo");
  assert.equal(r.voz, "não_escolhida_para_TTS");
  assert.equal(r.quantidade_blocos, r.blocos.length);
  assert.equal(r.assinatura_sha256, digest(r.blocos));
  assert.equal(r.blocos[0].tipo, "titulo");
  assert.equal(r.blocos[0].texto, "Lula venceu. O que O Globo disse no dia seguinte?");
  assert.ok(r.blocos.some(b => b.texto.includes("Essa é a leitura política de José")));
  assert.ok(r.blocos.every(b => b.texto.length > 0 && !b.texto.includes("**")));
});
test("marcacao visual nao deve ser lida literalmente", () => {
  assert.equal(textoAudivel("**Quem decide?** E agora?"), "Quem decide? E agora?");
});
test("assinatura muda quando um bloco muda", () => {
  const a = [{ tipo: "paragrafo", texto: "Texto inicial." }];
  const b = [{ tipo: "paragrafo", texto: "Texto alterado." }];
  assert.notEqual(digest(a), digest(b));
});
test("rejeita interpolacao ou fonte invalida sem executar codigo", () => {
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), "fdp-roteiro-"));
  try {
    const origem = fs.readFileSync(path.join(__dirname, "../data/edicoes/rascunhos/lula-venceu-o-globo.ts"), "utf8");
    const errado = origem.replace('title: "Lula venceu. O que O Globo disse no dia seguinte?"', "title: `Título ${process.env.SEGREDO}`");
    const arquivo = path.join(pasta, "rascunho.ts");
    fs.writeFileSync(arquivo, errado);
    assert.throws(() => prepararRoteiro(arquivo), /texto literal/);
  } finally {
    fs.rmSync(pasta, { recursive: true, force: true });
  }
});
