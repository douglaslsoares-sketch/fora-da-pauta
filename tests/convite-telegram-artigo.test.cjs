const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const artigo = fs.readFileSync(path.join(__dirname, "../components/ArtigoSimples.tsx"), "utf8");
const convite = fs.readFileSync(path.join(__dirname, "../components/ConviteTelegramArtigo.tsx"), "utf8");
const metadados = fs.readFileSync(path.join(__dirname, "../app/campanhas/[slug]/page.tsx"), "utf8");
test("o convite aparece depois do artigo, antes do compartilhamento", () => {
  assert.ok(artigo.indexOf("</article>") < artigo.indexOf("<ConviteTelegramArtigo />"));
  assert.ok(artigo.indexOf("<ConviteTelegramArtigo />") < artigo.indexOf('aria-labelledby="compartilhar-artigo"'));
});
test("o convite exige sessao confirmada de nao inscrito", () => {
  assert.match(convite, /situacao\.ativo === false/);
  assert.match(convite, /if \(!mostrarConvite\) return null;/);
  assert.match(convite, /href="\/votou-fique-de-olho"/);
});
test("arte e previa apontam para a imagem nova, sem reusar a antiga", () => {
  assert.match(artigo, /const arteUrl = "\/compartilhar\/olho-v2"/);
  assert.match(metadados, /\/compartilhar\/olho-v2/);
});
