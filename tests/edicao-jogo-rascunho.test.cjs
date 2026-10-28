const {test} = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname,"..");
const read = (p) => fs.readFileSync(path.join(root,p),"utf8");
test("rascunho não entra na lista publicada", () => {
 const campanhas=read("data/campanhas.ts");
 assert.doesNotMatch(campanhas, /slug:\s*["']o-jogo-sendo-jogado["']/);
 const draft=read("data/edicoes/rascunhos/o-jogo-sendo-jogado.ts");
 assert.doesNotMatch(draft,/^\s*publishedAt:/m);
});
test("prévia não é servida em produção", () => {
 const route=read("app/previa-editorial/o-jogo-sendo-jogado/page.tsx");
 assert.match(route,/process\.env\.NODE_ENV !== "development"\) notFound\(\)/);
 assert.match(route,/index: false/);
});
test("rascunho distingue fontes e interpretação", () => {
 const draft=read("data/edicoes/rascunhos/o-jogo-sendo-jogado.ts");
 assert.match(draft,/Tribunal Superior Eleitoral/);
 assert.match(draft,/Essa é uma interpretação política atribuída a José/);
 assert.match(draft,/live original/);
});
