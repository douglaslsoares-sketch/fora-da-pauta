const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

const origem = fs.readFileSync(path.join(__dirname, "..", "scripts", "gerar-atuacao-proposicoes-politicas.ps1"), "utf8");

test("CSV baixa para arquivo temporario e so entao substitui o anterior", () => {
  assert.match(origem, /\$tmp\s*=\s*"\$destino\.tmp"/);
  assert.match(origem, /-OutFile \$tmp/);
  assert.match(origem, /Move-Item\s+`\s*\n\s*-LiteralPath \$tmp/);
});

test("reexecuta downloads com limite, espera e rejeita falha definitiva", () => {
  assert.match(origem, /\$tentativa = 1; \$tentativa -le 4;/);
  assert.match(origem, /-TimeoutSec 180/);
  assert.match(origem, /Start-Sleep -Seconds \$espera/);
  assert.match(origem, /Falha no download de proposicoes apos 4 tentativas/);
});

test("nao usa fallback de CSV obsoleto nem apaga arquivo de destino no erro", () => {
  assert.doesNotMatch(origem, /Remove-Item\s+-LiteralPath \$destino/);
  assert.match(origem, /Arquivo CSV ausente ou incompleto/);
});
