const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = p => fs.readFileSync(path.join(root,p),"utf8");

test("artigo aprovado está no catálogo de publicações", () => {
  const campanhas = read("data/campanhas.ts");
  const artigo = read("data/edicoes/rascunhos/lula-venceu-o-globo.ts");
  assert.match(campanhas, /lulaVenceuOGloboRascunho/);
  assert.match(artigo, /publishedAt:\s*"2026-10-31"/);
});
test("rota de prévia permanece protegida", () => {
  const route = read("app/previa-editorial/lula-venceu-o-globo/page.tsx");
  assert.match(route, /process\.env\.NODE_ENV !== "development"\) notFound\(\)/);
});
test("edição distingue fatos e análise, com fontes", () => {
  const artigo = read("data/edicoes/rascunhos/lula-venceu-o-globo.ts");
  assert.match(artigo, /Tribunal Superior Eleitoral/);
  assert.match(artigo, /Essa é uma interpretação política atribuída a José/);
  assert.match(artigo, /live original/);
});
