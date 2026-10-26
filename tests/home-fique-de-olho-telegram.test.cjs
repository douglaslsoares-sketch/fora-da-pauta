const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

const ler = (p) => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
const home = ler("app/page.tsx");
const css = ler("app/page.module.css");
const fluxo = ler("components/VotouFiqueDeOlhoExperience.tsx");

test("home preserva identidade e chamada editorial", () => {
  assert.match(home, /fora-da-pauta-branca\.png/);
  assert.match(home, /Há mais para entender\./);
  assert.match(home, /Como o jogo é jogado/);
  assert.match(home, /Decisões que afetam a sua vida\./);
  assert.match(home, /Fique de Olho/);
  assert.match(home, /Do povo para o povo\./);
  assert.match(home, /Sofremos por desconhecer o nosso próprio valor\./);
});

test("botão principal conduz à página de inscrição sem prometer inscrição imediata", () => {
  assert.match(home, /href="\/votou-fique-de-olho" className=\{styles\.primaryLink\}/);
  assert.match(home, /Inscreva-se no Telegram para receber as próximas novidades/);
  assert.doesNotMatch(home, /A inscrição é concluída no Telegram\./);
  assert.match(fluxo, /A inscrição é concluída no Telegram/);
  assert.match(fluxo, /decisões que afetam a sua vida/);
});

test("continuidade preserva seleção e permite receber novidades sem seguir político", () => {
  assert.doesNotMatch(fluxo, /<span>Continuar<\/span>/);
  assert.match(fluxo, /setInscricaoGeral\(true\)/);
  assert.match(fluxo, /setEtapa\("telegram"\)/);
  assert.match(fluxo, /<span>Inscreva-se no Telegram para receber as próximas novidades<\/span>/);
  assert.match(fluxo, /Não é necessário escolher nenhum representante/);
  assert.match(fluxo, /setInscricaoGeral\(false\)/);
});

test("contraste e responsividade sem interferir nas outras páginas", () => {
  assert.match(css, /\.featureTitle[\s\S]*?#ffc400/);
  assert.match(css, /\.primaryArrow/);
  assert.match(css, /@media \(max-width: 767px\)/);
});
