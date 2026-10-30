// Prova integrada do fluxo real de rotas com PostgreSQL temporario.
// Nunca acessa a base de producao nem a API real do Telegram.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const ts = require("typescript");
const postgres = require("postgres");

const root = path.join(__dirname, "..");
const testDb = process.env.FDP_TEST_DATABASE_URL;

test("percurso completo: site -> bot -> concluir -> aviso (PostgreSQL real, Telegram falso)", {
  skip: !testDb,
}, async () => {
  // Uma base nova por teste impede interferencia inclusive nos demais testes CI.
  const admin = postgres(testDb, { max: 1 });
  const name = "fdp_tg_e2e_" + process.pid + "_" + crypto.randomBytes(3).toString("hex");
  const database = new URL(testDb);
  database.pathname = "/" + name;
  let sql;
  try {
    await admin.unsafe('CREATE DATABASE "' + name + '"');
    sql = postgres(database.toString(), { max: 6 });

    const ddl = [
      "CREATE TABLE public.telegram_sessoes_site (sessao_hash TEXT PRIMARY KEY, codigo_hash TEXT, codigo_expira_at TIMESTAMPTZ, expira_at TIMESTAMPTZ NOT NULL, candidaturas_pendentes TEXT[] NOT NULL DEFAULT '{}', telegram_chat_id BIGINT, vinculada_at TIMESTAMPTZ)",
      "CREATE TABLE public.telegram_preferencias (telegram_chat_id BIGINT NOT NULL, tipo TEXT NOT NULL, referencia TEXT NOT NULL DEFAULT '', status TEXT NOT NULL, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ, cancelled_at TIMESTAMPTZ, UNIQUE(telegram_chat_id,tipo,referencia))",
      "CREATE TABLE public.telegram_acompanhamentos (telegram_chat_id BIGINT NOT NULL, candidatura_id TEXT NOT NULL, identidade_politica_id TEXT, status TEXT NOT NULL, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ, cancelled_at TIMESTAMPTZ, UNIQUE(telegram_chat_id,candidatura_id))",
      "CREATE TABLE public.telegram_fila_avisos (id BIGSERIAL PRIMARY KEY, telegram_chat_id BIGINT NOT NULL, tipo TEXT, referencia TEXT, evento_id TEXT, texto TEXT, status TEXT DEFAULT 'pendente', tentativas INTEGER DEFAULT 0, proxima_tentativa_at TIMESTAMPTZ DEFAULT now(), processamento_iniciado_at TIMESTAMPTZ, updated_at TIMESTAMPTZ DEFAULT now(), enviado_at TIMESTAMPTZ, telegram_message_id BIGINT, ultimo_erro_codigo TEXT)",
    ];
    for (const query of ddl) await sql.unsafe(query);

    const env = {
      VERCEL_ENV: "preview",
      VERCEL_GIT_COMMIT_REF: "integracao/audio-telegram-voz-20261030",
      VERCEL_BRANCH_URL: "fora-da-pauta-ensaio-ci.vercel.app",
      FDP_TELEGRAM_E2E_READY: "isolated",
      FDP_TELEGRAM_TEST_DATABASE_URL: database.toString(),
      DATABASE_URL: database.toString(),
      FDP_TELEGRAM_TEST_BOT_TOKEN: "token-ficticio-ci",
      FDP_TELEGRAM_TEST_WEBHOOK_SECRET: "segredo-ci-teste",
      FDP_TELEGRAM_TEST_BOT_USERNAME: "FDPEnsaioTestBot",
      NODE_ENV: "test",
    };
    const processFake = { env };
    let browserCookie = null;
    const sent = [];
    const respond = (body, opts = {}) => ({
      body, status: opts.status || 200,
      headers: { set() {} },
      cookies: { set(name, value) {
        assert.equal(name, "fdp_tg_site_v1");
        browserCookie = value;
      } },
    });
    const NextResponse = {
      json: respond,
      redirect: (url, code) => Object.assign(respond(null, { status: code }), {
        url: String(url),
      }),
    };
    const cookieApi = {
      cookies: async () => ({
        get: name => name === "fdp_tg_site_v1" && browserCookie
          ? { value: browserCookie } : undefined,
      }),
    };
    const sendFake = async (url, options) => {
      assert.match(url, /^https:\/\/api\.telegram\.org\/bottoken-ficticio-ci\/sendMessage$/);
      const message = JSON.parse(options.body);
      sent.push(message);
      return {
        ok: true, status: 200,
        json: async () => ({ ok: true, result: { message_id: sent.length } }),
      };
    };

    function load(file, imports = {}) {
      const filePath = path.join(root, file);
      const compiled = ts.transpileModule(fs.readFileSync(filePath, "utf8"), {
        fileName: filePath,
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
        reportDiagnostics: true,
      });
      assert.equal((compiled.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error).length, 0);
      const module = { exports: {} };
      const allowed = Object.assign({
        "node:crypto": crypto,
        "next/server": { NextResponse },
        "next/headers": cookieApi,
        "@/lib/interesses/db": { sql },
        "../interesses/db": { sql },
        "server-only": {},
      }, imports);
      vm.runInNewContext(compiled.outputText, {
        module, exports: module.exports,
        require(name) {
          if (!Object.prototype.hasOwnProperty.call(allowed, name)) {
            throw Error("Importacao nao autorizada no teste: " + name);
          }
          return allowed[name];
        },
        process: processFake,
        console, URL, URLSearchParams, Buffer, Uint8Array, AbortSignal, fetch: sendFake,
      }, { filename: filePath, timeout: 2000 });
      return module.exports;
    }

    const ambiente = load("lib/telegram/ambiente.ts");
    assert.equal(ambiente.telegramLiberadoNesteAmbiente(), true);
    env.FDP_TELEGRAM_E2E_READY = "false";
    assert.equal(ambiente.telegramLiberadoNesteAmbiente(), false);
    env.FDP_TELEGRAM_E2E_READY = "isolated";
    env.DATABASE_URL = testDb; // uma URL diferente deve bloquear a preview
    assert.equal(ambiente.telegramLiberadoNesteAmbiente(), false);
    env.DATABASE_URL = database.toString();
    assert.equal(ambiente.telegramLiberadoNesteAmbiente(), true);

    const sessaoSite = load("lib/telegram/sessao-site.ts");
    const common = {
      "@/lib/telegram/ambiente": ambiente,
      "@/lib/telegram/sessao-site": sessaoSite,
      "@/lib/eleicoes/acompanhamento-politico": { idsAcompanhaveis: new Set(["100000000001"]) },
      "@/lib/eleicoes/identidade-politica": {
        buscarPessoaPoliticaConfirmadaPorCandidatura: id => id,
      },
      "@/data/eleicoes/candidaturas": {
        candidaturas: [{ id: "100000000001", nomeUrna: "Candidata de ensaio",
          nomeCompleto: "Candidata de ensaio", cargo: "deputada-federal",
          uf: "PR", siglaPartido: "TESTE", numero: 1111 }],
      },
      "@/data/eleicoes/eleitos": { eleitos2026: [] },
      "@/lib/eleicoes/formatar-cargo": { formatarCargo: () => "Deputada federal" },
      "@/lib/rateLimit": { consumeRateLimit: async () => ({ allowed: true }) },
    };
    const sessionRoute = load("app/api/telegram/sessao/route.ts", common);
    const webhook = load("app/api/telegram/webhook/route.ts", common);
    const concluir = load("app/api/telegram/concluir/route.ts", common);
    const processar = load("lib/telegram/processar-fila.ts", {
      "./ambiente": ambiente,
    }).processarFilaTelegram;

    const origin = "https://fora-da-pauta-ensaio-ci.vercel.app";
    const siteRequest = ids => ({
      url: origin + "/api/telegram/sessao",
      headers: { get: name => name === "origin" ? origin : null },
      json: async () => ({ ids }),
    });

    // 1. Visitante se inscreve sem selecionar pessoa politica.
    assert.equal((await sessionRoute.GET()).body.ativo, false);
    env.FDP_TELEGRAM_E2E_READY = "false";
    assert.equal((await sessionRoute.POST(siteRequest([]))).status, 503);
    env.FDP_TELEGRAM_E2E_READY = "isolated";
    const inicio = await sessionRoute.POST(siteRequest([]));
    assert.equal(inicio.status, 200);
    assert.match(inicio.body.url, /^https:\/\/t\.me\/FDPEnsaioTestBot\?start=s_/);
    assert.equal((await sessionRoute.GET()).body.ativo, false);
    const codigoInicio = new URL(inicio.body.url).searchParams.get("start");
    assert.match(codigoInicio, /^s_[A-Za-z0-9_-]{32}$/);

    // 2. Bot recebe /start autenticado e devolve o botao de conclusao.
    const chatId = 1001;
    const webhookRequest = (command, secret = env.FDP_TELEGRAM_TEST_WEBHOOK_SECRET) => ({
      headers: { get: name => name === "x-telegram-bot-api-secret-token" ? secret : null },
      json: async () => ({ message: { text: command, chat: { id: chatId, type: "private" } } }),
    });
    assert.equal((await webhook.POST(webhookRequest("/start " + codigoInicio, "errado"))).status, 401);
    assert.equal(sent.length, 0);
    assert.equal((await webhook.POST(webhookRequest("/start " + codigoInicio))).status, 200);
    const button = sent.at(-1).reply_markup.inline_keyboard[0][0];
    assert.equal(button.text, "Concluir a inscrição");
    assert.match(button.url, /^https:\/\/fora-da-pauta-ensaio-ci\.vercel\.app\/api\/telegram\/concluir\?codigo=/);
    assert.equal((await sessionRoute.GET()).body.ativo, false);

    // 3. Notificacao editorial fica pendente antes da conclusao.
    await sql.unsafe("INSERT INTO public.telegram_fila_avisos (telegram_chat_id,tipo,referencia,evento_id,texto) VALUES (1001,'edicoes','','ensaio:01','Aviso de teste sem destinatarios reais')");
    const antes = await processar();
    assert.equal(antes.enviados, 0);
    assert.equal(sent.length, 1);
    assert.equal((await sql.unsafe("SELECT status FROM public.telegram_fila_avisos"))[0].status, "pendente");

    // 4. Confirmacao cria cookie, autoriza a sessao e consome o link.
    const reqConcluir = url => ({ url, nextUrl: new URL(url) });
    const confirmado = await concluir.GET(reqConcluir(button.url));
    assert.equal(confirmado.status, 303);
    assert.match(confirmado.url, /retorno=telegram$/);
    assert.equal((await sessionRoute.GET()).body.ativo, true);
    assert.equal((await sessionRoute.GET()).body.novasEdicoes, true);
    const reutilizado = await concluir.GET(reqConcluir(button.url));
    assert.equal(reutilizado.status, 303);
    assert.match(reutilizado.url, /retorno=expirado$/);

    // 5. So depois da confirmacao o mesmo aviso e enviado uma vez.
    const depois = await processar();
    assert.equal(depois.enviados, 1);
    assert.equal(sent.length, 2);
    assert.equal(sent[1].text, "Aviso de teste sem destinatarios reais");
    assert.equal(sent[1].chat_id, "1001");
    assert.equal((await sql.unsafe("SELECT status FROM public.telegram_fila_avisos"))[0].status, "enviado");
    assert.equal((await processar()).enviados, 0);
    assert.equal(sent.length, 2);
  } finally {
    if (sql) await sql.end();
    try { await admin.unsafe('DROP DATABASE IF EXISTS "' + name + '" WITH (FORCE)'); }
    finally { await admin.end(); }
  }
});
