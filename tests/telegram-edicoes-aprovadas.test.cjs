const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const raiz = path.join(__dirname, "..");
const ler = (p) => fs.readFileSync(path.join(raiz,p),"utf8");
test("nenhuma nova edição foi aprovada para envio", () => {
  const fonte = ler("data/edicoes/avisos-aprovados.ts");
  assert.match(fonte, /avisosEdicoesAprovados: readonly AvisoEdicaoAprovado\[\] = \[\]/);
});
test("sem aprovação não há acesso à fila nem ao banco", () => {
  const coleta = ler("lib/telegram/coletar-novidades-edicoes.ts");
  assert.match(coleta, /if \(eventos\.length === 0\)/);
  assert.match(coleta, /semAprovacaoEditorial: true/);
});
test("registro de edição notifica somente inscritos antes da publicação", () => {
  const fila = ler("lib/telegram/registrar-novidades.ts");
  assert.match(fila, /tipo === "edicoes" && evento\.id\.startsWith\("edicao:"\)/);
  assert.match(fila, /created_at <= \$\{evento\.publicadoEm \?\? null\}::timestamptz/);
  assert.match(fila, /updated_at <= \$\{evento\.publicadoEm \?\? null\}::timestamptz/);
});
