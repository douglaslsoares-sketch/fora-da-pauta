import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";

test("coleta proposições com fonte e relatório sem publicação", async () => {
  const dir = await mkdtemp(join(tmpdir(), "fdp-camara-"));
  const fixture = join(dir, "fixture.json");
  const { writeFile } = await import("node:fs/promises");
  await writeFile(fixture, JSON.stringify({ dados: [{ id: 123, siglaTipo: "PL", numero: 5, ano: 2026, ementa: "Exemplo fictício", uri: "https://dadosabertos.camara.leg.br/api/v2/proposicoes/123" }] }));
  const destino = join(dir, "coleta.json");
  try {
    const child = spawn(process.execPath, [resolve("scripts/coletar-camara-proposicoes.mjs"), destino], {
      env: { ...process.env, FDP_COLETA_FIXTURE: fixture }, stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    child.stderr.on("data", b => { stderr += b; });
    const code = await new Promise((res, rej) => { child.on("error", rej); child.on("close", res); });
    assert.equal(code, 0, stderr);
    const dados = JSON.parse(await readFile(destino, "utf8"));
    const log = JSON.parse(await readFile(join(dir, "coleta.execucao.json"), "utf8"));
    assert.equal(dados.itens[0].id, 123);
    assert.equal(dados.itens[0].urlFonte, "https://dadosabertos.camara.leg.br/api/v2/proposicoes/123");
    assert.equal(log.status, "sucesso");
    assert.equal(log.quantidade, 1);
    assert.equal(log.modo, "fixture-local-sem-consulta-externa");
  } finally { await rm(dir, { recursive: true, force: true }); }
});
