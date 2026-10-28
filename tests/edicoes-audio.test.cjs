const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const componente = fs.readFileSync(path.join(__dirname, "../components/CampaignPage.tsx"), "utf8");
const leitor = fs.readFileSync(path.join(__dirname, "../components/EditorialAudioSystem.tsx"), "utf8");
test("cada edição pode iniciar leitura pelo sistema já instalado", () => {
  assert.match(componente, /Ouvir esta edição/);
  assert.match(componente, /id="texto-editorial-edicao"/);
  assert.match(componente, /"fdp:audio-start"/);
  assert.match(leitor, /"fdp:audio-start"/);
});
test("seções recolhidas abrem para a leitura completa", () => {
  assert.match(componente, /querySelectorAll<HTMLDetailsElement>\("details"\)/);
  assert.match(componente, /secao\.open = true/);
});
