const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const menu = fs.readFileSync("components/MenuPrincipal.tsx", "utf8");
const home = fs.readFileSync("components/HomeAcessoTelegram.tsx", "utf8");
const publicacoes = fs.readFileSync("app/edicoes/page.tsx", "utf8");
const admin = fs.readFileSync("app/admin/page.tsx", "utf8");

test("menu de lançamento não oferece recados ainda em validação", () => {
  assert.doesNotMatch(menu, /href="\/mandar-recado"/);
  assert.doesNotMatch(menu, /href="\/meus-recados"/);
});
test("áreas principais do lançamento permanecem acessíveis", () => {
  assert.match(menu, /href="\/edicoes"/);
  assert.match(menu, /href="\/acompanhar"/);
  assert.match(menu, /href="\/meus-acompanhamentos"/);
  assert.match(menu, /href="\/qr-code"/);
  assert.match(menu, /linkCompartilhamentoWhatsApp/);
});
test("publicações não apresentam botão desabilitado quando estão vazias", () => {
  assert.match(menu, /Novas análises em preparação/);
  assert.doesNotMatch(menu, /principalDesabilitado/);
  assert.match(publicacoes, /Novas análises em preparação/);
});
test("lançamento mantém a chamada pública ao canal e o acesso administrativo", () => {
  assert.match(home, /whatsapp\.com\/channel\//);
  assert.match(menu, /adminAutenticado/);
  assert.match(admin, /AdminLogin/);
});
