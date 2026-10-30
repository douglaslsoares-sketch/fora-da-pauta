const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const ts = require("typescript");

const file = path.join(__dirname, "..", "app", "api", "telegram", "concluir", "route.ts");
const src = fs.readFileSync(file, "utf8");
const code = ts.transpileModule(src, {
  fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  reportDiagnostics: true,
});
assert.equal((code.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error).length, 0);

function fixture() {
  const codigo = crypto.randomBytes(24).toString("base64url");
  const codigoHash = crypto.createHash("sha256").update(codigo).digest("hex");
  const state = { returnHash: codigoHash, chatId: "300", added: [], calls: 0 };
  const sql = (strings, ...args) => {
    const query = strings.join("?").replace(/\s+/g, " ").trim();
    if (query.includes("SELECT telegram_chat_id::text") && query.includes("codigo_hash")) {
      return Promise.resolve(args[0] === state.returnHash ? [{ telegram_chat_id: state.chatId }] : []);
    }
    if (query.startsWith("INSERT INTO public.telegram_sessoes_site")) {
      state.added.push({ sessionHash: args[0], chatId: String(args[2]) });
      return Promise.resolve([]);
    }
    if (query.startsWith("UPDATE public.telegram_sessoes_site")) {
      if (String(args[0]) !== state.chatId) throw Error("Chat inesperado");
      state.returnHash = null;
      state.calls++;
      return Promise.resolve([]);
    }
    throw Error("SQL inesperado: " + query);
  };
  sql.begin = cb => cb(sql);
  const mod = { exports: {} };
  const imports = {
    "node:crypto": crypto,
    "next/server": {
      NextResponse: {
        redirect: (url, status) => ({
          url: url.toString(), status,
          headers: { set(name, value) { this[name] = value; } },
          cookies: { set(name, value, options) { this.value = value; this.name = name; this.options = options; } },
        }),
      },
    },
    "@/lib/interesses/db": { sql },
    "@/lib/telegram/sessao-site": {
      COOKIE_SESSAO_TELEGRAM: "fdp_tg_site_v1", DIAS_SESSAO: 180,
      hashSessao: token => crypto.createHash("sha256").update(token).digest("hex"),
    },
  };
  vm.runInNewContext(code.outputText, {
    module: mod, exports: mod.exports, require: name => {
      assert.ok(imports[name], "Importação inesperada: " + name);
      return imports[name];
    },
    URL, process: { env: { NODE_ENV: "production" } },
  }, { filename: file, timeout: 1000 });
  const request = token => ({
    url: "https://www.foradapauta.org/api/telegram/concluir?codigo=" + token,
    nextUrl: new URL("https://www.foradapauta.org/api/telegram/concluir?codigo=" + token),
  });
  return { codigo, state, module: mod.exports, request };
}

test("conclui vinculo no navegador aberto pelo Telegram, sem mudar conta anterior", async () => {
  const f = fixture();
  const r = await f.module.GET(f.request(f.codigo));
  assert.equal(r.status, 303);
  assert.match(r.url, /\/votou-fique-de-olho\?retorno=telegram$/);
  assert.equal(r.cookies.name, "fdp_tg_site_v1");
  assert.equal(r.cookies.options.httpOnly, true);
  assert.equal(r.cookies.options.secure, true);
  assert.equal(f.state.added.length, 1);
  assert.equal(f.state.added[0].chatId, "300");
  assert.notEqual(f.state.returnHash, crypto.createHash("sha256").update(f.codigo).digest("hex"));
  assert.ok(!r.url.includes(f.codigo));
});

test("o mesmo link não pode ser usado duas vezes", async () => {
  const f = fixture();
  await f.module.GET(f.request(f.codigo));
  const r = await f.module.GET(f.request(f.codigo));
  assert.equal(r.status, 303);
  assert.match(r.url, /retorno=expirado$/);
  assert.equal(r.cookies.value, undefined);
  assert.equal(f.state.added.length, 1);
});

test("código inválido não cria cookie nem nova sessão", async () => {
  const f = fixture();
  const r = await f.module.GET(f.request("codigo-invalido"));
  assert.match(r.url, /retorno=telegram$/);
  assert.equal(r.cookies.value, undefined);
  assert.equal(f.state.added.length, 0);
});
