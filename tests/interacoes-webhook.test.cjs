const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createHmac, randomBytes } = require("node:crypto");
const vm = require("node:vm");
const fs = require("node:fs");
const ts = require("typescript");
const segredoBin = randomBytes(32);
const segredo = "whsec_" + segredoBin.toString("base64");
const source = fs.readFileSync("lib/interacoes/seguranca-webhook.ts", "utf8");
const mod = { exports: {} };
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
  module: mod, exports: mod.exports, require: name => {
    assert.equal(name, "node:crypto");
    return require("node:crypto");
  }, Buffer, Date, Math,
});
const { verificarAssinaturaResend, extrairProtocoloDestino } = mod.exports;
test("aceita assinatura verdadeira e rejeita payload alterado", () => {
  const id = "msg_abc1234567", t = String(Math.trunc(Date.now() / 1000)), payload = '{"type":"email.received"}';
  const signature = createHmac("sha256", segredoBin).update(id + "." + t + "." + payload).digest("base64");
  assert.equal(verificarAssinaturaResend(payload,id,t,"v1,"+signature,segredo),true);
  assert.equal(verificarAssinaturaResend(payload+" ",id,t,"v1,"+signature,segredo),false);
});
test("não aceita assinaturas antigas ou segredo não configurado", () => {
  const id = "msg_abc1234567", antigo = String(Math.trunc(Date.now() / 1000) - 7200);
  assert.equal(verificarAssinaturaResend("x",id,antigo,"v1,AA==",segredo),false);
  assert.equal(verificarAssinaturaResend("x",id,antigo,"v1,AA==",""),false);
});
test("associa resposta apenas ao protocolo no domínio autorizado", () => {
  const uuid = "420ede39-397f-41f4-a6c7-0960808cbf48";
  assert.equal(extrairProtocoloDestino(["resposta+"+uuid+"@respostas.exemplo.org"], "respostas.exemplo.org"),uuid);
  assert.equal(extrairProtocoloDestino(["resposta+"+uuid+"@outro.example"],"respostas.exemplo.org"),null);
  assert.equal(extrairProtocoloDestino([], "respostas.exemplo.org"), null);
});
