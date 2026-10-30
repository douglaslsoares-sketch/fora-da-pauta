const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = (filename) =>
  fs.readFileSync(path.join(__dirname, "..", filename), "utf8");

test("áudio compartilhado usa banco existente e tem chave por conteúdo e instruções", () => {
  const cache = read("lib/audio-cache.ts");
  const route = read("app/api/audio/ler/route.ts");

  assert.match(cache, /import \{ sql \} from "@\/lib\/interesses\/db"/);
  assert.match(cache, /CREATE TABLE IF NOT EXISTS fdp_audio_cache/);
  assert.match(cache, /pg_advisory_xact_lock/);
  assert.match(cache, /SELECT arquivo[\s\S]*FROM fdp_audio_cache/);
  assert.match(cache, /if \(encontrados\.length > 0\)/);
  assert.match(cache, /INSERT INTO fdp_audio_cache/);

  assert.match(route, /createHash\("sha256"\)/);
  assert.match(route, /texto,\s*instrucoes,/);
  assert.match(route, /obterOuGerarAudioCompartilhado/);
  assert.match(route, /"X-FDP-Audio-Cache"/);
});

test("audio limita novas geracoes pagas sem impedir reutilização", () => {
  const cache = read("lib/audio-cache.ts");
  const route = read("app/api/audio/ler/route.ts");
  const reuseIndex = cache.indexOf("if (encontrados.length > 0)");
  const quotaIndex = cache.indexOf("UPDATE fdp_audio_geracoes_diarias");
  assert.ok(reuseIndex > 0 && quotaIndex > reuseIndex);
  assert.match(cache, /LIMITE_GERACOES_DIA = 30/);
  assert.match(cache, /WHERE dia = CURRENT_DATE[\s\S]*total < \$\{LIMITE_GERACOES_DIA\}/);
  assert.match(route, /error instanceof LimiteDeAudioAtingido/);
});

test("narração preserva Marin, voz acolhedora e ritmo acordado", () => {
  const route = read("app/api/audio/ler/route.ts");
  assert.match(route, /voice: "marin"/);
  assert.match(route, /calorosa, acolhedora/);
  assert.match(route, /20% a 25%/);
  assert.match(route, /Preserve rigorosamente o conteúdo fornecido/);
  assert.match(route, /Não fale como locutor, apresentador ou atendente/);
});

test("notificações ficam em fila enquanto retorno ao site for pendente", () => {
  const queue = read("lib/telegram/processar-fila.ts");
  const webhook = read("app/api/telegram/webhook/route.ts");
  const concluir = read("app/api/telegram/concluir/route.ts");
  assert.match(queue, /AND NOT EXISTS \([\s\S]*?FROM public.telegram_sessoes_site AS pendente/);
  assert.match(queue, /pendente\.vinculada_at IS NULL/);
  assert.match(queue, /pendente\.codigo_hash IS NOT NULL/);
  assert.match(webhook, /vinculada_at = CASE WHEN \$\{jaConfirmado\[0\]\?\.pronto === true\}/);
  assert.match(concluir, /vinculada_at = COALESCE\(vinculada_at, now\(\)\)/);
});

test("retomada da inscrição não exige outro número de telefone", () => {
  const webhook = read("app/api/telegram/webhook/route.ts");
  assert.match(webhook, /renovarLinkDeConclusao\(chatId\)/);
  assert.match(webhook, /\/concluir/);
  assert.match(webhook, /text: "Concluir a inscrição"/);
  assert.match(webhook, /codigo_expira_at = now\(\) \+ interval '7 days'/);
});
