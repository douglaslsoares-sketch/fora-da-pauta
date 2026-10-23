const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const crypto = require("node:crypto");
const ts = require("typescript");
const postgres = require("postgres");

const url = process.env.INTERACOES_TEST_DATABASE_URL;
if (!url || !/^postgres(?:ql)?:\/\/[^/]+@(?:127\.0\.0\.1|localhost):5432\//.test(url)) {
  throw Error("Recusado: teste só pode usar PostgreSQL local em localhost:5432.");
}
const sql = postgres(url, { max: 3 });
const candidato = "160002536522", chatA = "4411001", chatB = "4411002";
const sha = value => crypto.createHash("sha256").update(value).digest("hex");

function carregar(arquivo, imports, env, fetcher) {
  const filename = path.resolve(__dirname, "..", arquivo);
  const js = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    fileName: filename, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const mod = { exports: {} };
  vm.runInNewContext(js.outputText, {
    module: mod, exports: mod.exports,
    require: name => {
      assert.ok(Object.hasOwn(imports, name), "Import inesperado: " + name);
      return imports[name];
    },
    URL, AbortSignal, console, Buffer, fetch: fetcher,
    process: { env: env || { FDP_INTERACOES_HABILITADAS: "1", TELEGRAM_BOT_TOKEN: "token-ficticio" } },
  }, { filename, timeout: 1000 });
  return mod.exports;
}
const NextResponse = { json: (body, args = {}) => ({ body, status: args.status || 200 }) };
const request = (pathname, body) => ({
  url: "https://www.foradapauta.org" + pathname,
  headers: { get: key => key === "origin" ? "https://www.foradapauta.org" : null },
  json: async () => body,
});

