const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ler = (arquivo) => fs.readFileSync(
  path.join(__dirname, "..", arquivo), "utf8",
);

test("mensagem de início preserva botão para concluir", () => {
  const webhook = ler("app/api/telegram/webhook/route.ts");
  assert.match(webhook, /text: "Concluir a inscrição"/);
  assert.match(webhook, /\/api\/telegram\/concluir\?codigo=/);
  assert.match(webhook, /renovarLinkDeConclusao\(chatId\)/);
  assert.match(webhook, /\/concluir/);
});

test("fila mantém avisos pendentes até confirmação", () => {
  const fila = ler("lib/telegram/processar-fila.ts");
  assert.match(fila, /AND NOT EXISTS \(/);
  assert.match(fila, /pendente\.vinculada_at IS NULL/);
  assert.match(fila, /pendente\.codigo_hash IS NOT NULL/);
  assert.doesNotMatch(fila, /pendente\.expira_at > now\(\)/);
});

test("retorno confirma todas as sessões pendentes da pessoa", () => {
  const concluir = ler("app/api/telegram/concluir/route.ts");
  assert.match(concluir, /vinculada_at = COALESCE\(vinculada_at, now\(\)\)/);
  assert.match(concluir, /WHERE telegram_chat_id = \$\{chatId\}::bigint/);
  assert.match(concluir, /\/votou-fique-de-olho\?retorno=telegram/);
});

test("reinscrição não bloqueia usuário anteriormente confirmado", () => {
  const webhook = ler("app/api/telegram/webhook/route.ts");
  assert.match(webhook, /jaConfirmado/);
  assert.match(webhook, /THEN now\(\) ELSE NULL END/);
});

test("inscrição ainda pendente não aparece como concluída no navegador", () => {
  const sessao = ler("lib/telegram/sessao-site.ts");
  assert.match(sessao, /AND s\.vinculada_at IS NOT NULL/);
});
