const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const dados = fs.readFileSync("data/editorial/primeira-edicao.ts", "utf8");
const pagina = fs.readFileSync("app/admin/artigos/previa-primeira-edicao/page.tsx", "utf8");
const botao = fs.readFileSync("components/CriarRascunhoPrimeiraEdicao.tsx", "utf8");
const admin = fs.readFileSync("app/admin/artigos/page.tsx", "utf8");

test("edição mantém a última redação e a fonte", () => {
  assert.match(dados, /Por que pagamos tantos juros\?/);
  assert.match(dados, /Por que não tocam nesse assunto\?/);
  assert.match(dados, /1 trilhão e 205 bilhões de reais/);
  assert.match(dados, /estatisticasfiscais/);
  assert.match(dados, /não necessariamente desembolso/);
});
test("prévia é privada e não indexada", () => {
  assert.match(pagina, /verifyQuestionsAdminSessionToken/);
  assert.match(pagina, /index: false/);
  assert.match(pagina, /NÃO PUBLICADA/);
});
test("rascunho criado somente por ação do editor autenticado", () => {
  assert.match(botao, /onClick/);
  assert.match(botao, /\/api\/admin\/artigos/);
  assert.match(botao, /const existente =/);
  assert.doesNotMatch(botao, /\/api\/admin\/artigos\/publicacao/);
  assert.match(admin, /href="\/admin\/artigos\/previa-primeira-edicao"/);
});