test("fluxo completo no PostgreSQL isolado e Telegram simulado", async t => {
  try {
    await t.test("migração repetível e sessões de dois usuários", async () => {
      const ddl = fs.readFileSync(path.resolve(__dirname, "../scripts/sql/interacoes-politicas.sql"), "utf8");
      await sql.unsafe(ddl);
      await sql.unsafe(ddl);
      await sql.unsafe("CREATE TABLE public.telegram_sessoes_site (sessao_hash text PRIMARY KEY, expira_at timestamptz NOT NULL, telegram_chat_id bigint NOT NULL)");
      await sql.unsafe("INSERT INTO public.telegram_sessoes_site VALUES ($1, now() + interval '1 day', $2::bigint), ($3, now() + interval '1 day', $4::bigint)", [sha("sessao-a"), chatA, sha("sessao-b"), chatB]);
    });
    let protocolo;
    await t.test("registro com consentimento gera protocolo sem divulgar chat", async () => {
      const api = carregar("app/api/interacoes/route.ts", {
        "next/server": { NextResponse },
        "@/lib/interesses/db": { sql },
        "@/lib/telegram/sessao-site": { tokenSessao: async () => "sessao-a", hashSessao: sha },
        "@/lib/rateLimit": { consumeRateLimit: async () => ({ allowed: true }) },
        "@/lib/eleicoes/acompanhamento-politico": { idsAcompanhaveis: new Set([candidato]) },
      });
      const body = {
        candidaturaId: candidato, categoria: "pergunta",
        mensagem: "Como o gabinete acompanha as votações deste tema?",
        origemCaminho: "/conheca-seu-candidato/" + candidato,
        consentiu: true,
      };
      assert.equal((await api.POST(request("/api/interacoes", { ...body, consentiu: false }))).status, 400);
      const r = await api.POST(request("/api/interacoes", body));
      assert.equal(r.status, 201);
      protocolo = r.body.protocolo;
      assert.match(protocolo, /^[0-9a-f-]{36}$/);
      assert.ok(!JSON.stringify(r.body).includes(chatA));
      const rows = await sql.unsafe("SELECT telegram_chat_id::text AS chat, status FROM public.interacoes_politicas WHERE id=$1::uuid", [protocolo]);
      assert.equal(rows[0].chat, chatA);
      assert.equal(rows[0].status, "recebida");
      const historico = await sql.unsafe("SELECT evento FROM public.interacoes_politicas_historico WHERE interacao_id=$1::uuid", [protocolo]);
      assert.deepEqual(historico.map(x => x.evento), ["recebida"]);
    });
    await t.test("somente remetente consulta sua manifestação", async () => {
      const minha = sessao => carregar("app/api/interacoes/minhas/route.ts", {
        "next/server": { NextResponse },
        "@/lib/interesses/db": { sql },
        "@/lib/telegram/sessao-site": { tokenSessao: async () => sessao, hashSessao: sha },
      });
      const b = await minha("sessao-b").GET();
      assert.equal(b.body.registros.length, 0);
      const a = await minha("sessao-a").GET();
      assert.equal(a.body.registros[0].id, protocolo);
      assert.ok(!JSON.stringify(a.body).includes("telegram_chat_id"));
    });
    await t.test("triagem segue etapas e exige comprovação de fonte", async () => {
      const api = carregar("app/api/admin/interacoes/route.ts", {
        "next/server": { NextResponse },
        "next/headers": { cookies: async () => ({ get: () => ({ value: "admin-teste" }) }) },
        "@/lib/questionsAdminAuth": {
          QUESTIONS_ADMIN_COOKIE: "fdp_questions_admin",
          verifyQuestionsAdminSessionToken: token => token === "admin-teste",
        },
        "@/lib/interesses/db": { sql },
        "@/lib/rateLimit": { consumeRateLimit: async () => ({ allowed: true }) },
      });
      const enviar = data => api.POST(request("/api/admin/interacoes", { id: protocolo, ...data }));
      assert.equal((await enviar({ status: "respondida", respostaTexto: "Não autorizada" })).status, 400);
      assert.equal((await enviar({ status: "em_analise" })).status, 200);
      assert.equal((await enviar({ status: "encaminhada", destinoOficial: "gabinete", fonteOficial: "http://não-valido" })).status, 400);
      assert.equal((await enviar({
        status: "encaminhada", destinoOficial: "Canal institucional (simulado)",
        fonteOficial: "https://www.camara.leg.br/",
      })).status, 200);
      assert.equal((await enviar({
        status: "respondida", respostaTexto: "O gabinete recebeu a pergunta e analisará os documentos.",
        autoria: "assessoria", origemResposta: "Comprovação simulada para teste isolado",
      })).status, 200);
      assert.equal((await enviar({
        status: "respondida", respostaTexto: "Resposta duplicada",
        autoria: "assessoria", origemResposta: "Outro registro",
      })).status, 409);
      const rows = await sql.unsafe("SELECT status, notificacao_status FROM public.interacoes_politicas WHERE id=$1::uuid", [protocolo]);
      assert.equal(rows[0].status, "respondida");
      assert.equal(rows[0].notificacao_status, "pendente");
    });
    await t.test("Telegram simulado entrega uma única resposta ao remetente", async () => {
      const enviados = [];
      const fakeFetch = async (url, options) => {
        assert.ok(url.endsWith("/bottoken-ficticio/sendMessage"));
        enviados.push(JSON.parse(options.body));
        return { json: async () => ({ ok: true, result: { message_id: 321 } }) };
      };
      const worker = carregar("lib/telegram/processar-respostas-interacoes.ts", {
        "server-only": {}, "@/lib/interesses/db": { sql },
      }, { TELEGRAM_BOT_TOKEN: "token-ficticio" }, fakeFetch);
      await worker.processarRespostasInteracoes();
      await worker.processarRespostasInteracoes();
      assert.equal(enviados.length, 1);
      assert.equal(String(enviados[0].chat_id), chatA);
      assert.ok(enviados[0].text.includes(protocolo));
      const rows = await sql.unsafe("SELECT notificacao_status, telegram_message_id FROM public.interacoes_politicas WHERE id=$1::uuid", [protocolo]);
      assert.equal(rows[0].notificacao_status, "enviado");
      assert.equal(String(rows[0].telegram_message_id), "321");
    });
  } finally {
    await sql.end();
  }
});
