const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const crypto = require("node:crypto");
const ts = require("typescript");

const source = fs.readFileSync("app/api/integracoes/resend-teste/route.ts", "utf8");
const transpiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const segredo = "whsec_" + Buffer.alloc(32, 7).toString("base64");

function obterHandler(env) {
  const moduleObj = { exports: {} };
  vm.runInNewContext(transpiled.outputText, {
    module: moduleObj, exports: moduleObj.exports,
    require(name) {
      if (name === "node:crypto") return crypto;
      if (name === "next/server") return {
        NextResponse: {
          json(body, options = {}) {
            return { status: options.status ?? 200, body };
          },
        },
      };
      throw new Error("Dependência inesperada: " + name);
    },
    process: { env },
    Buffer, Date, Math,
  });
  return moduleObj.exports.POST;
}

function request(body, signature = "", timestamp = String(Math.floor(Date.now() / 1000))) {
  const id = "msg_teste_abc";
  return {
    headers: new Map([
      ["content-length", String(Buffer.byteLength(body))],
      ["svix-id", id],
      ["svix-timestamp", timestamp],
      ["svix-signature", signature],
    ]),
    async text() { return body; },
  };
}

test("inativo por padrão, mesmo diante de chamada HTTP", async () => {
  const handler = obterHandler({});
  const r = await handler(request('{"type":"email.received"}'));
  assert.equal(r.status, 503);
});

test("recusa corpo sem assinatura válida", async () => {
  const handler = obterHandler({ FDP_WEBHOOK_RESEND_TESTE_PUBLICO: "1", RESEND_WEBHOOK_SECRET_TESTE: segredo });
  const r = await handler(request('{"type":"email.received"}', "v1,invalida"));
  assert.equal(r.status, 401);
});

test("aceita assinatura verdadeira sem executar qualquer envio", async () => {
  const handler = obterHandler({ FDP_WEBHOOK_RESEND_TESTE_PUBLICO: "1", RESEND_WEBHOOK_SECRET_TESTE: segredo });
  const body = '{"type":"email.received"}', now = String(Math.floor(Date.now() / 1000));
  const hmac = crypto.createHmac("sha256", Buffer.from(segredo.slice(6), "base64"))
    .update("msg_teste_abc." + now + "." + body).digest("base64");
  const r = await handler(request(body, "v1," + hmac, now));
  assert.equal(r.status, 200);
  assert.equal(r.body.teste, true);
  assert.equal(r.body.reconhecido, true);
});

test("rejeita assinatura antiga", async () => {
  const handler = obterHandler({ FDP_WEBHOOK_RESEND_TESTE_PUBLICO: "1", RESEND_WEBHOOK_SECRET_TESTE: segredo });
  const t = String(Math.floor(Date.now() / 1000) - 600);
  const body = '{"type":"email.received"}';
  const hmac = crypto.createHmac("sha256", Buffer.from(segredo.slice(6), "base64"))
    .update("msg_teste_abc." + t + "." + body).digest("base64");
  const r = await handler(request(body, "v1," + hmac, t));
  assert.equal(r.status, 401);
});
