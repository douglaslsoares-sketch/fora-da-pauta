const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function carregar(env) {
  const source = fs.readFileSync("lib/interacoes/processar-remessas.ts", "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const mod = { exports: {} };
  let acessos = 0;
  vm.runInNewContext(transpiled.outputText, {
    module: mod, exports: mod.exports,
    require(name) {
      if (name === "server-only") return {};
      if (name === "@/lib/interesses/db") return { sql: () => { acessos++; throw Error("Banco não deve ser acessado"); } };
      throw Error("Import inesperado: " + name);
    },
    process: { env },
  });
  return { worker: mod.exports.processarRemessasAutomaticas, acessos: () => acessos };
}
test("integração externa desativada não consulta banco nem envia email", async () => {
  const m = carregar({});
  const r = await m.worker();
  assert.equal(r.desativado, true);
  assert.equal(m.acessos(), 0);
});
test("não habilita sem provedor e domínio de respostas", async () => {
  const m = carregar({ FDP_INTERACOES_AUTOMATICAS: "1" });
  await assert.rejects(m.worker(), /não está configurado/);
  assert.equal(m.acessos(), 0);
});
