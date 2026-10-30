// Testes com PostgreSQL de verdade, mas isolado do projeto e sem usar
// contas de Telegram, chaves da OpenAI nem credenciais de produção.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const postgres = require("postgres");

const databaseUrl = process.env.FDP_TEST_DATABASE_URL;

function loadModule(filename, sql, globals = {}) {
  const absolute = path.join(__dirname, "..", filename);
  const code = ts.transpileModule(fs.readFileSync(absolute, "utf8"), {
    fileName: absolute,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  assert.deepEqual(
    (code.diagnostics || []).filter(x => x.category === ts.DiagnosticCategory.Error),
    [],
  );
  const module = { exports: {} };
  vm.runInNewContext(code.outputText, {
    module, exports: module.exports,
    require(name) {
      if (name === "server-only") return {};
      if (name === "./ambiente") return {
        telegramLiberadoNesteAmbiente: () => true,
        tokenBotTelegram: () => "token-ficticio",
      };
      if (name === "@/lib/interesses/db" || name === "../interesses/db") return { sql };
      throw Error("Importação não autorizada no teste: " + name);
    },
    Buffer, Uint8Array, AbortSignal, URL, process,
    console: { error() {} },
    ...globals,
  }, { filename: absolute, timeout: 2000 });
  return module.exports;
}

test("banco real: gera uma vez, guarda BYTEA e reutiliza mesmo sob concorrência", {
  skip: !databaseUrl,
}, async () => {
  const sql = postgres(databaseUrl, { max: 7 });
  try {
    const { obterOuGerarAudioCompartilhado } = loadModule("lib/audio-cache.ts", sql);
    let chamadas = 0;
    const gerar = async () => {
      chamadas++;
      await new Promise(resolve => setTimeout(resolve, 30));
      return Uint8Array.from([0x49, 0x44, 0x33, 0x01, 0x02]);
    };

    const resultados = await Promise.all([
      obterOuGerarAudioCompartilhado("teste-banco-cache-01", gerar),
      obterOuGerarAudioCompartilhado("teste-banco-cache-01", gerar),
      obterOuGerarAudioCompartilhado("teste-banco-cache-01", gerar),
    ]);
    assert.equal(chamadas, 1, "três visitantes geraram o áudio mais de uma vez");
    assert.deepEqual(resultados.map(x => x.geradoAgora).sort(), [false, false, true]);
    for (const result of resultados) {
      assert.deepEqual(Array.from(result.arquivo), [0x49, 0x44, 0x33, 0x01, 0x02]);
    }

    const armazenados = await sql`
      SELECT count(*)::int AS total FROM fdp_audio_cache
      WHERE chave = 'teste-banco-cache-01'
    `;
    assert.equal(armazenados[0].total, 1);

    await sql`
      UPDATE fdp_audio_geracoes_diarias SET total = 30
      WHERE dia = CURRENT_DATE
    `;
    const reutilizado = await obterOuGerarAudioCompartilhado(
      "teste-banco-cache-01", gerar,
    );
    assert.equal(reutilizado.geradoAgora, false);
    await assert.rejects(
      () => obterOuGerarAudioCompartilhado("teste-banco-cache-02", gerar),
      (erro) => erro.name === "LimiteDeAudioAtingido",
    );
    assert.equal(chamadas, 1);
  } finally {
    await sql.end();
  }
});

test("banco real: aviso pendente só é entregue após concluir inscrição", {
  skip: !databaseUrl,
}, async () => {
  const sql = postgres(databaseUrl, { max: 6 });
  const enviados = [];
  try {
    await sql`
      CREATE TABLE public.telegram_sessoes_site (
        telegram_chat_id BIGINT, vinculada_at TIMESTAMPTZ,
        codigo_hash TEXT, expira_at TIMESTAMPTZ
      )
    `;
    await sql`
      CREATE TABLE public.telegram_preferencias (
        telegram_chat_id BIGINT, tipo TEXT,
        referencia TEXT, status TEXT, cancelled_at TIMESTAMPTZ
      )
    `;
    await sql`
      CREATE TABLE public.telegram_acompanhamentos (
        telegram_chat_id BIGINT, candidatura_id TEXT, status TEXT,
        cancelled_at TIMESTAMPTZ
      )
    `;
    await sql`
      CREATE TABLE public.telegram_fila_avisos (
        id BIGSERIAL PRIMARY KEY, telegram_chat_id BIGINT,
        tipo TEXT, referencia TEXT, evento_id TEXT, texto TEXT,
        status TEXT DEFAULT 'pendente', tentativas INTEGER DEFAULT 0,
        proxima_tentativa_at TIMESTAMPTZ DEFAULT now(),
        processamento_iniciado_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ DEFAULT now(),
        enviado_at TIMESTAMPTZ, telegram_message_id BIGINT,
        ultimo_erro_codigo TEXT
      )
    `;
    await sql`
      INSERT INTO public.telegram_sessoes_site
        (telegram_chat_id, vinculada_at, codigo_hash, expira_at)
      VALUES (1001, NULL, 'token-de-teste', now() + interval '30 days')
    `;
    await sql`
      INSERT INTO public.telegram_preferencias
        (telegram_chat_id, tipo, referencia, status, cancelled_at)
      VALUES (1001, 'novas_edicoes', '', 'ativo', NULL)
    `;
    await sql`
      INSERT INTO public.telegram_fila_avisos
        (telegram_chat_id, tipo, referencia, evento_id, texto)
      VALUES (1001, 'edicoes', '', 'teste:edicao:01', 'Aviso fictício')
    `;
    const processar = loadModule("lib/telegram/processar-fila.ts", sql, {
      process: { env: { TELEGRAM_BOT_TOKEN: "token-ficticio" } },
      fetch: async (_url, options) => {
        enviados.push(JSON.parse(options.body));
        return { status: 200, json: async () => ({
          ok: true, result: { message_id: 1234 },
        }) };
      },
    }).processarFilaTelegram;

    const antes = await processar();
    assert.equal(antes.enviados, 0);
    assert.equal(enviados.length, 0);
    let filas = await sql`SELECT status FROM public.telegram_fila_avisos`;
    assert.equal(filas[0].status, "pendente");

    await sql`
      UPDATE public.telegram_sessoes_site
      SET vinculada_at = now(), codigo_hash = NULL
      WHERE telegram_chat_id = 1001
    `;

    const depois = await processar();
    assert.equal(depois.enviados, 1);
    assert.equal(enviados.length, 1);
    assert.equal(enviados[0].text, "Aviso fictício");
    filas = await sql`SELECT status FROM public.telegram_fila_avisos`;
    assert.equal(filas[0].status, "enviado");
  } finally {
    await sql.end();
  }
});
