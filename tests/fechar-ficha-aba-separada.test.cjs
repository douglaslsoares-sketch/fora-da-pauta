const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const read = p => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
test("ficha aberta pela busca é marcada como aba separada", () => {
  const src = read("components/CandidateSelector.tsx");
  assert.match(src, /\/pessoas\/\$\{candidate\.pessoaPoliticaId\}\?aba=separada/);
  assert.match(src, /\/conheca-seu-candidato\/\$\{candidate\.id\}\?aba=separada/);
  assert.match(src, /target="_blank"/);
});
test("fechar ficha tenta fechar a aba e orienta caso bloqueado", () => {
  const src = read("components/FecharFichaLink.tsx");
  assert.match(src, /window\.close\(\)/);
  assert.match(src, /window\.closed/);
  assert.match(src, /setFechamentoBloqueado\(true\)/);
  assert.match(src, /Feche esta aba pelo X/);
  assert.match(src, /router\.back\(\)/);
});
