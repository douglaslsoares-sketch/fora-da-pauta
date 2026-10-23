#!/usr/bin/env node
"use strict";
// Somente leitura. Não mostra credenciais nem mensagens.
const postgres = require("postgres");
const raw = process.env.INTERACOES_TEST_DATABASE_URL || process.env.DATABASE_URL;
if (!raw) {
  process.stderr.write("Conexão não configurada.\n");
  process.exitCode = 2;
} else {
  const url = new URL(raw); url.searchParams.delete("schema");
  const sql = postgres(url.toString(), { max: 1, connect_timeout: 8, idle_timeout: 3 });
  const tabelas = ["telegram_sessoes_site","telegram_acompanhamentos","telegram_preferencias",
    "rate_limit_buckets","interacoes_politicas","interacoes_politicas_historico"];
  (async () => {
    try {
      const resultados = await sql.begin(async tx => {
        await tx.unsafe("SET TRANSACTION READ ONLY");
        return tx.unsafe("SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = $1", ["public"]);
      });
      const existentes = new Map();
      for (const item of resultados) {
        if (!existentes.has(item.table_name)) existentes.set(item.table_name, new Set());
        existentes.get(item.table_name).add(item.column_name);
      }
      for (const t of tabelas) {
        const ok = existentes.has(t);
        process.stdout.write((ok ? "OK " : "AUSENTE ") + t + "\n");
        if (!ok) process.exitCode = 1;
      }
      for (const [t, cols] of Object.entries({
        interacoes_politicas: ["id","telegram_chat_id","candidatura_id","categoria","mensagem",
          "autorizacao_encaminhamento_at","status","notificacao_status",
          "resposta_texto","resposta_autoria","resposta_origem_verificada"],
        interacoes_politicas_historico: ["id","interacao_id","evento","registrado_at"],
      })) for (const col of cols) if (!existentes.get(t)?.has(col)) {
        process.stdout.write("COLUNA AUSENTE " + t + "." + col + "\n");
        process.exitCode = 1;
      }
      if (!process.exitCode) process.stdout.write("Verificação somente-leitura aprovada.\n");
    } catch {
      process.stderr.write("Falha ao consultar o esquema. Nenhuma alteração foi feita.\n");
      process.exitCode = 2;
    } finally {
      await sql.end({ timeout: 3 });
    }
  })();
}
