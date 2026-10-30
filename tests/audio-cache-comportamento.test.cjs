// Exercita o módulo real de cache em memória, sem banco externo,
 // chamadas de voz nem consumo de créditos.
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const filename = path.join(__dirname, "../lib/audio-cache.ts");
const source = fs.readFileSync(filename, "utf8");
const compiled = ts.transpileModule(source, {
  fileName: filename,
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
});
assert.equal((compiled.diagnostics || [])
  .filter(x => x.category === ts.DiagnosticCategory.Error).length, 0);

function fixture() {
  const files = new Map();
  let quota = 0, geracoesPagas = 0, consultas = 0;
  let previous = Promise.resolve();
  const sql = async (parts, ...args) => {
    const query = parts.join("?").replace(/\s+/g, " ").trim();

    if (query.startsWith("CREATE TABLE IF NOT EXISTS")) return [];
    if (query.includes("SELECT pg_advisory_xact_lock")) return [];
    if (query.includes("SELECT arquivo") && query.includes("FROM fdp_audio_cache")) {
      consultas++;
      const arquivo = files.get(String(args[0]));
      return arquivo ? [{ arquivo: Buffer.from(arquivo) }] : [];
    }
    if (query.includes("INSERT INTO fdp_audio_geracoes_diarias")) return [];
    if (query.includes("UPDATE fdp_audio_geracoes_diarias")) {
      if (quota >= Number(args[0])) return [];
      quota++;
      return [{ total: quota }];
    }
    if (query.startsWith("INSERT INTO fdp_audio_cache")) {
      files.set(String(args[0]), Buffer.from(args[1]));
      return [];
    }
    throw Error("SQL de cache não simulado: " + query);
  };
  sql.begin = async (callback) => {
    const preceding = previous;
    let release;
    previous = new Promise(resolve => { release = resolve; });
    await preceding;
    try {
      return await callback(sql);
    } finally {
      release();
    }
  };

  const mod = { exports: {} };
  vm.runInNewContext(compiled.outputText, {
    module: mod,
    exports: mod.exports,
    require: (name) => {
      if (name === "server-only") return {};
      if (name === "@/lib/interesses/db") return { sql };
      throw Error("Importação inesperada: " + name);
    },
    Buffer, Uint8Array, Error, console,
  }, { filename, timeout: 1000 });

  return {
    ...mod.exports,
    files,
    get quota() { return quota; },
    get consultas() { return consultas; },
    async gerar(chave, espera = 0) {
      return mod.exports.obterOuGerarAudioCompartilhado(chave, async () => {
        geracoesPagas++;
        if (espera) await new Promise(resolve => setTimeout(resolve, espera));
        return Uint8Array.from([0x49, 0x44, 0x33, 0x04]);
      });
    },
    get geracoesPagas() { return geracoesPagas; },
  };
}

test("primeira reprodução gera MP3; segunda reutiliza, sem novos créditos", async () => {
  const f = fixture();
  const primeira = await f.gerar("mesma-edicao");
  const segunda = await f.gerar("mesma-edicao");
  assert.equal(primeira.geradoAgora, true);
  assert.equal(segunda.geradoAgora, false);
  assert.equal(f.geracoesPagas, 1);
  assert.equal(f.quota, 1);
  assert.deepEqual(Array.from(primeira.arquivo), Array.from(segunda.arquivo));
});

test("acessos simultâneos à mesma edição não duplicam geração", async () => {
  const f = fixture();
  const resultados = await Promise.all([
    f.gerar("simultaneo", 10),
    f.gerar("simultaneo", 10),
    f.gerar("simultaneo", 10),
  ]);
  assert.deepEqual(resultados.map(v => v.geradoAgora).sort(), [false, false, true]);
  assert.equal(f.geracoesPagas, 1);
  assert.equal(f.quota, 1);
});

test("limite diário impede gerações extras, mas permite MP3s existentes", async () => {
  const f = fixture();
  for (let n = 0; n < 30; n++) await f.gerar("edicao-" + n);
  assert.equal(f.geracoesPagas, 30);
  await assert.rejects(() => f.gerar("edicao-30"), (err) =>
    err && err.name === "LimiteDeAudioAtingido"
  );
  assert.equal(f.geracoesPagas, 30);
  const outraPessoa = await f.gerar("edicao-0");
  assert.equal(outraPessoa.geradoAgora, false);
  assert.equal(f.geracoesPagas, 30);
});
