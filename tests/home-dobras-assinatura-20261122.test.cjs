const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const home = fs.readFileSync("components/HomeAcessoTelegram.tsx","utf8");
const css = fs.readFileSync("app/page.module.css","utf8");
const page = fs.readFileSync("app/page.tsx","utf8");

test("assinatura aparece só na primeira dobra", () => {
  assert.match(home, /<h1 id="mensagem-principal"[^>]+>Há mais para entender\.<\/h1>/);
  assert.doesNotMatch(home, /Conhecer é importante\./);
  assert.doesNotMatch(home, /Uma ponte entre a informação e o entendimento\./);
});
test("segunda dobra mantém só as duas frases aprovadas", () => {
  const segunda = home.split('id="contextualizacao"')[1].split('id="acompanhe"')[0];
  assert.match(segunda,/Todos os dias recebemos notícias sobre decisões que afetam nossa vida\./);
  assert.match(segunda,/Mas o que ficou de fora\? O que não foi explicado\? Quais interesses estão envolvidos\?/);
  assert.doesNotMatch(segunda,/Há mais para entender\./);
  assert.match(css,/\.perguntasDobra/);
});
test("terceira dobra convida ao acompanhamento e é seguida pelo menu", () => {
  assert.match(home,/Acompanhe o Fora da Pauta\./);
  assert.match(home,/Receba avisos de novas publicações\./);
  assert.match(home,/É gratuito\./);
  assert.match(home,/href="https:\/\/whatsapp\.com\/channel\//);
  assert.match(page,/<HomeAcessoTelegram[^>]+\/>[\s\S]*<MenuPrincipal/);
});
